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

export const HOSTED_QWEN_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
export const HOSTED_EMBEDDING_MODEL = "@cf/qwen/qwen3-embedding-0.6b";
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
  const embeddingModel = String(env?.DUNGEON_HOSTED_EMBEDDING_MODEL || "");
  const corpusVersion = String(env?.DUNGEON_HOSTED_WRITTEN_CORPUS || "");
  const reasons = [];
  if (!enabled(env?.DUNGEON_HOSTED_WRITTEN)) reasons.push("Hosted written checking is not activated.");
  if (model !== HOSTED_QWEN_MODEL || approvedModel !== model) reasons.push("The exact hosted model has not been approved.");
  if (embeddingModel !== HOSTED_EMBEDDING_MODEL) reasons.push("The hosted retrieval model is not configured.");
  if (!corpusVersion || corpusVersion === "not-indexed") reasons.push("The approved course corpus is not indexed.");
  if (!env?.AI || typeof env.AI.run !== "function") reasons.push("Workers AI is not bound.");
  if (!env?.COURSE_RAG || typeof env.COURSE_RAG.query !== "function") reasons.push("Course retrieval is not bound.");
  return {available: reasons.length === 0, reasons, model, embeddingModel, corpusVersion};
}

export async function hostedAuthorityHealth(env) {
  const status = configured(env);
  let vectorCount = null;
  if (status.available && typeof env.COURSE_RAG.describe === "function") {
    try {
      const description = await env.COURSE_RAG.describe();
      vectorCount = Number(description?.vectorCount || 0);
      if (!vectorCount) status.reasons.push("The approved course corpus contains no vectors.");
    } catch (error) {
      status.reasons.push("The course index could not be inspected.");
    }
  }
  return {
    available: status.reasons.length === 0,
    provider: "cloudflare-workers-ai",
    model: status.model || HOSTED_QWEN_MODEL,
    embeddingModel: status.embeddingModel || HOSTED_EMBEDDING_MODEL,
    corpusVersion: status.corpusVersion || null,
    vectorCount,
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

function vectorFrom(output) {
  const vector = output?.data?.[0];
  if (!Array.isArray(vector) || vector.length !== 1024 || vector.some((value) => !Number.isFinite(value))) {
    throw new WrittenAuthorityError(502, "RETRIEVAL_FAILED", "Dungeon could not prepare a course-grounded check.");
  }
  return vector;
}

async function retrieve(env, status, {courseId, query, sourceIds = null}) {
  const embedded = await env.AI.run(status.embeddingModel, {text: [query]});
  const filter = {
    courseId,
    corpusVersion: status.corpusVersion
  };
  if (sourceIds?.length) filter.lectureId = {$in: sourceIds};
  const matches = await env.COURSE_RAG.query(vectorFrom(embedded), {
    topK: 6,
    returnMetadata: "all",
    filter
  });
  const evidence = (matches?.matches || []).flatMap((match) => {
    const metadata = match?.metadata || {};
    const citation = String(metadata.citation || "");
    const lectureId = String(metadata.lectureId || "");
    const title = String(metadata.title || lectureId);
    const text = String(metadata.text || "");
    if (!/^[A-Z0-9_-]{4,80}#[0-9]{2,4}$/.test(citation) ||
        !/^[A-Z0-9_-]{4,80}$/.test(lectureId) || !text || text.length > 9000 || title.length > 240 ||
        String(metadata.courseId || "") !== courseId || String(metadata.corpusVersion || "") !== status.corpusVersion ||
        (sourceIds?.length && !sourceIds.includes(lectureId))) return [];
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
  const status = requireAvailable(env);
  const questionId = String(request?.questionId || "");
  const answer = boundedText(request?.answer, "Written response", 20, 6000);
  const question = WRITTEN_QUESTION_BANK[questionId];
  if (!question || (request?.courseId && String(request.courseId) !== question.courseId)) {
    throw new WrittenAuthorityError(400, "UNKNOWN_WRITTEN_QUESTION", "That rubric-marked question is not available.");
  }
  const query = [question.stem, question.caselet, ...question.rubric.flatMap((criterion) => [criterion.label, criterion.description])].join("\n");
  const evidence = await retrieve(env, status, {courseId: question.courseId, query, sourceIds: question.sourceIds});
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
  const status = requireAvailable(env);
  const requestedCourseId = String(request?.courseId || "").toUpperCase();
  const questionId = String(request?.questionId || "");
  if (!questionId) throw new WrittenAuthorityError(400, "AUTHORED_QUESTION_REQUIRED", "Post-submit coaching requires a Dungeon-authored question.");
  const authored = questionId ? WRITTEN_QUESTION_BANK[questionId] : null;
  if (questionId && (!authored || (requestedCourseId && authored.courseId !== requestedCourseId))) {
    throw new WrittenAuthorityError(400, "UNKNOWN_WRITTEN_QUESTION", "That rubric-marked question is not available.");
  }
  const courseId = authored ? authored.courseId : requestedCourseId;
  if (!COURSE_IDS.has(courseId)) throw new WrittenAuthorityError(400, "INVALID_WRITTEN_REQUEST", "Choose a valid Term 6 subject.");
  const cleanRequest = {
    courseId,
    prompt: authored
      ? [authored.stem, "Review criteria:", ...(authored.rubric || []).map((criterion) => `${criterion.label}: ${criterion.description}`)].join("\n")
      : boundedText(request?.prompt, "Question", 10, 2000),
    caselet: authored ? String(authored.caselet || "") : String(request?.caselet || "").trim(),
    answer: boundedText(request?.answer, "Written response", 20, 6000)
  };
  if (cleanRequest.caselet.length > 4000) throw new WrittenAuthorityError(400, "INVALID_WRITTEN_REQUEST", "The optional case context is too long.");
  const evidence = await retrieve(env, status, {
    courseId,
    query: [cleanRequest.prompt, cleanRequest.caselet].filter(Boolean).join("\n"),
    sourceIds: authored ? authored.sourceIds : undefined
  });
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
      retrievalMode: authored ? "declared-lecture-vector" : "subject-vector"
    });
  } catch (error) {
    return mergeCoachAnalysis({
      request: cleanRequest,
      evidence,
      analyst: null,
      verifier: null,
      model: status.model,
      authority: "dungeon-hosted-practice-coach",
      retrievalMode: authored ? "declared-lecture-vector" : "subject-vector"
    });
  }
}
