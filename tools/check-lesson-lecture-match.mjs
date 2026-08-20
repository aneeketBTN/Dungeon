#!/usr/bin/env node
/*
 * Does each lesson teach the lecture its id names?
 *
 * WHY THIS EXISTS
 * On 2026-08-18 two shipped SCLM lessons were found teaching the wrong lectures.
 * `SCLM-M02-L03`'s lesson taught L04's error metrics; `SCLM-M02-L04`'s opened on
 * L02's push/pull material and never taught its own lecture's accuracy half. Both
 * had passed every gate in the repository for as long as they existed, because
 * every existing gate checks something else:
 *
 *   - `check_lesson_file.mjs` checks the id against the manifest — the id was right.
 *   - `validate_t6_bank.js` checks each glossary heading against the transcripts —
 *     the terms were real course vocabulary, just from a different lecture.
 *   - `measure-syllabus-coverage.mjs` asks whether the SUBJECT teaches a term
 *     anywhere, not which lesson does.
 *   - LAW-47 checks delivery order, not content.
 *
 * Nothing compared a lesson's body to its own transcript. Only reading the lecture
 * found it, and reading 243 lectures is not a gate. This is.
 *
 * WHAT IT MEASURES
 * For each lesson, the fraction of its DISTINCTIVE content words that appear in its
 * own lecture ("own support"), and the best score any other lecture in the same
 * subject achieves on the same words. A lesson written from its transcript scores
 * high on its own lecture. A misfiled one scores low on its own and high on the
 * lecture it was actually written from.
 *
 * WHY DISTINCTIVE WORDS AND NOT ALL WORDS
 * "supply", "chain", "cost", "inventory", "customer" occur in nearly every lecture
 * of SCLM, so counting them would score every lesson highly against every lecture
 * and the measurement would carry no information. A word is kept only if it appears
 * in at most DF_MAX of the subject's lectures, which leaves the vocabulary that
 * actually distinguishes one lecture from its neighbours.
 *
 * WHY EACH LECTURE'S SCORE IS CORRECTED BY ITS OWN BACKGROUND RATE
 * Raw coverage rewards length: a long lecture holds more vocabulary, so it explains
 * any lesson's words better than a short one, whatever the lesson is about. The
 * first comparative run showed exactly that — six of sixteen flags named
 * `SPMS-M04-L10`, a 48,000-character guest session, as the rival. It was not the
 * source of six lessons; it is simply the biggest bag of words in the subject.
 *
 * So every lecture carries a background rate: the mean score it achieves against all
 * the OTHER lessons in its subject. A lecture that explains everything has a high
 * background and earns no credit for explaining one more thing. Scores are compared
 * after subtracting it, which is what makes the comparison about topic rather than
 * about length.
 *
 * WHY `connects` IS EXCLUDED FROM THE BODY
 * The handoff field describes the NEXT lecture on purpose — that is its whole job.
 * Including it injects foreign vocabulary into every lesson and would make a correct
 * handoff look like evidence of misfiling. Exclude it, or the gate punishes the
 * thing the contract asks for.
 *
 * WHY THE COURSE NOTES ARE NOT CONSULTED, THOUGH EVERY OTHER GATE USES THEM
 * The first version of this tool discounted words found in the module notes, copying
 * `validate_t6_bank.js`. That destroyed the measurement, and the fixture proved it:
 * the known-bad lesson scored 0.178 against its own lecture, and 0.871 once the notes
 * were allowed to excuse the misses — ABOVE the median of the correctly-mapped file.
 * The gate reported PASS on the exact defect it was built for.
 *
 * The reason is structural rather than a tuning problem. The notes are the right
 * authority for "does the course use this word at all", which is the question the
 * vocabulary gate asks. They cannot answer "which lecture does this word belong to",
 * because a revision sheet covers a module or a pair of modules and carries no
 * lecture-level resolution whatever. Consulting a source that cannot discriminate,
 * on a question that is entirely about discrimination, launders every miss into a
 * pass. This gate therefore scores against the transcripts alone.
 *
 * WHY THE CUT IS ANCHORED ON THE FIXTURE AND NOT ON THE SHIPPED DISTRIBUTION
 * Every other measurement in this repository is calibrated against what already
 * shipped, and that is usually right. It is wrong here, and the reason matters: the
 * shipped population CONTAINS UNDIAGNOSED INSTANCES OF THE DEFECT. Calibrating a
 * misfiling detector on a corpus that is partly misfiled sets the bar at whatever
 * the existing mistakes reach, which is precisely the level that hides them.
 *
 * So the cut is anchored on the one case confirmed by reading both transcripts —
 * `tests/fixtures/mismapped-lessons.js`, which scores +0.117 — and placed just below
 * it. The confirmed defect is the calibration sample; the population is the thing
 * being measured, not the ruler.
 *
 * The consequence is honest and worth stating: this flags a dozen lessons that
 * shipped before the gate existed, and they are a TRIAGE LIST rather than a verdict.
 * The gate says which lessons to read, not which are wrong. Its own top-ranked cases
 * cluster in the earliest-authored modules (SPMS module 1, SCLM module 1), which is
 * where an author would expect the process to have been least settled.
 *
 * WHAT IT DOES NOT CATCH
 * The fixture holds two defects and this gate finds one of them. `SCLM-M02-L03` was
 * written from another lecture, so a rival explains it better and the comparison
 * fires. `SCLM-M02-L04` was written from its OWN lecture's first half plus a
 * neighbour's opening, so no single rival dominates and it does not flag (+-0.079).
 * A partially-authored lesson is a different defect from a misfiled one, and only the
 * misfiled kind is detectable this way. Do not read a PASS as "every lesson covers
 * its lecture" — it means "no lesson looks written from a different one".
 *
 * USAGE
 *   node tools/check-lesson-lecture-match.mjs "<Term 6 Clean Transcripts>" [--gate]
 *   node tools/check-lesson-lecture-match.mjs "<transcripts>" --calibrate
 *   node tools/check-lesson-lecture-match.mjs "<transcripts>" --subject SCLM
 *   node tools/check-lesson-lecture-match.mjs "<transcripts>" --explain SCLM-M02-L03
 *
 * `--gate` exits non-zero on any flagged lesson. Without a transcript path it
 * cannot measure anything and says so rather than reporting a green tick over zero
 * checks, which is the failure mode `validate_t6_bank.js` was caught in.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadLectures } = require("./lib/clean_transcripts.js");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

/* A word is "distinctive" if it appears in at most this share of a subject's
 * lectures. 0.30 keeps per-case and per-topic vocabulary and drops the subject's
 * house words. */
const DF_MAX = 0.30;

/* THE FLAG IS COMPARATIVE, AND DELIBERATELY NOT AN ABSOLUTE THRESHOLD.
 *
 * Own support alone cannot decide this. Across the 243 shipped lessons it runs from
 * 0.19 at the 5th percentile to 0.72 at the 95th, and a low score has honest
 * explanations: a lesson rewritten hard in the author's own words, or one drawn from
 * the module notes rather than the transcript, sits low without being misfiled. Any
 * line drawn through that spread would be a number chosen at the keyboard.
 *
 * What does not have an honest explanation is another lecture in the same subject
 * explaining the lesson's vocabulary BETTER than the lecture it claims to teach.
 * A lesson written from its own transcript beats every rival; that is close to
 * tautological, and the shipped file bears it out — the median lesson beats its best
 * rival by more than 0.25.
 *
 * MARGIN_MIN is the tolerance on that comparison, not a quality bar. It exists
 * because case arcs share vocabulary heavily (the Laxmi Transformers lectures, the
 * FarmAid stockyard pair), so a rival can edge ahead by a hair on a perfectly
 * correct lesson. It is set just below the confirmed defect at +0.117 — see the
 * header on why the fixture and not the population is the calibration sample. */
const MARGIN_MIN = 0.10;

/* Words that carry no subject meaning. Deliberately short: the DF filter does most
 * of the work, and a long hand-written stoplist is a place for bias to hide. */
const STOP = new Set(`a about above after again against all also am an and any are as at be because been
before being below between both but by can cannot could did do does doing down during each few for from
further had has have having he her here hers herself him himself his how i if in into is it its itself
me more most my myself no nor not of off on once only or other ought our ours ourselves out over own
same she should so some such than that the their theirs them themselves then there these they this
those through to too under until up very was we were what when where which while who whom why will with
you your yours yourself yourselves one two three four five six seven eight nine ten first second third
next last new old good bad big small many much less least make makes made made get gets got give gives
given take takes taken come comes came go goes went know knows known see sees seen say says said think
thinks thought want wants wanted use uses used using need needs needed way ways thing things something
anything everything nothing someone anyone everyone nobody just even still yet always never often
sometimes usually really quite rather very almost enough too also however therefore thus hence
instead within without across between among during before after above below over under again once
here there where when why how what which who whom whose that this these those`
  .split(/\s+/).filter(Boolean));

function words(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

/* The lesson as the learner reads it, minus the handoff. See the header for why. */
function lessonBody(lesson) {
  return [
    lesson.title,
    lesson.objective,
    (lesson.explainer || []).join(" "),
    lesson.worked ? [lesson.worked.setup, lesson.worked.move, lesson.worked.because].join(" ") : "",
    (lesson.glossary || []).map((g) => g.term + " " + g.plain).join(" ")
  ].join(" ");
}

function loadLessonFile(override) {
  const scope = {};
  const file = override ? path.resolve(ROOT, override) : path.join(ROOT, "app/sets/t6_lessons.js");
  const src = fs.readFileSync(file, "utf8");
  new Function("window", src)(scope);
  return scope.T6_LESSONS || {};
}

function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const positional = argv.filter((a) => !a.startsWith("--"));
  const subjectArg = (() => {
    const i = argv.indexOf("--subject");
    return i === -1 ? null : argv[i + 1];
  })();
  const explainArg = (() => {
    const i = argv.indexOf("--explain");
    return i === -1 ? null : argv[i + 1];
  })();
  const lessonsValue = (() => {
    const i = argv.indexOf("--lessons");
    return i === -1 ? null : argv[i + 1];
  })();
  const transcriptRoot = positional.find((a) => a !== subjectArg && a !== explainArg && a !== lessonsValue);

  if (!transcriptRoot) {
    console.error("This gate needs the clean transcripts. Pass the root as the first argument:");
    console.error('  node tools/check-lesson-lecture-match.mjs "<Term 6 Clean Transcripts>" --gate');
    console.error("Refusing to report a result over zero checks.");
    process.exit(2);
  }

  const lessonsArg = (() => {
    const i = argv.indexOf("--lessons");
    return i === -1 ? null : argv[i + 1];
  })();

  const lessons = loadLessonFile(lessonsArg);
  const lectures = loadLectures(transcriptRoot).lectures;

  /* Per subject: the lecture texts, and the document frequency of every word. */
  const bySubject = new Map();
  for (const lecture of lectures) {
    if (!bySubject.has(lecture.subject)) bySubject.set(lecture.subject, []);
    bySubject.get(lecture.subject).push({
      id: lecture.lecture_id,
      module: lecture.module,
      order: lecture.order,
      title: lecture.title,
      bag: new Set(words((lecture.title || "") + " " + (lecture.text || "")))
    });
  }

  const dfBySubject = new Map();
  for (const [subject, list] of bySubject) {
    const df = new Map();
    for (const lecture of list) for (const w of lecture.bag) df.set(w, (df.get(w) || 0) + 1);
    dfBySubject.set(subject, { df, total: list.length });
  }


  /* PASS 1 — each lecture's background rate: how well it explains the OTHER lessons
   * in its subject. A long lecture explains everything, so its background is high and
   * the correction below stops it winning comparisons on size alone.
   *
   * The background is ALWAYS computed from the shipped lesson file, even when
   * `--lessons` points somewhere else. It is a property of the lecture against the
   * whole population, and computing it from a two-lesson fixture instead made the
   * gate pass its own regression case — the fixture's bad L04 became the entire
   * "background" for L04 and cancelled exactly the signal being measured. A probe is
   * scored against the population; it is not a population. */
  const corpusLessons = loadLessonFile(null);
  const profiles = [];
  for (const [lectureId, lesson] of Object.entries(corpusLessons)) {
    const subject = lesson.courseId;
    const list = bySubject.get(subject);
    if (!list) continue;
    const own = list.find((l) => l.id === lectureId);
    if (!own) continue;
    const { df, total } = dfBySubject.get(subject);
    const cap = Math.max(1, Math.floor(total * DF_MAX));
    const distinctive = [...new Set(words(lessonBody(lesson)))]
      .filter((w) => df.has(w) && df.get(w) <= cap);
    profiles.push({ lectureId, subject, own, list, distinctive });
  }

  const background = new Map();               // lecture id -> mean score over other lessons
  for (const [subject, list] of bySubject) {
    const subjectProfiles = profiles.filter((p) => p.subject === subject && p.distinctive.length >= 12);
    for (const lecture of list) {
      const others = subjectProfiles.filter((p) => p.lectureId !== lecture.id);
      if (others.length === 0) { background.set(lecture.id, 0); continue; }
      const sum = others.reduce((acc, p) =>
        acc + p.distinctive.filter((w) => lecture.bag.has(w)).length / p.distinctive.length, 0);
      background.set(lecture.id, sum / others.length);
    }
  }

  const rows = [];
  for (const [lectureId, lesson] of Object.entries(lessons)) {
    const subject = lesson.courseId;
    const list = bySubject.get(subject);
    if (!list) continue;
    const own = list.find((l) => l.id === lectureId);
    if (!own) continue;                                  // manifest mismatch is check_lesson_file's job

    const { df, total } = dfBySubject.get(subject);
    const cap = Math.max(1, Math.floor(total * DF_MAX));

    /* Distinctive words the lesson actually uses. A word the subject never uses at
     * all is authored vocabulary rather than evidence about which lecture this is,
     * so it is not scored either way. */
    const distinctive = [...new Set(words(lessonBody(lesson)))]
      .filter((w) => df.has(w) && df.get(w) <= cap);

    if (distinctive.length < 12) {
      rows.push({ lectureId, subject, skipped: `only ${distinctive.length} distinctive words` });
      continue;
    }

    /* Raw coverage, then corrected by the lecture's background rate so the comparison
     * is about topic rather than about how many words the lecture happens to hold. */
    const raw = (lecture) => distinctive.filter((w) => lecture.bag.has(w)).length / distinctive.length;
    const lift = (lecture) => raw(lecture) - (background.get(lecture.id) || 0);

    const ownScore = raw(own);
    const ownLift = lift(own);

    let best = null;
    for (const lecture of list) {
      if (lecture.id === lectureId) continue;
      const l = lift(lecture);
      if (!best || l > best.lift) best = { id: lecture.id, title: lecture.title, lift: l, raw: raw(lecture) };
    }

    const margin = best ? best.lift - ownLift : 0;
    rows.push({
      lectureId, subject,
      own: ownScore, ownLift, best, margin,
      words: distinctive.length,
      flagged: margin >= MARGIN_MIN
    });
  }

  const scored = rows.filter((r) => !r.skipped);
  scored.sort((a, b) => a.own - b.own);

  if (explainArg) {
    const row = rows.find((r) => r.lectureId === explainArg);
    if (!row) { console.error("no such lesson: " + explainArg); process.exit(2); }
    console.log(JSON.stringify(row, null, 2));
    return;
  }

  if (flags.has("--dump")) {
    const sorted = scored.slice().sort((a, b) => b.margin - a.margin);
    for (const r of sorted) console.log(r.margin.toFixed(4) + "	" + r.lectureId + "	" + r.ownLift.toFixed(3) + "	" + r.best.id + "	" + r.best.lift.toFixed(3));
    return;
  }

  if (flags.has("--calibrate")) {
    const pct = (p) => scored[Math.min(scored.length - 1, Math.floor(scored.length * p))].own.toFixed(3);
    console.log("Own-lecture support across " + scored.length + " scored lessons");
    console.log("  p05 " + pct(0.05) + "   p25 " + pct(0.25) + "   p50 " + pct(0.5) +
                "   p75 " + pct(0.75) + "   p95 " + pct(0.95));
    console.log("  flag rule: another lecture beats own by >= " + MARGIN_MIN);
    console.log("\nTwenty lowest own support:");
    for (const r of scored.slice(0, 20)) {
      console.log("  " + r.lectureId.padEnd(14) + " own " + r.own.toFixed(3) +
        "  best-other lift " + r.best.lift.toFixed(3) + " (" + r.best.id + ")" +
        "  margin " + (r.margin >= 0 ? "+" : "") + r.margin.toFixed(3) +
        (r.flagged ? "   <<< FLAGGED" : ""));
    }
    return;
  }

  const flagged = scored.filter((r) => r.flagged)
    .filter((r) => !subjectArg || r.subject === subjectArg);
  const skipped = rows.filter((r) => r.skipped);

  console.log("Lesson-to-lecture match — does each lesson teach the lecture its id names?");
  console.log("=".repeat(78));
  console.log(scored.length + " lessons scored, " + skipped.length + " skipped as too short to judge.");

  if (flagged.length === 0) {
    console.log("\nLESSON-LECTURE MATCH GATE: PASS — every lesson matches its own lecture best,");
    console.log("or is within the range the shipped lessons occupy.");
  } else {
    console.log("");
    for (const r of flagged) {
      console.log("FLAGGED  " + r.lectureId);
      console.log("   own lecture           lift " + r.ownLift.toFixed(3) + " (raw " + r.own.toFixed(3) + ")   " + r.words + " distinctive words");
      console.log("   best other lecture    lift " + r.best.lift.toFixed(3) + " (raw " + r.best.raw.toFixed(3) + ")   " + r.best.id + " — " + r.best.title);
      console.log("   margin against own    +" + r.margin.toFixed(3));
      console.log("   → read " + r.lectureId + "'s transcript before accepting this lesson.");
    }
    console.log("\nLESSON-LECTURE MATCH GATE: FAIL — " + flagged.length + " lesson(s) look written from another lecture.");
  }

  if (flags.has("--gate") && flagged.length > 0) process.exit(1);
}

main();
