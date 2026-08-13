#!/usr/bin/env node

/* Runs the owner-marked rubric calibration directly against the exact Workers AI
 * checkpoint and Vectorize corpus intended for production. It makes no deployment
 * or configuration change and never includes candidate text in its report. */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {parseCalibration, summarizeCalibration, validateCalibrationCases} from "./evaluate-local-grader.mjs";
import {judgementMessages, judgementSchema, mergeJudgements} from "./lib/written_authority.mjs";
import {findQuestion} from "./local-grader.mjs";
import {HOSTED_EMBEDDING_MODEL, HOSTED_QWEN_MODEL} from "../cloudflare/src/written-authority.mjs";

async function cloudflare(accountId, token, pathname, body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}${pathname}`, {
    method: "POST",
    headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Cloudflare request failed with HTTP ${response.status}.`);
  const payload = await response.json();
  if (!payload?.success) throw new Error("Cloudflare rejected the calibration request.");
  return payload.result;
}

async function evidenceFor(accountId, token, indexName, corpusVersion, question) {
  const query = [question.stem, question.caselet, ...question.rubric.flatMap((criterion) => [criterion.label, criterion.description])].join("\n");
  const embedding = await cloudflare(accountId, token, `/ai/run/${HOSTED_EMBEDDING_MODEL}`, {text: [query]});
  const vector = embedding?.data?.[0];
  if (!Array.isArray(vector) || vector.length !== 1024) throw new Error("Hosted calibration embedding was invalid.");
  const result = await cloudflare(accountId, token, `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/query`, {
    vector,
    filter: {courseId: question.courseId, corpusVersion, lectureId: {$in: question.sourceIds}},
    topK: 6,
    returnMetadata: "all",
    returnValues: false
  });
  const allowed = new Set(question.sourceIds);
  const evidence = (result?.matches || []).flatMap((match) => {
    const metadata = match?.metadata || {};
    if (metadata.courseId !== question.courseId || metadata.corpusVersion !== corpusVersion || !allowed.has(metadata.lectureId)) return [];
    return [{citation:String(metadata.citation || ""), lectureId:String(metadata.lectureId || ""), title:String(metadata.title || ""), text:String(metadata.text || "")}];
  }).filter((item) => item.citation && item.lectureId && item.text);
  if (!evidence.length) throw new Error(`No source-valid hosted evidence for ${question.id}.`);
  return evidence;
}

async function completion(accountId, token, messages, schema) {
  const result = await cloudflare(accountId, token, `/ai/run/${HOSTED_QWEN_MODEL}`, {
    messages,
    temperature: 0,
    max_tokens: 2200,
    response_format: {type: "json_schema", json_schema: schema}
  });
  if (typeof result?.response !== "string" || result.response.length > 40000) throw new Error("Hosted Qwen returned no bounded structured result.");
  return JSON.parse(result.response);
}

async function gradeCase(accountId, token, indexName, corpusVersion, item) {
  const {question} = findQuestion(item.questionId, item.courseId);
  const evidence = await evidenceFor(accountId, token, indexName, corpusVersion, question);
  const schema = judgementSchema(question);
  try {
    const grader = await completion(accountId, token, judgementMessages("grader", question, item.answer, evidence), schema);
    const verifier = await completion(accountId, token, judgementMessages("verifier", question, item.answer, evidence), schema);
    return mergeJudgements({question, answer:item.answer, evidence, grader, verifier, model:HOSTED_QWEN_MODEL, authority:"dungeon-hosted-calibration"});
  } catch (error) {
    return mergeJudgements({question, answer:item.answer, evidence, grader:null, verifier:null, model:HOSTED_QWEN_MODEL, authority:"dungeon-hosted-calibration"});
  }
}

async function main() {
  const filename = process.argv[2];
  const corpusVersion = process.argv[3];
  if (!filename || !corpusVersion) throw new Error("Usage: node tools/evaluate-hosted-grader.mjs <owner-marked.jsonl> <corpus-version>");
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const indexName = process.env.DUNGEON_VECTORIZE_INDEX || "dungeon-t6-course-rag-v1";
  if (!accountId || !token) throw new Error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the terminal environment.");
  const cases = validateCalibrationCases(parseCalibration(fs.readFileSync(path.resolve(filename), "utf8")));
  const results = [];
  const durationsMs = [];
  for (const item of cases) {
    process.stderr.write(`Checking ${item.id} (${item.courseId})\n`);
    const started = performance.now();
    results.push(await gradeCase(accountId, token, indexName, corpusVersion, item));
    durationsMs.push(performance.now() - started);
  }
  const report = summarizeCalibration(cases, results, durationsMs);
  report.runtime = {provider:"cloudflare-workers-ai", model:HOSTED_QWEN_MODEL, embeddingModel:HOSTED_EMBEDDING_MODEL, indexName, corpusVersion};
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
