/* Exam-pattern readiness gate.
 *
 *   node tools/check_exam_readiness.mjs [SUBJECT] [--json]
 *
 * Answers the only question that matters before authoring: **what do I write next, and
 * how many?** It measures the bank against the paper each subject actually sits and
 * prints a worklist ordered by exam date.
 *
 * It exists because three separate defects all came from nobody multiplying the paper
 * spec by the bank:
 *
 *   - sections that cannot be filled (SPMS Section B has 8 of 20 MSQs) were discovered
 *     by a learner opening the paper, not by a check;
 *   - an early authored MSQ tranche used the wrong answer count and repeated answer
 *     positions. The final P-type reminder now makes exactly two correct options a
 *     section-level contract, while position variety remains a craft check;
 *   - a 50-question section drew 16 questions sharing a character-identical prompt,
 *     because the pool is 52 and nothing measured prompt variety against demand.
 *
 * The paper spec is read **out of `app/t6.js`** rather than restated here. A gate that
 * keeps its own copy of the thing it is checking drifts, and that has already happened
 * once in this repo.
 */
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* ---- the paper spec, from the app ---------------------------------------------- */

async function readExamPapers() {
  const source = await readFile(resolve(root, "app/t6.js"), "utf8");
  const start = source.indexOf("var EXAM_PAPERS = ");
  if (start < 0) throw new Error("EXAM_PAPERS not found in app/t6.js — has it been renamed?");
  /* Walk braces so the literal is taken exactly, not guessed at with a regex. */
  const open = source.indexOf("{", start);
  let depth = 0, end = -1;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) { end = i + 1; break; }
  }
  if (end < 0) throw new Error("EXAM_PAPERS literal is unbalanced in app/t6.js");
  return Function(`"use strict"; return (${source.slice(open, end)});`)();
}

/* ---- the bank ------------------------------------------------------------------ */

async function readBank() {
  const files = ["t6_brgsa.js", "t6_catalog.js", "t6_diagnoses.js", "t6_lessons.js", "t6_integrated.js", "t6_ibm_case.js", "t6_challenges.js"];
  const sandbox = {};
  sandbox.window = sandbox;
  for (const file of files) {
    const code = await readFile(resolve(root, "app/sets", file), "utf8");
    Function("window", `"use strict"; ${code}`).call(sandbox, sandbox);
  }
  if (!sandbox.T6_COURSES) throw new Error("T6_COURSES did not load from app/sets");
  return sandbox.T6_COURSES;
}

function poolFor(course, type) {
  return Object.keys(course.questions)
    .map(id => course.questions[id])
    .filter(q => q && (q.type || "mcq") !== "primer" && (q.type || "mcq") === type);
}

/* The prompt a candidate actually reads. Two items with the same one are
   indistinguishable on the page however different their options are. */
const visiblePrompt = q => `${q.caselet || ""}|${q.stem || q.prompt || q.id}`;

/* ---- the checks ---------------------------------------------------------------- */

function checkSection(course, section) {
  const pool = poolFor(course, section.type);
  const findings = [];

  /* 1. Can the section be filled at all? */
  const shortfall = Math.max(0, section.count - pool.length);
  if (shortfall > 0) {
    findings.push({
      level: "error", code: "SECTION_UNDERFILLED",
      message: `${shortfall} more ${section.type} needed (${pool.length} of ${section.count}). ` +
        `Worth ${shortfall * section.marks} marks the mock cannot award.`,
      author: shortfall
    });
  }

  /* 2. SPMS P-type shape. Exactly two correct options is now part of the paper,
        not a variation to diversify. Position patterns still have to vary or the
        answer can be learned without reading the item. */
  if (section.type === "msq") {
    const shapes = pool.map(q => {
      const correct = (q.answers || q.correct || []).length;
      const options = (q.options || []).length;
      return { id: q.id, correct, options };
    });
    const wrongCount = shapes.filter(shape => shape.correct !== 2);
    if (wrongCount.length) {
      findings.push({
        level: "error", code: "PTYPE_CORRECT_COUNT",
        message: `${wrongCount.length} of ${shapes.length} MSQs do not have exactly two correct options.`
      });
    }
    const counts = {};
    shapes.forEach(s => { counts[`${s.correct}-of-${s.options}`] = (counts[`${s.correct}-of-${s.options}`] || 0) + 1; });
    findings.push({ level: "info", code: "MSQ_SHAPES", message: `shapes: ${JSON.stringify(counts)}` });

    /* If the correct options sit in the same positions every time, the pair can be
       selected without reading even though the count itself is correctly uniform. */
    const signatures = {};
    pool.forEach(q => {
      const key = (q.answers || q.correct || []).slice().sort((a, b) => a - b).join(",");
      signatures[key] = (signatures[key] || 0) + 1;
    });
    const commonest = Object.entries(signatures).sort((a, b) => b[1] - a[1])[0];
    if (commonest && commonest[1] === pool.length && pool.length > 2) {
      findings.push({
        level: "error", code: "MSQ_POSITION_CUE",
        message: `all ${pool.length} items have their correct options in the same positions ` +
          `[${commonest[0]}], so ticking those positions scores full marks without reading. ` +
          `Shuffle which options are correct.`
      });
    } else if (commonest && commonest[1] > pool.length * 0.5 && pool.length > 3) {
      findings.push({
        level: "warn", code: "MSQ_POSITION_SKEW",
        message: `${commonest[1]} of ${pool.length} items share the answer pattern [${commonest[0]}].`
      });
    }
  }

  /* 3. Prompt variety against demand. A pool barely larger than the section forces
        repeats however the draw is ordered. */
  const drawn = Math.min(section.count, pool.length);
  if (drawn > 0) {
    const prompts = new Map();
    pool.forEach(q => {
      const key = visiblePrompt(q);
      prompts.set(key, (prompts.get(key) || 0) + 1);
    });
    const distinct = prompts.size;
    const worst = [...prompts.entries()].sort((a, b) => b[1] - a[1])[0];
    /* The honest signal is not the distinct ratio — a section can pass that comfortably
       while still forcing a dozen identical prompts onto every paper. It is how many
       copies of the commonest prompt *cannot* be left out of the draw: the pool has
       `pool.length - section.count` slots of slack, and everything above that lands on
       the paper no matter how the draw is ordered. SCLM Section A passed a 60%-distinct
       rule while forcing 14 identical prompts, which is the defect this check exists
       for, so it is measured directly. */
    const slack = Math.max(0, pool.length - section.count);
    const forced = Math.max(0, worst[1] - slack);
    if (forced >= 3) {
      findings.push({
        level: "warn", code: "PROMPT_REPEATS_FORCED",
        message: `${forced} questions on every paper are forced to share one prompt ` +
          `("${worst[0].split("|").pop().slice(0, 60)}") — ${worst[1]} items carry it and the pool has ` +
          `only ${slack} spare. Vary the caselet, not just the options.`
      });
    } else if (distinct < drawn * 0.6) {
      findings.push({
        level: "warn", code: "PROMPT_VARIETY_LOW",
        message: `${distinct} distinct prompts across ${pool.length} items for a ${drawn}-question section.`
      });
    }
  }

  return { section: section.id, type: section.type, want: section.count, have: pool.length, findings };
}

/* ---- report -------------------------------------------------------------------- */

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const only = args.find(a => !a.startsWith("--"));

  const papers = await readExamPapers();
  const courses = await readBank();

  /* Exam order: soonest paper first, since that is the authoring priority. */
  const subjects = Object.keys(papers)
    .filter(id => !only || id === only.toUpperCase())
    .sort((a, b) => String(papers[a].sat).localeCompare(String(papers[b].sat)));

  const report = subjects.map(id => {
    const spec = papers[id];
    const course = courses[id];
    const sections = spec.sections.map(section => checkSection(course, section));
    const marksAtRisk = sections.reduce((n, s) =>
      n + s.findings.filter(f => f.code === "SECTION_UNDERFILLED").reduce((m, f) => m + f.author * spec.sections.find(x => x.id === s.section).marks, 0), 0);
    return { subject: id, title: spec.title, sat: spec.sat, total: spec.total, caveat: spec.caveat || null, sections, marksAtRisk };
  });

  if (asJson) {
    console.log(JSON.stringify({ ok: !report.some(r => r.sections.some(s => s.findings.some(f => f.level === "error"))), report }, null, 2));
    return;
  }

  let errors = 0, warnings = 0, worklist = [];
  for (const subject of report) {
    console.log(`\n${subject.subject} — ${subject.title}`);
    console.log(`  sat ${subject.sat} · ${subject.total} marks`);
    if (subject.caveat) console.log(`  ! ${subject.caveat.slice(0, 100)}…`);
    for (const section of subject.sections) {
      const flag = section.findings.some(f => f.level === "error") ? "FAIL"
        : section.findings.some(f => f.level === "warn") ? "warn" : "ok  ";
      console.log(`  [${flag}] Section ${section.section} · ${section.type} · ${section.have} of ${section.want}`);
      for (const finding of section.findings) {
        if (finding.level === "error") errors++;
        if (finding.level === "warn") warnings++;
        console.log(`         ${finding.level === "info" ? "·" : finding.level === "warn" ? "~" : "×"} ${finding.message}`);
        if (finding.author) {
          worklist.push({ subject: subject.subject, section: section.section, type: section.type, count: finding.author, sat: subject.sat });
        }
      }
    }
    if (subject.marksAtRisk) console.log(`  → ${subject.marksAtRisk} marks currently unawardable`);
  }

  console.log("\n\nAUTHORING WORKLIST — soonest paper first\n");
  if (!worklist.length) {
    console.log("  Every section can be filled. Remaining findings are quality, not volume.");
  } else {
    for (const item of worklist) {
      console.log(`  ${String(item.count).padStart(3)} × ${item.type.padEnd(13)} ${item.subject} Section ${item.section}   (sat ${item.sat})`);
    }
    console.log(`\n  ${worklist.reduce((n, i) => n + i.count, 0)} items total.`);
  }
  console.log(`\n${errors} error(s), ${warnings} warning(s).`);
  process.exitCode = errors ? 1 : 0;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
