# Proactive written adaptation verification

Date: 2026-08-13  
Status: `VERIFIED(REAL_BROWSER + AUTOMATED)` on `codex/measurement-foundation`; branch only.  
Open gates: `WAITING_LOCAL_MODEL_CALIBRATION + WAITING_HOSTED_CORPUS +
WAITING_OWNER_CALIBRATION + WAITING_OWNER_DEPLOY`.

## What changed

- `profile.writtenPractice` stores accepted criterion outcomes, authored question ids, timestamps,
  recent outcomes, and a bounded confirmation counter. It stores no additional copy of the learner's
  answer and never enters `conceptAttempts`.
- A missing criterion opens two fresh confirmations. An accepted success reduces the counter by one;
  showing the repair does not change it.
- Dungeon's main recommendation becomes the weakest open writing move and reports the remaining
  confirmations. The alternative route is withdrawn while it is the recommendation.
- An accepted miss inserts a synthetic `written-repair` support item immediately, targets the next
  authored written prompt, and retains the existing later different-family concept re-attempt.
- The practice header no longer renders the subject select. The session already owns the subject.

## Real Browser

Browser: app Browser at `http://127.0.0.1:8099/app/t6.html`.

1. `?scenario=written-recommendation`
   - Main heading: `Strengthen judgement and evidence`.
   - Copy: Dungeon found the move open and requires `2 more successful confirmations`.
   - Primary action: `Strengthen this writing move`.
   - The duplicate written route is absent from **Ways in**.
2. `?scenario=written-repair`
   - Accepted 0/2 result states that Dungeon inserted a teaching repair and a later concept question.
   - Header subject select computed `display: none`.
   - Continue opens `Dungeon intervention` / `Strengthen: Course understanding + Judgement and
     evidence` with authored course anchor, the three-step structure, and explicit unscored status.
   - `Use this in the next answer` opens a different authored case labelled
     `Dungeon re-check: Course understanding + Judgement and evidence` and states that it is a fresh
     transfer confirmation.
3. At 1280×720 on the transfer prompt: horizontal overflow `0`; visible interactive targets below
   44 px: `0`; the fixed-subject control remained hidden.

The executable page check is `tools/browser-checks/written-adaptation.js`.

## Automated

```text
node --check app/t6.js
pass

npm test
62 tests, 62 pass, 0 fail

node tools/validate_t6_bank.js "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"
ok: true; 748 scheduled questions fully taught; 0 errors

node tools/check_lesson_file.mjs "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"
ok: true; 0 errors

node tools/check-palette.mjs
all required pairings within tolerance; four states shape-distinct

node tools/build-site.mjs
prepared 16 public assets and the production worker
```

The bank gate retains its pre-existing IBM answer-length warning; this change adds no question or
option text and does not alter that warning.

## Boundaries

- A Qwen practice judgement remains `scored:false`, unofficial, and Strong-ineligible.
- An abstention or fallback self-review does not update the written-practice profile.
- This is an observed criterion history, not a permanent learner-ability label.
- Hosted model/corpus calibration, updated consent, owner merge, and deployment remain waiting.
