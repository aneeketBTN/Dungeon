/*
 * Lesson candidate extractor — the authoring aid for the 0→80 teaching layer.
 *
 * The bank was built by recombining four harvested sentences per concept, which
 * is enough to *test* someone who already studied and not enough to *teach*
 * anyone. The Term 6 pack already holds the missing material: a dense summary
 * per lecture, learning objectives written by the faculty, and a concept index
 * that records the first lecture in which each term appears.
 *
 * This tool does the machine half of the job only. It extracts structured
 * candidates — objectives, glossary terms, worked-example lines — and records
 * provenance for each. It deliberately does NOT emit learner-facing prose: the
 * dense files are transcript-derived bullets and some are incoherent out of
 * context ("Since, 21% of 38 is nearly 8, 38 plus 8 makes it 46"). Explainer
 * copy is authored in app/sets/t6_lessons.js against this output, the same split
 * app/sets/t6_diagnoses.js already uses for hand-authored diagnoses.
 *
 * Usage:  node tools/build_t6_lessons.mjs "<Term 6 AI-Ready Pack>" [SUBJECT]
 * Output: work/t6_lessons/<SUBJECT>_LESSON_CANDIDATES.json
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packPath = process.argv[2];
const subjectFilter = process.argv[3];

if (!packPath || !existsSync(packPath)) {
  console.error("Usage: node tools/build_t6_lessons.mjs \"<Term 6 AI-Ready Pack>\" [SUBJECT]");
  console.error("The pack is external to this repository; see the Directory Map in AGENTS.md.");
  process.exit(1);
}

const SUBJECTS = ["BRGSA", "IBM", "SCLM", "SPMS"];

/* An objective line tells the learner what they will be able to do. The faculty
 * phrase these inconsistently across lectures, so match the intent rather than
 * one fixed opener. */
const OBJECTIVE_PATTERNS = [
  /\bby the end\b/i,
  /\byou will be able to\b/i,
  /\byou will know\b/i,
  /\byou will use\b/i,
  /\byou will apply\b/i,
  /\bthis (?:pillar )?topic covers\b/i,
  /\bthis (?:module|topic|lecture) is all about\b/i
];

/* A line carrying a concrete number, currency, or percentage is a worked-example
 * candidate — the thing a cold learner needs and the current bank never shows. */
const EXAMPLE_PATTERN = /(\d[\d,.]*\s*%|₹\s?[\d,]+|\$\s?[\d,]+|\b\d{2,}\b|\b0\.\d+\b)/;

/* A definitional line answers "what is X" rather than narrating the lecture. */
const DEFINITION_PATTERNS = [
  /\bis (?:called|known as|simply|basically|the)\b/i,
  /\bmeans that\b/i,
  /\bwe call\b/i,
  /\brefers to\b/i,
  /\bin plain terms\b/i,
  /\bthink of (?:it|this) as\b/i
];

/* The manifest's key_terms are auto-extracted n-grams, not curated terminology.
 * They contain speech artefacts ("hey change", "opener"), proper nouns from
 * analogies ("sachin"), and truncated fragments ("validation just"). Filtering
 * here keeps the authoring list usable; the authored glossary is still the gate. */
const TERM_STOPWORDS = new Set(
  ("just hey okay right yeah kind sort thing things stuff lot bit way ways time times " +
   "one two three first second third next last also very much many more most less good " +
   "opener bench guys folks everyone example examples case cases point points")
    .split(/\s+/)
);

function isUsableTerm(term, title) {
  const value = String(term || "").trim();
  if (!value || value.length < 3) return false;
  const lower = value.toLowerCase();
  if (lower === String(title || "").toLowerCase()) return false;
  const tokens = lower.split(/\s+/);
  if (tokens.length > 4) return false;
  if (tokens.every((token) => TERM_STOPWORDS.has(token))) return false;
  if (tokens.some((token) => TERM_STOPWORDS.has(token)) && tokens.length <= 2) return false;
  if (/'s$/.test(lower)) return false;
  return true;
}

function parseDenseFile(text) {
  const lines = String(text).split(/\r?\n/);
  const header = lines[0] || "";
  const match = header.match(/^#\s*\[([A-Z]+-M\d+-L\d+)\]\s*(.*)$/);
  const termLine = (lines[1] || "").replace(/^KEY TERMS:\s*/i, "");
  const bullets = lines
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => line.trim().replace(/^-\s*/, ""))
    .filter(Boolean);
  return {
    lectureId: match ? match[1] : null,
    title: match ? match[2].trim() : "",
    headerTerms: termLine.split(";").map((term) => term.trim()).filter(Boolean),
    bullets
  };
}

async function loadConceptIndex(subject) {
  const file = join(packPath, "indexes", `${subject}_CONCEPT_INDEX.tsv`);
  if (!existsSync(file)) return new Map();
  const text = await readFile(file, "utf8");
  const index = new Map();
  text.split(/\r?\n/).slice(1).forEach((line) => {
    if (!line.trim()) return;
    const [concept, firstSeen, lectureIds] = line.split("\t");
    if (!concept || !firstSeen) return;
    index.set(concept.trim().toLowerCase(), {
      term: concept.trim(),
      firstSeen: firstSeen.trim(),
      lectureIds: (lectureIds || "").split(",").map((id) => id.trim()).filter(Boolean)
    });
  });
  return index;
}

async function loadManifest() {
  const file = join(packPath, "graph", "LECTURE_MANIFEST.jsonl");
  const text = await readFile(file, "utf8");
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function rank(bullets, patterns, limit) {
  return bullets.filter((bullet) => patterns.some((pattern) => pattern.test(bullet))).slice(0, limit);
}

const manifest = await loadManifest();
const outDir = join(root, "work", "t6_lessons");
await mkdir(outDir, { recursive: true });

const summary = [];

for (const subject of SUBJECTS) {
  if (subjectFilter && subject !== subjectFilter) continue;
  const conceptIndex = await loadConceptIndex(subject);
  const lectures = manifest
    .filter((entry) => entry.subject === subject)
    .sort((a, b) => a.module - b.module || a.order - b.order);

  const candidates = [];
  for (const entry of lectures) {
    const densePath = join(packPath, entry.dense_lecture.split("/").join("/"));
    if (!existsSync(densePath)) {
      candidates.push({ lectureId: entry.lecture_id, error: "missing dense file", densePath });
      continue;
    }
    const parsed = parseDenseFile(await readFile(densePath, "utf8"));

    /* Terms are cross-checked against the concept index so each one carries the
     * lecture in which the course first uses it. That first_seen value is what
     * makes the vocabulary gate in tools/validate_t6_bank.js decidable. */
    const terms = [];
    const seen = new Set();
    for (const raw of parsed.headerTerms.concat(entry.key_terms || [])) {
      const key = String(raw).trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      if (!isUsableTerm(raw, entry.title)) continue;
      const indexed = conceptIndex.get(key);
      terms.push({
        term: String(raw).trim(),
        firstSeen: indexed ? indexed.firstSeen : null,
        introducedHere: indexed ? indexed.firstSeen === entry.lecture_id : null,
        alsoUsedIn: indexed ? indexed.lectureIds.filter((id) => id !== entry.lecture_id) : []
      });
    }

    candidates.push({
      lectureId: entry.lecture_id,
      subject,
      module: entry.module,
      order: entry.order,
      title: entry.title,
      provenance: {
        bodySha256: entry.body_sha256,
        losslessChunk: entry.lossless_chunk,
        denseLecture: entry.dense_lecture,
        sourceWords: entry.source_words,
        denseWords: entry.dense_words
      },
      objectiveCandidates: rank(parsed.bullets, OBJECTIVE_PATTERNS, 6),
      definitionCandidates: rank(parsed.bullets, DEFINITION_PATTERNS, 6),
      exampleCandidates: parsed.bullets.filter((bullet) => EXAMPLE_PATTERN.test(bullet)).slice(0, 8),
      glossaryCandidates: terms.filter((term) => term.introducedHere !== false).slice(0, 10),
      carriedForwardTerms: terms.filter((term) => term.introducedHere === false).slice(0, 10),
      bulletCount: parsed.bullets.length
    });
  }

  const withObjectives = candidates.filter((entry) => (entry.objectiveCandidates || []).length).length;
  const withExamples = candidates.filter((entry) => (entry.exampleCandidates || []).length).length;
  summary.push({
    subject,
    lectures: candidates.length,
    withObjectiveCandidates: withObjectives,
    withExampleCandidates: withExamples,
    glossaryCandidateTotal: candidates.reduce((sum, entry) => sum + (entry.glossaryCandidates || []).length, 0)
  });

  const file = join(outDir, `${subject}_LESSON_CANDIDATES.json`);
  await writeFile(file, `${JSON.stringify({ subject, generatedFrom: packPath, lectures: candidates }, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ ok: true, outDir, summary }, null, 2));
