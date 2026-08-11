# Security policy

## Supported release

Security reports should concern the currently hosted Term 6 tester release. Legacy prototypes and
local-only research assets are not deployed.

## Reporting

Report suspected security or privacy problems privately to the Dungeon owner rather than posting
exploit details in the tester community. Include the affected URL, what happened, and the minimum
steps needed to reproduce it. Do not access another person's device, browser profile, or data.

## Release boundary

The public build is generated from an explicit allowlist. Real learner state, question history,
owner-supplied source extracts, working media, evidence captures, and local environment files are
excluded from deployment and source publication.

The controlled cohort uses individual email access rather than a shared password. Search indexing
is blocked, question-bearing responses use private cache controls, and the Cloudflare path will be
rate-limited after Access activation. The owner dashboard must have a narrower owner-only policy
than the learner route.

Tester-list changes use an owner-only edge endpoint. It validates the Access JWT and owner email,
requires same-origin writes, protects the owner bootstrap rule, and rejects a group containing
anything other than exact-email include rules. Cloudflare and private-origin credentials are edge
secrets and must never be copied into the dashboard, source, logs, or release manifest.

These controls do not create DRM. An approved tester can copy visible content, and the current
browser-local scheduler downloads the embedded bank scripts after access. Do not describe the
release as resistant to harvesting by authorised technical users until server-side item delivery
has replaced that client-bundle boundary.
