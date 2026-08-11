# Dungeon Cloudflare access edge

This Worker is the deployed, fail-closed controller for `aneeketdas.com/dungeon`. It serves the
allowlisted release directly from Cloudflare static assets and exposes an owner-only tester
allowlist endpoint used by the Dungeon Control Room. The private Sites deployment remains an
owner-only backup and is not an origin dependency for the public domain.

## Required runtime bindings

Non-secret values in `wrangler.jsonc`:

- `DUNGEON_PREFIX`
- `ACCESS_ACCOUNT_ID`
- `ACCESS_GROUP_ID`
- `ACCESS_TEAM_DOMAIN`
- `ACCESS_ADMIN_AUD`
- `ACCESS_LEARNER_AUD`
- `OWNER_EMAIL`

Configure the following with Cloudflare secrets or protected deployment values; never commit them:

- `CF_API_TOKEN`

The API token must be scoped to the owner account and only the Access organisation/group write
permission required to read and update the dedicated `Dungeon Testers` group. The group must
contain only exact-email include rules and must retain the owner email as its non-removable
bootstrap member.

The owner-only `/dungeon/admin*` Access application must be evaluated before the broader tester
application. The Worker validates the admin application JWT and the owner email again before any
list, grant, or revoke operation.

The normal release path is `npm run build` from the project root, followed by
`npm --prefix cloudflare run check`. `npm --prefix cloudflare run build:standalone` creates a
self-contained Worker bundle from the same allowlisted client directory for an authenticated API
deployment when an Assets-binding upload is unavailable. The current production version uses
this authenticated API fallback; `wrangler.jsonc` retains the equivalent `env.ASSETS` route. Both
paths run the Worker JWT checks. Never use a temporary workers.dev deployment for production or
put a deployment credential in source.

Production also has a zone rate-limit rule for the `/dungeon` path: more than 40 requests from one
IP/colo pair in 10 seconds is blocked for 10 seconds. This contains rapid automated collection
without representing the client-side bank as DRM.
