# Sites backup worker — not the deployed worker

`worker.mjs` here is **not** what serves `aneeketdas.com/dungeon`. The deployed Worker is
`cloudflare/src/index.mjs`, named in `cloudflare/wrangler.jsonc` as `main`.

This file is the entrypoint for the private OpenAI Sites deployment, which `AGENTS.md` records as
an owner-only backup and no longer an origin dependency. `tools/build-site.mjs` compiles it to
`dist/server/index.js`; `wrangler.jsonc` never references that path.

## Before promoting this back to an origin

It has not tracked the live Worker since commit `d92e06a`, while `cloudflare/src/index.mjs` has
moved through four releases. Known divergences:

- `/admin/api/testers` returns a `SETUP_REQUIRED` stub instead of the real tester controller.
- It has no agreement gate, so an approved tester would reach the dashboard without accepting the
  current terms.
- It has no D1 progress, learner sessions, or community acknowledgement handling.
- It has no `/dungeon` prefix handling; its routes are host-root relative.

Serving learners from this file in its current state would bypass the agreement gate. Reconcile it
against `cloudflare/src/index.mjs` first, and record the acceptance evidence, before treating it as
a live fallback.

Edit `cloudflare/src/index.mjs` for anything that must reach production.
