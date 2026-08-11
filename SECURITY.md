# Security policy

## Supported release

Security reports should concern the hosted Term 6 closed-test release. Legacy prototypes and
local research assets are not deployed.

## Reporting

Report suspected security or privacy problems privately to the Dungeon owner rather than posting
exploit details in the tester community. Include the affected URL, what happened, and the minimum
steps needed to reproduce it. Do not access another person's device, session, or learner data.

## Release boundary

The public build is generated from an explicit allowlist. Real local learner state, owner source
packs, working media, evidence captures, and environment files are excluded. Search indexing is
blocked, question-bearing responses use private cache controls, and rapid-request rate limiting is
enabled at the Cloudflare edge.

Learner entry uses a deliberately light approved-email check. The email is the shared secret; no
message or ownership challenge is sent. Successful login creates a random server-side session
whose token is stored only as a secure, HttpOnly, SameSite cookie in the browser and as a hash in
Cloudflare D1. Only one unexpired session is permitted per approved email.

The first Cloudflare country code is stored with the tester account. A later authenticated request
from another country deletes its sessions and locks the account for owner review. City- and
region-level automatic bans are intentionally not used because geolocation at that precision is
too unstable for irreversible enforcement. A country lock is not proof of sharing: travel, VPNs,
mobile carriers, and routing can produce legitimate changes.

The owner dashboard remains behind Cloudflare Access. Tester-list writes validate the owner
Access identity, require same-origin requests, and protect the owner bootstrap entry. Revoking a
tester removes the allowlist entry and cascades deletion of that tester's sessions and progress.

## Honest anti-sharing boundary

These controls reduce casual credential sharing and simultaneous use. They do not provide DRM,
verify that a person owns the email they enter, detect same-country sequential sharing, prevent a
tester photographing a screen, or make visible content impossible to reproduce. Contractual
confidentiality, a small trusted cohort, owner review, and rapid revocation remain necessary.
