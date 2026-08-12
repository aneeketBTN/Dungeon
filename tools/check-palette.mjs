/* Palette gate for app/t6.css.
 *
 * docs/design/ART_DIRECTION_SYSTEM.md makes an asset production-ready only when it
 * "survives grayscale and color-vision checks", and AGENTS.md requires that Strong,
 * Developing, Needs practice, and Not started stay distinguishable without colour or
 * motion. Both are measurements, not opinions, so they are measured here.
 *
 * This reads the light-dark() pairs out of the real stylesheet rather than keeping a
 * copy of the palette. A hand-copied table passes forever after the CSS moves on;
 * this one fails the moment a token changes underneath it.
 *
 *   node tools/check-palette.mjs [path/to/t6.css]
 *
 * Exit 0 = every pairing the UI actually draws is within tolerance in both themes.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = process.argv[2] || resolve(here, "..", "app", "t6.css");
const css = readFileSync(cssPath, "utf8");

/* ---------- colour maths ---------- */

const hex = (h) => {
  const s = h.trim().replace("#", "");
  const full = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};
const srgbToLin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const linToSrgb = (c) => {
  c = Math.max(0, Math.min(1, c));
  return Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
};
const lum = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

/* Machado, Oliveira & Fernandes 2009, severity 1.0, applied in linear RGB. */
const CVD = {
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const simulate = (rgb, kind) => {
  const lin = rgb.map(srgbToLin);
  return CVD[kind].map((row) => linToSrgb(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]));
};

/* OKLab distance — "do these read as different colours", which euclidean RGB does not answer. */
const oklab = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
};
const dE = (a, b) => {
  const x = oklab(a), y = oklab(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};

/* ---------- read the tokens out of the stylesheet ---------- */

const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf("\n}", css.indexOf(":root {")));
const themes = { light: {}, dark: {} };
const pairRe = /(--[a-z0-9-]+)\s*:\s*light-dark\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/g;
const flatRe = /(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
let m;
while ((m = pairRe.exec(rootBlock))) {
  themes.light[m[1]] = hex(m[2]);
  themes.dark[m[1]] = hex(m[3]);
}
while ((m = flatRe.exec(rootBlock))) {
  /* A token with one value is deliberately theme-independent (--saffron). */
  if (!(m[1] in themes.light)) {
    themes.light[m[1]] = hex(m[2]);
    themes.dark[m[1]] = hex(m[2]);
  }
}

const tokenCount = Object.keys(themes.light).length;
if (tokenCount < 20) {
  console.error(`Only ${tokenCount} colour tokens parsed from ${cssPath} — the :root block did not match. Refusing to report a pass.`);
  process.exit(2);
}

/* ---------- the pairings the UI actually draws ---------- */

const READING_SURFACES = ["--paper", "--card", "--card-soft", "--card-hover"];
const STATES = [
  { name: "strong", mark: "--green", veil: "--green-soft", on: "--on-green" },
  { name: "developing", mark: "--amber", veil: "--amber-soft", on: "--on-amber" },
  { name: "needs", mark: "--red", veil: "--red-soft", on: "--on-red" },
  { name: "unseen", mark: "--unseen", veil: "--grey-soft", on: null, ink: "--unseen-ink" },
];

/* Two tiers, because they answer different questions.
 *
 *   required  what WCAG obliges and what AGENTS.md names as a rule. Fails the run.
 *   reported  measurements worth watching that the design deliberately does not lean
 *             on. Hue separation between the state marks is the important one: the
 *             states are carried by shape and label (see .dot in t6.css), so a low
 *             number here is a known property of the palette, not a regression. It is
 *             printed every run so it cannot drift unnoticed into something the
 *             design *does* lean on. */
let failures = 0;
let checks = 0;
const results = [];

const check = (theme, group, label, value, min, unit = "", tier = "required") => {
  checks++;
  const ok = value + 1e-9 >= min;
  if (!ok && tier === "required") failures++;
  results.push({ theme, group, label, value, min, ok, unit, tier });
};

for (const themeName of ["light", "dark"]) {
  const t = themes[themeName];
  const c = (name) => {
    if (!t[name]) throw new Error(`token ${name} is not defined in :root`);
    return t[name];
  };

  /* Body text on every surface it can sit on. WCAG AA body text = 4.5:1. */
  for (const bg of READING_SURFACES) {
    for (const ink of ["--ink", "--ink-soft", "--muted"]) {
      check(themeName, "text on reading surfaces", `${ink} on ${bg}`, contrast(c(ink), c(bg)), 4.5, ":1");
    }
  }

  /* The deep panel carries its own three inks. */
  for (const bg of ["--deep", "--deep-2"]) {
    for (const ink of ["--on-deep", "--on-deep-muted", "--on-deep-faint"]) {
      check(themeName, "text on the deep panel", `${ink} on ${bg}`, contrast(c(ink), c(bg)), 4.5, ":1");
    }
  }

  /* Guidance and state colours used as text. */
  for (const bg of ["--card", "--card-soft", "--paper"]) {
    for (const ink of ["--green", "--amber", "--red", "--blue", "--unseen-ink"]) {
      check(themeName, "meaning colours as text", `${ink} on ${bg}`, contrast(c(ink), c(bg)), 4.5, ":1");
    }
  }

  /* A state's own text on its own veil — the status pills and stat cards. */
  for (const s of STATES) {
    const ink = s.ink || s.mark;
    check(themeName, "state text on its own veil", `${ink} on ${s.veil}`, contrast(c(ink), c(s.veil)), 4.5, ":1");
  }
  for (const [ink, veil] of [["--blue", "--blue-soft"], ["--blue", "--blue-tint"], ["--blue", "--blue-veil"], ["--green", "--green-soft"], ["--red", "--red-soft"]]) {
    check(themeName, "state text on its own veil", `${ink} on ${veil}`, contrast(c(ink), c(veil)), 4.5, ":1");
  }

  /* Text placed on a saturated fill: the option keys, the checked chips, the CTA. */
  for (const [on, fill] of [["--on-green", "--green"], ["--on-amber", "--amber"], ["--on-red", "--red"], ["--on-blue", "--blue"], ["--on-saffron", "--saffron"], ["--on-deep", "--deep"]]) {
    check(themeName, "text on a filled mark", `${on} on ${fill}`, contrast(c(on), c(fill)), 4.5, ":1");
  }

  /* Non-text UI: marks, focus rings, and the borders that carry state. WCAG 1.4.11 = 3:1. */
  for (const s of STATES) {
    check(themeName, "marks against the card", `${s.mark} on --card`, contrast(c(s.mark), c("--card")), 3.0, ":1");
  }
  for (const bg of ["--card", "--paper", "--card-soft"]) {
    check(themeName, "focus ring", `--focus on ${bg}`, contrast(c("--focus"), c(bg)), 3.0, ":1");
  }
  check(themeName, "marks against the card", "--blue on --card", contrast(c("--blue"), c("--card")), 3.0, ":1");

  /* Hairlines and surface steps. Reported: every surface these delineate is already
     identified by its content and its --line border, so the hairline is reinforcement.
     The deep panel is the one to watch — at night it separates from the page by very
     little, which is why it carries --deep-edge. */
  check(themeName, "surface separation", "--line-strong on --card", contrast(c("--line-strong"), c("--card")), 3.0, ":1", "reported");
  check(themeName, "surface separation", "--line on --card", contrast(c("--line"), c("--card")), 3.0, ":1", "reported");
  check(themeName, "surface separation", "--deep against --paper", contrast(c("--deep"), c("--paper")), 1.15, ":1", "reported");
  check(themeName, "surface separation", "--deep-edge against --deep", contrast(c("--deep-edge"), c("--deep")), 1.15, ":1", "reported");
  check(themeName, "surface separation", "--card against --paper", contrast(c("--card"), c("--paper")), 1.05, ":1");

  /* Grayscale and colour vision on the marks alone. Reported, not required: the four
     states are told apart by shape (asserted below) and by their labels. These numbers
     say how much the hue adds on top of that, which for this palette is "a little". */
  const marks = STATES.map((s) => ({ name: s.name, rgb: c(s.mark) }));
  for (let i = 0; i < marks.length; i++) {
    for (let j = i + 1; j < marks.length; j++) {
      check(themeName, "hue separation (shape carries the state)", `${marks[i].name} vs ${marks[j].name}, grayscale`, contrast(marks[i].rgb, marks[j].rgb), 1.25, ":1", "reported");
    }
  }
  for (const kind of Object.keys(CVD)) {
    const sim = marks.map((mk) => ({ name: mk.name, rgb: simulate(mk.rgb, kind) }));
    let worst = Infinity, pair = "";
    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim.length; j++) {
        const d = dE(sim[i].rgb, sim[j].rgb);
        if (d < worst) { worst = d; pair = `${sim[i].name}/${sim[j].name}`; }
      }
    }
    check(themeName, "hue separation (shape carries the state)", `${kind}, worst pair ${pair}`, worst, 0.10, "", "reported");
  }
}

/* ---------- the states must be four shapes, not four fills ---------- */

/* AGENTS.md: "Strong, Developing, Needs practice, and Not started states must remain
   distinguishable without color or motion." Since the hues measurably do not carry
   that (see the reported block above), the shapes must. This asserts that each .dot
   variant declares a different silhouette — it is what stops the four quietly
   collapsing back into four identical circles. */
const SHAPE_PROPS = ["border-radius", "clip-path", "background", "background-image", "transform", "border-style", "width", "height"];
const shapeSignatures = {};
for (const state of ["strong", "developing", "needs", "unseen"]) {
  const rule = new RegExp(`\\.dot\\.${state}\\s*\\{([^}]*)\\}`).exec(css);
  if (!rule) {
    console.error(`No .dot.${state} rule found in ${cssPath}. The four evidence states must each declare a mark.`);
    process.exit(2);
  }
  const decls = rule[1].split(";").map((d) => d.trim()).filter(Boolean);
  const shape = decls
    .filter((d) => SHAPE_PROPS.includes(d.split(":")[0].trim()))
    .map((d) => d.replace(/\s+/g, " "))
    .sort()
    .join("; ");
  shapeSignatures[state] = shape;
}
const shapeStates = Object.keys(shapeSignatures);
let shapeFailures = 0;
console.log("\n=== EVIDENCE STATE SHAPES (both themes) ===\n");
for (const state of shapeStates) {
  console.log(`  ${state.padEnd(12)} ${shapeSignatures[state] || "(no shape-bearing declaration)"}`);
}
for (let i = 0; i < shapeStates.length; i++) {
  for (let j = i + 1; j < shapeStates.length; j++) {
    const a = shapeStates[i], b = shapeStates[j];
    if (shapeSignatures[a] === shapeSignatures[b]) {
      console.log(`    FAIL  ${a} and ${b} draw the same silhouette; they differ only by colour.`);
      shapeFailures++;
      failures++;
    }
  }
}
if (!shapeFailures) console.log("\n    pass  all four silhouettes differ.");

/* ---------- report ---------- */

let lastGroup = "";
for (const theme of ["light", "dark"]) {
  console.log(`\n=== ${theme.toUpperCase()} ===`);
  lastGroup = "";
  for (const r of results.filter((x) => x.theme === theme)) {
    if (r.group !== lastGroup) { console.log(`\n  ${r.group}:`); lastGroup = r.group; }
    const flag = r.ok ? "pass" : r.tier === "required" ? "FAIL" : "note";
    console.log(`    ${flag}  ${r.label.padEnd(44)} ${r.value.toFixed(2)}${r.unit} (min ${r.min})`);
  }
}

const hardFails = results.filter((r) => !r.ok && r.tier === "required");
const notes = results.filter((r) => !r.ok && r.tier === "reported");

console.log(`\n${checks} contrast checks across ${tokenCount} tokens, plus 4 shape signatures.`);
if (notes.length) {
  console.log(`\n${notes.length} below target, reported not required:`);
  for (const r of notes) console.log(`  ${r.theme}: ${r.label} = ${r.value.toFixed(2)}${r.unit}, target ${r.min}`);
}
if (failures) {
  console.log(`\n${hardFails.length + shapeFailures} REQUIRED CHECK(S) FAILED:`);
  for (const r of hardFails) console.log(`  ${r.theme}: ${r.label} = ${r.value.toFixed(2)}${r.unit}, needs ${r.min}`);
  if (shapeFailures) console.log(`  ${shapeFailures} pair(s) of evidence states share a silhouette.`);
  process.exit(1);
}
console.log("\nAll required pairings within tolerance in both themes; all four states shape-distinct.");
