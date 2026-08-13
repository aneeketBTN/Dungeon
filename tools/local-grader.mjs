#!/usr/bin/env node

/* Dungeon's local written-response grader.
 *
 * This process is deliberately dependency-free and loopback-only by contract. It
 * retrieves only from the lecture IDs already attached to the question, asks the
 * configured LM Studio model for one compact criterion-level judgement, then
 * accepts it only after deterministic citation, schema, and answer-evidence checks.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";
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
} from "./lib/written_authority.mjs";

export {acceptJudgement, distressSignal, mergeCoachAnalysis, mergeJudgements, supportResponse} from "./lib/written_authority.mjs";

const require = createRequire(import.meta.url);
const {loadLectures} = require("./lib/clean_transcripts.js");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const BANK_FILES = [
  "app/sets/t6_diagnoses.js",
  "app/sets/t6_brgsa.js",
  "app/sets/t6_catalog.js",
  "app/sets/t6_challenges.js"
];
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const COURSE_IDS = new Set(["BRGSA", "IBM", "SCLM", "SPMS"]);
const STOP_WORDS = new Set("a an and are as at be because been being but by can could did do does for from had has have how i if in into is it its may might more most must no not of on only or our should so than that the their then there these they this those to under use used using was we were what when where which while who why will with would you your".split(" "));

let bankCache = null;

export function loadCourses() {
  if (bankCache) return bankCache;
  const context = vm.createContext({window: {}});
  BANK_FILES.forEach((relative) => {
    const filename = path.join(ROOT, relative);
    vm.runInContext(fs.readFileSync(filename, "utf8"), context, {filename});
  });
  bankCache = context.window.T6_COURSES || {};
  return bankCache;
}

export function findQuestion(questionId, courseId) {
  const courses = loadCourses();
  const ids = courseId ? [courseId] : Object.keys(courses);
  for (const id of ids) {
    const question = courses[id]?.questions?.[questionId];
    if (question) return {courseId: id, question};
  }
  throw new Error("Unknown written-response question.");
}

function tokens(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function chunkLecture(lecture, target = 1500) {
  const paragraphs = String(lecture.text || "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const chunks = [];
  let buffer = "";
  paragraphs.forEach((paragraph) => {
    if (buffer && buffer.length + paragraph.length + 1 > target) {
      chunks.push(buffer);
      buffer = "";
    }
    if (paragraph.length <= target) {
      buffer += (buffer ? "\n" : "") + paragraph;
      return;
    }
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    sentences.forEach((sentence) => {
      if (buffer && buffer.length + sentence.length + 1 > target) {
        chunks.push(buffer);
        buffer = "";
      }
      buffer += (buffer ? " " : "") + sentence;
    });
  });
  if (buffer) chunks.push(buffer);
  return chunks.map((text, index) => ({
    citation: `${lecture.lecture_id}#${String(index + 1).padStart(2, "0")}`,
    lectureId: lecture.lecture_id,
    title: lecture.title || lecture.lecture_id,
    text
  }));
}

export function retrieveEvidence(question, _answer, lectures, limit = 6) {
  const allowedIds = new Set((question.sourceIds || [question.source]).filter(Boolean));
  const allowedLectures = lectures.filter((lecture) => allowedIds.has(lecture.lecture_id));
  const missing = [...allowedIds].filter((id) => !allowedLectures.some((lecture) => lecture.lecture_id === id));
  if (missing.length) throw new Error(`Missing required lecture source: ${missing.join(", ")}`);

  const courseQuery = tokens([
    question.stem,
    question.caselet,
    question.exemplar,
    ...(question.rubric || []).flatMap((criterion) => [criterion.label, criterion.description])
  ].join(" "));
  const weights = new Map();
  courseQuery.forEach((token) => weights.set(token, (weights.get(token) || 0) + 3));

  /* Call chunkLecture with one argument on purpose.
   *
   * `.flatMap(chunkLecture)` passes (element, index, array), so the array index
   * silently became the `target` chunk size: the first lecture chunked to a target
   * of 0 characters, the second to 1. Every paragraph then exceeded its target and
   * fell through to the sentence splitter, so a question was judged against six
   * disconnected 80-130 character fragments — several cut mid-sentence — instead of
   * six coherent ~1,430 character passages. */
  const ranked = allowedLectures
    .flatMap((lecture) => chunkLecture(lecture))
    .map((chunk, sourceOrder) => {
      const haystack = tokens(chunk.text);
      const counts = new Map();
      haystack.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
      const score = [...weights].reduce((total, [token, weight]) => total + Math.min(4, counts.get(token) || 0) * weight, 0);
      return {...chunk, score, sourceOrder};
    })
    .sort((left, right) => right.score - left.score || left.sourceOrder - right.sourceOrder);

  /* Guarantee every declared lecture a seat before filling the rest by score.
   *
   * A case question declares the principle lecture and the applied lecture that
   * supplied the case, and its case_evidence criterion is answerable only from the
   * latter. A plain global top-6 let one lecture take all six slots — measured on
   * three BRGSA case questions — so the model was asked to judge case evidence
   * against a lecture that never mentioned the case, and abstained. */
  const seats = [];
  const taken = new Set();
  allowedLectures.forEach((lecture) => {
    const best = ranked.find((chunk) => chunk.lectureId === lecture.lecture_id && !taken.has(chunk.citation));
    if (best && seats.length < limit) {
      seats.push(best);
      taken.add(best.citation);
    }
  });
  ranked.forEach((chunk) => {
    if (seats.length >= limit || taken.has(chunk.citation)) return;
    seats.push(chunk);
    taken.add(chunk.citation);
  });
  return seats
    .sort((left, right) => right.score - left.score || left.sourceOrder - right.sourceOrder)
    .map(({sourceOrder, score, ...chunk}) => chunk);
}

function weightedChunkRank(query, answer, lectures) {
  const queryTokens = tokens(query);
  const answerTokens = tokens(answer);
  const weights = new Map();
  queryTokens.forEach((token) => weights.set(token, (weights.get(token) || 0) + 3));
  answerTokens.forEach((token) => weights.set(token, (weights.get(token) || 0) + 1));
  /* One argument, for the same reason as retrieveEvidence above. */
  return lectures
    .flatMap((lecture) => chunkLecture(lecture))
    .map((chunk, sourceOrder) => {
      const counts = new Map();
      tokens(chunk.text).forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
      const lexicalScore = [...weights].reduce((total, [token, weight]) => total + Math.min(4, counts.get(token) || 0) * weight, 0);
      return {...chunk, lexicalScore, sourceOrder};
    })
    .sort((left, right) => right.lexicalScore - left.lexicalScore || left.sourceOrder - right.sourceOrder);
}

function cosine(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || !left.length) return 0;
  let dot = 0;
  let leftSize = 0;
  let rightSize = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftSize += left[index] * left[index];
    rightSize += right[index] * right[index];
  }
  return leftSize && rightSize ? dot / (Math.sqrt(leftSize) * Math.sqrt(rightSize)) : 0;
}

async function lmStudioEmbeddings({model, baseUrl, texts}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      signal: controller.signal,
      body: JSON.stringify({model, input: texts})
    });
    if (!response.ok) throw new Error(`LM Studio embeddings returned HTTP ${response.status}.`);
    const payload = await response.json();
    const vectors = (payload?.data || []).slice().sort((left, right) => left.index - right.index).map((item) => item.embedding);
    if (vectors.length !== texts.length || vectors.some((vector) => !Array.isArray(vector) || !vector.length)) {
      throw new Error("LM Studio returned incomplete embeddings.");
    }
    return vectors;
  } finally {
    clearTimeout(timeout);
  }
}

export async function retrieveSubjectEvidence(request, lectures, options = {}) {
  const courseId = String(request?.courseId || "").toUpperCase();
  if (!COURSE_IDS.has(courseId)) throw new Error("Choose a valid Term 6 subject.");
  const subjectLectures = lectures.filter((lecture) => String(lecture.subject || "").toUpperCase() === courseId);
  if (!subjectLectures.length) throw new Error(`No course material is available for ${courseId}.`);
  const query = [request.prompt, request.caselet].filter(Boolean).join("\n");
  // Retrieve from the authored question, not from candidate claims. The answer is
  // untrusted and must not be able to steer the authority corpus it is checked against.
  const candidates = weightedChunkRank(query, "", subjectLectures).slice(0, options.candidateLimit || 24);
  const limit = options.limit || 6;
  if (!candidates.length) return {evidence: [], retrievalMode: "subject-lexical"};
  const embed = options.embed;
  const embeddingModel = options.embeddingModel || process.env.DUNGEON_EMBEDDING_MODEL;
  if (!embed && !embeddingModel) {
    return {evidence: candidates.slice(0, limit).map(({lexicalScore, sourceOrder, ...chunk}) => chunk), retrievalMode: "subject-lexical"};
  }
  try {
    const vectors = embed
      ? await embed([query, ...candidates.map((chunk) => chunk.text)])
      : await lmStudioEmbeddings({
          model: embeddingModel,
          baseUrl: loopbackBaseUrl(options.baseUrl || process.env.LM_STUDIO_BASE_URL),
          texts: [query, ...candidates.map((chunk) => chunk.text)]
        });
    const queryVector = vectors[0];
    const lexicalMax = Math.max(1, ...candidates.map((chunk) => chunk.lexicalScore));
    const evidence = candidates
      .map((chunk, index) => ({
        ...chunk,
        hybridScore: cosine(queryVector, vectors[index + 1]) * .75 + (chunk.lexicalScore / lexicalMax) * .25
      }))
      .sort((left, right) => right.hybridScore - left.hybridScore || right.lexicalScore - left.lexicalScore || left.sourceOrder - right.sourceOrder)
      .slice(0, limit)
      .map(({lexicalScore, hybridScore, sourceOrder, ...chunk}) => chunk);
    return {evidence, retrievalMode: "subject-hybrid"};
  } catch (error) {
    return {evidence: candidates.slice(0, limit).map(({lexicalScore, sourceOrder, ...chunk}) => chunk), retrievalMode: "subject-lexical-fallback"};
  }
}

function loopbackBaseUrl(raw) {
  const parsed = new URL(raw || "http://127.0.0.1:1234/v1");
  if (!LOOPBACK_HOSTS.has(parsed.hostname) || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("LM Studio base URL must remain on loopback.");
  }
  return parsed.toString().replace(/\/$/, "");
}

async function lmStudioCompletion({model, baseUrl, messages, schema, schemaName = "dungeon_structured_response", maxTokens = 1000}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: maxTokens,
        stream: false,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {name: schemaName, strict: true, schema}
        }
      })
    });
    if (!response.ok) throw new Error(`LM Studio returned HTTP ${response.status}.`);
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LM Studio returned no structured judgement.");
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`${error.message} (finish=${payload?.choices?.[0]?.finish_reason || "unknown"}, chars=${content.length})`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function completionWithEncodingRetry(completion, args, validate) {
  let messages = args.messages;
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const output = await completion({...args, messages});
      if (validate(output)) return output;
      lastError = new Error("Qwen returned unexpected non-English or corrupted characters.");
      messages = encodingRepairMessages(args.messages);
    } catch (error) {
      lastError = error;
      messages = [
        {...args.messages[0], content: args.messages[0].content + " The previous structured response was not valid JSON. Regenerate the complete response from the task as one valid JSON object matching the supplied schema exactly. Escape quotation marks inside strings, close every array and object, and do not add markdown or commentary outside the JSON."},
        ...args.messages.slice(1)
      ];
    }
  }
  throw lastError || new Error("Qwen did not return a valid structured response twice.");
}

export async function gradeAnswer(request, options = {}) {
  const questionId = String(request?.questionId || "");
  const courseId = request?.courseId ? String(request.courseId) : undefined;
  const answer = String(request?.answer || "").trim();
  if (!/^[a-z0-9_-]{3,120}$/i.test(questionId)) throw new Error("Invalid question ID.");
  /* Before the length bound, before retrieval, before the model, before the text
   * leaves this process. A response that reads as distress is answered with help,
   * not a mark and not a character-count error, and is not transmitted to any
   * inference provider. Sliced to the length a real answer may be so an oversized
   * body cannot turn this into work. */
  if (distressSignal(answer.slice(0, 6000))) return supportResponse(questionId);

  if (answer.length < 20 || answer.length > 6000) throw new Error("Written response must be 20–6000 characters.");
  const found = options.question ? {courseId: courseId || options.courseId || "TEST", question: options.question} : findQuestion(questionId, courseId);
  const question = found.question;
  if (question.type !== "short-answer" || !(question.rubric || []).length) throw new Error("Question is not a rubric-marked written response.");

  const prepared = Array.isArray(request?._preparedEvidence) ? request._preparedEvidence : null;
  const allowedIds = new Set((question.sourceIds || [question.source]).filter(Boolean));
  const preparedValid = prepared && prepared.length > 0 && prepared.length <= 6 && prepared.every((chunk) =>
    chunk && allowedIds.has(chunk.lectureId) &&
    new RegExp(`^${String(chunk.lectureId).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}#[0-9]{2,4}$`).test(String(chunk.citation || "")) &&
    String(chunk.title || "").length <= 240 && String(chunk.text || "").length > 0 && String(chunk.text || "").length <= 9000
  );
  const sourceRoot = options.sourceRoot || process.env.DUNGEON_TRANSCRIPTS;
  const lectures = preparedValid ? null : (options.lectures || loadLectures(sourceRoot).lectures);
  const evidence = preparedValid ? prepared : retrieveEvidence(question, "", lectures);
  if (!evidence.length) throw new Error("No course evidence was retrieved.");
  const model = options.model || process.env.DUNGEON_GRADER_MODEL;
  if (!model) throw new Error("DUNGEON_GRADER_MODEL is not set.");
  const baseUrl = loopbackBaseUrl(options.baseUrl || process.env.LM_STUDIO_BASE_URL);
  const schema = judgementSchema(question);
  /* 4,096, not 1,000. Measured completion lengths on the approved checkpoint run
   * 717–1,000 tokens for a three-criterion judgement, so the old ceiling truncated
   * the JSON mid-string and abstained a question the model had actually marked
   * correctly. The Examiner coach was raised for this same reason; the marker was
   * left behind. */
  const completion = options.completion || (async ({messages, schema: passSchema}) => lmStudioCompletion({model, baseUrl, messages, schema: passSchema || schema, schemaName: "dungeon_rubric_judgement", maxTokens: 4096}));
  /* One whole judgement attempt: model call, encoding repair, deterministic gates.
   * Returns null when the attempt could not produce a judgement at all, so both
   * failure shapes — a parse/transport throw and a gate-rejected judgement — are
   * retryable by the same caller. An earlier version retried only the second shape,
   * which missed truncation entirely because that throws. */
  const attempt = async () => {
    try {
      const judgement = await completionWithEncodingRetry(completion, {pass: "marker", messages: judgementMessages("marker", question, answer, evidence), schema}, judgementEnglishValid);
      return acceptJudgement({question, answer, evidence, judgement, model, authority: "dungeon-local-practice"});
    } catch (error) {
      return null;
    }
  };
  try {
    /* Run-to-run variance at temperature 0 is real on this checkpoint: identical
     * input has returned full marks, partial marks, and an abstention across runs.
     * A second attempt converts some of that noise into a mark rather than sending
     * the learner to self-review. It is a fresh judgement under the same
     * deterministic gates, never a softer threshold. */
    let result = await attempt();
    if ((!result || result.abstain) && !options.noRetry) {
      const retried = await attempt();
      if (retried && !retried.abstain) result = retried;
    }
    if (result) return result;
    throw new Error("No attempt produced a judgement.");
  } catch (error) {
    return {
      kind: "rubric-mark",
      questionId: question.id,
      model,
      authority: "dungeon-local-practice",
      score: null,
      maxScore: (question.rubric || []).length,
      criteria: (question.rubric || []).map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
        decision: "uncertain",
        marksAwarded: 0,
        answerEvidence: "",
        sourceCitations: [],
        reason: "The local judgement did not complete reliably."
      })),
      abstain: true,
      abstainReason: "The local model did not return one deterministically valid judgement.",
      feedback: "Dungeon could not issue a reliable local mark. Use the visible rubric and exemplar instead.",
      repairConcepts: [],
      retrieval: evidence.map(({citation, lectureId, title}) => ({citation, lectureId, title}))
    };
  }
}

export function prepareAnswer(request, options = {}) {
  const questionId = String(request?.questionId || "");
  const courseId = request?.courseId ? String(request.courseId) : undefined;
  if (!/^[a-z0-9_-]{3,120}$/i.test(questionId)) throw new Error("Invalid question ID.");
  const found = options.question ? {courseId: courseId || options.courseId || "TEST", question: options.question} : findQuestion(questionId, courseId);
  const question = found.question;
  if (question.type !== "short-answer" || !(question.rubric || []).length) throw new Error("Question is not a rubric-marked written response.");
  const sourceRoot = options.sourceRoot || process.env.DUNGEON_TRANSCRIPTS;
  const lectures = options.lectures || loadLectures(sourceRoot).lectures;
  const evidence = retrieveEvidence(question, "", lectures);
  if (!evidence.length) throw new Error("No course evidence was retrieved.");
  return {kind: "written-evidence", questionId: question.id, courseId: found.courseId, evidence};
}

export async function analyzeAnswer(request, options = {}) {
  const requestedCourseId = String(request?.courseId || "").toUpperCase();
  const questionId = String(request?.questionId || "");
  const authored = questionId ? findQuestion(questionId, requestedCourseId) : null;
  const courseId = authored ? authored.courseId : requestedCourseId;
  const prompt = authored
    ? [authored.question.stem, "Review criteria:", ...(authored.question.rubric || []).map((criterion) => `${criterion.label}: ${criterion.description}`)].join("\n")
    : String(request?.prompt || "").trim();
  const caselet = authored ? String(authored.question.caselet || "") : String(request?.caselet || "").trim();
  const answer = String(request?.answer || "").trim();
  if (!COURSE_IDS.has(courseId)) throw new Error("Choose a valid Term 6 subject.");
  if (prompt.length < 10 || prompt.length > 2000) throw new Error("The question must be 10–2000 characters.");
  if (caselet.length > 4000) throw new Error("The optional case context is too long.");
  if (answer.length < 20 || answer.length > 6000) throw new Error("Written response must be 20–6000 characters.");
  const cleanRequest = {courseId, prompt, caselet, answer};
  const sourceRoot = options.sourceRoot || process.env.DUNGEON_TRANSCRIPTS;
  const lectures = options.lectures || loadLectures(sourceRoot).lectures;
  const baseUrl = loopbackBaseUrl(options.baseUrl || process.env.LM_STUDIO_BASE_URL);
  const authoredEvidence = authored ? retrieveEvidence(authored.question, "", lectures) : null;
  const retrieved = authored
    ? {evidence: authoredEvidence, retrievalMode: "declared-lecture"}
    : await retrieveSubjectEvidence(cleanRequest, lectures, {...options, baseUrl});
  if (!retrieved.evidence.length) throw new Error("No course evidence was retrieved.");
  const model = options.model || process.env.DUNGEON_GRADER_MODEL;
  if (!model) throw new Error("DUNGEON_GRADER_MODEL is not set.");
  const analysisSchema = coachSchema();
  const verificationSchema = coachVerifierSchema();
  const completion = options.completion || (async ({messages, schema, pass}) => lmStudioCompletion({
      model,
      baseUrl,
      messages,
      schema,
      schemaName: pass === "analyst" ? "dungeon_grounded_coaching" : "dungeon_coaching_verification",
      maxTokens: pass === "analyst" ? 4096 : 2048
  }));
  try {
    const analyst = await completionWithEncodingRetry(completion, {
      pass: "analyst",
      messages: coachMessages("analyst", cleanRequest, retrieved.evidence),
      schema: analysisSchema
    }, (output) => coachEnglishValid(output, "analyst"));
    const verifier = await completionWithEncodingRetry(completion, {
      pass: "coach-verifier",
      messages: coachMessages("verifier", cleanRequest, retrieved.evidence, analyst),
      schema: verificationSchema
    }, (output) => coachEnglishValid(output, "verifier"));
    return mergeCoachAnalysis({
      request: cleanRequest,
      evidence: retrieved.evidence,
      analyst,
      verifier,
      model,
      authority: "dungeon-local-practice-coach",
      retrievalMode: retrieved.retrievalMode
    });
  } catch (error) {
    const failure = String(error?.message || "Unknown coaching failure.").replace(/[\r\n]+/g, " ").slice(0, 240);
    return {
      kind: "grounded-coaching",
      model,
      authority: "dungeon-local-practice-coach",
      courseId,
      abstain: true,
      abstainReason: `The two local analysis passes did not complete reliably. ${failure}`,
      answerSummary: "Dungeon could not ground a reliable analysis in the selected subject.",
      strengths: [],
      gaps: [],
      suggestedAnswer: "",
      sourceCitations: [],
      retrievalMode: retrieved.retrievalMode,
      retrieval: retrieved.evidence.map(({citation, lectureId, title}) => ({citation, lectureId, title}))
    };
  }
}

export async function health(options = {}) {
  const model = options.model || process.env.DUNGEON_GRADER_MODEL;
  const baseUrl = loopbackBaseUrl(options.baseUrl || process.env.LM_STUDIO_BASE_URL);
  if (!model) return {available: false, model: null, reason: "DUNGEON_GRADER_MODEL is not set."};
  const sourceRoot = options.sourceRoot || process.env.DUNGEON_TRANSCRIPTS;
  if (!sourceRoot && !options.lectures) {
    return {available: false, model, baseUrl, reason: "DUNGEON_TRANSCRIPTS is not set."};
  }
  let lectureCount = 0;
  try {
    const lectures = options.lectures || loadLectures(sourceRoot).lectures;
    lectureCount = Array.isArray(lectures) ? lectures.length : 0;
    if (!lectureCount) throw new Error("No lectures loaded.");
  } catch (error) {
    return {available: false, model, baseUrl, reason: "The configured transcript source could not be loaded."};
  }
  try {
    const response = await fetch(`${baseUrl}/models`, {headers: {Accept: "application/json"}});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const ids = Array.isArray(payload.data) ? payload.data.map((entry) => entry.id) : [];
    const embeddingModel = options.embeddingModel || process.env.DUNGEON_EMBEDDING_MODEL || null;
    return ids.includes(model)
      ? {available: true, provider: "local-lm-studio", model, embeddingModel: embeddingModel && ids.includes(embeddingModel) ? embeddingModel : null, baseUrl, lectureCount, capabilities: ["rubric-mark", "subject-coach"]}
      : {available: false, model, baseUrl, reason: "The configured model is not loaded in LM Studio.", loadedModels: ids};
  } catch (error) {
    return {available: false, model, baseUrl, reason: "LM Studio is not reachable on loopback."};
  }
}

async function readStdin() {
  let body = "";
  for await (const chunk of process.stdin) body += chunk;
  return JSON.parse(body || "{}");
}

async function main() {
  const mode = process.argv[2];
  if (mode === "--health") {
    process.stdout.write(JSON.stringify(await health()));
    return;
  }
  if (mode === "--stdin") {
    const request = await readStdin();
    process.stdout.write(JSON.stringify(request?.kind === "coach" ? await analyzeAnswer(request) : request?.kind === "prepare" ? prepareAnswer(request) : await gradeAnswer(request)));
    return;
  }
  throw new Error("Usage: node tools/local-grader.mjs --health|--stdin");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
