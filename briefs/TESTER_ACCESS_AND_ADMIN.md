# Tester Access, Anti-Harvesting, and Owner Operations

Status: `IMPLEMENTED` for the owner dashboard, release boundary, private-cache policy, no-index
controls, and owner-only Sites deployment. Exact `aneeketdas.com/dungeon` routing and per-tester
Cloudflare Access remain `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS` because activating the
nominally free plan requires accepting Cloudflare terms and authorising the saved card for usage
above the free limits.

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
6. Cloudflare rate limiting challenges or blocks high-volume automated requests without penalising
   normal page loads.

The origin remains owner-only. The path proxy must use an origin credential kept only in
Cloudflare secrets; it must never appear in source, the browser, deployment metadata, or a URL.

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
- the tester access/revocation workflow and honest anti-copy limit;
- a release checklist and links to Cloudflare operations;
- a structured feedback template for WhatsApp triage;
- a change-announcement composer that copies a draft but never sends without another explicit
  action.

The dashboard does not display a fake tester count, usage metric, feedback inbox, or deployment
status that no connected backend can support. Cloudflare remains the authority for identity,
access logs, traffic, and rate limits; WhatsApp remains the current cohort conversation and
feedback surface.

## Cloudflare configuration after owner approval

- Activate Zero Trust Free only after the owner accepts its terms and overage-card authorisation.
- Create the one-time PIN identity provider.
- Create `Dungeon Testers` as an email allowlist; begin empty and add only owner-supplied addresses.
- Create an Access application for `aneeketdas.com/dungeon*` using that group.
- Create an owner-only application for `aneeketdas.com/dungeon/admin*` with higher precedence.
- Route `/dungeon` and `/dungeon/*` through a Worker to the private Sites origin, preserving method,
  query, content type, CSP, no-index, and cache headers.
- Apply a rate-limit rule to the Dungeon path and verify that a normal first load, study set, and
  admin refresh do not trigger it.
- Verify anonymous denial, approved-tester entry, owner admin entry, individual revocation, and
  non-Dungeon routes on `aneeketdas.com`.

## Gates

- `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`: terms plus overage-card authorisation.
- `WAITING_OWNER_TESTER_EMAILS`: no tester access is granted until the owner supplies addresses.
- GitHub and WhatsApp creation remain separately staged pending action-time confirmation.
- Server-side item delivery remains `UNSTARTED`; do not claim perfect anti-scraping.

