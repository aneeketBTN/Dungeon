# Term 6 Revision — Mac Transfer Handoff

Updated: 2026-08-11

Copy or download the entire project folder to the Mac. Do not copy only `mock/`: the complete
folder also contains the operating brief, evidence, legacy references, and learning-engine data
that must be preserved.

## Important state note

The learning engine's durable data is in:

- `data/state/`
- `data/history/`
- `data/graphs/`

The active Term 6 dashboard stores its separate browser profile under
`term6.revision.v2`. The legacy product slice uses `dungeon.product.v1`. Browser local
storage is not part of the copied folder, so both browser-only profiles start fresh on the Mac.
This does not erase or change the engine files above.

## First launch on macOS

1. Put the folder somewhere local, for example `~/Documents/Dungeon`.
2. Open Terminal.
3. Run:

```bash
cd ~/Documents/Dungeon
python3 tools/server.py 8099
```

4. Open [http://localhost:8099/](http://localhost:8099/). The root redirects to the active Term 6
   revision dashboard.
5. Stop the server with `Control-C`.

There is no npm install or web build step. Alternatively:

```bash
cd ~/Documents/Dungeon
bash tools/start-mac.sh
```

## Active implementation

- `mock/t6.html` — staged dashboard, evidence graph, mixed-format practice, and results structure
- `mock/t6.css` — low-density desktop, narrow, accessible, and reduced-motion presentation
- `mock/t6.js` — confidence-aware evidence states, rotation, boss grading, save/resume/reset
- `mock/sets/t6_brgsa.js` — original BRGSA authored bank
- `mock/sets/t6_catalog.js` — all-subject catalogue and dashboard concept mapping
- `mock/sets/t6_challenges.js` — mixed-format/boss augmentation and active rotation pools
- `tools/validate_t6_bank.js` — bank/source/breadth validation utility
- `tools/server.py` — local server and root redirect

The earlier cinematic product slice remains at `legacy/rogue/rogue.html`. It is a legacy reference, not
the active student route.

## Deterministic Browser scenarios

Append `?scenario=NAME` to `/mock/t6.html`:

- `dashboard-progress`
- `dashboard-concepts`
- `dashboard-plan`
- `question`
- `question-mcq`
- `question-cloze`
- `question-match`
- `question-boss`
- `feedback`
- `priority`
- `results`

These routes do not overwrite the normal browser profile.

## Transfer verification

After copying, verify:

```bash
cd ~/Documents/Dungeon
python3 - <<'PY'
from pathlib import Path
required = [
    "AGENTS.md",
    "docs/briefs/T6_REVISION_FALLBACK.md",
    "docs/briefs/T6_LEARNING_EVIDENCE_AND_ITEM_PEDIGREE.md",
    "mock/t6.html",
    "mock/t6.css",
    "mock/t6.js",
    "mock/sets/t6_brgsa.js",
    "mock/sets/t6_catalog.js",
    "mock/sets/t6_challenges.js",
    "tools/validate_t6_bank.js",
    "data/state/game_state.json",
    "data/history/question_history.json",
]
missing = [item for item in required if not Path(item).is_file()]
print("Transfer OK" if not missing else "Missing: " + ", ".join(missing))
PY
```

Then open each subject, start one short set, use a full practice mock directly, reload an
unfinished set, and inspect the dashboard at a narrow viewport. Windows Browser evidence is at
`evidence/2026-08-10/t6-dashboard-all-subjects/`; a Mac copy still needs that short smoke test
before claiming Mac-specific verification.
