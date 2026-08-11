# Dungeon Cloudflare access edge

This Worker is the prepared, fail-closed controller for `aneeketdas.com/dungeon`. It proxies the
private Sites origin and exposes an owner-only tester allowlist endpoint used by the Dungeon
Control Room.

It is intentionally not deployed while Zero Trust activation is
`WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`.

## Required runtime bindings

Non-secret values in `wrangler.jsonc`:

- `DUNGEON_PREFIX`
- `SITES_ORIGIN`

Configure the following with Cloudflare secrets or protected deployment values; never commit them:

- `ACCESS_ACCOUNT_ID`
- `ACCESS_GROUP_ID`
- `ACCESS_TEAM_DOMAIN`
- `ACCESS_ADMIN_AUD`
- `OWNER_EMAIL`
- `CF_API_TOKEN`
- `SITES_BYPASS_TOKEN`

The API token must be scoped to the owner account and only the Access organisation/group write
permission required to read and update the dedicated `Dungeon Testers` group. The group must
contain only exact-email include rules and must retain the owner email as its non-removable
bootstrap member.

The owner-only `/dungeon/admin*` Access application must be evaluated before the broader tester
application. The Worker validates the admin application JWT and the owner email again before any
list, grant, or revoke operation.
