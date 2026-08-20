"use strict";

/*
 * Course-notes loader — the second authority the lessons were actually authored from.
 *
 * WHY THIS EXISTS
 * The LAW-49 vocabulary gate measured lesson glossaries against the lecture
 * transcripts alone and reported 37 errors and 72 warnings against content that is
 * not wrong. `data/syllabus/README.md` says the term lists come from the course's
 * revision sheets, and the lessons were authored from those sheets too. A term the
 * module notes introduce has no position in a transcript, or a position that does
 * not reflect where the course actually teaches it — so judging it by transcript
 * order manufactures failures. "CSR trap", "BOP scale paradox", "policy ripple
 * effect" and "career aspiration bottleneck" all read as invented vocabulary until
 * the notes were searched, and all four are in the IBM short notes.
 *
 * WHY NOTHING IS WRITTEN OUT
 * The obvious shortcut is to precompute {term -> earliest module} and commit it.
 * That compresses past the point where an error is recoverable, in three ways this
 * material actually exhibits:
 *
 *   1. Range files. `IBM M1-2.pdf`, `IBM M 5-6.pdf`, `Module 3-4.pdf` each cover two
 *      modules. Collapsing to one number invents precision the source lacks, and it
 *      errs permissive: a term introduced in M2 stamped as M1 stops the gate catching
 *      real prematurity. So a file carries a module RANGE, and availability is judged
 *      against the range's first module.
 *
 *   2. Mention is not introduction. "Earliest module containing the string" treats a
 *      backward reference as the teaching point. `data/syllabus/coverage-floors.json`
 *      records three matching bugs of exactly this shape that inflated coverage from
 *      63% to 39% once fixed. Callers get the text and decide; this file does not
 *      pre-judge.
 *
 *   3. Unsearchable is not absent. IBM's Detailed Notes extract to 12 characters over
 *      13 pages and 21 over 22 — they are image scans. A boolean index would record
 *      "not in notes" for material nobody searched, and once committed there is no way
 *      to tell that apart from a real absence. Every entry therefore carries its own
 *      extraction quality, and `searchable` is false when a file yields almost nothing
 *      per page. Callers must treat a miss against an unsearchable file as UNKNOWN.
 *
 * The material is owner-supplied and gitignored, and README forbids copying any of it
 * into the repository. Reading it at runtime and holding it in memory keeps that rule
 * intact: no prose is ever written anywhere.
 *
 * LAYOUT
 *   <root>/<subject dir>/**\/*.pdf
 * Module numbers come from the filename — "SCM M3", "module 4", "IBM M1-2",
 * "Inclusive_Business_Model_5", "MOD 7_SPM". Files whose module cannot be read are
 * returned with modules: [] and are searched for every module rather than dropped,
 * because dropping them would again turn "not parsed" into "not taught".
 */

var fs = require("fs");
var path = require("path");
var cp = require("child_process");

/* Subject directory names as the owner's folder actually spells them. */
var SUBJECT_DIRS = {
  BRGSA: "Business Research & Growth Systems",
  IBM: "IBM",
  SCLM: "Supply chain & Logistic Management",
  SPMS: "Software Product Management"
};

/* Below this, a PDF is a scan rather than text and cannot be searched. Pages of real
 * notes run to thousands of characters; the image-only files here yield about one. */
var MIN_CHARS_PER_PAGE = 40;

function walk(dir, out) {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, {withFileTypes: true}).forEach(function (entry) {
    var full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(pdf|txt)$/i.test(entry.name)) out.push(full);
  });
  return out;
}

/* Every module a filename names. A range "M1-2" or "M 5-6" yields both ends, so the
 * caller can use the FIRST for availability and still see the file spans two. */
function modulesFromName(name) {
  var base = path.basename(name, path.extname(name));
  var patterns = [
    /(?:^|[^a-z0-9])(?:mod(?:ule)?|m)\s*_?\s*(\d+)\s*[-–—]\s*(\d+)/i,
    /(?:^|[^a-z0-9])(?:mod(?:ule)?|m)\s*_?\s*(\d+)/i,
    /_(\d+)\s*$/,
    /\s(\d+)\s*$/
  ];
  for (var i = 0; i < patterns.length; i += 1) {
    var hit = patterns[i].exec(base);
    if (!hit) continue;
    var from = parseInt(hit[1], 10);
    var to = hit[2] ? parseInt(hit[2], 10) : from;
    if (!(from >= 1 && from <= 12)) continue;
    var span = [];
    for (var m = from; m <= Math.max(from, Math.min(to, 12)); m += 1) span.push(m);
    return span;
  }
  return [];
}

/* pdftotext ships with the Git-for-Windows and most Linux toolchains and is the only
 * extractor assumed. If it is missing, that is reported as unsearchable rather than
 * silently returning empty text, which would read as "the course never says this". */
function extract(file) {
  /* A .txt beside a scan is a transcription of material pdftotext cannot reach — the
   * image-only PDFs here yield nothing, and reading them by eye is the only way to make
   * that content searchable. Such a file is text already and needs no extractor. */
  if (/\.txt$/i.test(file)) {
    try {
      return {text: fs.readFileSync(file, "utf8"), failed: false};
    } catch (error) {
      return {text: "", failed: true, reason: error.message};
    }
  }
  try {
    var text = cp.execFileSync("pdftotext", ["-q", file, "-"], {
      encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 120000
    });
    return {text: text || "", failed: false};
  } catch (error) {
    return {text: "", failed: true, reason: error.message};
  }
}

/* Page count comes from the extracted text itself: pdftotext writes a form feed between
 * pages, so the count is one more than the number of separators. pdfinfo is NOT assumed —
 * it is absent on this machine, and the earlier version fell back to "1 page" when it was
 * missing, which quietly turned charsPerPage into a whole-file character count. A 50-page
 * scan carrying 100 stray characters would then have measured 100 "per page" and been
 * called searchable, and a miss against it would have been reported as the course not
 * teaching the term. Counting separators cannot fail that way. */
function pageCountFrom(text) {
  if (!text) return 0;
  var separators = text.split("\f").length - 1;
  return separators > 0 ? separators : 1;
}

/*
 * Returns {available, sources[]} where each source is
 *   {subject, file, modules[], firstModule, pages, chars, charsPerPage, searchable, text}
 * `available` is false when the root does not exist, so callers can degrade instead
 * of treating an absent corpus as proof of anything.
 */
function loadNotes(rootPath) {
  if (!rootPath || !fs.existsSync(rootPath)) return {available: false, sources: []};
  var sources = [];
  Object.keys(SUBJECT_DIRS).forEach(function (subject) {
    walk(path.join(rootPath, SUBJECT_DIRS[subject]), []).forEach(function (file) {
      var got = extract(file);
      var pages = pageCountFrom(got.text) || 1;
      var chars = got.text.replace(/\s+/g, " ").trim().length;
      var perPage = chars / pages;
      var span = modulesFromName(file);
      sources.push({
        subject: subject,
        file: path.relative(rootPath, file),
        absolute: file,
        isTranscript: /\.txt$/i.test(file),
        // A transcription marks its pages "--- p07 ---"; that count is how far it got.
        transcribedPages: /\.txt$/i.test(file) ? (got.text.match(/^--- p\d+ ---$/gm) || []).length : 0,
        modules: span,
        firstModule: span.length ? span[0] : null,
        pages: pages,
        chars: chars,
        charsPerPage: Math.round(perPage),
        searchable: !got.failed && perPage >= MIN_CHARS_PER_PAGE,
        extractionFailed: got.failed,
        text: got.text
      });
    });
  });

  /* A transcription supersedes the scan it was read from — but ONLY once it covers every
   * page of it. The first version of this dropped the scan as soon as any .txt existed
   * beside it, and a half-written transcription (21 of 42 pages, while its agent was
   * still running) silently removed a 42-page blind spot from the report. That is the
   * same class of error as treating an unreadable file as an absent term: the gate would
   * claim material had been searched when half of it had not. A partial transcription is
   * therefore kept as an extra searchable source, while its scan STAYS unsearchable and
   * carries the shortfall so the report can say how far the reading actually got. */
  var byStem = {};
  sources.forEach(function (source) {
    if (!source.isTranscript) return;
    byStem[source.absolute.replace(/\.txt$/i, "").toLowerCase()] = source;
  });
  var superseded = {};
  sources.forEach(function (source) {
    if (source.isTranscript) return;
    var transcript = byStem[source.absolute.replace(/\.pdf$/i, "").toLowerCase()];
    if (!transcript) return;
    if (transcript.transcribedPages >= source.pages) {
      superseded[source.absolute] = true;
    } else {
      source.partialTranscript = {
        file: transcript.file,
        transcribedPages: transcript.transcribedPages,
        ofPages: source.pages
      };
    }
  });
  return {available: true, sources: sources.filter(function (s) { return !superseded[s.absolute]; })};
}

module.exports = {loadNotes: loadNotes, SUBJECT_DIRS: SUBJECT_DIRS, MIN_CHARS_PER_PAGE: MIN_CHARS_PER_PAGE};
