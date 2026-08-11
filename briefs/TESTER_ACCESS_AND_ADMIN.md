# Tester Access, Anti-Harvesting, and Owner Operations

Status: `VERIFIED(CLOUDFLARE_API + ANONYMOUS_EDGE)` for exact `aneeketdas.com/dungeon` routing,
one-time-code tester Access, owner-only admin Access, direct static-asset delivery, private caching,
no-index controls, rapid-request rate limiting, and the dedicated email group/management secret.
The owner Control Room is `VERIFIED(BROWSER)` Healthy, Connected, and Allowlisted on the exact
domain. One owner/browser address is approved for learner access in addition to the non-counted
bootstrap address. The learner route reaches its one-time-code challenge; post-code learner
acceptance is `WAITING_OWNER_LEARNER_SIGNIN`. External tester grants remain
`WAITING_OWNER_TESTER_EMAILS`.

Decision date: 2026-08-11

## Threat model and honest promise

The controlled cohort should prevent anonymous students and search engines from browsing or bulk
downloading Dungeon. It should let the owner add and revoke testers individually, preserve an
audit trail at the edge, slow automated harvesting, and avoid collecting learner progress on the
server.

It cannot make visible learning content impossible to copy. An approved tester can still save,
photograph, transcribe, or share material. The practical promise is controlled access and
containable abuse, not DRM.

## Chosen mechanism

Use identity-based access rather than a shared password:

1. Cloudflare Access protects `aneeketdas.com/dungeon*`.
2. Approved testers receive a one-time sign-in code at an allowlisted email address.
3. A `Dungeon Testers` access group controls the learner route; removing one email revokes one
   person without changing credentials for everyone.
4. `aneeketdas.com/dungeon/admin*` has a narrower owner-only policy and wins over the broader
   tester route.
5. The edge records access identity and request metadata; the learning app still stores progress
   only in the learner's browser.
6. Cloudflare rate limiting blocks more than 40 `/dungeon` requests per IP/colo pair in 10 seconds
   for 10 seconds without penalising a normal page load.

The Worker serves the allowlisted build directly from its self-contained Cloudflare deployment
(embedded in the current API version, or through the equivalent Wrangler Assets binding) and
validates the signed learner/admin Access token against the matching application audience. The Sites release
remains owner-only as a backup, but no origin bypass credential is needed or stored.

## Content-delivery boundary

The production build exposes only ten allowlisted assets: the learner HTML/CSS/application, the
three embedded T6 banks, the owner dashboard HTML/CSS/application, and `robots.txt`. It excludes
live `state/`, `history/`, owner source packs, CLA analysis, work files, transfer material,
credentials, and community invite links.

The three current bank scripts still contain the authored questions required by the browser-local
scheduler. Identity access, private cache headers, no-index rules, and rate limiting protect them
from anonymous or casual bulk collection. They do not stop an approved technical tester from
downloading the bank. Server-side, per-session item delivery is a separate architecture change and
must be completed before claiming strong resistance to harvesting by authorised users.

## Owner dashboard

`mock/admin.html` provides:

- production health and allowlisted-release checks;
- an email form, current tester list, refresh, and confirmation-backed one-person revocation;
- a truthful connected/setup-needed state based on the live Cloudflare edge controller;
- the tester access/revocation workflow and honest anti-copy limit;
- a release checklist and links to Cloudflare operations;
- a structured feedback template for WhatsApp triage;
- a change-announcement composer that copies a draft but never sends without another explicit
  action.

The dashboard does not display a fake tester count, usage metric, feedback inbox, or deployment
status that no connected backend can support. Cloudflare remains the authority for identity,
access logs, traffic, and rate limits; WhatsApp remains the current cohort conversation and
feedback surface.

`cloudflare/src/index.mjs` is the deployed management and static-delivery boundary. The owner-only API
validates the Cloudflare Access JWT audience and exact owner email, requires same-origin mutations,
accepts only a small JSON email payload, and refuses mixed-selector or owner-missing groups. The
Cloudflare group token is a runtime secret and is absent from the dashboard, source configuration,
release manifest, and logs. The dedicated group retains the
owner email as a non-removable bootstrap rule so revoking the last tester cannot produce an empty
or ownerless group.

## Deployed Cloudflare configuration

- Zero Trust Free is active.
- `Dungeon one-time email code` is the tester identity provider.
- `Dungeon Testers` is an exact-email allowlist; add only owner-supplied addresses.
- The learner application auto-selects the one-time-code provider. After inbox verification, an
  unapproved email receives: “This email is not approved. Ask Aneeket to add it, then try again.”
  Do not reveal allowlist membership before inbox ownership is proven.
- Seed the dedicated group with the owner email as the protected bootstrap member; the dashboard
  hides that member from the tester count and cannot revoke it.
- Create an Access application for `aneeketdas.com/dungeon*` using that group.
- Create an owner-only application for `aneeketdas.com/dungeon/admin*` with higher precedence.
- Route `/dungeon` and `/dungeon/*` through Worker-owned allowlisted asset delivery with explicit
  learner/admin aliases, private cache controls, and no direct public admin-asset path.
- The zone rate-limit rule blocks above 40 requests per IP/colo pair per 10 seconds for 10 seconds.
- Verify anonymous denial, approved-tester entry, owner admin entry, individual revocation, and
  non-Dungeon routes on `aneeketdas.com`.
- The least-privilege Access group read/write token is stored as `CF_API_TOKEN`; Access IDs,
  audiences, team domain, and owner email are protected deployment bindings. Verify the dashboard's
  add, list, duplicate-add, revoke, and last-tester flows against the real group after the owner
  completes the open Access sign-in.

## Gates

- `WAITING_OWNER_TESTER_EMAILS`: the owner/browser learner address is approved; no external tester
  access is granted until the owner supplies addresses.
- `WAITING_OWNER_LEARNER_SIGNIN`: the learner route reaches the emailed-code challenge; the owner
  must complete it before post-login learner UI interaction can be accepted on the exact domain.
- GitHub and WhatsApp creation remain separately staged pending action-time confirmation.
- Server-side item delivery remains `UNSTARTED`; do not claim perfect anti-scraping.
