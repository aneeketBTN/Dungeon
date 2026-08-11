import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import worker from "../site/worker.mjs";

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
  assert.equal(response.headers.get("location"), "/mock/t6.html");
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
  assert.equal(response.headers.get("location"), "/mock/admin.html");
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
    new Request("https://dungeon.test/mock/t6.js"),
    env
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.equal(response.headers.get("cache-control"), "private, max-age=0, must-revalidate");
  assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
});

test("release build includes only the allowlisted active app", async () => {
  const buildScript = await readFile(
    new URL("../scripts/build-site.mjs", import.meta.url),
    "utf8"
  );
  assert.match(buildScript, /mock\/t6\.html/);
  assert.match(buildScript, /mock\/login\.html/);
  assert.match(buildScript, /mock\/admin\.html/);
  assert.match(buildScript, /mock\/robots\.txt/);
  assert.doesNotMatch(buildScript, /state\//);
  assert.doesNotMatch(buildScript, /history\//);
  assert.doesNotMatch(buildScript, /mock\/CLAs\//);
  assert.match(buildScript, /client.*release-manifest\.json|release-manifest\.json.*client/s);
});

test("anonymous login assets do not disclose the private WhatsApp invite", async () => {
  const loginHtml = await readFile(new URL("../mock/login.html", import.meta.url), "utf8");
  const loginJs = await readFile(new URL("../mock/login.js", import.meta.url), "utf8");
  assert.doesNotMatch(loginHtml, /E9RThdcAzqFDTiWPUYcE3I/);
  assert.doesNotMatch(loginJs, /E9RThdcAzqFDTiWPUYcE3I/);
});
