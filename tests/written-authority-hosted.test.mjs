import test from "node:test";
import assert from "node:assert/strict";

import {
  HOSTED_QWEN_MODEL,
  WRITTEN_EVIDENCE_VERSION,
  coachHostedAnswer,
  gradeHostedAnswer,
  hostedAuthorityHealth
} from "../cloudflare/src/written-authority.mjs";
import {WRITTEN_QUESTION_BANK} from "../cloudflare/src/generated/written-bank.mjs";
import {WRITTEN_EVIDENCE} from "../cloudflare/src/generated/written-evidence.mjs";

function baseEnv(overrides = {}) {
  return {
    DUNGEON_HOSTED_WRITTEN: "on",
    DUNGEON_HOSTED_WRITTEN_MODEL: HOSTED_QWEN_MODEL,
    DUNGEON_HOSTED_WRITTEN_APPROVED_MODEL: HOSTED_QWEN_MODEL,
    DUNGEON_HOSTED_WRITTEN_CORPUS: WRITTEN_EVIDENCE_VERSION,
    ...overrides
  };
}

test("hosted authority is unavailable until model approval and corpus activation agree", async () => {
  const status = await hostedAuthorityHealth(baseEnv({
    DUNGEON_HOSTED_WRITTEN: "off",
    AI: {run: async () => ({})}
  }));
  assert.equal(status.available, false);
  assert.match(status.reason, /not activated/i);
});

test("hosted marking stays off unless the activation flag names the evidence pack that shipped", async () => {
  const stale = await hostedAuthorityHealth(baseEnv({
    DUNGEON_HOSTED_WRITTEN_CORPUS: "frozen-0000000000000000",
    AI: {run: async () => ({})}
  }));
  assert.equal(stale.available, false);
  assert.match(stale.reason, /course evidence is not activated/i);

  await assert.rejects(
    gradeHostedAnswer(baseEnv({
      DUNGEON_HOSTED_WRITTEN_CORPUS: "frozen-0000000000000000",
      AI: {run: async () => assert.fail("no answer may reach the model before activation")}
    }), {questionId: Object.keys(WRITTEN_QUESTION_BANK)[0], answer: "A".repeat(40)}),
    /course evidence is not activated/i
  );
});

test("every rubric-marked question ships frozen evidence inside its declared lectures", () => {
  for (const question of Object.values(WRITTEN_QUESTION_BANK)) {
    const chunks = WRITTEN_EVIDENCE[question.id];
    assert.ok(Array.isArray(chunks) && chunks.length, `${question.id} has no frozen evidence`);
    const allowed = new Set(question.sourceIds);
    for (const chunk of chunks) {
      assert.ok(allowed.has(chunk.lectureId), `${question.id} cites undeclared lecture ${chunk.lectureId}`);
      assert.ok(chunk.citation.startsWith(`${chunk.lectureId}#`), `${question.id} has a mismatched citation`);
      assert.ok(chunk.text.length > 0 && chunk.text.length <= 9000);
    }
  }
});

test("hosted rubric marks read frozen evidence and never call a retrieval model", async () => {
  const question = Object.values(WRITTEN_QUESTION_BANK)[0];
  const answer = "The governing idea is demand validation. Choose the targeted page because its behavioural evidence reduces uncertainty before resources are committed.";
  const calls = [];
  const decision = {
    criteria: question.rubric.map((criterion) => ({
      id: criterion.id,
      decision: "met",
      gapCodes: [],
      answerEvidence: "governing idea",
      sourceCitations: [WRITTEN_EVIDENCE[question.id][0].citation],
      reason: "The candidate states the required course-grounded idea."
    })),
    feedback: "Every criterion is present."
  };
  const env = baseEnv({
    AI: {run: async (model, input) => {
      calls.push({model, input});
      return {response: JSON.stringify(decision)};
    }}
  });
  const result = await gradeHostedAnswer(env, {questionId: question.id, courseId: question.courseId, answer});
  assert.equal(result.abstain, false);
  assert.equal(result.score, question.rubric.length);
  assert.equal(result.authority, "dungeon-hosted-practice");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, HOSTED_QWEN_MODEL);
  /* The marker is shown only the lectures the question declares. */
  const shown = calls[0].input.messages.map((message) => message.content).join("\n");
  for (const chunk of WRITTEN_EVIDENCE[question.id]) assert.ok(shown.includes(chunk.citation));
});

test("a response that reads as distress is answered with help and reaches no model", async () => {
  const question = Object.values(WRITTEN_QUESTION_BANK)[0];
  const env = baseEnv({AI: {run: async () => assert.fail("distress must not reach an inference provider")}});
  const result = await gradeHostedAnswer(env, {
    questionId: question.id,
    courseId: question.courseId,
    answer: "i dont care about this exam i want to kill myself"
  });
  assert.equal(result.kind, "written-support");
  assert.equal(result.supportOffered, true);
  assert.equal(result.score, null);
  assert.equal(result.abstain, true);
});

test("distress is caught before the length bound, so a short cry for help is not a validation error", async () => {
  const question = Object.values(WRITTEN_QUESTION_BANK)[0];
  const env = baseEnv({AI: {run: async () => assert.fail("distress must not reach an inference provider")}});
  const result = await gradeHostedAnswer(env, {questionId: question.id, answer: "i want to die"});
  assert.equal(result.kind, "written-support");
});

test("authored post-submit coach gives grounded guidance without a fabricated grade", async () => {
  const question = Object.values(WRITTEN_QUESTION_BANK)[0];
  const citation = WRITTEN_EVIDENCE[question.id][0].citation;
  let generation = 0;
  const env = baseEnv({
    AI: {run: async () => {
      generation += 1;
      return generation === 1 ? {response: JSON.stringify({
        grounded: true,
        answerSummary: "The response names the decision but needs a causal reason.",
        strengths: [{point: "It makes a decision.", answerEvidence: "Choose the targeted test", sourceCitations: [citation]}],
        gaps: [{point: "It does not explain why the evidence is trustworthy.", answerEvidence: "", sourceCitations: [citation]}],
        suggestedAnswer: "Choose the targeted test because its behavioural evidence is more trustworthy and therefore reduces decision uncertainty.",
        sourceCitations: [citation]
      })} : {response: JSON.stringify({accept: true, sourceCitations: [citation], reason: "All claims are supported."})};
    }}
  });
  const result = await coachHostedAnswer(env, {
    courseId: question.courseId,
    questionId: question.id,
    answer: "Choose the targeted test because it seems more relevant to the intended customers."
  });
  assert.equal(result.abstain, false);
  assert.equal(Object.hasOwn(result, "score"), false);
  assert.equal(result.retrievalMode, "frozen-lecture-evidence");
});
