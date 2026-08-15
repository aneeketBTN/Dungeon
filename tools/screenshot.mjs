/*
 * Pixel acceptance, finally.
 *
 * THE PROBLEM THIS SOLVES
 * Every verification since 2026-08-12 has closed with "no screenshots — the Browser pane
 * was not compositing". That is not a guess: an undisplayed pane composites no frames, so
 * `document.timeline.currentTime` stays pinned at 0, every CSS transition reads as its
 * start value, and the pane's own `screenshot` times out saying so. Two apparent CSS bugs
 * in one session were that artefact. Layout could still be measured — in fixed-width
 * same-origin iframes — but nobody has ever looked at the product.
 *
 * Headless Chrome has no pane to display. It composites, it has real time, and it is
 * already installed. What it cannot do is click: `chrome --screenshot` photographs a page
 * as it loads, so on its own it can only ever capture a landing screen.
 *
 * `tools/shots/frame.html` is the way round that. It is same-origin with the app, so it
 * drives the real UI inside an iframe — the same technique the browser checks use — and
 * then holds still. Chrome photographs the frame. No CDP, no WebSocket, no dependency.
 *
 * WHAT IT WILL NOT TELL YOU
 * A screenshot is acceptance of what a screen looks like, not of what it does. It cannot
 * see a hover state, a focus ring reached by keyboard, a transition's direction, or a
 * screen reader. Keep running `ui-audit.js` for the numbers: a picture and a measurement
 * fail differently, which is the entire lesson of LAW-64.
 *
 * USAGE
 *   python tools/server.py 8099          # or any port; pass it below
 *   node tools/screenshot.mjs --port 8099 [--out <dir>] [--only <scene>] [--chrome <path>]
 *
 * Exits non-zero if any shot failed, and says which. A frame that could not drive its
 * scene paints a loud red panel and titles itself SHOT FAILED rather than photographing
 * whatever happened to be on screen — a blank screenshot and a broken drive look
 * identical otherwise, which is the reteach-probe lesson in a different medium.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(here, "..");

const args = process.argv.slice(2);
function flag(name, fallback) {
  const at = args.indexOf(`--${name}`);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
}

const port = flag("port", "8099");
const outDir = path.resolve(flag("out", path.join(repo, "outputs", "shots")));
const only = flag("only", null);
const base = `http://localhost:${port}`;

const CHROME_CANDIDATES = [
  process.env.DUNGEON_CHROME,
  flag("chrome", null),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA || ""}/Google/Chrome/Application/chrome.exe`,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  /* Edge is Chromium and takes the same flags. A fallback, not a preference: it is
     a different rendering build, so a shot from it is evidence about Edge. */
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((candidate) => {
  try { return fs.statSync(candidate).isFile(); } catch { return false; }
});
if (!chrome) {
  console.error("No Chrome or Edge found. Pass --chrome <path> or set DUNGEON_CHROME.");
  console.error("Looked in:\n  " + CHROME_CANDIDATES.join("\n  "));
  process.exit(1);
}

/* The sweep. Two viewports because those are the two the project measures at, and both
   themes on the surfaces where the palette does real work — `--ink` flips with the theme
   and `--deep` does not, which is how the coin's filled side once vanished on a dark
   page with nothing in the DOM to show it. */
const DESKTOP = { w: 1280, h: 900 };
const PHONE = { w: 375, h: 812 };

const SHOTS = [
  { scene: "dashboard", subject: "SPMS", size: DESKTOP, theme: "light" },
  { scene: "dashboard", subject: "SPMS", size: DESKTOP, theme: "dark" },
  { scene: "dashboard", subject: "SPMS", size: PHONE, theme: "light" },
  { scene: "dashboard", subject: "SPMS", size: PHONE, theme: "dark" },

  { scene: "lesson", subject: "SCLM", size: DESKTOP, theme: "light" },
  { scene: "lesson", subject: "SCLM", size: PHONE, theme: "light" },
  { scene: "lesson", subject: "BRGSA", size: DESKTOP, theme: "dark" },

  { scene: "question", subject: "SCLM", size: DESKTOP, theme: "light" },
  { scene: "question", subject: "SCLM", size: PHONE, theme: "light" },
  { scene: "question", subject: "SCLM", size: DESKTOP, theme: "dark" },

  { scene: "exam-home", subject: "SCLM", size: DESKTOP, theme: "light" },
  { scene: "exam-home", subject: "SCLM", size: PHONE, theme: "dark" },

  /* The screen the 2026-08-14 layout sweep never visited, and where the legend chip
     was found painting across its own label at every desktop width. */
  { scene: "exam-question", subject: "SCLM", size: DESKTOP, theme: "light" },
  { scene: "exam-question", subject: "SCLM", size: DESKTOP, theme: "dark" },
  { scene: "exam-question", subject: "SCLM", size: PHONE, theme: "light" },
  { scene: "exam-question", subject: "BRGSA", size: DESKTOP, theme: "light" }
];

fs.mkdirSync(outDir, { recursive: true });

/* One reachability check before sixteen silent failures. A dev server that is not
   running produces sixteen screenshots of a connection error, and every one of them
   looks like a rendering bug. */
try {
  execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    "--virtual-time-budget=3000", "--dump-dom", `${base}/app/t6.html`
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 30000 })
    .includes("subject-rail") || (() => { throw new Error("served page is not the app"); })();
} catch (error) {
  console.error(`Cannot read ${base}/app/t6.html — is the dev server running on port ${port}?`);
  console.error(String(error.message || error));
  process.exit(1);
}

const results = [];
for (const shot of SHOTS) {
  if (only && shot.scene !== only) continue;
  const name = [shot.scene, shot.subject, `${shot.size.w}x${shot.size.h}`, shot.theme].join("_") + ".png";
  const file = path.join(outDir, name);
  const url = `${base}/tools/shots/frame.html?scene=${shot.scene}&subject=${shot.subject}` +
    `&w=${shot.size.w}&h=${shot.size.h}&theme=${shot.theme}`;
  try {
    execFileSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      /* Long enough for the app to boot, the frame to drive it, and every animation
         to be finished by hand. Virtual time, so it costs no wall clock. */
      "--virtual-time-budget=8000",
      `--window-size=${shot.size.w},${shot.size.h}`,
      `--screenshot=${file}`,
      url
    ], { stdio: ["ignore", "ignore", "pipe"], timeout: 60000 });
  } catch (error) {
    results.push({ name, ok: false, why: String(error.message || error).split("\n")[0] });
    continue;
  }
  let bytes = 0;
  try { bytes = fs.statSync(file).size; } catch { /* not written */ }
  results.push({ name, ok: bytes > 0, bytes });
}

/* A frame that failed to drive its scene still writes a PNG — of a red panel. Read the
   title back out of the DOM for the same URLs so a red shot is reported as a failure
   here rather than discovered by a human opening sixteen files. */
for (const shot of SHOTS) {
  if (only && shot.scene !== only) continue;
  const name = [shot.scene, shot.subject, `${shot.size.w}x${shot.size.h}`, shot.theme].join("_") + ".png";
  const url = `${base}/tools/shots/frame.html?scene=${shot.scene}&subject=${shot.subject}` +
    `&w=${shot.size.w}&h=${shot.size.h}&theme=${shot.theme}`;
  let dom = "";
  try {
    dom = execFileSync(chrome, [
      "--headless=new", "--disable-gpu", "--no-sandbox",
      "--virtual-time-budget=8000", "--dump-dom", url
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 60000 });
  } catch { /* reported below as unverified */ }
  const row = results.find((r) => r.name === name);
  if (!row) continue;
  /* Read the TITLE, not the body.
   *
   * The first version searched the whole DOM for the failure banner's text and reported
   * all four dashboard shots red — because that text also appears in the frame's own
   * source comment explaining the banner. Four perfectly good screenshots, condemned by
   * their own documentation. The title is set once, by the frame, at the end of a
   * successful drive or in its catch, so it is the one place that cannot be an echo. */
  const title = (/<title>([\s\S]*?)<\/title>/i.exec(dom) || [, ""])[1].trim();
  if (!dom) {
    row.why = "written, but the frame's own status could not be read back";
  } else if (title !== `shot ready: ${shot.scene}`) {
    row.ok = false;
    const banner = /class="?shot-error[\s\S]{0,400}/.exec(dom.replace(/<[^>]+>/g, " "));
    row.why = `frame title was "${title}" — ` +
      (banner ? banner[0].replace(/\s+/g, " ").trim().slice(0, 220) : "the scene did not complete");
  }
}

const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({
  chrome, outDir, taken: results.length, failed: failed.length, results
}, null, 2));
process.exit(failed.length ? 1 : 0);
