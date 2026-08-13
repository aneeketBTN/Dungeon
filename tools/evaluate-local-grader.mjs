#!/usr/bin/env node

/* Runs an owner-marked JSONL calibration set through the configured local grader.
 * Candidate answers never appear in the report; the source JSONL remains local. */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {findQuestion, gradeAnswer} from "./local-grader.mjs";

const DECISIONS = new Set(["met", "not_met"]);

export function parseCalibration(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line, index) => {
      const item = JSON.parse(line);
      if (!item.id || !item.courseId || !item.questionId || String(item.answer || "").trim().length < 20) {
        throw new Error(`Calibration line ${index + 1} is missing id, courseId, questionId, or a substantive answer.`);
      }
      if (item.expectedAbstain !== true) {
        if (!item.expected || !Object.keys(item.expected).length || Object.values(item.expected).some((value) => !DECISIONS.has(value))) {
          throw new Error(`Calibration line ${index + 1} needs met/not_met decisions or expectedAbstain:true.`);
        }
      }
      return item;
    });
}

export function validateCalibrationCases(cases) {
  const seen = new Set();
  cases.forEach((item) => {
    if (seen.has(item.id)) throw new Error(`Duplicate calibration id: ${item.id}`);
    seen.add(item.id);
    const {question} = findQuestion(item.questionId, item.courseId);
    if (item.expectedAbstain === true) return;
    const expectedIds = (question.rubric || []).map((criterion) => criterion.id).sort();
    const labelledIds = Object.keys(item.expected || {}).sort();
    if (JSON.stringify(expectedIds) !== JSON.stringify(labelledIds)) {
      throw new Error(`Calibration ${item.id} must label every rubric criterion exactly once.`);
    }
  });
  return cases;
}

export function summarizeCalibration(cases, results, durationsMs = []) {
  const report = {
    cases: cases.length,
    subjects: {},
    issued: 0,
    abstained: 0,
    expectedAbstentions: 0,
    unsafeAmbiguousIssues: 0,
    criterionCount: 0,
    criterionCorrect: 0,
    falseAwards: 0,
    falseDenials: 0,
    exactCases: 0,
    details: []
  };
  cases.forEach((item, index) => {
    const result = results[index];
    report.subjects[item.courseId] = (report.subjects[item.courseId] || 0) + 1;
    if (result?.abstain) report.abstained += 1; else report.issued += 1;
    if (item.expectedAbstain) {
      report.expectedAbstentions += 1;
      if (!result?.abstain) report.unsafeAmbiguousIssues += 1;
      report.details.push({id:item.id, courseId:item.courseId, questionId:item.questionId, expected:"abstain", actual:result?.abstain ? "abstain" : "issued"});
      return;
    }
    let exact = !result?.abstain;
    const actualById = new Map((result?.criteria || []).map((criterion) => [criterion.id, criterion.decision]));
    Object.entries(item.expected).forEach(([criterionId, expected]) => {
      const actual = result?.abstain ? "abstain" : actualById.get(criterionId) || "missing";
      report.criterionCount += 1;
      if (actual === expected) report.criterionCorrect += 1; else exact = false;
      if (expected === "not_met" && actual === "met") report.falseAwards += 1;
      if (expected === "met" && actual === "not_met") report.falseDenials += 1;
    });
    if (exact) report.exactCases += 1;
    report.details.push({id:item.id, courseId:item.courseId, questionId:item.questionId, expected:"criterion-mark", actual:result?.abstain ? "abstain" : `${result.score}/${result.maxScore}`, exact});
  });
  const judgeableCases = Math.max(1, report.cases - report.expectedAbstentions);
  report.criterionAccuracy = report.criterionCount ? report.criterionCorrect / report.criterionCount : 0;
  report.exactCaseRate = report.exactCases / judgeableCases;
  report.abstentionRate = report.abstained / Math.max(1, report.cases);
  report.falseAwardRate = report.falseAwards / Math.max(1, report.criterionCount);
  if (durationsMs.length) {
    const sorted = durationsMs.slice().sort((left, right) => left - right);
    const percentile = (fraction) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
    report.latency = {
      meanSeconds: Number((durationsMs.reduce((total, value) => total + value, 0) / durationsMs.length / 1000).toFixed(2)),
      p50Seconds: Number((percentile(.5) / 1000).toFixed(2)),
      p95Seconds: Number((percentile(.95) / 1000).toFixed(2))
    };
  }
  report.smokeCoverage = report.cases >= 20 && ["BRGSA", "IBM", "SCLM", "SPMS"].every((courseId) => (report.subjects[courseId] || 0) >= 5);
  report.provisionalAuthorityGate = report.cases >= 48 && ["BRGSA", "IBM", "SCLM", "SPMS"].every((courseId) => (report.subjects[courseId] || 0) >= 12) && report.falseAwardRate <= .05 && report.exactCaseRate >= .85 && report.abstentionRate <= .30 && report.unsafeAmbiguousIssues === 0;
  report.gateNote = "These are provisional product acceptance thresholds, not a psychometric validation. Owner review remains required.";
  return report;
}

async function main() {
  const filename = process.argv[2];
  if (!filename) throw new Error("Usage: node tools/evaluate-local-grader.mjs <owner-marked.jsonl>");
  const cases = validateCalibrationCases(parseCalibration(fs.readFileSync(filename, "utf8")));
  const results = [];
  const durationsMs = [];
  for (const item of cases) {
    process.stderr.write(`Checking ${item.id} (${item.courseId})\n`);
    const started = performance.now();
    results.push(await gradeAnswer(item));
    durationsMs.push(performance.now() - started);
  }
  process.stdout.write(`${JSON.stringify(summarizeCalibration(cases, results, durationsMs), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
