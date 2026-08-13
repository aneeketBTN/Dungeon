# Frozen course evidence, hosted distress interception, and written-answer retention

Status: `VERIFIED(AUTOMATED)` on `codex/measurement-foundation`. Branch only — nothing pushed,
merged, or deployed. Hosted written checking remains fail-closed.

Gates still open: `WAITING_OWNER_CALIBRATION` (hosted model never measured),
`WAITING_OWNER_CONTENT_ACCEPTANCE` (BRGSA bank defects), `WAITING_OWNER_DEPLOY`.

## What was verified

### 1. Course evidence no longer needs a hosted index

`retrieveEvidence` never reads the candidate answer — its query is the stem, caselet and rubric, all
fixed at authoring time. A question's evidence is therefore a constant, and the per-request vector
search was recomputing it. It is now frozen at build time into
`cloudflare/src/generated/written-evidence.mjs` and read directly.

Measured over the committed pack:

| Property | Value |
| --- | --- |
| Questions covered | 64 / 64 in the bank |
| Chunks | 380 |
| Course text | 511 KiB |
| Chunk length, min–max | 231 – 1,500 characters |
| Chunks per question, min–max | 4 – 6 |
| Lecture-boundary violations | 0 |
| Pack digest | `frozen-185aa5b47352529a` |

The chunk-length floor of 231 characters is the visible trace of the `flatMap` arity fix: before it,
the first lecture chunked to a target of 0 characters and the second to 1, so the marker was shown
84-character fragments.

Consequences:

- The Vectorize index `dungeon-t6-course-rag-v1` was never created, and the binding for it was a
  standing `wrangler deploy` failure. The binding is gone; the dry-run is clean.
- Uploading 3,470 transcript chunks to a hosted index is no longer an owner action at all. Course
  transcripts stay out of any hosted store.
- The embedding model and its call are removed from the hosted request path.
- `DUNGEON_HOSTED_WRITTEN_CORPUS` must now equal the pack's own content digest, so approval cannot
  drift from the course text the marker will quote. Re-freezing the evidence switches hosted marking
  off until the new pack is approved by name. Covered by a test that asserts no answer reaches the
  model when the flag names a different pack.

Bundle after the change, from `wrangler deploy --dry-run`:

```text
Total Upload: 853.12 KiB / gzip: 155.92 KiB
```

Workers Free allows 3 MiB compressed, so the frozen pack uses about 5% of the ceiling.

### 2. The hosted runtime did not intercept distress

`cloudflare/src/written-authority.mjs` imported `distressSignal` and `supportResponse` and never
called either. Only `tools/local-grader.mjs` ran the check. The hosted worker is the runtime testers
will actually use, so the promise in `docs/community/PRIVACY.md` and `app/privacy.html` — "not sent
to any AI provider, not marked, not stored" — was not being kept there.

Both hosted entry points now check before the activation gate, the length bound, the evidence lookup
and any model call. Two tests cover it: one asserts an `env.AI.run` that fails the test is never
reached, one asserts a 13-character cry for help returns support rather than a character-count error.

The local grader's ordering was corrected the same way — distress previously sat after the 20-character
minimum, so the shortest and most urgent messages got a validation error.

### 3. Written answers are stored, expire, and can be deleted

`0007_written_answer_archive.sql` adds the only table in Dungeon holding a learner's own prose. Each
row carries its own `expires_at`, written 92 days out by the application.

Four promises in the privacy notice, four tests:

| Promise | Test |
| --- | --- |
| Kept for three months | stored expiry is exactly 92 days from creation |
| Distress is never stored | a support response writes no row |
| Deleted on request | the owner action removes that tester's rows and no one else's |
| Withdrawal deletes them | revoking a tester removes their rows |

Retention runs on a daily cron (`17 3 * * *`) rather than opportunistically on write, because the
window has to keep running after the exam season — precisely when nobody is opening Dungeon and the
stored answers are oldest. `revokeTester` deletes archive rows explicitly rather than relying on
foreign-key enforcement.

Archiving is best-effort: a fifth test asserts a storage failure still returns the learner's mark.

## Automated verification

```text
npm test                      78 passing, 0 failing
npm run build                 17 public assets
npm run check:palette         all pairings within tolerance, both themes
npm run validate:bank         pass
cd cloudflare && npm run check  dry-run clean, no Vectorize binding, cron registered
```

## Marking quality — unchanged by this session, restated for the record

The 128-case sweep behind these numbers predates this session's changes; nothing here alters marking
behaviour. Reproduced so the ship decision rests on measured figures:

| | Exemplars at full marks | Abstained | Zero | Marks earned |
| --- | ---: | ---: | ---: | ---: |
| IBM | 22/32 (69%) | 3 | 0 | 63/80 (79%) |
| BRGSA | 13/32 (41%) | 8 | 3 | 45/80 (56%) |

IBM short-form is 14/16. Zero false awards across 64 content-free answers in every run to date;
discrimination 94%. Latency p50 28.3s, p90 47.8s on the local 35B — the hosted checkpoint has never
been measured.

Against the original baseline on the identical 42 BRGSA cases the score moved 66/105 → 67/105. The
chunking fix did not measurably help BRGSA. Five of the eight questions flagged earlier for
concept-label/exemplar mismatch appear in today's failure list, which points at authoring rather than
inference.

## Not done

- The hosted `/coach` route is still not wired in `cloudflare/src/index.mjs`; `coachHostedAnswer`
  exists and is tested but unreachable.
- The hosted model has never been run. `tools/evaluate-hosted-grader.mjs` now calls
  `gradeHostedAnswer` itself, so it measures the shipped path rather than a parallel implementation,
  and needs only a Workers AI token — no index.
- `brgsa_m2_design_short_answer` remains a confirmed bank defect: the stem asks for "Experiment
  design", the anchor lecture is "Null Hypothesis", and the exemplar explains the null.
- No owner review of stored answers exists yet. The rows accumulate; reading them is manual.
