# Cloudflare protected-domain verification

Date: 2026-08-11

Status: `VERIFIED(CLOUDFLARE_API + ANONYMOUS_EDGE)` for deployment, DNS, route, Access policy,
anonymous denial, direct-bank denial, rate limiting, secret presence, and least-privilege group
access. Production owner/tester UI interaction is `WAITING_REAL_BROWSER_DNS_CACHE`: public DNS and
pinned Cloudflare-edge HTTPS pass, but the declared Browser resolver remained inconsistent after a
pre-deployment negative lookup and returned `ERR_NAME_NOT_RESOLVED` on the final retry.

## Deployed boundary

- URL: `https://aneeketdas.com/dungeon/`
- Owner dashboard: `https://aneeketdas.com/dungeon/admin/`
- Worker: `dungeon-access-edge`
- Worker version: `72708eb2-dc76-4987-bad1-238b7ac8313c`
- Route: `aneeketdas.com/dungeon*`
- Static delivery: the current API deployment embeds 11 files from the ten-file allowlist plus the generated release
  manifest; no `state/`, `history/`, credentials, tester addresses, source packs, or working files.
- Latest deployment source: authenticated API; `has_assets: false` because this version uses the
  verified embedded-asset fallback rather than the equivalent Wrangler Assets binding.
- Sites remains an owner-only backup and is not a production-origin dependency.
- Sites version 5 was saved from commit `bec2c2af7e1b9b4f9fcd854ee2e19f239e7fd131` and deployed
  successfully at its private production URL. Its access policy contains one owner, no groups,
  and no external visitors.

## Access configuration

- Zero Trust team: `dawn-unit-8689.cloudflareaccess.com`; plan reported `Zero Trust Free`.
- Tester IdP: `Dungeon one-time email code`
  (`9c4f0251-b98f-4438-a4c4-be4df2ae3dcf`).
- Tester group: `Dungeon Testers` (`e74be54f-b714-44ea-95cb-11ed66777f18`). It contains one
  exact-email bootstrap rule for the owner and no tester address.
- Learner application: `Dungeon Testers`, domain `aneeketdas.com/dungeon*`, one-time-code IdP,
  allow policy bound to the dedicated group, audience
  `56d9461adc8ecc52a110cc47c664c4db3c36ea5439616a9e6372f55974209263`.
- Admin application: `Dungeon Owner Dashboard`, domain `aneeketdas.com/dungeon/admin*`, Cloudflare
  account IdP, exact owner-email allow policy, audience
  `4835199408cc2b98c8ece55b29877e4bc98411a2e052b011fe0b19512f307105`.
- Worker secret inventory returns `CF_API_TOKEN` as `secret_text`; the value never entered source,
  the release manifest, or evidence.
- The stored runtime credential successfully read the dedicated group through Cloudflare's API
  (`HTTP 200`, group name matched, one exact-email rule).
- The temporary broad Worker deployment token was deleted immediately after deployment and a
  fresh token-list read returned zero deployment-token rows.

## Anonymous edge checks

Public DNS-over-HTTPS returned `104.21.87.41` and `172.67.140.143` for `aneeketdas.com`. Direct
HTTPS requests pinned to the returned Cloudflare edge address produced:

| Request | Result | Access audience |
| --- | --- | --- |
| `/dungeon` | `302` to Cloudflare Access; private/no-store | learner audience |
| `/dungeon/sets/t6_challenges.js` | `302` to Cloudflare Access; bank bytes not returned | learner audience |
| `/dungeon/admin/` | `302` to Cloudflare Access; private/no-store | distinct admin audience |

This proves that anonymous callers cannot retrieve the learner entry point, direct question bank,
or owner dashboard. The distinct admin audience also shows the more-specific owner application is
winning over the broader tester application.

## Rapid-request containment

Zone ruleset `efaf5d34bb8e41649accaf0c4e7d90a9`, rule
`821ecf9153c544afb79c6ef88bb3561b`, is enabled in phase `http_ratelimit`. It matches the
`aneeketdas.com` host and `/dungeon` path, counts by Cloudflare colo and source IP, and blocks above
40 requests in 10 seconds for 10 seconds. The free plan exposes a 10-second period, so the initial
60-second attempt was rejected and no stale rule was created.

## Local verification

- `npm run build`: prepared the allowlisted release.
- `npm test`: 20/20 pass, including fail-closed bindings/auth, email-only group invariants,
  protected owner membership, same-origin mutations, static route allowlist, private cache/no-index
  headers, health, manifest, out-of-prefix denial, method rejection, and embedded-asset fallback.
- `node mock/validate_t6_bank.js`: 728 items, no validator errors.
- `npx wrangler deploy --dry-run`: 13 build-directory files read and Worker bundle succeeded before
  production deployment.
- `npm run build:standalone`: embedded the same 11 served files in a 383,738-byte fallback bundle;
  the unit suite proves this path retains private-cache headers and the Worker authentication gate.
- `npm --prefix cloudflare run build:standalone`: prepares the same 11 allowlisted client files in
  a self-contained bundle for authenticated API deployment.
- The first non-interactive Wrangler live deploy exited before mutation because its process lacked
  `CLOUDFLARE_API_TOKEN`; no temporary workers.dev deployment was used. The checked-in standalone
  bundle was uploaded through the authenticated provider API and the exact route was read back.

## Remaining acceptance

- `WAITING_OWNER_TESTER_EMAILS`: only the owner bootstrap email is present; no potential user was
  granted access without an owner-supplied address.
- `WAITING_REAL_BROWSER_DNS_CACHE`: the declared Browser resolver was inconsistent after its
  pre-propagation negative lookup and returned `ERR_NAME_NOT_RESOLVED` on the final retry. Do not
  claim production owner/tester interaction verified until the Browser reaches the URL, the owner
  signs in, the Control Room reports Connected, and a real add/revoke pass is performed with an
  owner-approved tester email.
- Identity and rate limiting prevent anonymous/casual harvesting, not copying by an approved
  technical tester. Server-side per-session item delivery remains the stronger future boundary.
