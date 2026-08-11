import { createRemoteJWKSet, jwtVerify } from "jose";

const ACCESS_API = "https://api.cloudflare.com/client/v4";
const REQUIRED_ADMIN_BINDINGS = [
  "ACCESS_ACCOUNT_ID",
  "ACCESS_GROUP_ID",
  "ACCESS_TEAM_DOMAIN",
  "ACCESS_ADMIN_AUD",
  "OWNER_EMAIL",
  "CF_API_TOKEN"
];

class RequestError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}

function securityHeaders(headers = new Headers()) {
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Referrer-Policy", "same-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return headers;
}

function redirect(location, status = 302) {
  return new Response(null, {status, headers: securityHeaders(new Headers({Location: location}))});
}

function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function requireBindings(env, names) {
  const missing = names.filter((name) => typeof env?.[name] !== "string" || !env[name].trim());
  if (missing.length) {
    throw new RequestError(503, "SETUP_REQUIRED", "Cloudflare Access management is not configured.");
  }
}

function accessGroupUrl(env) {
  return `${ACCESS_API}/accounts/${encodeURIComponent(env.ACCESS_ACCOUNT_ID)}/access/groups/${encodeURIComponent(env.ACCESS_GROUP_ID)}`;
}

function accessTeamUrl(env) {
  let teamUrl;
  try {
    teamUrl = new URL(env.ACCESS_TEAM_DOMAIN);
  } catch (error) {
    throw new RequestError(503, "SETUP_REQUIRED", "Cloudflare Access is not configured.");
  }
  if (teamUrl.protocol !== "https:" || !teamUrl.hostname.endsWith(".cloudflareaccess.com")) {
    throw new RequestError(503, "SETUP_REQUIRED", "Cloudflare Access is not configured.");
  }
  return teamUrl;
}

async function verifyAccess(request, env, audience) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) throw new RequestError(403, "ACCESS_AUTH_REQUIRED", "Cloudflare Access authentication is required.");
  if (typeof audience !== "string" || !audience.trim()) {
    throw new RequestError(503, "SETUP_REQUIRED", "Cloudflare Access is not configured.");
  }

  const teamUrl = accessTeamUrl(env);

  try {
    const jwks = createRemoteJWKSet(new URL("/cdn-cgi/access/certs", teamUrl));
    const {payload} = await jwtVerify(token, jwks, {
      issuer: teamUrl.origin,
      audience
    });
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

async function readBoundedJson(request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestError(415, "JSON_REQUIRED", "Send a JSON request.");
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > 2048) throw new RequestError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  const body = await request.text();
  if (body.length > 2048) throw new RequestError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new RequestError(400, "INVALID_JSON", "The request could not be read.");
  }
}

function requireSameOrigin(request) {
  const expectedOrigin = new URL(request.url).origin;
  if (request.headers.get("origin") !== expectedOrigin) {
    throw new RequestError(403, "SAME_ORIGIN_REQUIRED", "The request must come from the Dungeon dashboard.");
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
    throw new RequestError(502, "ACCESS_PROVIDER_ERROR", "Cloudflare Access could not update the tester list.");
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
  const body = {
    name: group.name,
    include: emails.map((email) => ({email: {email}}))
  };
  if (Array.isArray(group.exclude)) body.exclude = group.exclude;
  if (Array.isArray(group.require)) body.require = group.require;
  if (typeof group.is_default === "boolean") body.is_default = group.is_default;
  return body;
}

async function writeGroup(env, fetchImpl, group, emails) {
  return accessApi(env, fetchImpl, {
    method: "PUT",
    body: JSON.stringify(groupUpdateBody(group, emails))
  });
}

async function manageTesters(request, env, fetchImpl, verifyAdmin) {
  requireBindings(env, REQUIRED_ADMIN_BINDINGS);
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL);
  if (!ownerEmail) throw new RequestError(503, "SETUP_REQUIRED", "Cloudflare Access management is not configured.");
  await verifyAdmin(request, env);

  const method = request.method.toUpperCase();
  if (!["GET", "POST", "DELETE"].includes(method)) {
    return json({code: "METHOD_NOT_ALLOWED", message: "Use GET, POST, or DELETE."}, 405);
  }

  const group = await accessApi(env, fetchImpl);
  const emails = parseEmailOnlyGroup(group, ownerEmail);

  if (method === "GET") {
    return json({status: "connected", testers: emails.filter((email) => email !== ownerEmail)});
  }

  requireSameOrigin(request);
  let targetEmail;
  if (method === "POST") {
    const body = await readBoundedJson(request);
    targetEmail = normalizeEmail(body?.email);
  } else {
    targetEmail = normalizeEmail(new URL(request.url).searchParams.get("email"));
  }
  if (!targetEmail) throw new RequestError(400, "INVALID_EMAIL", "Enter a valid tester email.");
  if (targetEmail === ownerEmail) throw new RequestError(400, "OWNER_PROTECTED", "Owner access cannot be changed here.");

  const updated = method === "POST"
    ? [...new Set([...emails, targetEmail])].sort()
    : emails.filter((email) => email !== targetEmail);

  await writeGroup(env, fetchImpl, group, updated);
  const testers = updated.filter((email) => email !== ownerEmail);
  console.log(JSON.stringify({event: "tester_access_change", action: method === "POST" ? "grant" : "revoke", testerCount: testers.length}));
  return json({status: "connected", testers});
}

async function serveAsset(request, env, assetPath, embeddedAssets) {
  if (!["GET", "HEAD"].includes(request.method.toUpperCase())) {
    return json({code: "METHOD_NOT_ALLOWED", message: "Use GET or HEAD."}, 405);
  }

  let response;
  if (env?.ASSETS && typeof env.ASSETS.fetch === "function") {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = assetPath;
    assetUrl.search = "";
    response = await env.ASSETS.fetch(new Request(assetUrl, {method: request.method}));
  } else if (embeddedAssets?.[assetPath]) {
    const asset = embeddedAssets[assetPath];
    response = new Response(request.method === "HEAD" ? null : asset.body, {
      headers: {"Content-Type": asset.contentType}
    });
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
  verifyRequest = verifyAccess,
  embeddedAssets = null
} = {}) {
  return {
    async fetch(request, env) {
      try {
        const url = new URL(request.url);
        const prefix = env?.DUNGEON_PREFIX || "/dungeon";
        if (url.pathname === `${prefix}/admin/api/testers`) {
          return await manageTesters(request, env, fetchImpl, verifyAdmin);
        }
        if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
          const audience = url.pathname.startsWith(`${prefix}/admin`)
            ? env?.ACCESS_ADMIN_AUD
            : env?.ACCESS_LEARNER_AUD;
          await verifyRequest(request, env, audience);
        }
        if (url.pathname === prefix) return redirect(`${prefix}/${url.search}`);
        if (url.pathname === `${prefix}/admin`) return redirect(`${prefix}/admin/${url.search}`);
        if (url.pathname === `${prefix}/admin/`) return await serveAsset(request, env, "/mock/admin.html", embeddedAssets);
        if (url.pathname === `${prefix}/admin/admin.css`) return await serveAsset(request, env, "/mock/admin.css", embeddedAssets);
        if (url.pathname === `${prefix}/admin/admin.js`) return await serveAsset(request, env, "/mock/admin.js", embeddedAssets);
        if (url.pathname === `${prefix}/admin/t6.html`) return redirect(`${prefix}/`);
        if (url.pathname === `${prefix}/admin/health`) {
          return json({status: "ok", storage: "browser-local", access: "cloudflare-zero-trust"});
        }
        if (url.pathname === `${prefix}/admin/release-manifest.json`) {
          return await serveAsset(request, env, "/release-manifest.json", embeddedAssets);
        }
        if (url.pathname === `${prefix}/health`) {
          return json({status: "ok", storage: "browser-local", access: "cloudflare-zero-trust"});
        }
        if (url.pathname.startsWith(`${prefix}/admin/`) || url.pathname.startsWith(`${prefix}/mock/admin`)) {
          return json({code: "NOT_FOUND", message: "Not found."}, 404);
        }
        const assetPath = learnerAssetPath(url.pathname, prefix);
        if (assetPath) return await serveAsset(request, env, assetPath, embeddedAssets);
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
