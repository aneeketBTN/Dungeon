import {
  acceptJudgement,
  coachEnglishValid,
  coachMessages,
  coachSchema,
  coachVerifierSchema,
  distressSignal,
  encodingRepairMessages,
  judgementEnglishValid,
  judgementMessages,
  judgementSchema,
  mergeCoachAnalysis,
  supportResponse
} from "../../tools/lib/written_authority.mjs";
import {WRITTEN_QUESTION_BANK} from "./generated/written-bank.mjs";
import {WRITTEN_EVIDENCE, WRITTEN_EVIDENCE_VERSION} from "./generated/written-evidence.mjs";

export const HOSTED_QWEN_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
export {WRITTEN_EVIDENCE_VERSION};
const COURSE_IDS = new Set(["BRGSA", "IBM", "SCLM", "SPMS"]);

export class WrittenAuthorityError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function enabled(value) {
  return ["1", "on", "true", "yes"].includes(String(value || "").toLowerCase());
}

function configured(env) {
  const model = String(env?.DUNGEON_HOSTED_WRITTEN_MODEL || "");
  const approvedModel = String(env?.DUNGEON_HOSTED_WRITTEN_APPROVED_MODEL || "");
  const corpusVersion = String(env?.DUNGEON_HOSTED_WRITTEN_CORPUS || "");
  const reasons = [];
  if (!enabled(env?.DUNGEON_HOSTED_WRITTEN)) reasons.push("Hosted written checking is not activated.");
  if (model !== HOSTED_QWEN_MODEL || approvedModel !== model) reasons.push("The exact hosted model has not been approved.");
  /* The activation flag names the evidence pack by its own digest, so approval
   * cannot drift from the course text the marker will actually quote. Re-freezing
   * the evidence changes the digest and switches hosted marking off until the
   * owner approves the new pack by name. */
  if (corpusVersion !== WRITTEN_EVIDENCE_VERSION) reasons.push("The approved course evidence is not activated.");
  if (!env?.AI || typeof env.AI.run !== "function") reasons.push("Workers AI is not bound.");
  return {available: reasons.length === 0, reasons, model, corpusVersion};
}

export async function hostedAuthorityHealth(env) {
  const status = configured(env);
  const questionCount = Object.keys(WRITTEN_EVIDENCE).length;
  const chunkCount = Object.values(WRITTEN_EVIDENCE).reduce((total, list) => total + list.length, 0);
  if (!chunkCount) status.reasons.push("The frozen course evidence pack is empty.");
  return {
    available: status.reasons.length === 0,
    provider: "cloudflare-workers-ai",
    model: status.model || HOSTED_QWEN_MODEL,
    corpusVersion: status.corpusVersion || null,
    evidenceVersion: WRITTEN_EVIDENCE_VERSION,
    evidenceQuestions: questionCount,
    evidenceChunks: chunkCount,
    capabilities: ["rubric-mark", "subject-coach"],
    retention: "candidate answers are processed for this response and are not stored by Dungeon's authority endpoint",
    reason: status.reasons[0] || ""
  };
}

function requireAvailable(env) {
  const status = configured(env);
  if (!status.available) {
    throw new WrittenAuthorityError(503, "WRITTEN_AUTHORITY_UNAVAILABLE", status.reasons[0]);
  }
  return status;
}

function boundedText(value, label, minimum, maximum) {
  const text = String(value || "").trim();
  if (text.length < minimum || text.length > maximum) {
    throw new WrittenAuthorityError(400, "INVALID_WRITTEN_REQUEST", `${label} must be ${minimum}–${maximum} characters.`);
  }
  return text;
}

/* Retrieval never reads the candidate answer: the query is built from the stem,
 * caselet and rubric, all fixed at authoring time. So a question's evidence is a
 * constant, and a per-request vector search only recomputes it. It is frozen at
 * build time instead (tools/build_written_authority_assets.mjs), which keeps the
 * course transcripts out of any hosted index and makes the evidence something a
 * person can read and correct per question.
 *
 * Validate it anyway. This is the boundary that decides which citations
 * acceptJudgement will honour, and a generated file is still a file. */
function frozenEvidence(question) {
  const allowed = new Set(question.sourceIds || []);
  const evidence = (WRITTEN_EVIDENCE[question.id] || []).flatMap((chunk) => {
    const citation = String(chunk?.citation || "");
    const lectureId = String(chunk?.lectureId || "");
    const title = String(chunk?.title || lectureId);
    const text = String(chunk?.text || "");
    if (!/^[A-Z0-9_-]{4,80}#[0-9]{2,4}$/.test(citation) || !/^[A-Z0-9_-]{4,80}$/.test(lectureId) ||
        !citation.startsWith(`${lectureId}#`) || !allowed.has(lectureId) ||
        !text || text.length > 9000 || title.length > 240) return [];
    return [{citation, lectureId, title, text}];
  });
  if (!evidence.length) {
    throw new WrittenAuthorityError(503, "COURSE_EVIDENCE_UNAVAILABLE", "No approved course evidence was available for this check.");
  }
  return evidence;
}

function parseStructured(output) {
  const raw = output?.response;
  if (typeof raw !== "string" || raw.length > 40000) {
    throw new Error("Hosted model returned no bounded structured response.");
  }
  return JSON.parse(raw);
}

async function complete(env, status, messages, schema, validate, maxTokens = 1000) {
  let attemptMessages = messages;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const output = parseStructured(await env.AI.run(status.model, {
      messages: attemptMessages,
      temperature: 0,
      max_tokens: maxTokens,
      response_format: {type: "json_schema", json_schema: schema}
    }));
    if (validate(output)) return output;
    attemptMessages = encodingRepairMessages(messages);
  }
  throw new Error("Qwen returned unexpected non-English or corrupted characters twice.");
}

export async function gradeHostedAnswer(env, request) {
  const questionId = String(request?.questionId || "");
  const question = WRITTEN_QUESTION_BANK[questionId];
  if (!question || (request?.courseId && String(request.courseId) !== question.courseId)) {
    throw new WrittenAuthorityError(400, "UNKNOWN_WRITTEN_QUESTION", "That rubric-marked question is not available.");
  }
  /* Ahead of the length bound, the activation gate, the evidence and the model.
   * Someone writing that they want to hurt themselves is answered with help, not
   * a character-count error or a "service unavailable", and their words reach no
   * inference provider. Sliced to the length a real answer may be, so an
   * oversized body cannot turn this into work. */
  if (distressSignal(String(request?.answer || "").slice(0, 6000))) return supportResponse(question.id);
  const status = requireAvailable(env);
  const answer = boundedText(request?.answer, "Written response", 20, 6000);
  const evidence = frozenEvidence(question);
  const schema = judgementSchema(question);
  const messages = judgementMessages("marker", question, answer, evidence);
  try {
    /* 4,096 for the same reason as the local marker: a three-criterion judgement
     * runs close to 1,000 completion tokens, and truncated JSON abstains a question
     * the model marked correctly. */
    const judgement = await complete(env, status, messages, schema, judgementEnglishValid, 4096);
    const result = acceptJudgement({question, answer, evidence, judgement, model: status.model, authority: "dungeon-hosted-practice"});
    if (!result.abstain) return result;
    /* One fresh judgement before the learner is sent to self-review; run-to-run
     * variance abstains marks the model can produce on an identical retry. */
    const second = await complete(env, status, messages, schema, judgementEnglishValid, 4096);
    const retried = acceptJudgement({question, answer, evidence, judgement: second, model: status.model, authority: "dungeon-hosted-practice"});
    return retried.abstain ? result : retried;
  } catch (error) {
    return acceptJudgement({question, answer, evidence, judgement: null, model: status.model, authority: "dungeon-hosted-practice"});
  }
}

export async function coachHostedAnswer(env, request) {
  const requestedCourseId = String(request?.courseId || "").toUpperCase();
  const questionId = String(request?.questionId || "");
  if (!questionId) throw new WrittenAuthorityError(400, "AUTHORED_QUESTION_REQUIRED", "Post-submit coaching requires a Dungeon-authored question.");
  const authored = WRITTEN_QUESTION_BANK[questionId];
  if (!authored || (requestedCourseId && authored.courseId !== requestedCourseId)) {
    throw new WrittenAuthorityError(400, "UNKNOWN_WRITTEN_QUESTION", "That rubric-marked question is not available.");
  }
  if (distressSignal(String(request?.answer || "").slice(0, 6000))) return supportResponse(authored.id);
  const status = requireAvailable(env);
  const courseId = authored.courseId;
  if (!COURSE_IDS.has(courseId)) throw new WrittenAuthorityError(400, "INVALID_WRITTEN_REQUEST", "Choose a valid Term 6 subject.");
  const cleanRequest = {
    courseId,
    prompt: [authored.stem, "Review criteria:", ...(authored.rubric || []).map((criterion) => `${criterion.label}: ${criterion.description}`)].join("\n"),
    caselet: String(authored.caselet || ""),
    answer: boundedText(request?.answer, "Written response", 20, 6000)
  };
  const evidence = frozenEvidence(authored);
  try {
    const analyst = await complete(env, status, coachMessages("analyst", cleanRequest, evidence), coachSchema(), (output) => coachEnglishValid(output, "analyst"), 4096);
    const verifier = await complete(env, status, coachMessages("verifier", cleanRequest, evidence, analyst), coachVerifierSchema(), (output) => coachEnglishValid(output, "verifier"), 2048);
    return mergeCoachAnalysis({
      request: cleanRequest,
      evidence,
      analyst,
      verifier,
      model: status.model,
      authority: "dungeon-hosted-practice-coach",
      retrievalMode: "frozen-lecture-evidence"
    });
  } catch (error) {
    return mergeCoachAnalysis({
      request: cleanRequest,
      evidence,
      analyst: null,
      verifier: null,
      model: status.model,
      authority: "dungeon-hosted-practice-coach",
      retrievalMode: "frozen-lecture-evidence"
    });
  }
}
