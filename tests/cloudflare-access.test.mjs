import assert from "node:assert/strict";
import test from "node:test";

import {createWorker, RequestError, summarizeCohort} from "../cloudflare/src/index.mjs";

const owner = "owner@example.com";
const baseEnv = {
  DUNGEON_PREFIX: "/dungeon",
  DB: {prepare() {}},
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
  OWNER_EMAIL: owner,
  CF_API_TOKEN: "test-api-token"
};

function createMemoryStore({agreementAccepted = true} = {}) {
  const sessions = new Map();
  const active = new Set();
  const progress = new Map();
  const countries = new Map();
  const locked = new Set();
  const agreements = new Map();
  return {
    sessions,
    active,
    progress,
    locked,
    agreements,
    async checkLogin(env, email, country) {
      if (locked.has(email)) throw new RequestError(403, "ACCOUNT_LOCKED", "This tester account is locked. Ask Aneeket for help.");
      if (countries.has(email) && country && countries.get(email) !== country) {
        locked.add(email);
        for (const [tokenHash, sessionEmail] of sessions) if (sessionEmail === email) sessions.delete(tokenHash);
        throw new RequestError(403, "LOCATION_LOCKED", "This tester account was locked because its country changed. Ask Aneeket for help.");
      }
      if ([...sessions.values()].includes(email)) {
        throw new RequestError(409, "ACCOUNT_IN_USE", "This tester account is already active on another browser. Sign out there or ask Aneeket for help.");
      }
    },
    async issueSession(env, email, tokenHash, expiresAt, country) {
      active.add(email);
      if (country && !countries.has(email)) countries.set(email, country);
      sessions.set(tokenHash, email);
    },
    async findSession(env, tokenHash, country) {
      const email = sessions.get(tokenHash);
      if (email && countries.has(email) && country && countries.get(email) !== country) {
        locked.add(email);
        sessions.delete(tokenHash);
        return null;
      }
      return email && active.has(email) ? {email} : null;
    },
    async endSession(env, tokenHash) { sessions.delete(tokenHash); },
    async activateTester(env, email) { active.add(email); },
    async agreementVersion(env, email) {
      return agreements.get(email) || (agreementAccepted ? "2026-08-11" : null);
    },
    async acceptAgreement(env, email, version) { agreements.set(email, version); },
    async revokeTester(env, email) {
      active.delete(email);
      countries.delete(email);
      locked.delete(email);
      progress.delete(email);
      for (const [tokenHash, sessionEmail] of sessions) if (sessionEmail === email) sessions.delete(tokenHash);
    },
    async unlockTester(env, email) {
      const wasLocked = locked.delete(email);
      countries.delete(email);
      return wasLocked;
    },
    async getProgress(env, email) { return progress.get(email) || null; },
    async saveProgress(env, email, stateJson) {
      const prior = progress.get(email);
      const revision = Number(prior?.revision || 0) + 1;
      const updated_at = new Date().toISOString();
      progress.set(email, {state_json: stateJson, revision, updated_at});
      return {revision, updatedAt: updated_at};
    }
  };
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

function workerWithGroup(testers = ["alpha@example.com"], options = {}) {
  return createWorker({
    store: options.store || createMemoryStore(),
    verifyAdmin: options.verifyAdmin || (async () => owner),
    fetchImpl: options.fetchImpl || (async () => Response.json(groupResult(testers))),
    embeddedAssets: options.embeddedAssets || null
  });
}

async function login(worker, email, env = baseEnv, country = null) {
  const headers = {"Content-Type": "application/json", Origin: "https://aneeketdas.com"};
  if (country) headers["CF-IPCountry"] = country;
  return worker.fetch(request("/dungeon/api/session", {
    method: "POST",
    headers,
    body: JSON.stringify({email})
  }), env);
}

function cookieFrom(response) {
  return response.headers.get("set-cookie").split(";", 1)[0];
}

test("tester endpoint fails closed when protected bindings are absent", async () => {
  const worker = workerWithGroup();
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), {});
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "SETUP_REQUIRED");
});

test("first approved login requires and records the current tester agreement", async () => {
  const store = createMemoryStore({agreementAccepted: false});
  const worker = workerWithGroup(["alpha@example.com"], {store});

  const required = await login(worker, "alpha@example.com");
  assert.equal(required.status, 428);
  assert.deepEqual(await required.json(), {
    code: "AGREEMENT_REQUIRED",
    message: "Review and accept the closed tester agreement to continue.",
    agreementRequired: true,
    agreementVersion: "2026-08-11"
  });

  const accepted = await worker.fetch(request("/dungeon/api/session", {
    method: "POST",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({
      email: "alpha@example.com",
      acceptAgreement: true,
      agreementVersion: "2026-08-11"
    })
  }), baseEnv);
  assert.equal(accepted.status, 200);
  assert.equal(store.agreements.get("alpha@example.com"), "2026-08-11");
});

test("tester endpoint requires owner authentication", async () => {
  const worker = createWorker({
    store: createMemoryStore(),
    fetchImpl: async () => Response.json(groupResult())
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "OWNER_AUTH_REQUIRED");
});

test("tester list omits the protected owner member", async () => {
  const worker = workerWithGroup(["alpha@example.com", "beta@example.com"]);
  const response = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).testers, ["alpha@example.com", "beta@example.com"]);
});

test("grant preserves the owner and existing testers", async () => {
  let updateBody;
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {
    store,
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
  assert.equal(store.active.has("beta@example.com"), true);
});

test("one request onboards a whole cohort and reports duplicates and rejects", async () => {
  let updateBody;
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {
    store,
    fetchImpl: async (input, init = {}) => {
      if (init.method === "PUT") {
        updateBody = JSON.parse(init.body);
        return Response.json(groupResult(["alpha@example.com"]));
      }
      return Response.json(groupResult(["alpha@example.com"]));
    }
  });
  const response = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "POST",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({emails: ["Beta@Example.com", "gamma@example.com", "alpha@example.com", "not-an-email", owner]})
  }), baseEnv);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload.added, ["beta@example.com", "gamma@example.com"]);
  assert.deepEqual(payload.alreadyApproved, ["alpha@example.com"]);
  assert.deepEqual(payload.rejected, ["not-an-email", owner]);
  assert.deepEqual(updateBody.include.map((rule) => rule.email.email), [
    "alpha@example.com",
    "beta@example.com",
    "gamma@example.com",
    owner
  ]);
  assert.equal(store.active.has("beta@example.com"), true);
  assert.equal(store.active.has("gamma@example.com"), true);
  assert.equal(store.active.has(owner), false);
});

test("unlocking a country lock keeps the tester's saved progress", async () => {
  const sampleState = {version: 2, selectedCourse: "BRGSA", conceptAttempts: {BRGSA: {C1: [{correct: true}]}}, completed: {BRGSA: [1]}};
  let wroteGroup = false;
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {
    store,
    fetchImpl: async (input, init = {}) => {
      if (init.method === "PUT") wroteGroup = true;
      return Response.json(groupResult(["alpha@example.com"]));
    }
  });

  const firstLogin = await login(worker, "alpha@example.com", baseEnv, "IN");
  const cookie = cookieFrom(firstLogin);
  await worker.fetch(request("/dungeon/api/progress", {
    method: "PUT",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: cookie},
    body: JSON.stringify({state: sampleState})
  }), baseEnv);
  await worker.fetch(request("/dungeon/api/session", {
    method: "DELETE",
    headers: {Origin: "https://aneeketdas.com", Cookie: cookie}
  }), baseEnv);

  const fromAbroad = await login(worker, "alpha@example.com", baseEnv, "US");
  assert.equal(fromAbroad.status, 403);
  assert.equal((await fromAbroad.json()).code, "LOCATION_LOCKED");

  const unlock = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({email: "alpha@example.com", action: "unlock"})
  }), baseEnv);
  assert.equal(unlock.status, 200);
  assert.equal((await unlock.json()).unlocked, "alpha@example.com");
  assert.equal(wroteGroup, false, "unlock must not rewrite the Access group");

  const afterUnlock = await login(worker, "alpha@example.com", baseEnv, "US");
  assert.equal(afterUnlock.status, 200);
  const progressResponse = await worker.fetch(request("/dungeon/api/progress", {
    headers: {Cookie: cookieFrom(afterUnlock)}
  }), baseEnv);
  assert.equal(progressResponse.status, 200);
  assert.deepEqual((await progressResponse.json()).state, sampleState);
});

test("cohort insights rank by unassisted first attempts and exclude the owner", () => {
  const progressRow = (email, attempts) => ({
    email,
    state_json: JSON.stringify({
      version: 2,
      selectedCourse: "BRGSA",
      completed: {},
      conceptAttempts: {BRGSA: attempts}
    })
  });
  const attempt = (correct, extra = {}) => ({correct, scored: true, isReattempt: false, at: 1770000000000, ...extra});

  const summary = summarizeCohort([
    progressRow("alpha@example.com", {
      C1: [attempt(false), attempt(false), attempt(true, {hintUsed: true})],
      C2: [attempt(true), attempt(true)]
    }),
    progressRow("beta@example.com", {
      C1: [attempt(false)],
      // Retries and unscored work must never count as evidence of what a tester knows.
      C2: [attempt(false, {isReattempt: true}), attempt(false, {scored: false})]
    }),
    progressRow(owner, {C1: [attempt(false), attempt(false), attempt(false)]}),
    {email: "corrupt@example.com", state_json: "{not json"}
  ], owner);

  const hardest = summary.hardest.find((row) => row.concept === "C1");
  assert.equal(hardest.attempts, 4, "owner attempts and bad rows are excluded");
  assert.equal(hardest.accuracy, 25);
  assert.equal(hardest.testers, 2);
  assert.equal(hardest.assistedRate, 25);
  assert.equal(hardest.lowSample, true);
  assert.equal(summary.hardest[0].concept, "C1", "hardest concept sorts first");

  const beta = summary.participation.find((row) => row.email === "beta@example.com");
  assert.equal(beta.attempts, 3, "every recorded attempt counts as activity");
  assert.equal(beta.firstAttempts, 1, "only unassisted first attempts score accuracy");
  assert.equal(beta.accuracy, 0);
  assert.equal(summary.participation.some((row) => row.email === owner), false);
  assert.equal(summary.participation.some((row) => row.email === "corrupt@example.com"), false);
});

test("unlock refuses an address that is not an approved tester", async () => {
  const worker = workerWithGroup(["alpha@example.com"]);
  const response = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({email: "stranger@example.com", action: "unlock"})
  }), baseEnv);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).code, "NOT_APPROVED");
});

test("revoke invalidates sessions and deletes saved progress", async () => {
  let updateBody;
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {
    store,
    fetchImpl: async (input, init = {}) => {
      if (init.method === "PUT") {
        updateBody = JSON.parse(init.body);
        return Response.json(groupResult([]));
      }
      return Response.json(groupResult(["alpha@example.com"]));
    }
  });
  const loginResponse = await login(worker, "alpha@example.com");
  const cookie = cookieFrom(loginResponse);
  const state = {version: 2, selectedCourse: "BRGSA", conceptAttempts: {}, completed: {BRGSA: [1]}};
  await worker.fetch(request("/dungeon/api/progress", {
    method: "PUT",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: cookie},
    body: JSON.stringify({state})
  }), baseEnv);

  const revoke = await worker.fetch(request("/dungeon/admin/api/testers?email=alpha%40example.com", {
    method: "DELETE",
    headers: {Origin: "https://aneeketdas.com"}
  }), baseEnv);
  assert.equal(revoke.status, 200);
  assert.deepEqual(updateBody.include, [{email: {email: owner}}]);
  assert.equal(store.progress.has("alpha@example.com"), false);

  const after = await worker.fetch(request("/dungeon/", {headers: {Cookie: cookie}}), baseEnv);
  assert.equal(await after.text(), "asset:/mock/login.html");
});

test("mixed-selector groups are rejected instead of silently widened", async () => {
  const worker = createWorker({
    store: createMemoryStore(),
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

test("approved email enters immediately while an unapproved email gets the private denial", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {store});

  const denied = await login(worker, "stranger@example.com");
  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), {code: "NOT_APPROVED", message: "Ask Aneeket to add you in."});

  const approved = await login(worker, "Alpha@Example.com");
  assert.equal(approved.status, 200);
  assert.match(approved.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
  const learner = await worker.fetch(request("/dungeon/", {headers: {Cookie: cookieFrom(approved)}}), baseEnv);
  assert.equal(await learner.text(), "asset:/mock/t6.html");
});

test("anonymous learner sees only the login and cannot fetch the question bank", async () => {
  const worker = workerWithGroup();
  const learner = await worker.fetch(request("/dungeon/"), baseEnv);
  assert.equal(await learner.text(), "asset:/mock/login.html");
  const bank = await worker.fetch(request("/dungeon/sets/t6_brgsa.js"), baseEnv);
  assert.equal(bank.status, 401);
});

test("progress is durable across learner sessions", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {store});
  const firstLogin = await login(worker, "alpha@example.com");
  const firstCookie = cookieFrom(firstLogin);
  const state = {version: 2, selectedCourse: "BRGSA", conceptAttempts: {BRGSA: {C1: [{correct: true}]}}, completed: {BRGSA: [1]}};
  const saved = await worker.fetch(request("/dungeon/api/progress", {
    method: "PUT",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: firstCookie},
    body: JSON.stringify({state})
  }), baseEnv);
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).revision, 1);

  await worker.fetch(request("/dungeon/api/session", {
    method: "DELETE",
    headers: {Origin: "https://aneeketdas.com", Cookie: firstCookie}
  }), baseEnv);
  const secondLogin = await login(worker, "alpha@example.com");
  const loaded = await worker.fetch(request("/dungeon/api/progress", {
    headers: {Cookie: cookieFrom(secondLogin)}
  }), baseEnv);
  assert.equal(loaded.status, 200);
  assert.deepEqual((await loaded.json()).state, state);
});

test("one email cannot open a second active browser and a new country locks the account", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {store});
  const first = await login(worker, "alpha@example.com", baseEnv, "SG");
  assert.equal(first.status, 200);

  const simultaneous = await login(worker, "alpha@example.com", baseEnv, "SG");
  assert.equal(simultaneous.status, 409);

  await worker.fetch(request("/dungeon/api/session", {
    method: "DELETE",
    headers: {Origin: "https://aneeketdas.com", Cookie: cookieFrom(first), "CF-IPCountry": "SG"}
  }), baseEnv);
  const moved = await login(worker, "alpha@example.com", baseEnv, "IN");
  assert.equal(moved.status, 403);
  assert.equal(store.locked.has("alpha@example.com"), true);
});

test("owner routes retain the separate Cloudflare Access boundary", async () => {
  let adminChecks = 0;
  const worker = workerWithGroup([], {verifyAdmin: async () => { adminChecks += 1; return owner; }});
  const admin = await worker.fetch(request("/dungeon/admin/"), baseEnv);
  assert.equal(await admin.text(), "asset:/mock/admin.html");
  const health = await worker.fetch(request("/dungeon/admin/health"), baseEnv);
  assert.equal((await health.json()).storage, "cloudflare-d1");
  assert.equal(adminChecks, 2);
});

test("health and release routes stay under the Dungeon prefix", async () => {
  const worker = workerWithGroup();
  const health = await worker.fetch(request("/dungeon/health"), baseEnv);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).access, "dashboard-allowlist");
  const outside = await worker.fetch(request("/health"), baseEnv);
  assert.equal(outside.status, 404);
});

test("standalone delivery serves embedded login and learner assets", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {
    store,
    embeddedAssets: {
      "/mock/login.html": {body: "embedded login", contentType: "text/html; charset=utf-8"},
      "/mock/t6.html": {body: "embedded learner", contentType: "text/html; charset=utf-8"}
    }
  });
  const {ASSETS, ...envWithoutAssets} = baseEnv;
  const anonymous = await worker.fetch(request("/dungeon/"), envWithoutAssets);
  assert.equal(await anonymous.text(), "embedded login");
  const approved = await login(worker, "alpha@example.com", envWithoutAssets);
  const learner = await worker.fetch(request("/dungeon/", {headers: {Cookie: cookieFrom(approved)}}), envWithoutAssets);
  assert.equal(await learner.text(), "embedded learner");
});
