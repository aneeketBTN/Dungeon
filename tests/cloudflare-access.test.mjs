import assert from "node:assert/strict";
import test from "node:test";

import {createWorker} from "../cloudflare/src/index.mjs";

const owner = "owner@example.com";
const baseEnv = {
  DUNGEON_PREFIX: "/dungeon",
  ASSETS: {
    async fetch(input) {
      return new Response(`asset:${new URL(input.url).pathname}`, {
        headers: {"Content-Type": "text/plain", "Cache-Control": "public, max-age=31536000"}
      });
    }
  },
  ACCESS_ACCOUNT_ID: "account-id",
  ACCESS_GROUP_ID: "group-id",
  ACCESS_TEAM_DOMAIN: "https://dungeon.cloudflareaccess.com",
  ACCESS_ADMIN_AUD: "admin-audience",
  ACCESS_LEARNER_AUD: "learner-audience",
  OWNER_EMAIL: owner,
  CF_API_TOKEN: "test-api-token"
};

function testWorker(options = {}) {
  return createWorker({verifyRequest: async () => ({}), ...options});
}

function groupResult(testers = ["alpha@example.com"]) {
  return {
    success: true,
    result: {
      id: "group-id",
      name: "Dungeon Testers",
      include: [owner, ...testers].map((email) => ({email: {email}})),
      exclude: [],
      require: [],
      is_default: false
    }
  };
}

function request(path, init = {}) {
  return new Request(`https://aneeketdas.com${path}`, init);
}

test("tester endpoint fails closed when protected bindings are absent", async () => {
  const worker = testWorker({verifyAdmin: async () => owner});
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "SETUP_REQUIRED");
});

test("tester endpoint requires owner authentication", async () => {
  const worker = testWorker({
    fetchImpl: async () => Response.json(groupResult())
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "OWNER_AUTH_REQUIRED");
});

test("tester list omits the protected owner member", async () => {
  const worker = testWorker({
    fetchImpl: async () => Response.json(groupResult(["alpha@example.com", "beta@example.com"])),
    verifyAdmin: async () => owner
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).testers, ["alpha@example.com", "beta@example.com"]);
});

test("grant preserves the owner and existing testers", async () => {
  let updateBody;
  const worker = testWorker({
    verifyAdmin: async () => owner,
    fetchImpl: async (input, init = {}) => {
      if (init.method === "PUT") {
        updateBody = JSON.parse(init.body);
        return Response.json(groupResult(["alpha@example.com", "beta@example.com"]));
      }
      return Response.json(groupResult(["alpha@example.com"]));
    }
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "POST",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({email: "Beta@Example.com"})
  }), baseEnv);
  assert.equal(response.status, 200);
  assert.deepEqual(updateBody.include, [
    {email: {email: "alpha@example.com"}},
    {email: {email: "beta@example.com"}},
    {email: {email: owner}}
  ]);
  assert.deepEqual((await response.json()).testers, ["alpha@example.com", "beta@example.com"]);
});

test("revoke removes one tester but cannot remove the owner", async () => {
  let updateBody;
  const worker = testWorker({
    verifyAdmin: async () => owner,
    fetchImpl: async (input, init = {}) => {
      if (init.method === "PUT") {
        updateBody = JSON.parse(init.body);
        return Response.json(groupResult([]));
      }
      return Response.json(groupResult(["alpha@example.com"]));
    }
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers?email=alpha%40example.com", {
    method: "DELETE",
    headers: {Origin: "https://aneeketdas.com"}
  }), baseEnv);
  assert.equal(response.status, 200);
  assert.deepEqual(updateBody.include, [{email: {email: owner}}]);

  const ownerResponse = await worker.fetch(request("/dungeon/admin/api/testers?email=owner%40example.com", {
    method: "DELETE",
    headers: {Origin: "https://aneeketdas.com"}
  }), baseEnv);
  assert.equal(ownerResponse.status, 400);
  assert.equal((await ownerResponse.json()).code, "OWNER_PROTECTED");
});

test("mixed-selector groups are rejected instead of silently widened", async () => {
  const worker = testWorker({
    verifyAdmin: async () => owner,
    fetchImpl: async () => Response.json({
      success: true,
      result: {name: "Dungeon Testers", include: [{email: {email: owner}}, {everyone: {}}]}
    })
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "UNSAFE_ACCESS_GROUP");
});

test("learner and owner routes resolve only to allowlisted static assets", async () => {
  const worker = testWorker({verifyAdmin: async () => owner});

  const root = await worker.fetch(request("/dungeon"), baseEnv);
  assert.equal(root.status, 302);
  assert.equal(root.headers.get("location"), "/dungeon/");

  const learner = await worker.fetch(request("/dungeon/"), baseEnv);
  assert.equal(await learner.text(), "asset:/mock/t6.html");
  assert.equal(learner.headers.get("cache-control"), "private, no-store, max-age=0");
  assert.equal(learner.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");

  const adminRedirect = await worker.fetch(request("/dungeon/admin"), baseEnv);
  assert.equal(adminRedirect.status, 302);
  assert.equal(adminRedirect.headers.get("location"), "/dungeon/admin/");

  const admin = await worker.fetch(request("/dungeon/admin/"), baseEnv);
  assert.equal(await admin.text(), "asset:/mock/admin.html");

  const hiddenAdminAsset = await worker.fetch(request("/dungeon/mock/admin.js"), baseEnv);
  assert.equal(hiddenAdminAsset.status, 404);
});

test("health and release routes stay under the protected prefix", async () => {
  const worker = testWorker({verifyAdmin: async () => owner});
  const health = await worker.fetch(request("/dungeon/health"), baseEnv);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).access, "cloudflare-zero-trust");

  const manifest = await worker.fetch(request("/dungeon/release-manifest.json"), baseEnv);
  assert.equal(await manifest.text(), "asset:/release-manifest.json");

  const outside = await worker.fetch(request("/health"), baseEnv);
  assert.equal(outside.status, 404);
});

test("protected routes fail closed without a valid Access JWT", async () => {
  const worker = createWorker();
  const response = await worker.fetch(request("/dungeon/"), baseEnv);
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "ACCESS_AUTH_REQUIRED");
});
