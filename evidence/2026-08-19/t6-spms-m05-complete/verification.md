# SPMS module 5 complete — 8 of 8 lectures

`VERIFIED(REAL_BROWSER + AUTOMATED)` — 2026-08-19, branch `fix/theme-switch-and-login-theming`.
Not merged, not deployed. All new prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`.

## What was authored

Three lessons, the first batch under the 2026-08-19 owner decision that uncited lectures are not
optional:

| lecture | lesson title | source |
| --- | --- | --- |
| `SPMS-M05-L05` | Value communication: the customer's journey | 11,415-char transcript |
| `SPMS-M05-L07` | Product launch: plan, accelerate, review | 24,474-char transcript |
| `SPMS-M05-L08` | Customer experience as the advantage | 19,125-char transcript |

Lesson file **245 → 248**; SPMS **46 → 49 of 84**; backlog **38 → 35**, still entirely SPMS.
**SPMS module 5 is complete, 8 of 8.**

*(Corrected before commit: this first read "246 → 249". The true totals are BRGSA 50 + IBM 78 +
SCLM 71 + SPMS 49 = **248**, confirmed against both `check_lesson_file` and a `lectureId:` count.
Recorded rather than silently fixed, because a lesson count is quoted downstream.)*

## The handoff defect, found before writing rather than after

`SPMS-M05-L06`'s `connects` read *"That closes the market-facing module. The next turns inward, to
how requirements are gathered and written."* **That promise was false**: L06 is Product Launch
Part 1, and L07 and L08 follow it inside module 5. It had been written when L06 was the last
authored lesson in the module, and inserting anything after it made it wrong — the insertion defect
the authoring plan warns about, caught by checking the `connects` above the insertion point before
writing a word.

Repaired the way the protocol prescribes — **the promise was moved, not rewritten**: it now sits on
`SPMS-M05-L08`, which really is the last lecture of the module, and L06 hands off to the launch plan
that actually follows it. Verified in the running app after the change (both strings read back from
the served file).

## Source verification before writing

Every figure and glossary heading was grepped against `SPMS_M05_SUM_TRANSCRIPT.txt` first, with a
first-appearance check for terms introduced earlier in the course:

- Confirmed present: `post-purchase dissonance`, `time to first value`, `usage analytics`,
  `customer advocacy` , `referral program`, `press release`, `launch plan`,
  `customer advisory board`, `fear, uncertainty, doubt`, `progressive modernization`,
  `tribal knowledge`, `net promoter score`, `CSAT`, `churn`, `predictive customer success`,
  `intelligent support`.
- **One transcript-typo trap, routed around.** The M05 lecture says *"we talked about **modes** in a
  startup context… customer experience can be a great **mode**"* — `moat` occurs **0** times in M05.
  It occurs **1×** in M02 and **3×** in M03, so the idea is genuinely taught earlier and the word is
  legitimate prior vocabulary: it is used in L08's prose and deliberately **not** made a glossary
  heading, since this lecture does not introduce it. This is the ~one-per-module source trap the
  authoring plan predicts; it is now four-plus recorded.
- **Two hedged figures handled conservatively.** The Dropbox referral growth is spoken as *"more
  than close to 4000%"* and the storage rewards as *"I think… as of the last I knew"*. The durable,
  examinable point — a two-sided referral reward lowering acquisition cost — is taught; the
  double-hedged megabyte figures are not stated as fact.

## Gates

| gate | result |
| --- | --- |
| `check_lesson_file.mjs` | **0 errors**; SPMS 49 authored; module 5 complete |
| `validate_t6_bank.js` (vocabulary/LAW-49) | **0 errors**, 9 warnings — **all pre-existing, none names a new lesson** |
| `check-lesson-lecture-match.mjs --gate` | **expected state**: `FAIL` naming `SPMS-M01-L01` and nothing else. No new flags, and the corpus shift (LAW-76) moved nothing else over the line |
| `npm run check:syllabus` | **PASS** — 100% on all four subjects, no term dropped |
| `npm run check:taught` | **PASS** — no new untaught vocabulary |
| `npm run check:tested` | **PASS** at floors (BRGSA 67 / IBM 19 / SCLM 33 / SPMS 30) |
| `npm test` | **128 / 128** |
| `node tools/build-site.mjs` | 19 assets |
| line endings | LF preserved (`LAW-74` check run explicitly) |

## House-style measurement, before commit

Measured against the shipped distribution rather than against a guess:

```
house  because     n=248  min=62  median=398  max=521
house  paragraphs  n=749  median=473  p99=684  max=695
```

**Two defects in my own prose, caught and fixed before commit.** `SPMS-M05-L08`'s first paragraph
came in at **712 characters — the longest in the entire file** — and its explainer at **306 words**
against the ~300 ceiling. Trimmed to 608 and 291; the file's longest paragraph is once again a
pre-existing lesson at 695. Final: `because` 322 / 420 / 428, all paragraphs ≤ 676, explainers 277 /
296 / 291 words.

## Real browser

Local dev server on 8099, every disclosure expanded, **165,304 characters rendered**.

- All three new titles present in the lesson index, each correctly labelled
  `Read-only — no question cites this` — accurate, since no question cites these lectures yet.
- `SPMS-M05-L08` read end to end as a learner sees it (**3,375 characters**): objective, three
  explainer paragraphs, worked example, five glossary entries, handoff. Protocol Step 5.3.
- `ui-audit.js` **fetched from the server, not pasted**, run with all lessons expanded at
  **1280×720** and **375×812**: **0 on every detector** — overflow, clipped, hiddenScroll, cutRows,
  overlaps, ragged, barInset, circleFit, tapTargets, typeTooSmall, no sideways page scroll.
- `density` lists ten paragraphs and **exactly one is mine** (676 chars, ranked 6th, under the house
  p99 of 684). The other nine are pre-existing. Recorded because the previous batch's density
  entries were *all* mine and held the top seven slots — this one sits inside the distribution.

## Not done

- **No screenshots.** `node tools/screenshot.mjs --port <port>` was not run. This is a text-only
  addition rendering through an existing path, and the DOM audit covers layout at both viewports;
  pixel acceptance is nonetheless not claimed.
- **No LAW-47 run.** These lectures are uncited, so nothing schedules them and no delivery order
  changed — the teach-before-test property is untouched by this batch. Stated rather than assumed.
- **No second reader.** The prose is `WAITING_OWNER_CONTENT_ACCEPTANCE`, which under the 2026-08-19
  decision means every lesson gets read.

## Finding for the owner — `SPMS-M05-L06`'s lesson is a composite

Not fixed in this batch, and worth a decision. The lesson at `SPMS-M05-L06` is titled *"Launches,
customer experience, and advantage"* and teaches launch-as-process, the UX/CX distinction and
competitive advantage. Its own lecture, **Product Launch Part 1**, is the framework — assessment,
objectives, customer segments, positioning against advantages, competitors and obstacles — which the
lesson barely touches, while the CX half belongs to `SPMS-M05-L08`, which now has its own lesson.

It reads that way because it was authored when it was the only lesson standing in for this whole
area. **This is the class the match gate structurally cannot see** — a lesson written from half its
own lecture — and it did not flag.

> **CORRECTED and RESOLVED the same day.** This section first said the lesson was **"cited,
> scheduled"**, and gave that as the reason to defer the rewrite to the owner. **That was wrong** —
> `SPMS-M05-L06` is *uncited* and unscheduled, verified against `check_lesson_file`'s own
> never-scheduled list, so rewriting it touched neither scored coverage nor LAW-47 nor the
> scheduler. The real risk was always the **syllabus coverage ratchet**, which reads every lesson
> regardless of citation — and that did fire. The lesson has since been rewritten against its own
> lecture: see `evidence/2026-08-19/t6-composites-rewritten/verification.md`.
