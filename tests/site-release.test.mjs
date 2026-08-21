import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import worker from "../sites-backup/worker.mjs";

const env = {
  ASSETS: {
    fetch(request) {
      return new Response(`asset:${new URL(request.url).pathname}`, {
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};

test("root redirects to the canonical active route", async () => {
  const response = await worker.fetch(new Request("https://dungeon.test/"), env);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/app/t6.html");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("health endpoint reports the shared progress storage model", async () => {
  const response = await worker.fetch(new Request("https://dungeon.test/health"), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    service: "dungeon-t6",
    status: "ok",
    storage: "cloudflare-d1-with-browser-fallback"
  });
});

test("admin uses its canonical owner dashboard route", async () => {
  const response = await worker.fetch(new Request("https://dungeon.test/admin"), env);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/app/admin.html");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});

test("tester management fails closed until the Cloudflare edge is connected", async () => {
  const response = await worker.fetch(
    new Request("https://dungeon.test/admin/api/testers"),
    env
  );
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    status: "setup-required",
    code: "SETUP_REQUIRED",
    message: "Activate Cloudflare Access to manage testers from the dashboard."
  });
});

test("static responses receive launch security and cache headers", async () => {
  const response = await worker.fetch(
    new Request("https://dungeon.test/app/t6.js"),
    env
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.match(response.headers.get("content-security-policy"), /style-src-attr 'unsafe-inline'/);
  assert.equal(response.headers.get("cache-control"), "private, max-age=0, must-revalidate");
  assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});

test("release build includes only the allowlisted active app", async () => {
  const buildScript = await readFile(
    new URL("../tools/build-site.mjs", import.meta.url),
    "utf8"
  );
  assert.match(buildScript, /app\/t6\.html/);
  assert.match(buildScript, /app\/sets\/t6_mini_mocks\.js/);
  assert.doesNotMatch(buildScript, /app\/t6-chart\.js/);
  assert.match(buildScript, /app\/login\.html/);
  assert.match(buildScript, /app\/admin\.html/);
  assert.match(buildScript, /app\/robots\.txt/);
  assert.doesNotMatch(buildScript, /state\//);
  assert.doesNotMatch(buildScript, /history\//);
  assert.doesNotMatch(buildScript, /data\//);
  assert.doesNotMatch(buildScript, /CLAs\//);
  assert.doesNotMatch(buildScript, /legacy\//);
  assert.match(buildScript, /client.*release-manifest\.json|release-manifest\.json.*client/s);
});

test("the streamlined dashboard removes redundant analytics and custom settings", async () => {
  const html = await readFile(new URL("../app/t6.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app/t6.js", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/t6.css", import.meta.url), "utf8");

  assert.match(html, /<section class="progress-glance"/);
  assert.match(html, /id="overall-strong"/);
  assert.match(html, /id="concepts-disclosure"/);
  assert.doesNotMatch(html, /id="hero-trend"|id="mastery-radar"|id="progress-trend"/);
  assert.doesNotMatch(html, /t6-chart\.js|id="practice-builder"|id="builder-toggle"/);
  assert.doesNotMatch(html, /id="plan-disclosure"|id="exam-disclosure"|id="lessons-disclosure"/);
  assert.doesNotMatch(html, /class="coin"/);
  assert.doesNotMatch(html, /id="header-subject"/);
  assert.match(app, /return \{kind:"priority", title:"All nine runs are clear"/);
  assert.match(css, /\.course-card \{[^}]*border: 0;[^}]*box-shadow: var\(--shadow-lift\)/s);
  assert.match(css, /\.progress-glance \{[^}]*border: 0;[^}]*box-shadow: var\(--shadow-lift\)/s);
  assert.match(css, /\.dashboard-disclosure \{[^}]*border: 0;[^}]*box-shadow: var\(--shadow-lift\)/s);
  assert.match(css, /\.stat \{[^}]*border: 0;[^}]*box-shadow: var\(--shadow-lift\)/s);
});

test("Learn has one sequenced front door and discloses detail progressively", async () => {
  const html = await readFile(new URL("../app/t6.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app/t6.js", import.meta.url), "utf8");

  assert.match(html, /<p class="eyebrow">Study now<\/p>/);
  assert.match(html, /<section class="progress-glance"/);
  assert.match(html, /<details class="dashboard-disclosure" id="replay-disclosure" hidden>/);
  assert.match(html, /<details class="dashboard-disclosure" id="advanced-disclosure">/);
  assert.doesNotMatch(html, /Where can I start|Your next step|Ten available study sets/);

  assert.match(app, /runs\.filter\(function \(definition\) \{ return !definition\.mock; \}\)/);
  assert.match(app, /replay\.hidden = path\.cleared\.length === 0/);
  assert.match(app, /path\.cleared\.forEach\(function \(run\)/);
  assert.match(app, /plannedCarryForward\(courseId, coreIds, 2\)/);

  assert.match(html, /id="result-learned"/);
  assert.match(html, /id="result-struggled"/);
  assert.match(html, /id="result-next"/);
  assert.match(html, /id="result-bars"[^>]*role="img"/);
});

test("Quick Notes covers the authored course and teaches numerical setup", async () => {
  const html = await readFile(new URL("../app/t6.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app/t6.js", import.meta.url), "utf8");

  assert.match(html, /id="mode-notes"/);
  assert.match(html, /<section class="screen notes-screen" id="notes-screen"/);
  assert.match(html, /id="notes-search"/);
  assert.match(html, /id="notes-print"/);
  assert.match(app, /Object\.keys\(LESSONS\)\.map/);
  assert.match(app, /var NUMERICAL_METHODS = \{/);
  assert.match(app, /Question exoskeleton/);
  assert.match(app, /EOQ = √\(2DK ÷ h\)/);
  assert.match(app, /σDLT = σ per period × √lead time/);
  assert.match(app, /LTV as ARPU × expected lifespan × gross margin/);
  assert.match(app, /RICE = reach × impact × confidence ÷ effort/);
  assert.match(app, /window\.print\(\)/);
});

test("wrong-answer feedback teaches the correction without exposing scheduling rules", async () => {
  const app = await readFile(new URL("../app/t6.js", import.meta.url), "utf8");

  assert.match(app, /partCorrect \? "Almost — "/);
  assert.match(app, /: "Not quite"/);
  assert.match(app, /answer-key-head'>Better answer/);
  assert.match(app, /diagnosis-head'>What your answer missed/);
  assert.match(app, /<b>Use this check:<\/b>/);
  assert.match(app, /<b>How it fits:<\/b>/);
  assert.doesNotMatch(app, /Not yet — this idea will return|This ‘could explain’ error will return|A different question on the same idea is placed later/);
});

test("Examiner separates full mocks, Speedruns, and Minis by time to exam", async () => {
  const html = await readFile(new URL("../app/t6.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app/t6.js", import.meta.url), "utf8");
  const selector = await readFile(new URL("../app/sets/t6_mini_mocks.js", import.meta.url), "utf8");

  assert.match(html, /data-exam-mode="mini"/);
  assert.match(html, /data-exam-mode="final"/);
  assert.match(html, /data-exam-mode="full"/);
  assert.match(html, /id="exam-mini-grid"/);
  assert.match(html, /id="final-sprint"/);
  assert.match(html, /Full mocks <small>1\+ week out<\/small>/);
  assert.match(html, /Speedrun <small>within a week<\/small>/);
  assert.match(html, /Minis <small>last 25–30 min<\/small>/);
  assert.match(html, /Full exam-condition mocks/);
  assert.match(html, /id="confidence-guide"/);
  assert.match(html, /sets\/t6_mini_mocks\.js/);
  assert.match(selector, /var ROUND_SIZE = 8/);
  assert.match(selector, /applicationTier/);
  assert.match(selector, /uncoveredConceptIds/);
  assert.match(selector, /rotationRank/);
  assert.match(app, /kind:"confidence-sprint"/);
  assert.match(app, /skipLessons:true/);
  assert.match(app, /skipPrimers:true/);
  assert.match(app, /feedback after every answer/);
  assert.match(app, /Next-time method/);
  assert.match(app, /session\.kind !== "confidence-sprint" && !correct/);
  assert.match(app, /var FINAL_SPRINT_SECONDS = 25 \* 60/);
  assert.match(app, /Answer the eight prompts/);
  assert.match(app, /Speedrun complete/);
  assert.match(app, /Mini complete/);
});

test("anonymous login assets do not disclose the private WhatsApp invite", async () => {
  const loginHtml = await readFile(new URL("../app/login.html", import.meta.url), "utf8");
  const loginJs = await readFile(new URL("../app/login.js", import.meta.url), "utf8");
  assert.doesNotMatch(loginHtml, /E9RThdcAzqFDTiWPUYcE3I/);
  assert.doesNotMatch(loginJs, /E9RThdcAzqFDTiWPUYcE3I/);
});
