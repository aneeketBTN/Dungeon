/* Run the project's rendered UI and optical audits over every release-facing scene.
 * The same-origin screenshot frame supplies the stateful destinations (lesson,
 * question, completed mini-mock and paper question); this runner reads the probes'
 * JSON back from headless Chrome and fails on the checklist's zero-tolerance fields.
 *
 * Usage: node tools/check-ui-layout.mjs --port 8107
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
function flag(name, fallback) {
  const at = args.indexOf(`--${name}`);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
}

const port = flag("port", "8099");
const base = `http://localhost:${port}`;
const candidates = [
  process.env.DUNGEON_CHROME,
  flag("chrome", null),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA || ""}/Google/Chrome/Application/chrome.exe`,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
].filter(Boolean);
const chrome = candidates.find((candidate) => {
  try { return fs.statSync(candidate).isFile(); } catch { return false; }
});
if (!chrome) throw new Error("Chrome or Edge was not found; pass --chrome <path>.");

const only = flag("only", null);
const scenes = [
  ["dashboard", "SPMS"], ["dashboard-folded", "IBM"], ["lesson", "SCLM"], ["question", "SCLM"],
  ["exam-home", "SCLM"], ["exam-final", "IBM"], ["exam-full", "IBM"],
  ["exam-released", "IBM"], ["exam-question", "SCLM"],
  ["mini-question", "SPMS"], ["mini-feedback", "SPMS"],
  ["mini-result", "SPMS"], ["mini-feedback", "IBM"], ["mini-result", "IBM"],
  ["notes", "SCLM"], ["notes-ibm", "IBM"]
].filter(([scene]) => !only || scene === only);
const sizes = [[375, 812, "dark"], [1280, 900, "light"]];
const zeroUi = ["overflow", "clipped", "circleFit", "overlaps", "ragged", "cutRows", "hiddenScroll", "barInset"];
const zeroOptical = ["deadShadow", "flatSurface"];
const profiles = [];
process.on("exit", () => profiles.forEach((profile) => {
  try { fs.rmSync(profile, {recursive:true, force:true}); } catch { /* temporary profile */ }
}));

function decode(value) {
  return value.replaceAll("&quot;", '"').replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}
function reportFrom(dom, id) {
  const match = new RegExp(`<pre[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/pre>`, "i").exec(dom);
  if (!match) throw new Error(`${id} was not returned by the frame`);
  return JSON.parse(decode(match[1]));
}
function run(scene, subject, width, height, theme) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dungeon-ui-audit-"));
  profiles.push(profile);
  const url = `${base}/tools/shots/frame.html?scene=${scene}&subject=${subject}&w=${width}&h=${height}` +
    `&theme=${theme}&audit=1&optical=1`;
  const dom = execFileSync(chrome, [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--disable-cache",
    `--user-data-dir=${profile}`, "--virtual-time-budget=8000", "--dump-dom", url
  ], {encoding:"utf8", stdio:["ignore", "pipe", "pipe"], timeout:60000});
  const title = (/<title>([\s\S]*?)<\/title>/i.exec(dom) || [,"unknown"])[1].trim();
  if (title !== `shot ready: ${scene}`) {
    const banner = (/<div id="shot-error"[^>]*>([\s\S]*?)<\/div>/i.exec(dom) || [,""])[1]
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    throw new Error(`${scene} ${width}: frame ended as ${title}${banner ? ` — ${decode(banner)}` : ""}`);
  }
  return {ui:reportFrom(dom, "ui-audit-report"), optical:reportFrom(dom, "optical-audit-report")};
}

const rows = [];
const failures = [];
for (const [scene, subject] of scenes) {
  for (const [width, height, theme] of sizes) {
    try {
      const result = run(scene, subject, width, height, theme);
      const uiCounts = Object.fromEntries(zeroUi.map((key) => [key, (result.ui[key] || []).length]));
      const opticalCounts = Object.fromEntries(zeroOptical.map((key) => [key, (result.optical[key] || []).length]));
      const badUi = Object.entries(uiCounts).filter(([, count]) => count);
      const badOptical = Object.entries(opticalCounts).filter(([, count]) => count);
      const bad = badUi.length || badOptical.length || result.ui.pageScrollsSideways;
      rows.push({scene, viewport:`${width}x${height}`, theme, ui:uiCounts, optical:opticalCounts,
        nearMiss:(result.optical.nearMiss || []).length, insetDrift:(result.optical.insetDrift || []).length,
        baselineDrift:(result.optical.baselineDrift || []).length, tapTargets:(result.ui.tapTargets || []).length,
        radiiOffScale:(result.ui.radiiOffScale || []).length, density:(result.ui.density || []).length,
        status:bad ? "FAIL" : "PASS"});
      if (bad) failures.push({scene, viewport:`${width}x${height}`, theme, ui:result.ui, optical:result.optical});
    } catch (error) {
      failures.push({scene, viewport:`${width}x${height}`, theme, error:String(error.message || error)});
      rows.push({scene, viewport:`${width}x${height}`, theme, status:"ERROR"});
    }
  }
}

console.log(JSON.stringify({chrome, rows, failures}, null, 2));
if (failures.length) process.exitCode = 1;
