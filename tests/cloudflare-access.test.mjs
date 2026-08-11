import assert from "node:assert/strict";
import test from "node:test";

import {createWorker} from "../cloudflare/src/index.mjs";

const owner = "owner@example.com";
const baseEnv = {
  DUNGEON_PREFIX: "/dungeon",
  SITES_ORIGIN: "https://dungeon-origin.example",
  SITES_BYPASS_TOKEN: "test-origin-token",
  ACCESS_ACCOUNT_ID: "account-id",
  ACCESS_GROUP_ID: "group-id",
  ACCESS_TEAM_DOMAIN: "https://dungeon.cloudflareaccess.com",
  ACCESS_ADMIN_AUD: "admin-audience",
  OWNER_EMAIL: owner,
  CF_API_TOKEN: "test-api-token"
};

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
  const worker = createWorker({verifyAdmin: async () => owner});
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "SETUP_REQUIRED");
});

test("tester endpoint requires owner authentication", async () => {
  const worker = createWorker({
    fetchImpl: async () => Response.json(groupResult())
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "OWNER_AUTH_REQUIRED");
});

test("tester list omits the protected owner member", async () => {
  const worker = createWorker({
    fetchImpl: async () => Response.json(groupResult(["alpha@example.com", "beta@example.com"])),
    verifyAdmin: async () => owner
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).testers, ["alpha@example.com", "beta@example.com"]);
});

test("grant preserves the owner and existing testers", async () => {
  let updateBody;
  const worker = createWorker({
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
  const worker = createWorker({
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
  const worker = createWorker({
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

test("private-origin proxy strips the path prefix and rewrites redirects", async () => {
  let proxiedRequest;
  const worker = createWorker({
    verifyAdmin: async () => owner,
    fetchImpl: async (input) => {
      proxiedRequest = input;
      return new Response(null, {status: 302, headers: {Location: "/mock/admin.html"}});
    }
  });
  const response = await worker.fetch(request("/dungeon/admin?from=test", {
    headers: {Cookie: "CF_Authorization=private", "Cf-Access-Jwt-Assertion": "jwt"}
  }), baseEnv);
  assert.equal(proxiedRequest.url, "https://dungeon-origin.example/admin?from=test");
  assert.equal(proxiedRequest.headers.get("cookie"), null);
  assert.equal(proxiedRequest.headers.get("cf-access-jwt-assertion"), null);
  assert.equal(proxiedRequest.headers.get("oai-sites-authorization"), "Bearer test-origin-token");
  assert.equal(response.headers.get("location"), "/dungeon/mock/admin.html");
});
