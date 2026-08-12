"use strict";

/*
 * Lecture source loader.
 *
 * WHY THIS EXISTS
 * The teaching layer and the LAW-49 vocabulary gate both need the same thing: the
 * course's lectures, in teaching order, each with its own text. That used to come
 * from the external "Term 6 AI-Ready Pack" — a manifest plus one lossless chunk per
 * lecture. The pack is no longer the source of truth: its dense layer produced lines
 * that are incoherent out of context, and its concept index is explicitly a list of
 * retrieval candidates rather than course vocabulary. Content authored against it
 * went wrong in ways that were expensive to find (LAW-49).
 *
 * The clean transcripts are the authority now:
 *
 *   <root>/<SUBJECT>/<SUBJECT>_M<NN>_SUM_TRANSCRIPT.txt
 *
 * One file per module, each holding its lectures in teaching order behind headers:
 *
 *   ## C06 | Strategic Fit
 *
 * The `C06` is the recording's original code and is NOT the lecture number — module 2
 * runs C10, C01, C02 … C12, so the codes are not even monotonic. What identifies a
 * lecture is its POSITION in the module file: the Nth section is L<N>. That was
 * checked against the old manifest before this loader replaced it — SCLM M01 §4 is
 * "Strategic Fit" (SCLM-M01-L04) and §6 is "Drivers of Sypply Chain Performance"
 * (SCLM-M01-L06), and the titles agree down to the typos the manifest also carried.
 *
 * The old pack layout is still accepted so existing invocations do not hard-fail;
 * `sourceKind` on the result says which one was read. Prefer the clean transcripts.
 */

var fs = require("fs");
var path = require("path");

function pad2(value) {
  return String(value).length < 2 ? "0" + value : String(value);
}

/* Split one module transcript into its lectures. Position is identity: the Nth
 * section in the file is L<N>, because the file is in teaching order. */
function splitModule(subject, moduleNumber, raw) {
  var lines = String(raw).split(/\r?\n/);
  var lectures = [];
  var current = null;
  lines.forEach(function (line) {
    var header = /^##\s+(.*)$/.exec(line);
    if (header) {
      /* Headers read "## <code> | <title>". The code is not always C-plus-digits:
       * split recordings use C05A/C05B and case readings use the literal RESOURCE,
       * so take everything before the first pipe rather than pattern-matching it. */
      var text = header[1].trim();
      var pipe = text.indexOf("|");
      current = {
        subject: subject,
        module: moduleNumber,
        order: lectures.length + 1,
        originalCode: pipe >= 0 ? text.slice(0, pipe).trim() : "",
        title: (pipe >= 0 ? text.slice(pipe + 1) : text).trim(),
        body: []
      };
      current.lecture_id = subject + "-M" + pad2(moduleNumber) + "-L" + pad2(current.order);
      lectures.push(current);
      return;
    }
    if (current) current.body.push(line);
  });
  return lectures.map(function (entry) {
    return {
      lecture_id: entry.lecture_id,
      subject: entry.subject,
      module: entry.module,
      order: entry.order,
      title: entry.title,
      originalCode: entry.originalCode,
      text: entry.body.join("\n").trim()
    };
  });
}

function loadCleanTranscripts(rootDir) {
  var lectures = [];
  fs.readdirSync(rootDir, {withFileTypes: true})
    .filter(function (entry) { return entry.isDirectory(); })
    .forEach(function (dir) {
      var subject = dir.name;
      var subjectDir = path.join(rootDir, subject);
      fs.readdirSync(subjectDir)
        .filter(function (name) { return /_M(\d+)_SUM_TRANSCRIPT\.txt$/i.test(name); })
        .sort()
        .forEach(function (name) {
          var moduleNumber = Number(/_M(\d+)_SUM_TRANSCRIPT\.txt$/i.exec(name)[1]);
          var raw = fs.readFileSync(path.join(subjectDir, name), "utf8");
          lectures = lectures.concat(splitModule(subject, moduleNumber, raw));
        });
    });
  return lectures;
}

function loadPackManifest(packPath) {
  var manifestPath = path.join(packPath, "graph", "LECTURE_MANIFEST.jsonl");
  return fs.readFileSync(manifestPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map(function (line) { return JSON.parse(line); })
    .map(function (entry) {
      var chunkPath = entry.lossless_chunk
        ? path.join(packPath, entry.lossless_chunk.split("/").join(path.sep))
        : "";
      return {
        lecture_id: entry.lecture_id,
        subject: entry.subject,
        module: entry.module,
        order: entry.order,
        title: entry.title,
        originalCode: "",
        text: chunkPath && fs.existsSync(chunkPath) ? fs.readFileSync(chunkPath, "utf8") : ""
      };
    });
}

/* Returns {sourceKind, lectures[]} for either layout, so callers need not care. */
function loadLectures(sourcePath) {
  if (!sourcePath) throw new Error("No lecture source path given");
  if (fs.existsSync(path.join(sourcePath, "graph", "LECTURE_MANIFEST.jsonl"))) {
    return {sourceKind: "pack", lectures: loadPackManifest(sourcePath)};
  }
  return {sourceKind: "clean-transcripts", lectures: loadCleanTranscripts(sourcePath)};
}

module.exports = {loadLectures: loadLectures, splitModule: splitModule};
