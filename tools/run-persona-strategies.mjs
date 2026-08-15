/*
 * The three personas, run against the harness JSON instead of the browser.
 *
 * The cram test's single most useful number was Lazy's controlled split: test-craft
 * scored 25/25 on SCLM Section A while blind guessing scored chance. That experiment
 * is mechanical — it is a set of rules applied to option text — so it does not need a
 * browser, a persona, or 390 tool calls. It needs the paper and the key.
 *
 * Each strategy below is one of the reported exploits, stated as code so it can be
 * re-run after any bank change:
 *
 *   longest        pick the longest option            (the bank-wide length bias)
 *   fixedB         always pick B                      (F-07, the BRGSA key)
 *   onTopic        pick the only option naming the concept from the stem   (F-05)
 *   noAbsolutes    eliminate options carrying only/all/every/never/always  (F-06)
 *   ethical        eliminate options proposing hiding, deleting, ignoring  (F-06)
 *
 * Ties are resolved by taking the expected value of picking at random among the
 * survivors, so a strategy that narrows four options to two scores 0.5, not 1. That
 * is what the strategy actually achieves and it stops a rule looking better than it is.
 *
 * USAGE  node tools/run-persona-strategies.mjs [harnessDir]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2] || path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

const ABSOLUTES = /\b(only|all|every|always|never|entirely|automatically|simply|any|no other|nothing else)\b/i;
const UNETHICAL = /\b(hide|hiding|delete|deleting|ignore|ignoring|double-count|conceal|omit|misreport)\b/i;

function words(s) { return String(s || "").trim().split(/\s+/).filter(Boolean).length; }

/* Expected marks for picking uniformly among `survivors` when `answer` is correct. */
function expected(survivors, answer, marks) {
  if (!survivors.length) return 0;
  return survivors.includes(answer) ? marks / survivors.length : 0;
}

const STRATEGIES = {
  longest: (q) => {
    const lengths = q.options.map(words);
    const max = Math.max(...lengths);
    return q.options.map((_, i) => i).filter((i) => lengths[i] === max);
  },
  fixedB: (q) => (q.options.length > 1 ? [1] : [0]),
  onTopic: (q) => {
    /* The concept name as it appears in the stem, e.g. "Which explanation best
       connects Strategic fit to the wider subject?" — then keep only options that
       mention it. Before the fix exactly one option did. */
    const m = /connects (.+?) to the wider subject/i.exec(q.stem || "");
    if (!m) return q.options.map((_, i) => i);
    const name = m[1].toLowerCase();
    const hits = q.options.map((o, i) => [o.toLowerCase().includes(name), i]).filter(([h]) => h).map(([, i]) => i);
    return hits.length ? hits : q.options.map((_, i) => i);
  },
  noAbsolutes: (q) => {
    const keep = q.options.map((_, i) => i).filter((i) => !ABSOLUTES.test(q.options[i]));
    return keep.length ? keep : q.options.map((_, i) => i);
  },
  ethical: (q) => {
    const keep = q.options.map((_, i) => i).filter((i) => !UNETHICAL.test(q.options[i]));
    return keep.length ? keep : q.options.map((_, i) => i);
  },
  combined: (q) => {
    let keep = q.options.map((_, i) => i);
    const drop = (test) => {
      const next = keep.filter((i) => !test(q.options[i]));
      if (next.length) keep = next;
    };
    drop((o) => ABSOLUTES.test(o));
    drop((o) => UNETHICAL.test(o));
    const m = /connects (.+?) to the wider subject/i.exec(q.stem || "");
    if (m) {
      const name = m[1].toLowerCase();
      const on = keep.filter((i) => q.options[i].toLowerCase().includes(name));
      if (on.length) keep = on;
    }
    return keep;
  }
};

/* Every seeded set that has been exported, not just the first.
 *
 * A paper draws 20–50 questions from a pool of 52–120, so a single seed is a sample
 * and its noise is the size of the effect this measures. Sixteen BRGSA items moved
 * set 1's "eliminate the absolutes" score from 36.2% to 46.3% while the bank-wide
 * bias fell, purely because the reshuffled draw picked up four items where all three
 * distractors carry one. Reading one seed cannot separate a bank change from a draw,
 * so each set is reported and the mean is the headline. */
function scoreSet(subject, setNumber) {
  const paperPath = path.join(dir, `${subject}-set${setNumber}.json`);
  const keyPath = path.join(dir, `${subject}-set${setNumber}.key.json`);
  if (!fs.existsSync(paperPath) || !fs.existsSync(keyPath)) return null;
  const paper = JSON.parse(fs.readFileSync(paperPath, "utf8"));
  const keyFile = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  if (paper.digest !== keyFile.digest) throw new Error(`${subject} set ${setNumber}: paper and key are from different draws`);
  const keyById = Object.fromEntries(keyFile.key.map((k) => [k.id, k]));

  /* Single-answer MCQs only — the formats these exploits are stated against. Written,
     numeric, msq and match are reported separately as "craft cannot reach". */
  const mcq = paper.paper.filter((q) => q.type === "mcq" && Array.isArray(q.options));
  const reachable = mcq.reduce((s, q) => s + q.marks, 0);
  const totalMarks = paper.paper.reduce((s, q) => s + q.marks, 0);
  if (!reachable) {
    return { set: setNumber, mcqQuestions: 0, mcqMarks: 0, paperMarks: totalMarks, craftCannotReach: totalMarks, percentOfMcqMarks: null };
  }

  const scores = {};
  for (const [name, rule] of Object.entries(STRATEGIES)) {
    let got = 0;
    for (const q of mcq) got += expected(rule(q), keyById[q.id].answer, q.marks);
    scores[name] = Math.round((got / reachable) * 1000) / 10;
  }
  scores.chance = Math.round((mcq.reduce((s, q) => s + q.marks / q.options.length, 0) / reachable) * 1000) / 10;

  return {
    set: setNumber,
    mcqQuestions: mcq.length,
    mcqMarks: reachable,
    paperMarks: totalMarks,
    craftCannotReach: totalMarks - reachable,
    percentOfMcqMarks: scores
  };
}

const report = {};
for (const subject of ["SPMS", "BRGSA", "SCLM", "IBM"]) {
  const sets = [1, 2, 3].map((n) => scoreSet(subject, n)).filter(Boolean);
  if (!sets.length) continue;
  const scored = sets.filter((s) => s.percentOfMcqMarks);
  const mean = {};
  if (scored.length) {
    for (const name of Object.keys(scored[0].percentOfMcqMarks)) {
      const total = scored.reduce((sum, s) => sum + s.percentOfMcqMarks[name], 0);
      mean[name] = Math.round((total / scored.length) * 10) / 10;
    }
  }
  report[subject] = {
    setsMeasured: sets.map((s) => s.set),
    /* The number to read. A per-set row is a sample; this is the estimate. */
    meanPercentOfMcqMarks: scored.length ? mean : null,
    bySet: sets
  };
}

console.log(JSON.stringify(report, null, 2));
