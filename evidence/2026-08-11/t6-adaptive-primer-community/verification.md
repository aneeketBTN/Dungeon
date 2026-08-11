# Adaptive primer, evidence-first dashboard, and community bump verification

**Date:** 2026-08-11

**Status:** `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED + REMOTE_D1)`

## Accepted scope

- A one-click learning run introduces one new concept at a time with a short, explicitly assisted
  primer immediately before the scored challenge that uses it.
- Primer support fades after an easy primer or two successful difficulty-3-or-harder challenges,
  and it restores applied/misconception layers after misses.
- Primer work is support state only. It cannot award mastery, raise a result percentage, enter
  held-feedback practice, or affect cohort learning-signal analytics.
- The dashboard starts with the next action, then a five-axis Term 6 mastery matrix and the
  selected-subject evidence trend. Subject and concept detail follows lower on the page.
- The WhatsApp invite is disclosed only after approved-email admission. Opening it enables a
  separate membership self-attestation; this is not described as verified membership.
- The owner can bump one missing tester or all missing testers. The action records an in-app
  reminder and copies a manual message; it does not send a message or remove access automatically.

## Learning-bank and automated acceptance

- `node mock/validate_t6_bank.js "C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack"`
  passed with 792 source-traceable surfaces: 728 scored challenges and 64 support-only primers.
  The active scored scheduler remains 565 items after the existing option-shape exclusions.
- JavaScript syntax checks passed for the learner, login, admin, bank, and Worker files.
- `npm.cmd test` passed **31/31** release, access, community-state, and paused-agent tests.
- `npm.cmd run build` passed with the expected 13 public release assets.
- `npm.cmd --prefix cloudflare run check` passed with Wrangler 4.120.1; the dry run reported
  78.09 KiB total and 18.51 KiB gzip with the intended bindings.
- `node cloudflare/scripts/build-standalone.mjs` passed with 14 embedded assets.
- Remote D1 migration `0004_community_acknowledgement.sql` applied successfully; a subsequent
  remote migration list reported `No migrations to apply!`.
- Release tests assert that the private WhatsApp invite token is absent from anonymous
  `login.html` and `login.js` assets. Worker tests reject acknowledgement before invite-open state
  and confirm that bulk bump targets only testers without an acknowledgement.

## Real Browser acceptance

- Desktop primer path: a minimum primer appears before its scored application challenge; answering
  the primer shows `Primer ready to use` and advances into the connected challenge.
- Narrow recovery path: the level-3 fixture visibly includes the fact, application,
  misconception, and prior-knowledge connection layers.
- Desktop and 390-pixel dashboards place the matrix and selected-subject trend immediately after
  the start-run hero, with accessible text values alongside the canvas.
- The 390-pixel agreement gate starts with the group acknowledgement disabled. Opening the actual
  supplied invite enables the acknowledgement while the page states that Dungeon records the open
  but cannot independently verify WhatsApp membership.
- The 390-pixel Control Room exposes bulk and per-tester bump actions, joined/missing/bumped chips,
  and stacks row actions without splitting email addresses character by character.
- The checked Browser console had no warnings or errors.

Screenshots:

- [Desktop dashboard hierarchy](dashboard-desktop-first.png)
- [390-pixel mastery matrix](dashboard-390-matrix.png)
- [390-pixel stronger primer](primer-recovery-390.png)
- [390-pixel WhatsApp open gate](agreement-whatsapp-gate-390.png)
- [390-pixel owner bump controls](admin-bump-390.png)

## Agreement artifact acceptance

`outputs/Dungeon_Closed_Tester_Agreement.docx` was exported through desktop Word to
`outputs/Dungeon_Closed_Tester_Agreement.pdf`. Both PDF pages were rendered and inspected at
original detail. The final two-page document has no clipping, overlap, orphan third page, or
signature field, and its participation/removal wording matches the in-app acknowledgement.

## Persistence safety

The project-owned live state and history files were not used as fixtures and retained these hashes:

| File | SHA-256 |
| --- | --- |
| `history/flagged_questions.json` | `447C5A84A4AA200B7741682D8C298082463AAFF8E6921AC6DA512521D1D39081` |
| `history/question_history.json` | `11FE498FA0CDE478D841701C392EBB8FA2FA7E5CE6030770C844317D3BBB7995` |
| `state/game_state.json` | `3708B45896F3A6BED3E292BED5D574658D22965A0E7EB7A858872D29396BAF02` |
| `state/session_cache.json` | `49358BC959FD91685BD107A871089CE534CF8DEC1E8AA3E69482778951C24E4B` |
| `state/stats.json` | `FB18F52F9FDE8DE1273767199F732C9081F4B87109A69C34458C685CF8F9BE37` |
| `state/stats/BEHECON_stats.json` | `B7563D42265DCF2FBDB1970F146F2EDBEC2EDFE1BE7680D90567E70BBAFF42EC` |
| `state/stats/MACRO_stats.json` | `1903564C08E60FB0BDA452E5D72CBDE000453F2D688F4C0641E70044DE34A62C` |
| `state/stats/meta_stats.json` | `70841DC058CADA01F287C820B19F928017458A7AA45AEB63429C3F543F2192EA` |
| `state/stats/NABM_stats.json` | `CFF438BB7F0042A34B1D84E4030F7AD5F2A479D48E05B219DD56A92011672DEB` |

## Claim boundaries

- A click plus acknowledgement is a deliberate tester attestation, not WhatsApp membership proof.
- Bumps are reminders and clipboard preparation, not autonomous WhatsApp sends or automatic access
  removal. Removal remains an owner-reviewed action and must never be based on answer accuracy.
- The 64 primers are structurally/source validated but share the standing
  `WAITING_OWNER_CONTENT_ACCEPTANCE` boundary with the scored bank.
- Primer thresholds and the five-axis matrix are first-cohort product hypotheses that need genuine
  learner evidence before they are called calibrated.

## Production publish

- Commit `475837fd857125dd7a4891e68e99f58cecd06f99` was pushed to `main` and the configured Workers
  Build deployed Cloudflare version `98f1bb5b-e5f5-4f08-9340-e102dc79be50` at
  `2026-08-11T16:28:21.979Z`.
- `https://aneeketdas.com/dungeon/health` returned `200` with Cloudflare D1 storage and dashboard-
  allowlist health. The anonymous production `login.js` returned `200`, contained the new approved-
  response invite validator, did not contain the private invite token, and retained
  `Cache-Control: private, no-store, max-age=0`.
- In a real Browser on `https://aneeketdas.com/dungeon/admin/`, release health was Healthy, Access
  was Connected, release scope was Allowlisted with 13 assets, and the bulk/per-person bump
  controls and group state chips were present. The changed agreement version truthfully displayed
  the existing testers as `Not agreed yet`; they will re-accept on their next learner login.
- The live Control Room listed eight approved external testers at this check. No tester grant,
  revoke, bump, agreement acknowledgement, or progress record was changed during verification.
- The configured owner-only Sites backup could not be refreshed because project
  `appgprj_6a7ae01a2c6481918c77e6842be2003a` was not visible to the current Sites connector account.
  The private version 5 remains the backup; the exact-domain Worker is healthy and has no Sites
  origin dependency.
