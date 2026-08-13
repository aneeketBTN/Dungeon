# Authored written practice and hosted written authority — verification

Date: 2026-08-13

Branch: `codex/measurement-foundation`

Status: `VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED + WORKER_DRY_RUN)` for the branch-local
authored-practice flow, shared authority boundary, compact evidence labels, and corrupted-output
guard. Public activation remains
`WAITING_HOSTED_CORPUS + WAITING_OWNER_CALIBRATION + WAITING_OWNER_CONSENT + WAITING_OWNER_DEPLOY`.

No Cloudflare resource was created or changed. No transcript was uploaded, no D1 migration was
applied, no feature flag was enabled, and nothing was committed, pushed, merged, or deployed.

## Accepted product boundary

- The dashboard entry is **Practise written answers**.
- A run contains four Dungeon-authored short-answer prompts, not an arbitrary question box.
- Teach-before-test remains active: an unread source lesson and primer precede the first response.
- Qwen checks only the server-owned question, rubric, and declared lecture boundary.
- Accepted checks are criterion-level Dungeon practice judgements, not IIMB grades, and remain
  ineligible for Strong evidence.
- Timed examiner papers never invoke the authority.
- The subject-wide analyzer remains local/internal evaluation tooling. It is absent from the learner
  HTML and the production Worker returns 404 for `/api/written-authority/coach`.

## Compact course evidence

The learner sees a small subject/module tag such as `BRGSA M1`. Exact lecture and chunk IDs stay in
the validated authority result and are still used for citation verification. The compact tag was
checked on lesson, primer, and written-question surfaces.

Saved Browser evidence:

- `written-lesson-tag-375.png` — teach-before-test lesson at 375×812 with `BRGSA M1` beside the
  module/lesson line.
- `written-question-tag-375.png` — the compact evidence tag on the mobile prompt path.
- `written-practice-1280.png` — authored written-practice run at the default 1280×720 Browser size.
- `written-route-1280.png` — desktop dashboard state used to enter the run.

At 375×812 and 1280×720, the inspected screens had no horizontal overflow. The authored route was
enabled independently of model availability because the transparent rubric/exemplar fallback is a
complete non-AI path.

## Qwen corrupted-script repair

The observed failure was stray CJK/mojibake embedded between otherwise English words. LAW-60 now
applies identically to local LM Studio and Workers AI:

1. every generation prompt requires English model-authored prose and plain ASCII punctuation;
2. feedback, reasons, summaries, strengths, gaps, and suggested answers are checked for unexpected
   CJK scripts (literal candidate quotes are excluded from this check);
3. a corrupt response is regenerated once with a dedicated encoding-repair instruction;
4. a second corrupt response is withheld and the authority abstains.

The actual Mac checkpoint
`qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` was rerun through the repaired subject-hybrid
path with the BRGSA demand-validation answer that had exposed the defect. It returned a grounded
result with one strength, three gaps, a substantive suggested answer, and
`hasUnexpectedCjk: false` in 48.7 seconds.

The real authored BRGSA question was also exercised in the Browser. Its two checks disagreed, so
Dungeon correctly issued no machine mark and returned the learner to the visible rubric/exemplar;
no model-authored corrupt prose was displayed.

## Automated and build evidence

- `npm test` — 61/61 pass. New cases prove first-pass CJK corruption retries and repeated corruption
  abstains without returning corrupt learner copy. The public arbitrary-coach route is asserted 404.
- `node --check app/t6.js`, `tools/local-grader.mjs`, and `cloudflare/src/index.mjs` — pass.
- `npm run build` — pass; 16 public assets and the production Worker prepared.
- `npm run check:palette` — all required pairings pass in light and dark; four evidence states remain
  shape-distinct.
- `node tools/validate_t6_bank.js <real transcript root>` — `ok: true`, 106 authored lessons, every
  scheduled question taught, no errors. Existing IBM option-rank warning remains.
- `cd cloudflare; npm run check` — pass. Worker dry-run shows D1, Vectorize, AI, and Assets bindings;
  committed activation remains `off`, model approval `not-approved`, corpus `not-indexed`.
- `npm run check:exam` — expected existing failure only: SCLM Section B remains 4 of 6 numerical
  questions, with the existing SCLM repetition warnings. This work did not alter that bank gap.

## Remaining gates

Before public activation: create/index the private Vectorize corpus, calibrate the exact hosted
Workers AI checkpoint against the 48 owner-marked authored responses, update tester consent and the
agreement version, apply the content-free usage migration, repeat live signed-in Browser acceptance,
and ship through an owner-reviewed pull request. Local checkpoint results do not validate the hosted
checkpoint.
