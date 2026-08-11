# Tester Access, Anti-Harvesting, and Owner Operations

Status: `VERIFIED(CLOUDFLARE_API + ANONYMOUS_EDGE)` for exact `aneeketdas.com/dungeon` routing,
owner-only admin Access, direct static-asset delivery, private caching, no-index controls,
rapid-request rate limiting, and the dedicated email group/management secret. The owner Control Room
is `VERIFIED(BROWSER)` Healthy, Connected, and Allowlisted on the exact domain. Approved-email
admission, the private denial, the first-login agreement gate, per-email progress storage, and the
narrow agreement layout are `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED)` at
`evidence/2026-08-11/learner-backend-and-agreement/verification.md`. The `mock/login.css` repair is
live and a fresh approved address has completed agreement -> dashboard -> sign-out -> revocation
on the production domain. The first external cohort is active with nine approved addresses.

Decision date: 2026-08-11 (superseding the same day's emailed-code learner design)

## Threat model and honest promise

The controlled cohort should prevent anonymous students and search engines from browsing or bulk
downloading Dungeon. It should let the owner add and revoke testers individually, preserve an
audit trail at the edge, slow automated harvesting, keep each tester's revision progress with their
own account, and detect obvious account sharing.

It cannot make visible learning content impossible to copy. An approved tester can still save,
photograph, transcribe, or share material. The practical promise is controlled access and
containable abuse, not DRM.

It is also not identity proof. Anyone who knows an approved email can enter as that tester. That is
the owner's explicit exam-season trade: a binary admission check, since testers hand over their
addresses directly. Never describe it to testers or in documents as verified identity.

## Chosen mechanism

The dashboard allowlist is the only admission check; there is no shared password and no emailed
code on the learner path:

1. The owner adds a tester email in the Control Room, which writes the dedicated `Dungeon Testers`
   exact-email group. Removing one email revokes one person.
2. The learner opens `/dungeon/`, types that email, and enters. Nothing is emailed. The Worker
   checks the live group and issues a random 32-byte opaque session token, stored as a SHA-256 hash
   and set as an `HttpOnly; Secure; SameSite=Lax` cookie scoped to `/dungeon` for one day.
3. An unapproved email receives one fixed private denial, `Ask Aneeket to add you in.`, which never
   distinguishes a missing address from a wrong one and never returns the allowlist.
4. A first approved login is held at a one-time agreement step. Only after the email passes the
   allowlist check does the `428` response disclose the WhatsApp invite. The join acknowledgement
   stays disabled until that invite is opened. Acceptance stores the agreement version/time plus
   the invite-opened and membership-acknowledged timestamps; a returning tester on the same
   version enters directly.
5. `aneeketdas.com/dungeon/admin*` keeps the narrower owner-only Cloudflare Access policy. Owner
   authority is unchanged and stronger than learner admission by design.
6. Learner progress is stored per email in Cloudflare D1. The browser copy remains an offline
   fallback, and a dirty-flag check stops a staler server copy from overwriting an unsynced local
   run.
7. Cloudflare rate limiting blocks more than 40 `/dungeon` requests per IP/colo pair in 10 seconds
   for 10 seconds without penalising a normal page load.

## Anti-sharing controls

- **One active browser per email.** A second concurrent login is refused with an explicit message
  rather than silently displacing the first. Sign-out releases the lock and flushes pending saves.
- **Country lock.** If an approved account appears from a different country than its first login,
  the account is locked and its sessions are deleted, at both login and mid-session checks.
- **City and region are deliberately unused.** Mobile networks, VPNs, travel, and ISP routing make
  them too noisy to justify an automatic permanent ban. A lock is an owner review prompt with a
  human unlock path, not proof of misconduct, and the agreement says so.
- The Control Room shows active-session, first-country, and lock state per tester so the owner can
  judge a lock before acting.
- Revocation deletes that tester's sessions and server-side progress in the same action.

## Closed tester agreement

`DUNGEON_CLOSED_TESTER_AGREEMENT.md` is the source text;
`outputs/Dungeon_Closed_Tester_Agreement.docx` and `.pdf` are the deliverables built by
`work/build_tester_agreement.py`. Owner direction: this is a gentlemen's agreement, so acceptance is
two acknowledgement ticks at first login, not a signature. The document carries no name, email, or
signature blanks. One acknowledgement accepts the closed-test terms; the other confirms membership
in the private WhatsApp tester group. The in-app step shows a short summary plus the full terms in a
disclosure. The system records the agreement version/time and the invite-opened and membership-
acknowledged times. The page says plainly that it cannot independently verify WhatsApp membership;
the second tick is self-attestation after the actual invite was opened. The current agreement also
states that testers who neither join nor participate after reminders may be removed, while low
academic accuracy is never a reason for removal.

The Worker serves the allowlisted build directly from its self-contained Cloudflare deployment
(embedded in the current API version, or through the equivalent Wrangler Assets binding) and
validates the signed learner/admin Access token against the matching application audience. The Sites release
remains owner-only as a backup, but no origin bypass credential is needed or stored.

## Content-delivery boundary

The production build exposes only thirteen allowlisted assets: the login HTML/CSS/application, the
learner HTML/CSS/application, the three embedded T6 banks, the owner dashboard
HTML/CSS/application, and `robots.txt`. It excludes live `state/`, `history/`, owner source packs,
CLA analysis, work files, transfer material, credentials, and the private community invite. The
invite is returned dynamically only after an approved email reaches the agreement gate; the same
link appears inside the session-protected learner dashboard for existing testers.

Only the login page and its assets are anonymous. Every learner asset, including the bank scripts,
requires a valid session cookie and returns `401 LOGIN_REQUIRED` without one.

The three current bank scripts still contain the authored questions required by the client-side
scheduler. Session access, private cache headers, no-index rules, and rate limiting protect them
from anonymous or casual bulk collection. They do not stop an approved technical tester from
downloading the bank. Server-side, per-session item delivery is a separate architecture change and
must be completed before claiming strong resistance to harvesting by authorised users.

## Owner dashboard

`mock/admin.html` provides:

- production health and allowlisted-release checks;
- cohort paste-onboarding, current tester list, refresh, clear-lock recovery, and
  confirmation-backed one-person revocation;
- per-tester session, agreement, progress, country, and last-active signals;
- per-tester WhatsApp-acknowledgement and bump state, one-person Bump, and a bulk **Bump missing
  group joins** action;
- Participation and Where testers struggle panels computed from real saved state, with small
  learning samples labelled as low evidence;
- a truthful connected/setup-needed state based on the live Cloudflare edge controller;
- the tester access/revocation workflow and honest anti-copy limit;
- a release checklist and links to Cloudflare operations;
- a structured feedback template for WhatsApp triage;
- a change-announcement composer that copies a draft but never sends without another explicit
  action.

A bump writes an in-app reminder timestamp and copies a firm WhatsApp reminder for the owner. It
does not message anyone automatically and does not revoke access. The owner reviews participation
and sends the copied message manually before any separate revoke action.

The dashboard does not display a fake tester count, feedback inbox, or deployment status that no
connected backend can support. Cloudflare remains the authority for admission,
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
- `Dungeon Testers` is an exact-email allowlist; add only owner-supplied addresses. The Worker reads
  it live on every login and refuses a mixed-selector or owner-missing group.
- The learner route has no Cloudflare Access application. Admission is the Worker's own
  approved-email check, and an unapproved email receives `Ask Aneeket to add you in.` with no
  allowlist disclosure.
- Seed the dedicated group with the owner email as the protected bootstrap member; the dashboard
  hides that member from the tester count and cannot revoke it.
- Keep the owner-only application for `aneeketdas.com/dungeon/admin*`; it remains the stronger
  boundary and is unchanged by learner admission.
- `dungeon-learner-state` is the D1 database bound as `DB`. Apply `cloudflare/migrations/` in order;
  migration `0004_community_acknowledgement.sql` adds the three community timestamps and
  `db/schema.ts` mirrors the current shape.
- Route `/dungeon` and `/dungeon/*` through Worker-owned allowlisted asset delivery with explicit
  learner/admin aliases, private cache controls, and no direct public admin-asset path.
- The zone rate-limit rule blocks above 40 requests per IP/colo pair per 10 seconds for 10 seconds.
- Verify anonymous denial, unapproved-email denial, approved-tester entry, the first-login
  agreement, owner admin entry, individual revocation, and non-Dungeon routes on `aneeketdas.com`.
- The least-privilege Access group read/write token is stored as `CF_API_TOKEN`; Access IDs,
  audiences, team domain, and owner email are protected deployment bindings. Verify the dashboard's
  add, list, duplicate-add, revoke, and last-tester flows against the real group after the owner
  completes the open Access sign-in.

## Gates

- The first cohort is active with nine approved tester addresses; small participation samples are
  operational signals, not evidence for punitive or learning-quality conclusions.
- The live `[hidden]` repair and a complete fresh-account agreement flow are verified. A changed
  agreement version must repeat the same live acceptance check before release.
- Server-side item delivery remains `UNSTARTED`; do not claim perfect anti-scraping.
