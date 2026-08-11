# Tester dashboard access-management verification

Date: 2026-08-11
Status: `IMPLEMENTED` and synthetically verified for the owner dashboard controls, fail-closed
Sites response, prepared Cloudflare Access-group controller, JWT/owner boundary, mutation
invariants, and private-origin proxy. Live email grants and revocation remain
`WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`.

## Implemented owner flow

- Enter one tester email and choose **Add tester**.
- Refresh and inspect the current approved tester list.
- Choose **Revoke** beside one person and confirm the destructive action.
- See a truthful **Setup needed** state while the Cloudflare controller is not connected.
- Website access remains separate from WhatsApp membership.

The page never receives a Cloudflare credential. It calls the same-origin
`/dungeon/admin/api/testers` edge endpoint, which is designed to sit behind the narrower
owner-only Access application.

## Security invariants

- Missing runtime bindings return `503 SETUP_REQUIRED`.
- Missing or invalid owner authentication returns `403 OWNER_AUTH_REQUIRED`.
- State-changing requests require the dashboard's exact origin.
- JSON bodies are content-type checked and bounded to 2 KiB.
- The dedicated group accepts only exact-email include rules and at most 200 entries.
- The owner email must be present and cannot be listed as a tester or revoked.
- Grant preserves existing testers; revoke removes only the selected email.
- Cloudflare API and Sites bypass credentials exist only as runtime bindings and are stripped from
  proxied requests and responses.
- Structured mutation logs contain action and resulting count, never an email address.

## Automated evidence

Observed on 2026-08-11:

```text
node --check mock/admin.js
node --check site/worker.mjs
node --check cloudflare/src/index.mjs
npm test
npm --prefix cloudflare run types
npm --prefix cloudflare run check
npm run build
```

Results: JavaScript syntax passed; 16 tests passed with zero failures; current Cloudflare Worker
types generated; Wrangler 4.120.1 produced a successful dry-run bundle; the Sites build retained
the ten-file public allowlist. The tests cover setup failure, owner authentication, list filtering,
grant, revoke, protected owner access, unsafe group rejection, path stripping, credential-header
removal, redirect rewriting, and the Sites fail-closed response.

## Open acceptance

- Cloudflare Zero Trust plan terms and saved-card overage authorisation are not accepted.
- No live Access organisation, identity provider, application, group, route, secret, or tester
  grant was created in this change.
- Real-domain add/list/revoke and real-Browser visual interaction remain open until that gate is
  cleared. Source inspection and synthetic checks are secondary evidence, not visual acceptance.
