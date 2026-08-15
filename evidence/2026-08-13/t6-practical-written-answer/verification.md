# Practical written-answer correction — verification

Date: 2026-08-13

Status: `VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)` on
`codex/measurement-foundation`; branch only. This does not close
`WAITING_LOCAL_MODEL_CALIBRATION`, the separate hosted calibration/corpus gates, owner content
acceptance, PR review, merge, or deployment.

## Defect reproduced

The owner submitted this response to `brgsa_m1_demand_short_answer`:

> Id recommend the founder to follow through with Page A, as page A is substiantially better at
> validation through actual userbase. Since the targeted traffic actually interacted with the
> page, that is mental effort that went into your page, thus is a stronger signal of validation.

The generated case and defensible decision came from `BRGSA-M01-L03` (landing-page traffic and
signal quality), but the written item declared only `BRGSA-M01-L01` and required a generic
pre-declared-test reason. The old two-generation path took 46.9 seconds and abstained after the
same checkpoint disagreed with itself. This was an item-authority mismatch, not evidence that the
candidate judgement was unsound.

## Change

- Every generated practical short answer now asks a direct question: what should be done, and why
  does the case evidence support the judgement.
- Its authority boundary includes the principle lecture and the applied lecture that supplied the
  case. On this item, retrieval is confined to `BRGSA-M01-L01` and `BRGSA-M01-L03`.
- The transparent rubric is two criteria: **Course understanding** and **Judgement and evidence**.
  Naming the exact term is not required when the idea is applied accurately.
- One compact Qwen criterion judgement is followed by deterministic complete-schema,
  English-script, declared-citation, and literal-answer-evidence validation. Uncertainty or any
  invalid field abstains. A duplicate call to the same model is no longer treated as independent
  authority.
- After 900 ms of idle writing, the local UI sends only `{courseId, questionId}` to prepare course
  evidence. No partial answer is transmitted. The answer is sent only when **Check** is pressed.
- The closed bag is translucent and fixed in a reserved header slot during practice. Saved drag
  coordinates cannot place it over the case or question; it remains draggable elsewhere.

## Real model

Runtime: Windows local server → private SSH loopback → LM Studio on the M4 Pro Mac.

Exact generation model:
`qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled`.

Question-only preparation returned `ready:true` in **497 ms**. The exact owner response then
returned in **24.937 s**, `abstain:false`, **2/2**:

- `Course understanding`: `met`, cited `BRGSA-M01-L03#196`;
- `Judgement and evidence`: `met`, cited `BRGSA-M01-L03#196`.

The returned retrieval list contained only the two declared lectures. Model-authored feedback had
no CJK, full-width, replacement, or mojibake characters.

## Real Browser

The same exact response was entered through `http://127.0.0.1:8099/app/t6.html`. The learner UI
showed **Local Qwen rubric mark: 2 of 2**, both criteria Met, compact `BRGSA M1` evidence tags, the
grounded exemplar, the practice-only boundary, and no script artifacts.

Visual acceptance at the default 1280-wide Browser confirmed the direct practical prompt, quieter
bag launcher, visible subject control, and no overlap between the bag and the subject selector or
question copy. At an explicit 375×812 viewport:

```json
{
  "clientWidth": 360,
  "scrollWidth": 360,
  "bag": {"x": 297, "y": 11, "width": 52, "height": 52},
  "practiceHeaderHeight": 119.640625,
  "questionCardTop": 123.640625,
  "bagOverQuestionCard": false
}
```

The phone layout had no horizontal overflow; the bag occupied the reserved practice-header space
and did not intersect the question card.

## Automated gates

- `npm test` — **62/62 pass**, including answer-independent retrieval, one-pass marking,
  exact-answer-evidence validation, invented-citation abstention, CJK retry/abstention, prompt
  injection placement, question-only preparation, hosted server-owned questions, and one hosted
  Qwen generation per authored mark.
- `node tools/validate_t6_bank.js "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"`
  — `ok:true`; 748 scheduled questions are fully taught, with the existing IBM option-rank warning.
- `node tools/check_lesson_file.mjs <real transcript root>` — `ok:true`.
- `node tools/check-palette.mjs` — all required pairings and four state silhouettes pass in both
  themes; the pre-existing advisory notes remain.
- `node tools/build-site.mjs` — 16 public assets and the production Worker prepared.

No commit, push, merge, Cloudflare mutation, corpus upload, or deployment was performed.
