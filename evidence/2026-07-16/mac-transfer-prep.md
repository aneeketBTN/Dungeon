# Mac Transfer Preparation Evidence

- **Goal:** make the full Dungeon folder portable to macOS without losing project-owned engine
  state or obscuring prototype state boundaries.
- **Status:** `VERIFIED(secondary portability checks)`.
- **Primary acceptance still pending:** real Browser visual/usability pass on the Mac.

## Changed artifacts

- `MAC_TRANSFER.md`
- `mock/start-mac.sh`
- `.claude/launch.json`
- `_TRANSFER/SETUP.md`
- `AGENTS.md`
- `DESIGN_SOURCE_INDEX.md`
- `BUG-LAWS.md`
- `QUALITY-LOG.md`
- `CHANGELOG.md`

The already implemented vertical-slice files were preserved:

- `mock/rogue.html`
- `mock/rogue.css`
- `mock/rogue.js`
- `mock/server.py`

## Checks and observed results

| Check | Observed |
|---|---|
| Windows absolute user paths in active project/runtime files | none |
| Case-insensitive path collisions | none |
| Symlink/reparse dependencies | none |
| Misleading repository metadata | empty `.git` directory removed |
| Shell launcher line endings | LF only |
| JavaScript parse | `mock/rogue.js` passed `node --check` |
| Python parse | all 3 Python files parsed |
| JSON parse | all 18 JSON files parsed |
| Root/local page route | HTTP 200 |
| Fresh, returning, and all-correct scenario URLs | HTTP 200 |
| CSS and JavaScript routes | HTTP 200 |
| Door MP4 and poster PNG | HTTP 200 |
| Local leaderboard API | HTTP 200 |

## State safety

- `state/`, `history/`, and `graphs/` remain unchanged and are included in the transfer.
- The web profile is browser-local under `dungeon.product.v1`; it is not represented as a folder
  file and will start fresh in the Mac browser.
- Deterministic `?scenario=...` profiles do not write to the normal web profile.

## Remaining gates

- `WAITING_REAL_BROWSER`: run and capture the fresh-player golden path, failure, completion,
  results, reduced motion, keyboard, and narrow viewport on the Mac.
- `WAITING_COMPUTER_USE`: enable only if desktop-level interaction is needed; built-in Browser is
  the preferred acceptance tool for this web prototype.
