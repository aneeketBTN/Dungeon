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
/* Flags are not the harness directory. `process.argv[2]` used to be taken as the path,
   so `--gate` became a directory name, every export lookup missed, and the gate
   reported a pass over a report containing nothing at all — LAW-67, and the second
   time this exact shape has appeared in a gate written to catch it. */
const dir = process.argv.slice(2).filter((a) => !a.startsWith("--"))[0] ||
  path.join(here, "..", "evidence", "2026-08-15", "persona-harness");

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
  /* "Pick the second-longest."
   *
   * Added 2026-08-15, and it is the rule that pays best on this bank. It exists
   * because the defence against `longest` created it: `comparableWrong` selects
   * distractors closest in length to the correct answer, which was the right move
   * against "pick the longest" — and it clusters the four lengths so tightly that the
   * answer lands one rank below the top far more often than chance. Defeating one
   * shape cue manufactured its neighbour, and nothing was watching that rank.
   *
   * `lengthRankShares` in the bank validator counts the answer's exact position in an
   * ascending sort. That is not what a candidate can execute: where several options
   * tie on length they cannot tell which is "second", so this resolves ties by
   * guessing among them, exactly as every other rule here does. The two numbers differ
   * by up to 10 points and this one is the honest one. */
  secondLongest: (q) => {
    const lengths = q.options.map(words);
    const max = Math.max(...lengths);
    const below = lengths.filter((l) => l < max);
    if (!below.length) return q.options.map((_, i) => i);
    const second = Math.max(...below);
    return q.options.map((_, i) => i).filter((i) => lengths[i] === second);
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
  },
  /* The same three content rules, then length as the tie-break a person would reach
     for last. Kept SEPARATE from `combined` rather than folded into it: `combined`
     carries a 32% limit calibrated against its three-rule form in the overhaul brief,
     and quietly adding a fourth rule to it would have made every earlier reading of
     that number incomparable with this one. */
  combinedWithLength: (q) => {
    let keep = STRATEGIES.combined(q);
    if (keep.length > 1) {
      const lengths = keep.map((i) => words(q.options[i]));
      const max = Math.max(...lengths);
      const below = lengths.filter((l) => l < max);
      if (below.length) {
        const second = Math.max(...below);
        const narrowed = keep.filter((i) => words(q.options[i]) === second);
        if (narrowed.length) keep = narrowed;
      }
    }
    return keep;
  }
};

/* Thresholds, and the gate that holds them.
 *
 * §6 of the overhaul brief sets these; `secondLongest` is new and takes the same 30%
 * the other shape rules take, because it is the same kind of rule and a candidate can
 * execute it just as easily. `chance` is excluded — it is the baseline, not a rule. */
const LIMITS = {
  longest: 30, secondLongest: 30, onTopic: 32,
  noAbsolutes: 30, ethical: 35, combined: 32, combinedWithLength: 32
};

/* `fixedB` is reported and deliberately NOT gated here.
 *
 * "Always press B" is a claim about the bank's answer slots, and `validate_t6_bank.js`
 * already checks that exactly: `answerSlotShares` is 0.25/0.25/0.25/0.25 on every
 * subject, because `balanceAnswerPositions` deals slots flat by construction. What
 * this file measures is one 50-of-100 draw from that flat pool, where the standard
 * error is about 6 points — so a gate at 30% fires on sampling noise roughly a third
 * of the time and says nothing about the bank. SCLM read 32 / 28 / 32 across its three
 * sets from a provably flat pool. Gating the sample would be measuring the draw. */

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

report.limits = LIMITS;

console.log(JSON.stringify(report, null, 2));

/* A report with no subjects in it is not a clean bank, it is a missing input. Refuse
   rather than let anything downstream read silence as a pass (LAW-67). */
const measured = Object.keys(report).filter((k) => k !== "limits");
if (!measured.length) {
  console.error(`\nNo persona exports found in ${dir}. Run: node tools/export-persona-run.mjs`);
  process.exit(1);
}

if (process.argv.includes("--gate")) {
  const over = [];
  for (const [subject, row] of Object.entries(report)) {
    if (subject === "limits" || !row.meanPercentOfMcqMarks) continue;
    for (const [rule, limit] of Object.entries(LIMITS)) {
      const value = row.meanPercentOfMcqMarks[rule];
      if (typeof value === "number" && value > limit) over.push(`${subject} ${rule} ${value}% > ${limit}%`);
    }
  }
  if (over.length) {
    console.error("\nT3 FAILED — a mechanical rule pays above its limit on the mock paper:");
    for (const line of over) console.error(`  × ${line}`);
    process.exit(1);
  }
  console.error("\nT3 passed: every mechanical rule at or under its limit, mean of sets 1-3.");
}
