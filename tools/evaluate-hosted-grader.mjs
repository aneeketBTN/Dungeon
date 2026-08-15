#!/usr/bin/env node

/* Runs the owner-marked rubric calibration against the exact Workers AI checkpoint
 * intended for production. It makes no deployment or configuration change and never
 * includes candidate text in its report.
 *
 * It calls gradeHostedAnswer itself rather than reimplementing the marking loop, so
 * what is measured is the shipped path: the same frozen evidence, acceptance gates,
 * token ceiling and retry the worker will run. Only env.AI.run is swapped, for the
 * REST endpoint that backs the same models.
 *
 * There is no Vectorize index and no embedding call: a question's evidence does not
 * depend on the answer, so it ships frozen in the bundle. */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {parseCalibration, summarizeCalibration, validateCalibrationCases} from "./evaluate-local-grader.mjs";
import {HOSTED_QWEN_MODEL, WRITTEN_EVIDENCE_VERSION, gradeHostedAnswer} from "../cloudflare/src/written-authority.mjs";

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

function hostedEnv(accountId, token, counters) {
  return {
    DUNGEON_HOSTED_WRITTEN: "on",
    DUNGEON_HOSTED_WRITTEN_MODEL: HOSTED_QWEN_MODEL,
    DUNGEON_HOSTED_WRITTEN_APPROVED_MODEL: HOSTED_QWEN_MODEL,
    DUNGEON_HOSTED_WRITTEN_CORPUS: WRITTEN_EVIDENCE_VERSION,
    AI: {
      run: async (model, input) => {
        counters.modelCalls += 1;
        return cloudflare(accountId, token, `/ai/run/${model}`, input);
      }
    }
  };
}

async function main() {
  const filename = process.argv[2];
  if (!filename) throw new Error("Usage: node tools/evaluate-hosted-grader.mjs <owner-marked.jsonl>");
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) throw new Error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in the terminal environment.");
  const cases = validateCalibrationCases(parseCalibration(fs.readFileSync(path.resolve(filename), "utf8")));
  const counters = {modelCalls: 0};
  const env = hostedEnv(accountId, token, counters);
  const results = [];
  const durationsMs = [];
  for (const item of cases) {
    process.stderr.write(`Checking ${item.id} (${item.courseId})\n`);
    const started = performance.now();
    try {
      results.push(await gradeHostedAnswer(env, {questionId: item.questionId, courseId: item.courseId, answer: item.answer}));
    } catch (error) {
      /* A transport or activation failure is an abstention, not a silent pass. */
      process.stderr.write(`  failed: ${error.message}\n`);
      results.push({abstain: true, abstainReason: error.message, criteria: []});
    }
    durationsMs.push(performance.now() - started);
  }
  const report = summarizeCalibration(cases, results, durationsMs);
  report.runtime = {
    provider: "cloudflare-workers-ai",
    model: HOSTED_QWEN_MODEL,
    evidenceVersion: WRITTEN_EVIDENCE_VERSION,
    retrieval: "frozen-lecture-evidence",
    modelCalls: counters.modelCalls
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
