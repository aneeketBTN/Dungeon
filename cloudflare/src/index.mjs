import { createRemoteJWKSet, jwtVerify } from "jose";

const ACCESS_API = "https://api.cloudflare.com/client/v4";
const SESSION_COOKIE = "dungeon_session";
const SESSION_DAYS = 1;
const AGREEMENT_VERSION = "2026-08-11-community-v2";
const COMMUNITY_INVITE_URL = "https://chat.whatsapp.com/E9RThdcAzqFDTiWPUYcE3I";
const REQUIRED_ACCESS_BINDINGS = ["ACCESS_ACCOUNT_ID", "ACCESS_GROUP_ID", "OWNER_EMAIL", "CF_API_TOKEN"];
const REQUIRED_ADMIN_BINDINGS = [
  ...REQUIRED_ACCESS_BINDINGS,
  "ACCESS_TEAM_DOMAIN",
  "ACCESS_ADMIN_AUD"
];
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'none'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'"
].join("; ");

export class RequestError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function securityHeaders(headers = new Headers()) {
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return headers;
}

function json(payload, status = 200, extraHeaders = {}) {
  const headers = securityHeaders(new Headers(extraHeaders));
  headers.set("Content-Type", "application/json; charset=utf-8");
  return Response.json(payload, {status, headers});
}

function redirect(location, status = 302, extraHeaders = {}) {
  return new Response(null, {
    status,
    headers: securityHeaders(new Headers({Location: location, ...extraHeaders}))
  });
}

function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function requestCountry(request) {
  const value = request.cf?.country || request.headers.get("cf-ipcountry");
  return typeof value === "string" && /^[A-Z]{2}$/.test(value.toUpperCase()) ? value.toUpperCase() : null;
}

function requireBindings(env, names) {
  const missing = names.filter((name) => typeof env?.[name] !== "string" || !env[name].trim());
  if (missing.length) throw new RequestError(503, "SETUP_REQUIRED", "Tester access is not configured.");
}

function requireDatabase(env) {
  if (!env?.DB || typeof env.DB.prepare !== "function") {
    throw new RequestError(503, "BACKEND_UNAVAILABLE", "Progress storage is temporarily unavailable.");
  }
  return env.DB;
}

function accessGroupUrl(env) {
  return `${ACCESS_API}/accounts/${encodeURIComponent(env.ACCESS_ACCOUNT_ID)}/access/groups/${encodeURIComponent(env.ACCESS_GROUP_ID)}`;
}

function accessTeamUrl(env) {
  let teamUrl;
  try {
    teamUrl = new URL(env.ACCESS_TEAM_DOMAIN);
  } catch (error) {
    throw new RequestError(503, "SETUP_REQUIRED", "Owner access is not configured.");
  }
  if (teamUrl.protocol !== "https:" || !teamUrl.hostname.endsWith(".cloudflareaccess.com")) {
    throw new RequestError(503, "SETUP_REQUIRED", "Owner access is not configured.");
  }
  return teamUrl;
}

async function verifyAccess(request, env, audience) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) throw new RequestError(403, "ACCESS_AUTH_REQUIRED", "Cloudflare Access authentication is required.");
  if (typeof audience !== "string" || !audience.trim()) {
    throw new RequestError(503, "SETUP_REQUIRED", "Owner access is not configured.");
  }
  const teamUrl = accessTeamUrl(env);
  try {
    const jwks = createRemoteJWKSet(new URL("/cdn-cgi/access/certs", teamUrl));
    const {payload} = await jwtVerify(token, jwks, {issuer: teamUrl.origin, audience});
    return payload;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(403, "ACCESS_AUTH_REQUIRED", "Cloudflare Access authentication is required.");
  }
}

async function verifyOwner(request, env) {
  let payload;
  try {
    payload = await verifyAccess(request, env, env.ACCESS_ADMIN_AUD);
  } catch (error) {
    if (error instanceof RequestError && error.code === "ACCESS_AUTH_REQUIRED") {
      throw new RequestError(403, "OWNER_AUTH_REQUIRED", "Owner authentication is required.");
    }
    throw error;
  }
  const authenticatedEmail = normalizeEmail(payload.email);
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL);
  if (!authenticatedEmail || !ownerEmail || authenticatedEmail !== ownerEmail) {
    throw new RequestError(403, "OWNER_AUTH_REQUIRED", "Owner authentication is required.");
  }
  return authenticatedEmail;
}

async function readBoundedJson(request, maxBytes = 2048) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestError(415, "JSON_REQUIRED", "Send a JSON request.");
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw new RequestError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  const body = await request.text();
  if (body.length > maxBytes) throw new RequestError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new RequestError(400, "INVALID_JSON", "The request could not be read.");
  }
}

function requireSameOrigin(request) {
  const expectedOrigin = new URL(request.url).origin;
  if (request.headers.get("origin") !== expectedOrigin) {
    throw new RequestError(403, "SAME_ORIGIN_REQUIRED", "The request must come from Dungeon.");
  }
}

async function accessApi(env, fetchImpl, init = {}) {
  const response = await fetchImpl(accessGroupUrl(env), {
    ...init,
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  const payload = await response.json();
  if (!response.ok || payload?.success !== true || !payload.result) {
    console.error(JSON.stringify({event: "access_group_api_error", status: response.status}));
    throw new RequestError(502, "ACCESS_PROVIDER_ERROR", "The tester list could not be checked.");
  }
  return payload.result;
}

function parseEmailOnlyGroup(group, ownerEmail) {
  if (!group || typeof group.name !== "string" || !Array.isArray(group.include) || group.include.length > 200) {
    throw new RequestError(409, "UNSAFE_ACCESS_GROUP", "The tester access group needs owner review.");
  }
  const emails = [];
  for (const rule of group.include) {
    const keys = rule && typeof rule === "object" ? Object.keys(rule) : [];
    const email = keys.length === 1 && keys[0] === "email" ? normalizeEmail(rule.email?.email) : null;
    if (!email) throw new RequestError(409, "UNSAFE_ACCESS_GROUP", "The tester access group needs owner review.");
    emails.push(email);
  }
  if (!emails.includes(ownerEmail)) {
    throw new RequestError(409, "OWNER_RULE_MISSING", "The tester access group needs owner review.");
  }
  return [...new Set(emails)].sort();
}

function groupUpdateBody(group, emails) {
  const body = {name: group.name, include: emails.map((email) => ({email: {email}}))};
  if (Array.isArray(group.exclude)) body.exclude = group.exclude;
  if (Array.isArray(group.require)) body.require = group.require;
  if (typeof group.is_default === "boolean") body.is_default = group.is_default;
  return body;
}

async function writeGroup(env, fetchImpl, group, emails) {
  return accessApi(env, fetchImpl, {method: "PUT", body: JSON.stringify(groupUpdateBody(group, emails))});
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function hashToken(token) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionTokenFromRequest(request) {
  const cookie = request.headers.get("cookie") || "";
  for (const part of cookie.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== SESSION_COOKIE) continue;
    const token = part.slice(separator + 1).trim();
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
  }
  return null;
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/dungeon; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
}

function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/dungeon; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function createD1Store() {
  return {
    async checkLogin(env, email, country) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      const tester = await db.prepare("SELECT first_country, location_locked_at FROM testers WHERE email = ?").bind(email).first();
      if (tester?.location_locked_at) {
        throw new RequestError(403, "ACCOUNT_LOCKED", "This tester account is locked. Ask Aneeket for help.");
      }
      if (tester?.first_country && country && tester.first_country !== country) {
        await db.batch([
          db.prepare("UPDATE testers SET location_locked_at = ?, lock_reason = ?, updated_at = ? WHERE email = ?")
            .bind(now, "country-changed", now, email),
          db.prepare("DELETE FROM learner_sessions WHERE email = ?").bind(email)
        ]);
        throw new RequestError(403, "LOCATION_LOCKED", "This tester account was locked because its country changed. Ask Aneeket for help.");
      }
      await db.prepare("DELETE FROM learner_sessions WHERE expires_at <= ?").bind(now).run();
      const existing = await db.prepare("SELECT token_hash FROM learner_sessions WHERE email = ? LIMIT 1").bind(email).first();
      if (existing) {
        throw new RequestError(409, "ACCOUNT_IN_USE", "This tester account is already active on another browser. Sign out there or ask Aneeket for help.");
      }
    },

    async issueSession(env, email, tokenHash, expiresAt, country) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      await db.batch([
        db.prepare(`INSERT INTO testers (email, active, created_at, updated_at, last_login_at, first_country)
          VALUES (?, 1, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET active = 1, updated_at = excluded.updated_at,
            last_login_at = excluded.last_login_at, first_country = COALESCE(testers.first_country, excluded.first_country)`)
          .bind(email, now, now, now, country),
        db.prepare("INSERT INTO learner_sessions (token_hash, email, created_at, expires_at, country) VALUES (?, ?, ?, ?, ?)")
          .bind(tokenHash, email, now, expiresAt, country)
      ]);
    },

    async findSession(env, tokenHash, country) {
      const db = requireDatabase(env);
      const row = await db.prepare(`SELECT learner_sessions.email AS email, testers.first_country AS first_country,
          testers.location_locked_at AS location_locked_at, testers.agreement_version AS agreement_version
        FROM learner_sessions
        INNER JOIN testers ON testers.email = learner_sessions.email
        WHERE learner_sessions.token_hash = ? AND learner_sessions.expires_at > ? AND testers.active = 1`)
        .bind(tokenHash, new Date().toISOString()).first();
      if (!row || row.location_locked_at) return null;
      if (row.first_country && country && row.first_country !== country) {
        const now = new Date().toISOString();
        await db.batch([
          db.prepare("UPDATE testers SET location_locked_at = ?, lock_reason = ?, updated_at = ? WHERE email = ?")
            .bind(now, "country-changed", now, row.email),
          db.prepare("DELETE FROM learner_sessions WHERE email = ?").bind(row.email)
        ]);
        throw new RequestError(403, "LOCATION_LOCKED", "This tester account was locked because its country changed. Ask Aneeket for help.");
      }
      return row;
    },

    async endSession(env, tokenHash) {
      const db = requireDatabase(env);
      await db.prepare("DELETE FROM learner_sessions WHERE token_hash = ?").bind(tokenHash).run();
    },

    async activateTester(env, email) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      await db.prepare(`INSERT INTO testers (email, active, created_at, updated_at)
        VALUES (?, 1, ?, ?)
        ON CONFLICT(email) DO UPDATE SET active = 1, updated_at = excluded.updated_at`)
        .bind(email, now, now).run();
    },

    async agreementVersion(env, email) {
      const db = requireDatabase(env);
      const row = await db.prepare("SELECT agreement_version FROM testers WHERE email = ? AND active = 1").bind(email).first();
      return row?.agreement_version || null;
    },

    async acceptAgreement(env, email, version) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      await db.prepare(`UPDATE testers
        SET agreement_version = ?, agreement_accepted_at = ?, community_invite_opened_at = ?,
          community_join_acknowledged_at = ?, community_reminder_at = NULL, updated_at = ?
        WHERE email = ? AND active = 1`)
        .bind(version, now, now, now, now, email).run();
    },

    async communityStatus(env, email) {
      const db = requireDatabase(env);
      const row = await db.prepare(`SELECT community_invite_opened_at, community_join_acknowledged_at,
          community_reminder_at
        FROM testers WHERE email = ? AND active = 1`).bind(email).first();
      return {
        joined: Boolean(row?.community_join_acknowledged_at),
        inviteOpenedAt: row?.community_invite_opened_at || null,
        joinedAt: row?.community_join_acknowledged_at || null,
        reminderAt: row?.community_reminder_at || null
      };
    },

    async markCommunityOpened(env, email) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      await db.prepare(`UPDATE testers
        SET community_invite_opened_at = COALESCE(community_invite_opened_at, ?), updated_at = ?
        WHERE email = ? AND active = 1`).bind(now, now, email).run();
    },

    async acknowledgeCommunity(env, email) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      const result = await db.prepare(`UPDATE testers
        SET community_join_acknowledged_at = ?, community_reminder_at = NULL, updated_at = ?
        WHERE email = ? AND active = 1 AND community_invite_opened_at IS NOT NULL`)
        .bind(now, now, email).run();
      return Number(result?.meta?.changes || 0) > 0;
    },

    async remindCommunity(env, emails) {
      if (!emails.length) return [];
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      const placeholders = emails.map(() => "?").join(", ");
      await db.prepare(`UPDATE testers SET community_reminder_at = ?, updated_at = ?
        WHERE active = 1 AND community_join_acknowledged_at IS NULL AND email IN (${placeholders})`)
        .bind(now, now, ...emails).run();
      return emails;
    },

    async revokeTester(env, email) {
      const db = requireDatabase(env);
      await db.prepare("DELETE FROM testers WHERE email = ?").bind(email).run();
    },

    async unlockTester(env, email) {
      const db = requireDatabase(env);
      const now = new Date().toISOString();
      const result = await db.prepare(`UPDATE testers
        SET location_locked_at = NULL, lock_reason = NULL, first_country = NULL, updated_at = ?
        WHERE email = ? AND active = 1`).bind(now, email).run();
      return Number(result?.meta?.changes || 0) > 0;
    },

    async listTesterSecurity(env, emails) {
      if (!emails.length) return {};
      const db = requireDatabase(env);
      const placeholders = emails.map(() => "?").join(", ");
      const result = await db.prepare(`SELECT testers.email, testers.first_country, testers.location_locked_at,
          testers.lock_reason, testers.agreement_version, testers.agreement_accepted_at, testers.last_seen_at,
          testers.community_invite_opened_at, testers.community_join_acknowledged_at, testers.community_reminder_at,
          COUNT(learner_sessions.token_hash) AS active_sessions,
          MAX(learner_progress.updated_at) AS progress_updated_at
        FROM testers
        LEFT JOIN learner_sessions ON learner_sessions.email = testers.email AND learner_sessions.expires_at > ?
        LEFT JOIN learner_progress ON learner_progress.email = testers.email
        WHERE testers.email IN (${placeholders})
        GROUP BY testers.email, testers.first_country, testers.location_locked_at, testers.lock_reason,
          testers.agreement_version, testers.agreement_accepted_at, testers.last_seen_at,
          testers.community_invite_opened_at, testers.community_join_acknowledged_at, testers.community_reminder_at`)
        .bind(new Date().toISOString(), ...emails).all();
      return Object.fromEntries((result.results || []).map((row) => [row.email, {
        firstCountry: row.first_country || null,
        locked: Boolean(row.location_locked_at),
        lockReason: row.lock_reason || null,
        activeSession: Number(row.active_sessions || 0) > 0,
        agreementAccepted: row.agreement_version === AGREEMENT_VERSION,
        agreementEverAccepted: Boolean(row.agreement_version),
        agreementAcceptedAt: row.agreement_accepted_at || null,
        communityInviteOpenedAt: row.community_invite_opened_at || null,
        communityJoined: Boolean(row.community_join_acknowledged_at),
        communityJoinedAt: row.community_join_acknowledged_at || null,
        communityReminderAt: row.community_reminder_at || null,
        lastSeenAt: row.last_seen_at || null,
        hasProgress: Boolean(row.progress_updated_at),
        progressUpdatedAt: row.progress_updated_at || null
      }]));
    },

    async allProgress(env) {
      const db = requireDatabase(env);
      const result = await db.prepare(`SELECT learner_progress.email, learner_progress.state_json,
          learner_progress.updated_at, testers.last_seen_at, testers.last_login_at
        FROM learner_progress
        INNER JOIN testers ON testers.email = learner_progress.email
        WHERE testers.active = 1`).all();
      return result.results || [];
    },

    async getProgress(env, email) {
      const db = requireDatabase(env);
      return db.prepare("SELECT state_json, revision, updated_at FROM learner_progress WHERE email = ?")
        .bind(email).first();
    },

    async saveProgress(env, email, stateJson) {
      const db = requireDatabase(env);
      const current = await db.prepare("SELECT revision FROM learner_progress WHERE email = ?").bind(email).first();
      const revision = Number(current?.revision || 0) + 1;
      const now = new Date().toISOString();
      await db.batch([
        db.prepare(`INSERT INTO learner_progress (email, state_json, revision, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET state_json = excluded.state_json, revision = excluded.revision, updated_at = excluded.updated_at`)
          .bind(email, stateJson, revision, now),
        db.prepare("UPDATE testers SET last_seen_at = ?, updated_at = ? WHERE email = ?").bind(now, now, email)
      ]);
      return {revision, updatedAt: now};
    }
  };
}

async function authenticateLearner(request, env, store) {
  const token = sessionTokenFromRequest(request);
  if (!token) return null;
  const row = await store.findSession(env, await hashToken(token), requestCountry(request));
  if (!row?.email) return null;
  // A version bump is a real terms change. A session issued under older terms must not carry that
  // acceptance forward, so the learner returns to the agreement step on the next request.
  if (row.agreement_version !== AGREEMENT_VERSION) {
    throw new RequestError(401, "AGREEMENT_REQUIRED", "The tester agreement was updated. Sign in again to review and accept it.");
  }
  return normalizeEmail(row.email);
}

async function manageSession(request, env, fetchImpl, store) {
  requireBindings(env, REQUIRED_ACCESS_BINDINGS);
  requireDatabase(env);
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const email = await authenticateLearner(request, env, store);
    if (!email) throw new RequestError(401, "LOGIN_REQUIRED", "Enter your approved email to continue.");
    const community = typeof store.communityStatus === "function"
      ? await store.communityStatus(env, email)
      : {joined: false, inviteOpenedAt: null, joinedAt: null, reminderAt: null};
    return json({email, community});
  }

  requireSameOrigin(request);
  if (method === "DELETE") {
    const token = sessionTokenFromRequest(request);
    if (token) await store.endSession(env, await hashToken(token));
    return json({status: "signed-out"}, 200, {"Set-Cookie": expiredSessionCookie()});
  }
  if (method !== "POST") return json({code: "METHOD_NOT_ALLOWED", message: "Use GET, POST, or DELETE."}, 405);

  const body = await readBoundedJson(request);
  const email = normalizeEmail(body?.email);
  if (!email) throw new RequestError(400, "INVALID_EMAIL", "Enter a valid email address.");

  const ownerEmail = normalizeEmail(env.OWNER_EMAIL);
  if (!ownerEmail) throw new RequestError(503, "SETUP_REQUIRED", "Tester access is not configured.");
  const group = await accessApi(env, fetchImpl);
  const approved = parseEmailOnlyGroup(group, ownerEmail);
  if (!approved.includes(email)) {
    console.log(JSON.stringify({event: "learner_login_denied"}));
    throw new RequestError(403, "NOT_APPROVED", "Ask Aneeket to add you in.");
  }

  const token = randomSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  const country = requestCountry(request);
  const acceptedVersion = await store.agreementVersion(env, email);
  const acceptanceRequested = body?.acceptAgreement === true;
  if (acceptedVersion !== AGREEMENT_VERSION) {
    if (!acceptanceRequested) {
      return json({
        code: "AGREEMENT_REQUIRED",
        message: "Review and accept the closed tester agreement to continue.",
        agreementRequired: true,
        agreementVersion: AGREEMENT_VERSION,
        communityInviteUrl: COMMUNITY_INVITE_URL
      }, 428);
    }
    if (body?.agreementVersion !== AGREEMENT_VERSION) {
      throw new RequestError(400, "AGREEMENT_VERSION_MISMATCH", "Reload and review the current tester agreement.");
    }
    if (body?.communityInviteOpened !== true || body?.communityJoinedAcknowledged !== true) {
      throw new RequestError(400, "COMMUNITY_ACK_REQUIRED", "Open the WhatsApp invite and confirm membership before entering.");
    }
  }
  await store.checkLogin(env, email, country);
  if (acceptedVersion !== AGREEMENT_VERSION) await store.acceptAgreement(env, email, AGREEMENT_VERSION);
  await store.issueSession(env, email, await hashToken(token), expiresAt, country);
  console.log(JSON.stringify({event: "learner_login", status: "approved"}));
  return json({status: "approved", email}, 200, {"Set-Cookie": sessionCookie(token)});
}

async function manageCommunity(request, env, store) {
  const email = await authenticateLearner(request, env, store);
  if (!email) throw new RequestError(401, "LOGIN_REQUIRED", "Enter your approved email to continue.");
  if (typeof store.communityStatus !== "function") {
    throw new RequestError(503, "BACKEND_UNAVAILABLE", "Community acknowledgement is temporarily unavailable.");
  }
  const method = request.method.toUpperCase();
  if (method === "GET") return json({community: await store.communityStatus(env, email)});
  if (method !== "PATCH") return json({code: "METHOD_NOT_ALLOWED", message: "Use GET or PATCH."}, 405);
  requireSameOrigin(request);
  const body = await readBoundedJson(request);
  if (body?.action === "opened") {
    await store.markCommunityOpened(env, email);
  } else if (body?.action === "acknowledge") {
    const recorded = await store.acknowledgeCommunity(env, email);
    if (!recorded) throw new RequestError(409, "INVITE_NOT_OPENED", "Open the WhatsApp invite before confirming membership.");
  } else {
    throw new RequestError(400, "UNSUPPORTED_ACTION", "Use opened or acknowledge.");
  }
  return json({community: await store.communityStatus(env, email)});
}

function validProgressState(state) {
  return state && typeof state === "object" && !Array.isArray(state) && state.version === 2 &&
    typeof state.selectedCourse === "string" && state.conceptAttempts && typeof state.conceptAttempts === "object" &&
    state.completed && typeof state.completed === "object";
}

async function manageProgress(request, env, store) {
  const email = await authenticateLearner(request, env, store);
  if (!email) throw new RequestError(401, "LOGIN_REQUIRED", "Enter your approved email to continue.");
  const method = request.method.toUpperCase();
  if (method === "GET") {
    const row = await store.getProgress(env, email);
    if (!row) return json({state: null, revision: 0, updatedAt: null});
    let state;
    try {
      state = JSON.parse(row.state_json);
    } catch (error) {
      throw new RequestError(500, "PROGRESS_UNREADABLE", "Saved progress could not be read.");
    }
    if (!validProgressState(state)) throw new RequestError(500, "PROGRESS_UNREADABLE", "Saved progress could not be read.");
    return json({state, revision: Number(row.revision || 0), updatedAt: row.updated_at || null});
  }
  if (method !== "PUT") return json({code: "METHOD_NOT_ALLOWED", message: "Use GET or PUT."}, 405);
  requireSameOrigin(request);
  const body = await readBoundedJson(request, 750000);
  if (!validProgressState(body?.state)) throw new RequestError(400, "INVALID_PROGRESS", "Progress data was not valid.");
  const stateJson = JSON.stringify(body.state);
  if (stateJson.length > 700000) throw new RequestError(413, "REQUEST_TOO_LARGE", "Progress data is too large.");
  const saved = await store.saveProgress(env, email, stateJson);
  return json({status: "saved", ...saved});
}

const LOW_SAMPLE_ATTEMPTS = 10;

export function summarizeCohort(rows, ownerEmail) {
  const concepts = new Map();
  const participation = [];

  for (const row of rows) {
    if (!row?.email || row.email === ownerEmail) continue;
    let state;
    try {
      state = JSON.parse(row.state_json);
    } catch (error) {
      continue;
    }
    if (!validProgressState(state)) continue;

    let attempts = 0;
    let firstAttempts = 0;
    let firstCorrect = 0;
    let lastActivity = 0;
    const touched = new Set();

    for (const [courseId, courseConcepts] of Object.entries(state.conceptAttempts || {})) {
      if (!courseConcepts || typeof courseConcepts !== "object") continue;
      for (const [conceptId, conceptAttempts] of Object.entries(courseConcepts)) {
        if (!Array.isArray(conceptAttempts)) continue;
        for (const attempt of conceptAttempts) {
          if (!attempt || typeof attempt !== "object") continue;
          attempts += 1;
          touched.add(`${courseId}::${conceptId}`);
          const at = Number(attempt.at) || 0;
          if (at > lastActivity) lastActivity = at;
          // Only unassisted first attempts are evidence of what a tester actually knows.
          if (attempt.scored === false || attempt.isReattempt) continue;
          firstAttempts += 1;
          if (attempt.correct) firstCorrect += 1;

          const key = `${courseId}::${conceptId}`;
          const stat = concepts.get(key) || {
            course: courseId, concept: conceptId, attempts: 0, correct: 0, assisted: 0, testers: new Set()
          };
          stat.attempts += 1;
          if (attempt.correct) stat.correct += 1;
          if (attempt.hintUsed || attempt.assistanceUsed) stat.assisted += 1;
          stat.testers.add(row.email);
          concepts.set(key, stat);
        }
      }
    }

    participation.push({
      email: row.email,
      attempts,
      firstAttempts,
      conceptsTouched: touched.size,
      accuracy: firstAttempts ? Math.round((firstCorrect / firstAttempts) * 100) : null,
      lastActivityAt: lastActivity ? new Date(lastActivity).toISOString() : (row.updated_at || null),
      lastSeenAt: row.last_seen_at || null
    });
  }

  const hardest = [...concepts.values()]
    .map((stat) => ({
      course: stat.course,
      concept: stat.concept,
      attempts: stat.attempts,
      accuracy: Math.round((stat.correct / stat.attempts) * 100),
      assistedRate: Math.round((stat.assisted / stat.attempts) * 100),
      testers: stat.testers.size,
      lowSample: stat.attempts < LOW_SAMPLE_ATTEMPTS
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, 12);

  participation.sort((a, b) => (b.attempts - a.attempts) || a.email.localeCompare(b.email));
  return {hardest, participation, lowSampleThreshold: LOW_SAMPLE_ATTEMPTS};
}

async function cohortInsights(request, env, verifyAdmin, store) {
  requireBindings(env, REQUIRED_ADMIN_BINDINGS);
  requireDatabase(env);
  await verifyAdmin(request, env);
  if (request.method.toUpperCase() !== "GET") {
    return json({code: "METHOD_NOT_ALLOWED", message: "Use GET."}, 405);
  }
  if (typeof store.allProgress !== "function") {
    throw new RequestError(503, "BACKEND_UNAVAILABLE", "Progress storage is temporarily unavailable.");
  }
  const rows = await store.allProgress(env);
  return json(summarizeCohort(rows, normalizeEmail(env.OWNER_EMAIL)));
}

async function manageTesters(request, env, fetchImpl, verifyAdmin, store) {
  requireBindings(env, REQUIRED_ADMIN_BINDINGS);
  requireDatabase(env);
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL);
  if (!ownerEmail) throw new RequestError(503, "SETUP_REQUIRED", "Tester access is not configured.");
  await verifyAdmin(request, env);

  const method = request.method.toUpperCase();
  if (!["GET", "POST", "PATCH", "DELETE"].includes(method)) {
    return json({code: "METHOD_NOT_ALLOWED", message: "Use GET, POST, PATCH, or DELETE."}, 405);
  }
  const group = await accessApi(env, fetchImpl);
  const emails = parseEmailOnlyGroup(group, ownerEmail);
  const responseBody = async (allEmails, extra = {}) => {
    const testers = allEmails.filter((email) => email !== ownerEmail);
    const security = typeof store.listTesterSecurity === "function"
      ? await store.listTesterSecurity(env, testers)
      : {};
    return {status: "connected", testers, security, ...extra};
  };
  if (method === "GET") return json(await responseBody(emails));

  requireSameOrigin(request);

  if (method === "PATCH") {
    const body = await readBoundedJson(request);
    if (body?.action === "bump-unjoined") {
      if (typeof store.remindCommunity !== "function" || typeof store.listTesterSecurity !== "function") {
        throw new RequestError(503, "BACKEND_UNAVAILABLE", "Community reminders are temporarily unavailable.");
      }
      const testers = emails.filter((email) => email !== ownerEmail);
      const security = await store.listTesterSecurity(env, testers);
      const targets = testers.filter((email) => !security[email]?.communityJoined);
      await store.remindCommunity(env, targets);
      console.log(JSON.stringify({event: "tester_community_reminder", reminded: targets.length}));
      return json(await responseBody(emails, {reminded: targets}));
    }
    const targetEmail = normalizeEmail(body?.email);
    if (!targetEmail) throw new RequestError(400, "INVALID_EMAIL", "Enter a valid tester email.");
    if (targetEmail === ownerEmail) throw new RequestError(400, "OWNER_PROTECTED", "Owner access cannot be changed here.");
    if (!emails.includes(targetEmail)) throw new RequestError(404, "NOT_APPROVED", "That email is not an approved tester.");
    if (body?.action === "unlock") {
      if (typeof store.unlockTester !== "function") throw new RequestError(503, "BACKEND_UNAVAILABLE", "Progress storage is temporarily unavailable.");
      await store.unlockTester(env, targetEmail);
      console.log(JSON.stringify({event: "tester_lock_change", action: "unlock"}));
      return json(await responseBody(emails, {unlocked: targetEmail}));
    }
    if (body?.action === "bump") {
      if (typeof store.remindCommunity !== "function") throw new RequestError(503, "BACKEND_UNAVAILABLE", "Community reminders are temporarily unavailable.");
      await store.remindCommunity(env, [targetEmail]);
      console.log(JSON.stringify({event: "tester_community_reminder", reminded: 1}));
      return json(await responseBody(emails, {reminded: [targetEmail]}));
    }
    throw new RequestError(400, "UNSUPPORTED_ACTION", "Use unlock, bump, or bump-unjoined.");
  }

  if (method === "DELETE") {
    const targetEmail = normalizeEmail(new URL(request.url).searchParams.get("email"));
    if (!targetEmail) throw new RequestError(400, "INVALID_EMAIL", "Enter a valid tester email.");
    if (targetEmail === ownerEmail) throw new RequestError(400, "OWNER_PROTECTED", "Owner access cannot be changed here.");
    const updated = emails.filter((email) => email !== targetEmail);
    await writeGroup(env, fetchImpl, group, updated);
    await store.revokeTester(env, targetEmail);
    console.log(JSON.stringify({event: "tester_access_change", action: "revoke", testerCount: updated.filter((email) => email !== ownerEmail).length}));
    return json(await responseBody(updated));
  }

  const body = await readBoundedJson(request, 4096);
  const requested = Array.isArray(body?.emails) ? body.emails : [body?.email];
  if (!requested.length || requested.length > 25) {
    throw new RequestError(400, "INVALID_EMAIL", "Add between one and 25 tester emails at a time.");
  }
  const accepted = [];
  const rejected = [];
  for (const candidate of requested) {
    const email = normalizeEmail(candidate);
    if (!email) {
      const raw = typeof candidate === "string" ? candidate.trim().slice(0, 80) : "";
      if (raw) rejected.push(raw);
      continue;
    }
    if (email === ownerEmail) {
      rejected.push(email);
      continue;
    }
    if (!accepted.includes(email)) accepted.push(email);
  }
  if (!accepted.length) throw new RequestError(400, "INVALID_EMAIL", "Enter a valid tester email.");

  const added = accepted.filter((email) => !emails.includes(email));
  const alreadyApproved = accepted.filter((email) => emails.includes(email));
  const updated = [...new Set([...emails, ...accepted])].sort();

  if (added.length) {
    await writeGroup(env, fetchImpl, group, updated);
    for (const email of added) await store.activateTester(env, email);
    console.log(JSON.stringify({
      event: "tester_access_change",
      action: "grant",
      granted: added.length,
      testerCount: updated.filter((email) => email !== ownerEmail).length
    }));
  }
  return json(await responseBody(updated, {added, alreadyApproved, rejected}));
}

async function serveAsset(request, env, assetPath, embeddedAssets) {
  if (!["GET", "HEAD"].includes(request.method.toUpperCase())) {
    return json({code: "METHOD_NOT_ALLOWED", message: "Use GET or HEAD."}, 405);
  }
  let response;
  if (embeddedAssets?.[assetPath]) {
    const asset = embeddedAssets[assetPath];
    response = new Response(request.method === "HEAD" ? null : asset.body, {headers: {"Content-Type": asset.contentType}});
  } else if (env?.ASSETS && typeof env.ASSETS.fetch === "function") {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = assetPath;
    assetUrl.search = "";
    response = await env.ASSETS.fetch(new Request(assetUrl, {method: request.method}));
  } else {
    throw new RequestError(503, "SETUP_REQUIRED", "Dungeon assets are not configured.");
  }
  const headers = securityHeaders(new Headers(response.headers));
  headers.delete("Set-Cookie");
  return new Response(response.body, {status: response.status, statusText: response.statusText, headers});
}

function learnerAssetPath(pathname, prefix) {
  const learnerFiles = new Map([
    [`${prefix}/`, "/mock/t6.html"],
    [`${prefix}/t6.html`, "/mock/t6.html"],
    [`${prefix}/t6.css`, "/mock/t6.css"],
    [`${prefix}/t6.js`, "/mock/t6.js"],
    [`${prefix}/release-manifest.json`, "/release-manifest.json"],
    [`${prefix}/robots.txt`, "/mock/robots.txt"]
  ]);
  if (learnerFiles.has(pathname)) return learnerFiles.get(pathname);
  if (pathname.startsWith(`${prefix}/sets/`)) return `/mock${pathname.slice(prefix.length)}`;
  if (pathname === `${prefix}/mock/t6.html` || pathname === `${prefix}/mock/t6.css` || pathname === `${prefix}/mock/t6.js`) {
    return pathname.slice(prefix.length);
  }
  if (pathname.startsWith(`${prefix}/mock/sets/`)) return pathname.slice(prefix.length);
  return null;
}

export function createWorker({
  fetchImpl = fetch,
  verifyAdmin = verifyOwner,
  embeddedAssets = null,
  store = createD1Store()
} = {}) {
  return {
    async fetch(request, env) {
      try {
        const url = new URL(request.url);
        const prefix = env?.DUNGEON_PREFIX || "/dungeon";

        if (url.pathname === prefix) return redirect(`${prefix}/${url.search}`);
        if (url.pathname === `${prefix}/login.css`) return await serveAsset(request, env, "/mock/login.css", embeddedAssets);
        if (url.pathname === `${prefix}/login.js`) return await serveAsset(request, env, "/mock/login.js", embeddedAssets);
        if (url.pathname === `${prefix}/api/session`) return await manageSession(request, env, fetchImpl, store);
        if (url.pathname === `${prefix}/api/community`) return await manageCommunity(request, env, store);
        if (url.pathname === `${prefix}/api/progress`) return await manageProgress(request, env, store);
        if (url.pathname === `${prefix}/health`) {
          requireDatabase(env);
          return json({status: "ok", storage: "cloudflare-d1", access: "dashboard-allowlist"});
        }

        if (url.pathname === `${prefix}/admin/api/testers`) {
          return await manageTesters(request, env, fetchImpl, verifyAdmin, store);
        }
        if (url.pathname === `${prefix}/admin/api/insights`) {
          return await cohortInsights(request, env, verifyAdmin, store);
        }
        if (url.pathname === `${prefix}/admin` || url.pathname.startsWith(`${prefix}/admin/`)) {
          await verifyAdmin(request, env);
        }
        if (url.pathname === `${prefix}/admin`) return redirect(`${prefix}/admin/${url.search}`);
        if (url.pathname === `${prefix}/admin/`) return await serveAsset(request, env, "/mock/admin.html", embeddedAssets);
        if (url.pathname === `${prefix}/admin/admin.css`) return await serveAsset(request, env, "/mock/admin.css", embeddedAssets);
        if (url.pathname === `${prefix}/admin/admin.js`) return await serveAsset(request, env, "/mock/admin.js", embeddedAssets);
        if (url.pathname === `${prefix}/admin/t6.html`) return redirect(`${prefix}/`);
        if (url.pathname === `${prefix}/admin/health`) {
          requireDatabase(env);
          return json({status: "ok", storage: "cloudflare-d1", access: "dashboard-allowlist"});
        }
        if (url.pathname === `${prefix}/admin/release-manifest.json`) {
          return await serveAsset(request, env, "/release-manifest.json", embeddedAssets);
        }
        if (url.pathname.startsWith(`${prefix}/admin/`) || url.pathname.startsWith(`${prefix}/mock/admin`)) {
          return json({code: "NOT_FOUND", message: "Not found."}, 404);
        }

        const assetPath = learnerAssetPath(url.pathname, prefix);
        if (assetPath) {
          const email = await authenticateLearner(request, env, store);
          if (!email) {
            if (assetPath === "/mock/t6.html") return await serveAsset(request, env, "/mock/login.html", embeddedAssets);
            return json({code: "LOGIN_REQUIRED", message: "Enter your approved email to continue."}, 401);
          }
          return await serveAsset(request, env, assetPath, embeddedAssets);
        }
        return json({code: "NOT_FOUND", message: "Not found."}, 404);
      } catch (error) {
        if (error instanceof RequestError) return json({code: error.code, message: error.message}, error.status);
        console.error(JSON.stringify({event: "worker_error", error: error instanceof Error ? error.message : "Unknown error"}));
        return json({code: "INTERNAL_ERROR", message: "The request could not be completed."}, 500);
      }
    }
  };
}

export default createWorker();
