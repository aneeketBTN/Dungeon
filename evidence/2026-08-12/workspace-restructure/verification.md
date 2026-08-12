# Workspace restructure — verification

Status: `VERIFIED(REAL_BROWSER + AUTOMATED)`
Date: 2026-08-12
Branch: `reorg/structure` (not merged, not pushed, not deployed)
Baseline commit: `abfd606`, git tag `pre-reorg-abfd606`

## Claim

The repository directory structure was reorganized without changing what the application does or
what the edge serves. This is a structural claim only. It does not advance content acceptance, the
exam-pattern boundary, or any learning claim.

## Backup taken before any change

`C:\Users\knigh\Dungeon-backup\2026-08-12-pre-reorg` — 576 files, 281.78 MB, including full `.git`
history. Excludes only `node_modules` and `__pycache__`, both regenerable from `package-lock.json`.
Verified byte-for-byte: SHA-256 over all 576 files, source vs backup, zero mismatches. Placed
outside OneDrive so sync could not create conflict copies during the work.

Manifests: `_baseline-manifest.csv`, `_gateE-baseline.csv`, `_golden-dist-client.csv`.

## Method

Seven phases, each committed separately as a revert point, each gated before the next began.

| Gate | Check | Baseline |
| --- | --- | --- |
| A | `npm test` | 34 pass, 0 fail |
| B | `node --check` across all source scripts | 32 files OK |
| C | `tools/validate_t6_bank.js` against the real pack | `errors: []`, `warnings: []` |
| D | `npm run build`, `dist/client` hashes vs golden snapshot | 14 assets |
| E | whole-tree SHA-256 content manifest vs baseline | 457 files, no content lost |
| F | real browser on the dev server | dashboard, login, admin |

Gate E is the losslessness proof: it compares content hashes as a multiset, so any baseline hash
that disappears must be explained by a named intentional edit. Every phase's absent-hash list was
reviewed against the edits made in that phase and matched exactly.

## Phases

| # | Change | Commit |
| --- | --- | --- |
| 1 | 15 root Markdown files and `briefs/` into `docs/` | `4bc037e` |
| 2 | legacy prototypes and rogue slice out of `mock/` into `legacy/` | `5245a0a` |
| 3 | build/dev scripts into `tools/` | `129b597` |
| 4 | `state/`, `history/`, `graphs/` into `data/` | `177145f` |
| 5 | `site/` to `sites-backup/` | `4175680` |
| 6 | `mock/` to `app/` across build, both workers, dev server, tests | `259b3a0` |
| 7 | reference sweep, index and changelog close-out | this commit |

## Result

- Gates A–E green at every phase.
- Final: 35 tests pass, 0 fail (34 baseline plus one new test), 32 syntax checks, bank validator
  reports zero errors and zero warnings.
- `dist/client` contains the same 14 assets with **identical SHA-256 content hashes**; only the URL
  prefix changed, `/mock/*` to `/app/*`.

## Real browser (gate F)

Local dev server, `tools/server.py` on port 8099, in-app Browser.

- `/` redirects to `/app/t6.html`.
- All 14 assets return 200: `t6.html`, `t6.css`, `t6.js`, the four `sets/*.js`, `login.*`, `admin.*`.
- Zero console errors on the dashboard.
- Dashboard renders the subject rail, trendline hero, and momentum copy.
- `Start this study set` opens a run and renders an adaptive primer with real bank content,
  confirming the `sets/` scripts load and parse under the new path.
- `login.html` and `admin.html` each load their sibling CSS and JS.
- `admin.js` resolves `../health`, `../admin/api/testers`, `../admin/api/insights`, and
  `../release-manifest.json` to the same URLs as before, because `app/` sits at the depth `mock/`
  did. These four 404 on the static dev server, as they did before this work: `server.py` only
  serves static files plus `/api/leaderboard` and `/api/score`. They are Worker routes.

## Bookmark preservation

`/dungeon/mock/t6.html`, `/dungeon/mock/t6.css`, `/dungeon/mock/t6.js`, and
`/dungeon/mock/sets/*.js` remain accepted public URLs and now resolve to `app/` assets. A new test,
`legacy /mock/ bookmarks still resolve to the renamed app assets`, asserts all four.

This matters because the test suite asserted the old path literals, so updating code and tests
together removed the suite as an independent check for phase 6. Gate D and this test cover it
instead.

## Defects found and fixed (not caused by the restructure)

1. **`core.autocrlf=true` rewrote LF working-tree files to CRLF on checkout.** Caught by gate E when
   a reverted `CHANGELOG.md` came back 609 bytes larger. The release build copies from the working
   tree, so this would change deployed asset bytes and every asset hash. Fixed with
   `core.autocrlf=false` locally and a `.gitattributes` pinning `eol=lf` for all contributors.
   Confirmed a no-op for content: `git add --renormalize` changed nothing, and all 14 asset hashes
   still match golden.
2. **Path-anchored ignore rules stopped matching when their directory moved.** `mock/CLAs/` no
   longer matched `legacy/CLAs/`, so `git add -A` briefly staged the private owner course material.
   Caught before push, removed with `git rm --cached`, and the commit amended so it never entered
   history — confirmed by `git log --all --name-only | grep CLAs` returning nothing. Rules rewritten
   as directory- and file-name patterns.

## Findings recorded, not acted on

- `sites-backup/worker.mjs` was documented as the production worker. It is not: `wrangler.jsonc`
  deploys `cloudflare/src/index.mjs`, and nothing references the `dist/server/index.js` this file
  builds to. It has not tracked the live Worker since `d92e06a`, four releases ago, and **has no
  agreement gate**, so promoting it back to an origin as-is would let approved testers reach the
  dashboard without accepting current terms. Recorded in `sites-backup/README.md`.
- `graph_source/` was never missing. It is a directory of the external pack at
  `C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack`, holding 283 chunks, matching the 283
  lectures documented in `docs/briefs/T6_REVISION_FALLBACK.md`. It has never been tracked, correctly.
  `AGENTS.md` listed it among repo-relative paths, which read as a missing repository directory.

## Not verified

- **No live-edge verification.** Nothing was pushed or deployed; a push to `main` deploys to the
  active cohort. The edge router changes in phase 6 are covered by unit tests and the golden asset
  comparison, not by a live request against `aneeketdas.com/dungeon`.
- Real-browser coverage was the dashboard, a study-set entry, login, and admin. Boss, case-cloze,
  constructed-response, match, and results surfaces were not re-exercised; they are served by the
  same `t6.js` under the same path, and no file content changed.
- `cloudflare/` did not move, so the Workers Builds dashboard configuration was neither changed nor
  re-verified.
