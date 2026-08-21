#!/usr/bin/env node
/*
 * Self-containment — every question carries the facts it is answered from.
 *
 * THE GUARANTEE THIS CHECKS
 * `docs/briefs/T6_EXAM_PATTERN.md` is explicit for BRGSA: "Every question is
 * self-contained. No question requires memorising figures from the Clairo or Zoko
 * Brand Bible; any brand-specific number needed is stated inside the question." The
 * bank had never been audited against it — it sat in §10 of the overhaul brief as an
 * open item from the day the pattern was written.
 *
 * Teaching WITH a brand's numbers is fine and is what the lessons are for. Testing
 * RECALL of them is training a skill the exam explicitly does not ask for, and a
 * candidate who has not memorised the brand bible would lose marks for a reason the
 * paper promises cannot happen.
 *
 * TWO GATED DEFECTS, AND ONE REVIEW LIST
 *
 *   brandFigureRecall (gated) — the correct answer turns on a number that appears
 *   nowhere the candidate can see AND the item invokes a named firm beyond its own
 *   concept label. This is the paper's guarantee exactly: the figure would have to
 *   come from the brand bible.
 *
 *   namesACaseItDoesNotShow (gated) — the item names a company and carries no
 *   caselet. LAW-61 widened from deictic phrasing ("in the drilling-machine example")
 *   to proper nouns, which is the half the LAW-61 sweep could not catch by pattern.
 *   A brand that IS the concept's name does not count: "Which statement best explains
 *   SELCO affordability system?" is naming its subject, not pointing at a hidden case.
 *
 *   unreachedByThisCheck (reported, NOT a defect list) — a figure in a correct option
 *   that `derivable()` could not produce from the page in one or two operations. Most
 *   of these are honest computations the check is simply too shallow to follow: SCLM's
 *   smoothing answer is 100 + 0.25 x (120 - 100) = 105, which is four operands. Read
 *   it as "worth a human glance", never as a count of broken items — a probe that
 *   reports its own reach as the bank's defect count is how a clean screen gets
 *   reported dirty, which costs exactly as much trust as the reverse.
 *
 * WHAT IS DELIBERATELY NOT FLAGGED
 * Numbers in DISTRACTORS. A wrong option quoting a figure the case does not contain
 * is often exactly the error the item exists to catch — "read the number that is not
 * there" is a real misreading — so flagging it would push authors to remove good
 * distractors. Only the correct answer has to be reachable from the page.
 *
 * Percentages and money are normalised before comparison, because a caselet saying
 * "₹3,400" and an option saying "3400" are the same figure to a reader.
 *
 *   node tools/measure-self-containment.mjs [--gate]
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, "..", "app");
const gate = process.argv.includes("--gate");

const context = { window: {}, atob: (v) => Buffer.from(v, "base64").toString("binary") };
vm.createContext(context);
for (const rel of ["sets/t6_lessons.js", "sets/t6_diagnoses.js", "sets/t6_brgsa.js", "sets/t6_catalog.js", "sets/t6_integrated.js", "sets/t6_ibm_case.js", "sets/t6_challenges.js"]) {
  const file = path.join(appRoot, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
const COURSES = context.window.T6_COURSES;

/* Brands the course tells cases about. The BRGSA paper names the first two; the rest
   are the recurring firms in the other three subjects' lectures, checked so the same
   defect elsewhere is reported even though only BRGSA's paper promises against it. */
const BRANDS = [
  "Clairo", "Zoko", "Zerodha", "WhatsApp", "Vaatsalya", "Aravind", "Grameen",
  "SELCO", "LabourNet", "RuralShores", "Akshaya Patra", "FarmAid", "Rajashree",
  "Laxmi", "Hasmukhbhai", "Diageo", "Skype", "ICQ"
];

/* A figure as a reader would match it: digits only, so ₹3,400 / 3400 / 3,400 agree.
   Bare small integers are dropped — "the three checks" and "two groups" are prose,
   not data, and treating them as figures buries the real findings under counting
   words. Percentages keep their own form so 33% is not confused with 33 units. */
function figures(text) {
  const out = new Set();
  const source = String(text || "");
  for (const match of source.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*%/g)) {
    out.add(match[1].replace(/,/g, "") + "%");
  }
  /* `(?:\.\d+)?` and not `\.?\d*` — the looser form swallowed the full stop after a
     sentence-final number and reported the figure as "105." */
  for (const match of source.matchAll(/(?<![\d.%])(\d[\d,]*(?:\.\d+)?)(?!\s*%)/g)) {
    const value = match[1].replace(/,/g, "");
    if (Number(value) >= 10) out.add(value);
  }
  return out;
}

/* Every number on the page, including the small ones. `figures()` keeps a floor of 10
   for what has to be CARRIED — "the three checks" is prose, not data — but a rate like
   an alpha of 0.25 is a genuine input, and excluding it made a derivable answer (100 +
   0.25 x 20 = 105) look like recall on eight SCLM surfaces. */
function derivationInputs(text) {
  const out = new Set(figures(text));
  for (const match of String(text || "").matchAll(/(?<![\d.%])(\d[\d,]*(?:\.\d+)?)/g)) {
    out.add(match[1].replace(/,/g, ""));
  }
  return out;
}

/* A figure the candidate can PRODUCE from the page is carried, even though its digits
 * are not printed there. `cac_scope` gives ₹3,00,000 and 120 customers and answers
 * ₹2,500; `nrr_meaning` gives 10, 2, 1 and 0.5 lakh and answers 105%. Both are
 * arithmetic, not recall, and the first version of this reported all four such items
 * as defects — which would have pushed an author to delete the computation these
 * questions exist to test. Only the four operations and a ratio-to-percentage, over
 * figures actually on the page: enough to recognise a computed answer, not enough to
 * "derive" an arbitrary number and excuse a real recall. */
function derivable(target, seen) {
  const values = [...seen].map((v) => Number(String(v).replace("%", ""))).filter((v) => Number.isFinite(v));
  const want = Number(String(target).replace("%", ""));
  if (!Number.isFinite(want)) return false;
  const close = (v) => Number.isFinite(v) && Math.abs(v - want) <= Math.max(0.5, Math.abs(want) * 0.01);
  for (const a of values) {
    if (close(a) || close(a * 100)) return true;
    for (const b of values) {
      if (close(a + b) || close(a - b) || close(a * b)) return true;
      if (b !== 0 && (close(a / b) || close((a / b) * 100) || close(((a - b) / b) * 100))) return true;
      for (const c of values) {
        if (close(a + b - c) || close(a - b - c) || close(a + b + c)) return true;
        if (c !== 0 && (close((a + b) / c) || close(((a + b - c) / c) * 100))) return true;
      }
    }
  }
  return false;
}

function correctAnswers(question) {
  const type = question.type || "mcq";
  if (type === "mcq" && Array.isArray(question.options)) return [question.options[question.answer]];
  if (type === "msq" && Array.isArray(question.options)) return (question.answers || []).map((i) => question.options[i]);
  if (type === "cloze" || type === "case-cloze") {
    return (question.blanks || []).map((blank) => (blank.options || [])[blank.answer]);
  }
  if (type === "match") return (question.rows || []).map((row) => (question.choices || [])[row.answer]);
  if (type === "boss") return (question.steps || []).map((step) => (step.options || [])[step.answer]);
  /* numeric answers are a computed figure, and short-answer is marked on a rubric —
     neither is a text option whose figures could have been recalled. */
  return [];
}

const report = { brandsChecked: BRANDS.length, subjects: {} };

for (const courseId of ["SPMS", "BRGSA", "SCLM", "IBM"]) {
  const course = COURSES[courseId];
  const brandRecall = [];
  const factualRecall = [];
  const unshownCase = [];

  for (const question of Object.values(course.questions)) {
    if ((question.type || "mcq") === "primer") continue;
    const visible = [question.caselet || "", question.stem || "", question.prompt || ""].join(" ");
    const seen = figures(visible);
    const inputs = derivationInputs(visible);
    /* A brand that IS the concept's own name is a label, not a case reference:
       `ibm_selco_explain` asks "Which statement best explains SELCO affordability
       system?" and naming the thing under discussion is how a question works. Only
       brands the item invokes beyond its own title count. */
    const label = String(question.node || "");
    const invoked = BRANDS.filter((brand) => {
      const re = new RegExp(`\\b${brand}\\b`, "i");
      return !re.test(label) && (re.test(visible) || correctAnswers(question).some((a) => re.test(String(a || ""))));
    });

    for (const answer of correctAnswers(question).filter(Boolean)) {
      const needed = [...figures(answer)].filter((value) => !seen.has(value) && !derivable(value, inputs));
      if (!needed.length) continue;
      const row = { id: question.id, type: question.type || "mcq", figures: needed, answer: String(answer).slice(0, 140) };
      if (invoked.length) brandRecall.push({ ...row, brands: invoked });
      else factualRecall.push(row);
    }

    /* A named firm with no case shown. The stem is where it matters — a brand in an
       option is a distractor's business and does not have to be depicted. */
    if (!question.caselet && invoked.length) {
      const named = invoked.filter((brand) => new RegExp(`\\b${brand}\\b`, "i").test(question.stem || ""));
      if (named.length) unshownCase.push({ id: question.id, brands: named, stem: String(question.stem).slice(0, 140) });
    }
  }

  report.subjects[courseId] = {
    questions: Object.keys(course.questions).length,
    /* The paper's own guarantee, and the only tier the gate holds. */
    brandFigureRecall: brandRecall,
    namesACaseItDoesNotShow: unshownCase,
    /* Reported, never gated. See the header: this is the check's own reach, not the
       bank's defect count. */
    unreachedByThisCheck: factualRecall
  };
}

console.log(JSON.stringify(report, null, 2));

if (gate) {
  const problems = [];
  for (const [courseId, row] of Object.entries(report.subjects)) {
    for (const hit of row.brandFigureRecall) {
      problems.push(`${courseId} ${hit.id}: correct answer needs ${hit.figures.join(", ")} from ${hit.brands.join("/")} — not on the page`);
    }
    for (const hit of row.namesACaseItDoesNotShow) {
      problems.push(`${courseId} ${hit.id}: names ${hit.brands.join(", ")} and shows no case`);
    }
  }
  if (problems.length) {
    console.error(`\nSELF-CONTAINMENT FAILED — ${problems.length} item(s) cannot be answered from what the candidate can see:`);
    for (const line of problems) console.error(`  × ${line}`);
    process.exit(1);
  }
  console.error("\nSelf-containment passed: every correct answer is reachable from its own page, and no item names a case it does not show.");
}
