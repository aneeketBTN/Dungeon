import assert from "node:assert/strict";
import test from "node:test";

import {createWorker, RequestError, summarizeCohort} from "../cloudflare/src/index.mjs";

const owner = "owner@example.com";
const currentAgreement = "2026-08-11-community-v2";
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
  const communityOpened = new Map();
  const communityJoined = new Map();
  const communityReminders = new Map();
  const writtenUsage = new Map();
  let cohortUsage = 0;
  return {
    sessions,
    active,
    progress,
    locked,
    agreements,
    communityOpened,
    communityJoined,
    communityReminders,
    writtenUsage,
    async checkLogin(env, email, country, releaseOtherDevice) {
      if (locked.has(email)) throw new RequestError(403, "ACCOUNT_LOCKED", "This tester account is locked. Ask Aneeket for help.");
      if (countries.has(email) && country && countries.get(email) !== country) {
        locked.add(email);
        for (const [tokenHash, sessionEmail] of sessions) if (sessionEmail === email) sessions.delete(tokenHash);
        throw new RequestError(403, "LOCATION_LOCKED", "This tester account was locked because its country changed. Ask Aneeket for help.");
      }
      const inUse = [...sessions.values()].includes(email);
      if (inUse) {
        if (releaseOtherDevice !== true) {
          throw new RequestError(409, "ACCOUNT_IN_USE", "This account is already open on another browser. You can sign that one out and continue here.");
        }
        for (const [tokenHash, sessionEmail] of sessions) if (sessionEmail === email) sessions.delete(tokenHash);
      }
      return {releasedOtherDevice: inUse && releaseOtherDevice === true};
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
      if (!email || !active.has(email)) return null;
      return {email, agreement_version: agreements.get(email) || (agreementAccepted ? currentAgreement : null)};
    },
    async endSession(env, tokenHash) { sessions.delete(tokenHash); },
    async activateTester(env, email) { active.add(email); },
    async agreementVersion(env, email) {
      return agreements.get(email) || (agreementAccepted ? currentAgreement : null);
    },
    async acceptAgreement(env, email, version) {
      const now = new Date().toISOString();
      agreements.set(email, version);
      communityOpened.set(email, now);
      communityJoined.set(email, now);
      communityReminders.delete(email);
    },
    async communityStatus(env, email) {
      return {
        joined: agreementAccepted ? communityJoined.has(email) || !agreements.has(email) : communityJoined.has(email),
        inviteOpenedAt: communityOpened.get(email) || null,
        joinedAt: communityJoined.get(email) || (agreementAccepted && !agreements.has(email) ? "accepted-before-test" : null),
        reminderAt: communityReminders.get(email) || null
      };
    },
    async markCommunityOpened(env, email) {
      if (!communityOpened.has(email)) communityOpened.set(email, new Date().toISOString());
    },
    async acknowledgeCommunity(env, email) {
      if (!communityOpened.has(email)) return false;
      communityJoined.set(email, new Date().toISOString());
      communityReminders.delete(email);
      return true;
    },
    async remindCommunity(env, emails) {
      const now = new Date().toISOString();
      emails.forEach((email) => {
        if (!communityJoined.has(email)) communityReminders.set(email, now);
      });
      return emails;
    },
    async listTesterSecurity(env, emails) {
      return Object.fromEntries(emails.map((email) => [email, {
        agreementAccepted: agreementAccepted || agreements.get(email) === currentAgreement,
        agreementEverAccepted: agreementAccepted || agreements.has(email),
        communityJoined: agreementAccepted ? communityJoined.has(email) || !agreements.has(email) : communityJoined.has(email),
        communityInviteOpenedAt: communityOpened.get(email) || null,
        communityJoinedAt: communityJoined.get(email) || null,
        communityReminderAt: communityReminders.get(email) || null,
        activeSession: [...sessions.values()].includes(email),
        locked: locked.has(email),
        hasProgress: progress.has(email)
      }]));
    },
    async revokeTester(env, email) {
      active.delete(email);
      countries.delete(email);
      locked.delete(email);
      progress.delete(email);
      agreements.delete(email);
      communityOpened.delete(email);
      communityJoined.delete(email);
      communityReminders.delete(email);
      for (const [tokenHash, sessionEmail] of sessions) if (sessionEmail === email) sessions.delete(tokenHash);
    },
    async unlockTester(env, email) {
      const wasLocked = locked.delete(email);
      countries.delete(email);
      return wasLocked;
    },
    /* Sign-out touches sessions and nothing else — the memory store mirrors that
     * deliberately, so a test asserting progress survives is testing the contract
     * rather than a convenient fake. */
    async signOutTester(env, email) {
      let cleared = 0;
      for (const [tokenHash, sessionEmail] of sessions) {
        if (sessionEmail === email) { sessions.delete(tokenHash); cleared += 1; }
      }
      return cleared;
    },
    async signOutTesters(env, emails) {
      const targets = new Set(emails);
      let cleared = 0;
      for (const [tokenHash, sessionEmail] of sessions) {
        if (targets.has(sessionEmail)) { sessions.delete(tokenHash); cleared += 1; }
      }
      return cleared;
    },
    async countActiveSessions(env, emails) {
      const counts = {};
      emails.forEach((email) => { counts[email] = 0; });
      for (const sessionEmail of sessions.values()) {
        if (sessionEmail in counts) counts[sessionEmail] += 1;
      }
      return counts;
    },
    async getProgress(env, email) { return progress.get(email) || null; },
    async saveProgress(env, email, stateJson) {
      const prior = progress.get(email);
      const revision = Number(prior?.revision || 0) + 1;
      const updated_at = new Date().toISOString();
      progress.set(email, {state_json: stateJson, revision, updated_at});
      return {revision, updatedAt: updated_at};
    },
    async reserveWrittenCheck(env, email, limit) {
      const checks = Number(writtenUsage.get(email) || 0) + 1;
      if (checks > limit) throw new RequestError(429, "WRITTEN_DAILY_LIMIT", "Today's written-check allowance has been used. Try again tomorrow.");
      writtenUsage.set(email, checks);
      return {checks, limit, remaining: limit - checks, resetsAt: "tomorrow"};
    },
    async reserveWrittenBudget(env, limit) {
      const cohortChecks = cohortUsage + 1;
      if (cohortChecks > limit) {
        throw new RequestError(429, "WRITTEN_BUDGET_LIMIT", "Dungeon's shared written-checking budget for today is used up. The rubric and exemplar are still available, and checking resumes tomorrow.");
      }
      cohortUsage = cohortChecks;
      return {cohortChecks, cohortLimit: limit};
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
    embeddedAssets: options.embeddedAssets || null,
    writtenAuthority: options.writtenAuthority
  });
}

async function login(worker, email, env = baseEnv, country = null, releaseOtherDevice = false) {
  const headers = {"Content-Type": "application/json", Origin: "https://aneeketdas.com"};
  if (country) headers["CF-IPCountry"] = country;
  return worker.fetch(request("/dungeon/api/session", {
    method: "POST",
    headers,
    body: JSON.stringify(releaseOtherDevice ? {email, releaseOtherDevice: true} : {email})
  }), env);
}

function cookieFrom(response) {
  return response.headers.get("set-cookie").split(";", 1)[0];
}

function writtenAuthorityStub(captured = []) {
  return {
    health: async () => ({available: true, provider: "test-workers-ai", model: "test-qwen", capabilities: ["rubric-mark"]}),
    grade: async (env, body) => {
      captured.push({operation: "grade", body});
      return {kind: "rubric-mark", authority: "test-hosted", score: 2, maxScore: 3, abstain: false, criteria: []};
    }
  };
}

test("hosted written authority requires a learner session and same-origin POST", async () => {
  const captured = [];
  const worker = workerWithGroup(["alpha@example.com"], {writtenAuthority: writtenAuthorityStub(captured)});
  const anonymous = await worker.fetch(request("/dungeon/api/written-authority/health"), baseEnv);
  assert.equal(anonymous.status, 401);

  const signedIn = await login(worker, "alpha@example.com");
  const cookie = cookieFrom(signedIn);
  const healthResponse = await worker.fetch(request("/dungeon/api/written-authority/health", {headers: {Cookie: cookie}}), baseEnv);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).available, true);

  const crossOrigin = await worker.fetch(request("/dungeon/api/written-authority/grade", {
    method: "POST",
    headers: {Cookie: cookie, Origin: "https://attacker.example", "Content-Type": "application/json"},
    body: JSON.stringify({courseId: "BRGSA", questionId: "BRGSA-written-01", answer: "A substantive answer long enough to inspect."})
  }), baseEnv);
  assert.equal(crossOrigin.status, 403);
  assert.equal(captured.length, 0);

  const unownedCoach = await worker.fetch(request("/dungeon/api/written-authority/coach", {
    method: "POST",
    headers: {Cookie: cookie, Origin: "https://aneeketdas.com", "Content-Type": "application/json"},
    body: JSON.stringify({courseId: "BRGSA", prompt: "An arbitrary question", answer: "An arbitrary answer"})
  }), baseEnv);
  assert.equal(unownedCoach.status, 404);
});

test("hosted written requests are metered without storing candidate text", async () => {
  const captured = [];
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {store, writtenAuthority: writtenAuthorityStub(captured)});
  const signedIn = await login(worker, "alpha@example.com");
  const cookie = cookieFrom(signedIn);
  const env = {...baseEnv, DUNGEON_HOSTED_WRITTEN_DAILY_LIMIT: "1"};
  const body = {courseId: "BRGSA", questionId: "BRGSA-written-01", answer: "A substantive private candidate answer for a one-time check."};
  const first = await worker.fetch(request("/dungeon/api/written-authority/grade", {
    method: "POST",
    headers: {Cookie: cookie, Origin: "https://aneeketdas.com", "Content-Type": "application/json"},
    body: JSON.stringify(body)
  }), env);
  assert.equal(first.status, 200);
  assert.equal((await first.json()).usage.remaining, 0);
  assert.deepEqual(captured, [{operation: "grade", body}]);
  assert.deepEqual([...store.writtenUsage.entries()], [["alpha@example.com", 1]]);
  assert.doesNotMatch(JSON.stringify([...store.writtenUsage.entries()]), /private candidate/i);

  const second = await worker.fetch(request("/dungeon/api/written-authority/grade", {
    method: "POST",
    headers: {Cookie: cookie, Origin: "https://aneeketdas.com", "Content-Type": "application/json"},
    body: JSON.stringify(body)
  }), env);
  assert.equal(second.status, 429);
  assert.equal((await second.json()).code, "WRITTEN_DAILY_LIMIT");
  assert.equal(captured.length, 1);
});

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
    agreementVersion: currentAgreement,
    communityInviteUrl: "https://chat.whatsapp.com/E9RThdcAzqFDTiWPUYcE3I"
  });

  const accepted = await worker.fetch(request("/dungeon/api/session", {
    method: "POST",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({
      email: "alpha@example.com",
      acceptAgreement: true,
      agreementVersion: currentAgreement,
      communityInviteOpened: true,
      communityJoinedAcknowledged: true
    })
  }), baseEnv);
  assert.equal(accepted.status, 200);
  assert.equal(store.agreements.get("alpha@example.com"), currentAgreement);
  assert.equal(store.communityJoined.has("alpha@example.com"), true);
});

test("a session issued under older terms cannot keep using the learner backend", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {store});
  const approved = await login(worker, "alpha@example.com");
  const cookie = cookieFrom(approved);

  const before = await worker.fetch(request("/dungeon/api/session", {headers: {Cookie: cookie}}), baseEnv);
  assert.equal(before.status, 200);

  // The owner publishes a real terms change; the live session predates it.
  store.agreements.set("alpha@example.com", "2026-08-11");

  const session = await worker.fetch(request("/dungeon/api/session", {headers: {Cookie: cookie}}), baseEnv);
  assert.equal(session.status, 401);
  assert.equal((await session.json()).code, "AGREEMENT_REQUIRED");

  const progress = await worker.fetch(request("/dungeon/api/progress", {headers: {Cookie: cookie}}), baseEnv);
  assert.equal(progress.status, 401);
  assert.equal((await progress.json()).code, "AGREEMENT_REQUIRED");
});

test("the control room separates older-terms testers from testers who never agreed", async () => {
  const store = createMemoryStore({agreementAccepted: false});
  const worker = workerWithGroup(["alpha@example.com", "beta@example.com"], {store});
  store.agreements.set("alpha@example.com", "2026-08-11");

  const response = await worker.fetch(request("/dungeon/admin/api/testers", {
    headers: {"CF-Access-Jwt-Assertion": "owner-token"}
  }), baseEnv);
  assert.equal(response.status, 200);
  const security = (await response.json()).security;
  assert.equal(security["alpha@example.com"].agreementAccepted, false);
  assert.equal(security["alpha@example.com"].agreementEverAccepted, true);
  assert.equal(security["beta@example.com"].agreementAccepted, false);
  assert.equal(security["beta@example.com"].agreementEverAccepted, false);
});

test("agreement acceptance fails closed until the WhatsApp invite was opened and membership acknowledged", async () => {
  const worker = workerWithGroup(["alpha@example.com"], {store: createMemoryStore({agreementAccepted: false})});
  const response = await worker.fetch(request("/dungeon/api/session", {
    method: "POST",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({
      email: "alpha@example.com",
      acceptAgreement: true,
      agreementVersion: currentAgreement
    })
  }), baseEnv);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "COMMUNITY_ACK_REQUIRED");
});

test("signed-in testers must open the invite before acknowledging the group", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com"], {store});
  const approved = await login(worker, "alpha@example.com");
  const cookie = cookieFrom(approved);
  store.communityJoined.delete("alpha@example.com");

  const early = await worker.fetch(request("/dungeon/api/community", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: cookie},
    body: JSON.stringify({action: "acknowledge"})
  }), baseEnv);
  assert.equal(early.status, 409);
  assert.equal((await early.json()).code, "INVITE_NOT_OPENED");

  const opened = await worker.fetch(request("/dungeon/api/community", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: cookie},
    body: JSON.stringify({action: "opened"})
  }), baseEnv);
  assert.equal(opened.status, 200);
  const joined = await worker.fetch(request("/dungeon/api/community", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: cookie},
    body: JSON.stringify({action: "acknowledge"})
  }), baseEnv);
  assert.equal((await joined.json()).community.joined, true);
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

test("signing a tester out ends their session but keeps approval and progress", async () => {
  const sampleState = {version: 2, selectedCourse: "SPMS", conceptAttempts: {SPMS: {C1: [{correct: true}]}}, completed: {SPMS: [1]}};
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

  const before = await worker.fetch(request("/dungeon/admin/api/testers"), baseEnv);
  assert.equal((await before.json()).security["alpha@example.com"].activeSessions, 1,
    "the control room must show the live session the owner is about to end");

  const signOut = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({email: "alpha@example.com", action: "sign-out"})
  }), baseEnv);
  assert.equal(signOut.status, 200);
  const signOutBody = await signOut.json();
  assert.equal(signOutBody.signedOut, "alpha@example.com");
  assert.equal(signOutBody.sessionsCleared, 1);
  assert.equal(signOutBody.security["alpha@example.com"].activeSessions, 0);
  assert.equal(wroteGroup, false, "sign-out must not rewrite the Access group");
  assert.ok(signOutBody.testers.includes("alpha@example.com"), "sign-out must not remove approval");

  // The old cookie is dead: the learner is pushed back to sign-in.
  const staleRequest = await worker.fetch(request("/dungeon/api/progress", {headers: {Cookie: cookie}}), baseEnv);
  assert.equal(staleRequest.status, 401, "the ended session must no longer reach the learner backend");

  // And signing back in returns every byte of saved work.
  const secondLogin = await login(worker, "alpha@example.com", baseEnv, "IN");
  assert.equal(secondLogin.status, 200, "an approved tester can sign straight back in");
  const restored = await worker.fetch(request("/dungeon/api/progress", {
    headers: {Cookie: cookieFrom(secondLogin)}
  }), baseEnv);
  assert.equal(restored.status, 200);
  assert.deepEqual((await restored.json()).state, sampleState, "progress must survive a forced sign-out");
});

test("signing everyone out clears tester sessions and leaves the owner alone", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com", "beta@example.com"], {store});

  await login(worker, "alpha@example.com", baseEnv, "IN");
  await login(worker, "beta@example.com", baseEnv, "IN");

  const response = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({action: "sign-out-all"})
  }), baseEnv);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.sessionsCleared, 2);
  assert.deepEqual(body.signedOut.sort(), ["alpha@example.com", "beta@example.com"]);
  assert.equal(body.security["alpha@example.com"].activeSessions, 0);
  assert.equal(body.security["beta@example.com"].activeSessions, 0);
  assert.ok(!body.signedOut.includes(baseEnv.OWNER_EMAIL), "the owner must never be signed out by the bulk control");
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

test("a learner can move to a new device without losing progress or waiting for the owner", async () => {
  const sampleState = {version: 2, selectedCourse: "BRGSA", conceptAttempts: {BRGSA: {C1: [{correct: true}]}}, completed: {BRGSA: [1]}};
  const worker = workerWithGroup(["alpha@example.com"], {store: createMemoryStore()});

  // Phone: sign in and record some work.
  const phone = await login(worker, "alpha@example.com");
  assert.equal(phone.status, 200);
  await worker.fetch(request("/dungeon/api/progress", {
    method: "PUT",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com", Cookie: cookieFrom(phone)},
    body: JSON.stringify({state: sampleState})
  }), baseEnv);

  // Laptop: the plain attempt is refused, but with a code the page can act on rather
  // than the old dead end of "sign out there".
  const blocked = await login(worker, "alpha@example.com");
  assert.equal(blocked.status, 409);
  assert.equal((await blocked.json()).code, "ACCOUNT_IN_USE");

  // Laptop: the learner chooses to end the other session.
  const laptop = await login(worker, "alpha@example.com", baseEnv, null, true);
  assert.equal(laptop.status, 200);
  assert.equal((await laptop.clone().json()).releasedOtherDevice, true);

  // The work follows the account, not the device.
  const carried = await worker.fetch(request("/dungeon/api/progress", {
    headers: {Cookie: cookieFrom(laptop)}
  }), baseEnv);
  assert.equal(carried.status, 200);
  assert.deepEqual((await carried.json()).state, sampleState);

  // Still exactly one active browser: the phone's cookie no longer authenticates.
  const oldDevice = await worker.fetch(request("/dungeon/api/progress", {
    headers: {Cookie: cookieFrom(phone)}
  }), baseEnv);
  assert.equal(oldDevice.status, 401, "the previous session must be ended, not merely joined");
});

test("a country-locked account cannot take over its way back in", async () => {
  const worker = workerWithGroup(["alpha@example.com"], {store: createMemoryStore()});
  const first = await login(worker, "alpha@example.com", baseEnv, "IN");
  assert.equal(first.status, 200);

  // A device switch is routine; clearing a country lock is a security decision, and
  // the release flag must not be a way around it.
  const abroad = await login(worker, "alpha@example.com", baseEnv, "US", true);
  assert.equal(abroad.status, 403);
  assert.equal((await abroad.json()).code, "LOCATION_LOCKED");
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

test("owner can bump every approved tester still missing the WhatsApp group", async () => {
  const store = createMemoryStore({agreementAccepted: false});
  await store.markCommunityOpened(baseEnv, "beta@example.com");
  await store.acknowledgeCommunity(baseEnv, "beta@example.com");
  const worker = workerWithGroup(["alpha@example.com", "beta@example.com"], {store});
  const response = await worker.fetch(request("/dungeon/admin/api/testers", {
    method: "PATCH",
    headers: {"Content-Type": "application/json", Origin: "https://aneeketdas.com"},
    body: JSON.stringify({action: "bump-unjoined"})
  }), baseEnv);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(payload.reminded, ["alpha@example.com"]);
  assert.equal(store.communityReminders.has("alpha@example.com"), true);
  assert.equal(store.communityReminders.has("beta@example.com"), false);
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
  assert.equal(await after.text(), "asset:/app/login.html");
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
  assert.equal(await learner.text(), "asset:/app/t6.html");
});

test("legacy /mock/ bookmarks still resolve to the renamed app assets", async () => {
  const worker = workerWithGroup(["alpha@example.com"]);
  const approved = await login(worker, "alpha@example.com");
  const cookie = cookieFrom(approved);
  for (const [bookmarked, asset] of [
    ["/dungeon/mock/t6.html", "asset:/app/t6.html"],
    ["/dungeon/mock/t6.css", "asset:/app/t6.css"],
    ["/dungeon/mock/t6.js", "asset:/app/t6.js"],
    ["/dungeon/mock/sets/t6_brgsa.js", "asset:/app/sets/t6_brgsa.js"]
  ]) {
    const response = await worker.fetch(request(bookmarked, {headers: {Cookie: cookie}}), baseEnv);
    assert.equal(await response.text(), asset, `${bookmarked} should still serve ${asset}`);
  }
});

test("anonymous learner sees only the login and cannot fetch the question bank", async () => {
  const worker = workerWithGroup();
  const learner = await worker.fetch(request("/dungeon/"), baseEnv);
  assert.equal(await learner.text(), "asset:/app/login.html");
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
  assert.equal(await admin.text(), "asset:/app/admin.html");
  const health = await worker.fetch(request("/dungeon/admin/health"), baseEnv);
  assert.equal((await health.json()).storage, "cloudflare-d1");
  assert.equal(adminChecks, 2);
});

test("the Access self-check explains a login loop without leaking configuration", async () => {
  let adminChecks = 0;
  const worker = workerWithGroup([], {verifyAdmin: async () => { adminChecks += 1; return owner; }});

  // Reachable without the owner gate: the route exists to explain why the gate fails.
  const anonymous = await worker.fetch(request("/dungeon/admin/access-check"), baseEnv);
  assert.equal(anonymous.status, 200);
  const report = await anonymous.json();
  assert.equal(adminChecks, 0, "the self-check must not require the gate it diagnoses");
  assert.equal(report.jwtPresent, false);
  assert.equal(report.reason, "NO_JWT_AT_ORIGIN");
  assert.equal(report.audienceConfigured, true);

  // Booleans only: no audience tag, team domain, or address may appear anywhere.
  const serialized = JSON.stringify(report);
  for (const secret of [baseEnv.ACCESS_ADMIN_AUD, baseEnv.ACCESS_TEAM_DOMAIN, owner, baseEnv.CF_API_TOKEN]) {
    assert.ok(!serialized.includes(secret), `self-check leaked ${secret}`);
  }

  // A token issued for a different application is named as an audience mismatch
  // rather than failing silently and bouncing the browser back to the login domain.
  const claims = Buffer.from(JSON.stringify({
    aud: ["some-other-application"], iss: "https://dungeon.cloudflareaccess.com",
    email: owner, exp: Math.floor(Date.now() / 1000) + 600
  })).toString("base64url");
  const mismatched = await worker.fetch(
    request("/dungeon/admin/access-check", {headers: {"cf-access-jwt-assertion": `header.${claims}.signature`}}),
    baseEnv
  );
  const mismatchReport = await mismatched.json();
  assert.equal(mismatchReport.jwtPresent, true);
  assert.equal(mismatchReport.audienceMatches, false);
  assert.equal(mismatchReport.reason, "AUDIENCE_MISMATCH");
  assert.equal(mismatchReport.verified, false);
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
      "/app/login.html": {body: "embedded login", contentType: "text/html; charset=utf-8"},
      "/app/t6.html": {body: "embedded learner", contentType: "text/html; charset=utf-8"}
    }
  });
  const {ASSETS, ...envWithoutAssets} = baseEnv;
  const anonymous = await worker.fetch(request("/dungeon/"), envWithoutAssets);
  assert.equal(await anonymous.text(), "embedded login");
  const approved = await login(worker, "alpha@example.com", envWithoutAssets);
  const learner = await worker.fetch(request("/dungeon/", {headers: {Cookie: cookieFrom(approved)}}), envWithoutAssets);
  assert.equal(await learner.text(), "embedded learner");
});

test("the cohort ceiling bounds spend no matter how many testers are admitted", async () => {
  const store = createMemoryStore();
  const worker = workerWithGroup(["alpha@example.com", "beta@example.com"], {
    store, writtenAuthority: writtenAuthorityStub([])
  });
  /* Generous per-tester allowance, tiny cohort budget: the point is that admitting
     more people must not raise the total. */
  const env = {...baseEnv, DUNGEON_HOSTED_WRITTEN_DAILY_LIMIT: "50", DUNGEON_HOSTED_WRITTEN_COHORT_DAILY_LIMIT: "2"};
  const body = JSON.stringify({courseId: "BRGSA", questionId: "BRGSA-written-01", answer: "A substantive written answer for checking."});
  /* One active session per email, so sign each tester in once and reuse the cookie. */
  const alpha = cookieFrom(await login(worker, "alpha@example.com"));
  const beta = cookieFrom(await login(worker, "beta@example.com"));
  const post = async (cookie) => worker.fetch(request("/dungeon/api/written-authority/grade", {
    method: "POST",
    headers: {Cookie: cookie, Origin: "https://aneeketdas.com", "Content-Type": "application/json"},
    body
  }), env);
  assert.equal((await post(alpha)).status, 200);
  assert.equal((await post(beta)).status, 200);
  const exhausted = await post(alpha);
  assert.equal(exhausted.status, 429, "the third check exceeds the cohort budget even though nobody hit their own limit");
  assert.equal((await exhausted.json()).code, "WRITTEN_BUDGET_LIMIT");
});
