import test from "node:test";
import assert from "node:assert/strict";

import {
  HOSTED_EMBEDDING_MODEL,
  HOSTED_QWEN_MODEL,
  coachHostedAnswer,
  gradeHostedAnswer,
  hostedAuthorityHealth
} from "../cloudflare/src/written-authority.mjs";
import {WRITTEN_QUESTION_BANK} from "../cloudflare/src/generated/written-bank.mjs";

function baseEnv(overrides = {}) {
  return {
    DUNGEON_HOSTED_WRITTEN: "on",
    DUNGEON_HOSTED_WRITTEN_MODEL: HOSTED_QWEN_MODEL,
    DUNGEON_HOSTED_WRITTEN_APPROVED_MODEL: HOSTED_QWEN_MODEL,
    DUNGEON_HOSTED_EMBEDDING_MODEL: HOSTED_EMBEDDING_MODEL,
    DUNGEON_HOSTED_WRITTEN_CORPUS: "test-corpus-v1",
    ...overrides
  };
}

function evidence(courseId, lectureId) {
  return {
    matches: [{
      id: "chunk-1",
      score: .91,
      metadata: {
        courseId,
        lectureId,
        corpusVersion: "test-corpus-v1",
        citation: `${lectureId}#01`,
        title: "Course lecture",
        text: "The governing idea must support the decision and its causal reason using trustworthy evidence."
      }
    }]
  };
}

test("hosted authority is unavailable until model approval and corpus activation agree", async () => {
  const status = await hostedAuthorityHealth(baseEnv({
    DUNGEON_HOSTED_WRITTEN: "off",
    AI: {run: async () => ({})},
    COURSE_RAG: {query: async () => ({matches: []}), describe: async () => ({vectorCount: 20})}
  }));
  assert.equal(status.available, false);
  assert.match(status.reason, /not activated/i);
});

test("hosted rubric marks use server-owned questions and declared lecture filters", async () => {
  const question = Object.values(WRITTEN_QUESTION_BANK)[0];
  const answer = "The governing idea is demand validation. Choose the targeted page because its behavioural evidence reduces uncertainty before resources are committed.";
  const calls = [];
  const decision = {
    criteria: question.rubric.map((criterion) => ({
      id: criterion.id,
      decision: "met",
      gapCodes: [],
      answerEvidence: "governing idea",
      sourceCitations: [`${question.sourceIds[0]}#01`],
      reason: "The candidate states the required course-grounded idea."
    })),
    feedback: "Every criterion is present."
  };
  const env = baseEnv({
    AI: {run: async (model, input) => {
      calls.push({model, input});
      return model === HOSTED_EMBEDDING_MODEL
        ? {data: [Array(1024).fill(0.01)]}
        : {response: JSON.stringify(decision)};
    }},
    COURSE_RAG: {query: async (vector, options) => {
      calls.push({vector, options});
      return evidence(question.courseId, question.sourceIds[0]);
    }}
  });
  const result = await gradeHostedAnswer(env, {questionId: question.id, courseId: question.courseId, answer});
  assert.equal(result.abstain, false);
  assert.equal(result.score, question.rubric.length);
  assert.equal(result.authority, "dungeon-hosted-practice");
  const vectorCall = calls.find((call) => call.options);
  assert.deepEqual(vectorCall.options.filter.lectureId, {$in: question.sourceIds});
  assert.equal(calls.filter((call) => call.model === HOSTED_QWEN_MODEL).length, 1);
});

test("authored post-submit coach gives grounded guidance without a fabricated grade", async () => {
  const question = Object.values(WRITTEN_QUESTION_BANK)[0];
  const courseId = question.courseId;
  const lectureId = question.sourceIds[0];
  let generation = 0;
  const env = baseEnv({
    AI: {run: async (model) => {
      if (model === HOSTED_EMBEDDING_MODEL) return {data: [Array(1024).fill(0.01)]};
      generation += 1;
      return generation === 1 ? {response: JSON.stringify({
        grounded: true,
        answerSummary: "The response names the decision but needs a causal reason.",
        strengths: [{point: "It makes a decision.", answerEvidence: "Choose the targeted test", sourceCitations: [`${lectureId}#01`]}],
        gaps: [{point: "It does not explain why the evidence is trustworthy.", answerEvidence: "", sourceCitations: [`${lectureId}#01`]}],
        suggestedAnswer: "Choose the targeted test because its behavioural evidence is more trustworthy and therefore reduces decision uncertainty.",
        sourceCitations: [`${lectureId}#01`]
      })} : {response: JSON.stringify({accept: true, sourceCitations: [`${lectureId}#01`], reason: "All claims are supported."})};
    }},
    COURSE_RAG: {query: async () => evidence(courseId, lectureId)}
  });
  const result = await coachHostedAnswer(env, {
    courseId,
    questionId: question.id,
    answer: "Choose the targeted test because it seems more relevant to the intended customers."
  });
  assert.equal(result.abstain, false);
  assert.equal(Object.hasOwn(result, "score"), false);
  assert.equal(result.retrievalMode, "declared-lecture-vector");
});
