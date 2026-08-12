const ACTIVE_ROUTE = "/mock/t6.html";
const ADMIN_ROUTE = "/mock/admin.html";

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
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive"
};

function withHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  headers.set(
    "Cache-Control",
    pathname.endsWith(".css") || pathname.endsWith("robots.txt")
      ? "public, max-age=300, must-revalidate"
      : "private, max-age=0, must-revalidate"
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

    if (url.pathname === "/admin") {
      return new Response(null, {
        status: 302,
        headers: {
          ...SECURITY_HEADERS,
          "Cache-Control": "no-store",
          Location: ADMIN_ROUTE
        }
      });
    }

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          service: "dungeon-t6",
          status: "ok",
          storage: "cloudflare-d1-with-browser-fallback"
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

    if (url.pathname === "/admin/api/testers") {
      return new Response(
        JSON.stringify({
          status: "setup-required",
          code: "SETUP_REQUIRED",
          message: "Activate Cloudflare Access to manage testers from the dashboard."
        }),
        {
          status: 503,
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
