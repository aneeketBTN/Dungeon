# Learn streamlining verification — 2026-08-21

## Outcome

- The Learn home has one ordinary entry path: subject → start/resume the open run.
- Each subject exposes nine fixed non-builder runs in order.
- Only the first uncleared run is offered as new work.
- Future runs are not rendered; completed runs alone render under Replay.
- Up to two Needs-practice concepts can be appended to the next fixed run on a fresh question family.
- Stats, charts, concept rows and specialist practice are closed disclosures by default.
- The completion screen reports learned, struggled and next-run guidance beside before/now/goal evidence bars.

## Automated checks

- `node --check app/t6.js` — PASS.
- `node --test tests/site-release.test.mjs` — 9/9 PASS.
- `npm test` — 140/140 PASS.
- `npm run review` — all checks PASS; bank validator 0 errors; lesson, naming, craft, palette, build and exam readiness PASS.
- `npm run check:palette` — all required pairings and state shapes PASS.
- `npm run build` — 20 public assets prepared.
- `git diff --check` — PASS.

## Release note

Branch `fix/theme-switch-and-login-theming`; not merged and not deployed. No Browser inspection was requested or performed, so this evidence is structural, behavioural-regression and build verification rather than a screenshot claim.
