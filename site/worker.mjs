const ACTIVE_ROUTE = "/mock/t6.html";

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "upgrade-insecure-requests"
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

function withHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  headers.set(
    "Cache-Control",
    pathname.endsWith(".html") ? "no-store" : "public, max-age=300, must-revalidate"
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(null, {
        status: 302,
        headers: {
          ...SECURITY_HEADERS,
          "Cache-Control": "no-store",
          Location: ACTIVE_ROUTE
        }
      });
    }

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          service: "dungeon-t6",
          status: "ok",
          storage: "browser-local"
        }),
        {
          status: 200,
          headers: {
            ...SECURITY_HEADERS,
            "Cache-Control": "no-store",
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
    }

    if (!env?.ASSETS?.fetch) {
      return new Response("Static asset service unavailable", {
        status: 503,
        headers: { ...SECURITY_HEADERS, "Cache-Control": "no-store" }
      });
    }

    const response = await env.ASSETS.fetch(request);
    return withHeaders(response, url.pathname);
  }
};

export default worker;

