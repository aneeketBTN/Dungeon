/*
 * One command to check this session's bank changes.
 *
 *   node tools/review-changes.mjs            gate summary in the terminal
 *   node tools/review-changes.mjs --html     also writes a page you can read
 *
 * WHY IT EXISTS
 * The name-matching work changed option TEXT across seven families in four subjects.
 * A green gate says the exploit is closed; it says nothing about whether the sentences
 * still read well, and readability is the thing the standing owner rule protects. The
 * first version of this fix passed every gate and printed eight options that each began
 * with the same 36-character prefix — caught by looking at the screen, not the number.
 * So this prints both: the gates, and the actual sentences a learner is served.
 *
 * It runs the real tools as subprocesses rather than reimplementing their checks, so it
 * cannot drift from them and report green while they are red.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const TRANSCRIPTS = process.env.T6_TRANSCRIPTS ||
  "C:/Users/knigh/OneDrive/Desktop/exam/Term 6 Clean Transcripts";

function run(label, file, args, check) {
  const started = Date.now();
  let stdout = "", code = 0;
  try {
    stdout = execFileSync(process.execPath, [path.join(root, file), ...args],
      { encoding: "utf8", cwd: root, stdio: "pipe", maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    code = error.status == null ? 1 : error.status;
    stdout = (error.stdout || "") + (error.stderr || "");
  }
  let detail = "";
  let ok = code === 0;
  if (check) {
    try { const verdict = check(stdout, code); ok = verdict.ok; detail = verdict.detail; }
    catch (error) { ok = false; detail = "could not read output: " + error.message; }
  }
  return { label, ok, detail, ms: Date.now() - started, stdout };
}

const results = [];

results.push(run("Bank validator (with transcripts)", "tools/validate_t6_bank.js", [TRANSCRIPTS], (out) => {
  const json = JSON.parse(out);
  const subjects = Object.keys(json.lessons?.coverage || {}).length;
  return {
    /* Coverage lives at lessons.coverage, NOT at the top level. A check reading
       `.coverage` gets {} from a healthy run and looks exactly like the empty-coverage
       failure the brief warns about. */
    ok: json.ok === true && (json.errors || []).length === 0 && subjects === 4,
    detail: `0 errors, ${(json.warnings || []).length} warning(s), coverage for ${subjects}/4 subjects`
  };
}));

results.push(run("Name-matching gate (R3)", "tools/measure-name-matching.js", ["--json"], (out) => {
  const json = JSON.parse(out);
  const over = json.byFamily.filter((row) => row.over);
  return {
    ok: over.length === 0,
    detail: over.length
      ? `OVER: ${over.map((r) => `${r.family} ${r.percent}%`).join(", ")}`
      : `all ${json.byFamily.length} families within limit, ${json.hundredPayoffTotal} sets still at 100%`
  };
}));

results.push(run("Learn-side craft (delivered runs)", "tools/measure-learn-craft.mjs", [], (out) => {
  const json = JSON.parse(out);
  const over = Object.entries(json).filter(([, v]) => v.percentOfSelectableParts.topicMatch > 32);
  return {
    ok: over.length === 0,
    detail: Object.entries(json)
      .map(([s, v]) => `${s} ${v.percentOfSelectableParts.topicMatch}`).join("  ") +
      (over.length ? `  <- over 32: ${over.map(([s]) => s).join(", ")}` : "")
  };
}));

results.push(run("Absolute bias", "tools/measure-absolute-bias.js", [], (out) => {
  const json = JSON.parse(out);
  const worst = json.byFamily.slice().sort((a, b) => b.gap - a.gap)[0];
  return { ok: true, detail: `overall correct ${json.overall.correctCarriesAbsolute} vs wrong ${json.overall.wrongCarriesAbsolute}; widest gap ${worst.family} ${worst.gap}` };
}));

results.push(run("Palette", "tools/check-palette.mjs", [], (out, code) =>
  ({ ok: code === 0, detail: out.trim().split("\n").pop() })));

results.push(run("Mini-mock coverage and rotation", "tools/check-mini-mocks.mjs", [], (out, code) => {
  const json = JSON.parse(out);
  return {
    ok: code === 0 && json.ok === true,
    detail: json.subjects.map((row) => `${row.courseId} ${row.rounds}×8, applied≥${row.applicationFloor}, rotation ${row.rotationChange.join("/")}%`).join(" · ")
  };
}));

results.push(run("Release build", "tools/build-site.mjs", [], (out, code) =>
  ({ ok: code === 0, detail: out.trim().split("\n").pop() })));

/* Exam readiness is reported, not gated: it exits 1 for a KNOWN and unrelated reason —
   SCLM Section B is two numericals short, blocked on the SCLM-M03-L06 lesson. Folding it
   into the pass/fail line would make this command permanently red and train the reader
   to ignore it. */
const readiness = run("Exam readiness (informational)", "tools/check_exam_readiness.mjs", [], (out, code) =>
  ({ ok: true, detail: code === 0 ? "complete" : out.trim().split("\n").filter(Boolean).pop() }));
results.push(readiness);

const failed = results.filter((r) => !r.ok);
const pad = Math.max(...results.map((r) => r.label.length));
console.log("\n  DUNGEON — bank change review\n");
for (const r of results) {
  console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.label.padEnd(pad)}  ${r.detail}`);
}
console.log(`\n  ${failed.length ? failed.length + " CHECK(S) FAILED" : "All checks passed"}\n`);

if (process.argv.includes("--html")) {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  for (const file of ["app/sets/t6_brgsa.js", "app/sets/t6_catalog.js",
    "app/sets/t6_integrated.js", "app/sets/t6_challenges.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
  }
  const courses = sandbox.window.T6_COURSES;

  /* One worked example per changed family, shown as the learner is served it. These are
     the families whose option text this session rewrote. */
  const FAMILIES = [
    ["contrast", "Replaced <code>term_cloze</code>. Was: pick this concept's NAME from four concept names — 100% name-matchable by construction."],
    ["repair_cloze", "Was: four different concepts' principles, so the correction was the only sentence on topic."],
    ["bridge_cloze", "Was: four different concepts' causal explanations."],
    ["case_cloze", "Two blanks. The decision now carries a trailing tag; the framework blank was four concept NAMES."],
    ["explain", "Distractors were already same-concept, but named the concept less densely than the answer did."],
    ["apply", "Same as explain."],
    ["connect", "Untouched — it was already at 0.5% and is the pattern the others now follow."]
  ];

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const nameMatch = JSON.parse(results[1].stdout);
  const before = { term_cloze: 100.0, repair_cloze: 81.9, case_cloze: 70.8, explain: 66.0, bridge_cloze: 48.5, boss: 41.3, apply: 36.2, connect: 0.5, contrast: 100.0 };

  const cards = [];
  for (const [family, why] of FAMILIES) {
    let sample = null;
    for (const course of Object.values(courses)) {
      for (const q of Object.values(course.questions || {})) {
        if (!new RegExp(`_${family}$`).test(q.id)) continue;
        const sets = [];
        if (Array.isArray(q.options) && typeof q.answer === "number") sets.push({ label: "", options: q.options, answer: q.answer });
        (q.blanks || []).forEach((b) => { if (Array.isArray(b.options)) sets.push({ label: b.label, options: b.options, answer: b.answer }); });
        if (sets.length) { sample = { q, sets, courseId: course.id }; break; }
      }
      if (sample) break;
    }
    if (!sample) continue;
    const row = nameMatch.byFamily.find((r) => r.family === family);
    cards.push(`<section class="card">
  <h2>${esc(family)} <span class="pill ${row && row.percent <= 32 ? "good" : "bad"}">${row ? row.percent : "?"}%</span>
    <span class="was">was ${before[family] ?? "?"}%</span></h2>
  <p class="why">${why}</p>
  <p class="meta">${esc(sample.courseId)} · <code>${esc(sample.q.id)}</code> · concept: <strong>${esc(sample.q.node || "")}</strong></p>
  ${sample.q.caselet ? `<blockquote>${esc(String(sample.q.caselet).slice(0, 420))}</blockquote>` : ""}
  <p class="stem">${esc(sample.q.stem || "")}</p>
  ${sample.sets.map((set) => `${set.label ? `<p class="blank">${esc(set.label)}</p>` : ""}
    <ol class="opts">${set.options.map((o, i) =>
      `<li class="${i === set.answer ? "correct" : ""}">${esc(o)}${i === set.answer ? ' <span class="tick">correct</span>' : ""}</li>`).join("")}</ol>`).join("")}
</section>`);
  }

  const gateRows = results.map((r) =>
    `<tr class="${r.ok ? "pass" : "fail"}"><td>${r.ok ? "PASS" : "FAIL"}</td><td>${esc(r.label)}</td><td>${esc(r.detail)}</td></tr>`).join("");

  const familyRows = nameMatch.byFamily.map((r) =>
    `<tr><td><code>${esc(r.family)}</code></td><td class="num">${r.sets}</td><td class="num">${before[r.family] ?? "—"}</td><td class="num ${r.percent <= 32 ? "good" : "bad"}">${r.percent}</td><td class="num">${r.hundredPayoffSets}</td></tr>`).join("");

  const html = `<title>Bank Change Review</title>
<style>
  :root{--bg:#fbfaf7;--fg:#1a1a19;--dim:#6b6b66;--line:#e2ded4;--card:#fff;--good:#1a6b3c;--bad:#a3341f;--mark:#f5efdd}
  :root:not([data-theme=light]){}
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#16161a;--fg:#eceae4;--dim:#9b9a94;--line:#2e2e35;--card:#1e1e24;--good:#6ed49a;--bad:#ff9b82;--mark:#3a3320}}
  :root[data-theme=dark]{--bg:#16161a;--fg:#eceae4;--dim:#9b9a94;--line:#2e2e35;--card:#1e1e24;--good:#6ed49a;--bad:#ff9b82;--mark:#3a3320}
  body{background:var(--bg);color:var(--fg);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:2rem 1.25rem 5rem}
  .wrap{max-width:60rem;margin:0 auto}
  h1{font-size:1.6rem;margin:0 0 .25rem} .sub{color:var(--dim);margin:0 0 2rem}
  table{width:100%;border-collapse:collapse;margin:0 0 2.5rem;font-size:.92rem}
  th,td{text-align:left;padding:.5rem .6rem;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-size:.75rem;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
  td.num{text-align:right;font-variant-numeric:tabular-nums}
  .pass td:first-child{color:var(--good);font-weight:600} .fail td:first-child{color:var(--bad);font-weight:600}
  .good{color:var(--good)} .bad{color:var(--bad)}
  .scroll{overflow-x:auto}
  .card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:1.1rem 1.25rem;margin:0 0 1.5rem}
  .card h2{font-size:1.05rem;margin:0 0 .35rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
  .pill{font-size:.78rem;padding:.1rem .5rem;border-radius:99px;border:1px solid currentColor}
  .was{font-size:.78rem;color:var(--dim);font-weight:400}
  .why{color:var(--dim);font-size:.88rem;margin:.1rem 0 .7rem}
  .meta{font-size:.8rem;color:var(--dim);margin:0 0 .6rem}
  blockquote{margin:0 0 .8rem;padding:.6rem .8rem;background:var(--mark);border-radius:8px;font-size:.86rem}
  .stem{font-weight:600;margin:0 0 .5rem}
  .blank{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--dim);margin:.8rem 0 .3rem}
  ol.opts{margin:0;padding-left:1.3rem} ol.opts li{margin:.3rem 0}
  li.correct{color:var(--good);font-weight:600}
  .tick{font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;border:1px solid currentColor;border-radius:99px;padding:0 .4rem}
  code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em}
</style>
<div class="wrap">
<h1>Bank change review</h1>
<p class="sub">Every gate, and the sentences a learner is actually served. Generated by <code>node tools/review-changes.mjs --html</code>.</p>

<h2>Gates</h2>
<div class="scroll"><table><thead><tr><th></th><th>Check</th><th>Result</th></tr></thead><tbody>${gateRows}</tbody></table></div>

<h2>Name-matching payoff by family</h2>
<p class="sub">"Keep the options that name the thing this set is called, then guess." Chance is 25%. Limit is 32% (10% for <code>connect</code>).</p>
<div class="scroll"><table><thead><tr><th>Family</th><th class="num">Sets</th><th class="num">Before</th><th class="num">After</th><th class="num">100% sets</th></tr></thead><tbody>${familyRows}</tbody></table></div>

<h2>Read the items</h2>
<p class="sub">One worked example per changed family. The correct option is marked — check that it is not the obvious one, and that every option reads like English.</p>
${cards.join("\n")}
</div>`;

  const outDir = path.join(root, "evidence", "2026-08-15", "t6-bank-overhaul");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "review.html");
  fs.writeFileSync(outFile, html);
  console.log(`  Wrote ${path.relative(root, outFile)}\n`);
}

process.exit(failed.length ? 1 : 0);
