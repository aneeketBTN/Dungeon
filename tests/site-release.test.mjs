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

test("health endpoint reports the privacy-preserving storage model", async () => {
  const response = await worker.fetch(new Request("https://dungeon.test/health"), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    service: "dungeon-t6",
    status: "ok",
    storage: "browser-local"
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
  assert.equal(
    response.headers.get("cache-control"),
    "public, max-age=300, must-revalidate"
  );
});

test("release build includes only the allowlisted active app", async () => {
  const buildScript = await readFile(
    new URL("../scripts/build-site.mjs", import.meta.url),
    "utf8"
  );
  assert.match(buildScript, /mock\/t6\.html/);
  assert.doesNotMatch(buildScript, /state\//);
  assert.doesNotMatch(buildScript, /history\//);
  assert.doesNotMatch(buildScript, /mock\/CLAs\//);
});
