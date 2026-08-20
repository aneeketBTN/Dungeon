# Verification — the subject rail, screenshots written down, and IBM modules 4 and 6

`VERIFIED(REAL_BROWSER + HEADLESS_CHROME + AUTOMATED)` · 2026-08-18 · branch
`fix/theme-switch-and-login-theming` · not merged, not deployed.

Four asks in one session: fix the finding left open, fix screenshots, accept the prose, and keep
authoring. Server port **8099**, checks on `http://127.0.0.1:8099`.

---

## Verdict

| Claim | Verdict |
| --- | --- |
| The subject rail hid half of itself on a phone | **Was true** — 54% hidden, two of four subjects off-screen. Now 0% |
| The rail's edge fade was broken too | **No** — that reading was a measurement artefact and was nearly filed as a defect |
| Screenshots are impossible here | **No** — the tool already existed; the knowledge was buried, and is now written down |
| IBM modules 4 and 6 authored | **Yes** — 7 lessons, both modules complete, file 164 → 171 |
| The new prose matches the house range | **Yes** — measured before committing, 430–506 against a house max of 521 |

---

## D1 · The subject rail hid two of four subjects

`ui-audit`'s `hiddenScroll` reported `div#course-grid` at 375 showing **355px of 768px, 54%
hidden**. Measured per card, that is not detail:

| Card | Position at 375 | Visible |
| --- | --- | --- |
| SPMS | 10 → 196 | fully |
| BRGSA | 204 → 390 | cut at the edge |
| IBM | 398 → 584 | **not at all** |
| SCLM | 592 → 778 | **not at all** |

Two of the four subjects were invisible on the control whose only job is choosing between four
subjects. A rail earns its keep for a long or unknown list; this list is four, fixed, and known at
build time.

The fix falls back to the two-column grid the `<=900px` rule already defines, so the phone layout
is 2×2. Measured before editing any CSS, by injecting the candidate rule and reading the result:

| | before | after |
| --- | ---: | ---: |
| hidden | 54% | **0%** |
| card width | 186px | 174px (146px at 320) |
| rail height | 97px | 203px |

**The cost is +106px**, on a dashboard that runs about 6,700px on a phone. Stated rather than
hidden: the original comment's fear was a vertical stack of four (~410px), and two rows is not
that. The edge fade is left in place and goes quiet correctly on its own, because
`updateRailScrollCue` writes `data-scroll="none"` when there is no slack.

Swept after the change:

| | 320 | 375 | 1280 |
| --- | --- | --- | --- |
| all four visible | yes | yes | yes (one row) |
| hiddenScroll | 0 | 0 | 0 |
| overflow / clipped / overlaps / ragged / cutRows / tapTargets | 0 | 0 | 0 |
| card heights identical | yes (97px each) | yes | yes |

The identical-height check matters: the previous defect on these cards was SPMS laying out
differently from the other three because it alone carries a negative-marking flag. It has not
returned — every card's `.course-head` has `scrollWidth === clientWidth` at 320.

---

## D2 · The fade was not broken. The measurement was.

Before fixing the rail I read the edge fade's computed opacity and got **0** where the CSS says
`1`. The element matched `[data-scroll="start"]`, the rule existed, it had the winning specificity,
there was no `!important`, and a recursive walk of every stylesheet — including inside media
queries — found nothing overriding it. Every check said the rule should apply, and it did not.

It was **not a defect**. `getAnimations()` showed the opacity transition `playState: "running"`
with `currentTime: 0`, and:

```
document.timeline.currentTime at start : 0
document.timeline.currentTime +500ms   : 0      (performance.now advanced 511ms)
```

**The document timeline is frozen**, because an undisplayed Browser pane composites no frames. Every
CSS transition therefore reads as its start value, permanently. The rule is correct and the
instrument was lying.

This is the third time this artefact has cost this repository — two apparent CSS bugs in one earlier
session were the same thing. The near-miss here was closer than those, because the false reading
survived a specificity audit, a stylesheet walk and a 700ms wait before the timeline check exposed
it. Recorded as **LAW-73**.

Note the probe defect on the way: the first stylesheet walk collected only top-level rules and never
recursed into `CSSMediaRule`, so it would not have found a media-query override had one existed.
That is the same non-recursive-walk mistake `LAW-71` already records against `optical-audit.js`.

---

## D3 · Screenshots — the knowledge existed and nobody could find it

`tools/screenshot.mjs` has existed since 2026-08-15 and works first time:

```bash
node tools/screenshot.mjs --port 8099
```

**16 shots, 16 ok, 0 failed.** The information was in three places — a Key Files row, a *closed*
Known Gaps checkbox, and the tool's own header comment — none of which is where a session looks at
the moment it wants a picture. So sessions try the Browser pane, fail, and re-derive.

Now written once, in `docs/governance/SCREENSHOTS.md`, and pointed at from the five places a session
actually passes through: `AGENTS.md`'s required-reading order (step 7) and its Key Files table,
`docs/governance/UI-CHECKLIST.md`, the authoring protocol's browser step, and `CLAUDE.md`. The page
carries the command, the reason the pane cannot work, what a screenshot still cannot tell you, and
the frozen-timeline probe from D2.

Shots read, not merely counted: the 375 dashboard in both themes (the 2×2 fix above) and the 375
lesson screen, which renders kicker, objective, explainer, CTA and the unscored footer correctly.

---

## D4 · IBM modules 4 and 6

Seven lessons. **Both modules are now complete** — M04 6/6, M06 5/5. File **164 → 171**; backlog
**119 → 112** (IBM 32, SCLM 40, SPMS 40).

| lecture | lesson title |
| --- | --- |
| `IBM-M04-L01` | The employment problem RuralShores was built for |
| `IBM-M04-L02` | What a BPO is, and why the urban one leaks people |
| `IBM-M04-L03` | What breaks when you move a BPO to a village |
| `IBM-M04-L06` | Where rural BPO plateaued, and what impact sourcing means |
| `IBM-M06-L01` | Who the informal workforce is, and why nobody speaks for them |
| `IBM-M06-L03` | Four explanations for LabourNet's struggle, and the one it answered |
| `IBM-M06-L04` | Hasiru Dala: a price that changes behaviour, a franchise that changes status |

**Source fidelity.** 64 M04 candidates and 88 M06 candidates grep-verified against the module
transcripts before writing, with first-appearance position so nothing is glossed ahead of the
course's own usage. **Zero misses in both passes**, and zero invented-vocabulary warnings against
the new lessons — the validator's ten standing warnings all name pre-existing ones.

**Prose length was measured before committing this time**, which is the lesson the previous batch
paid for. All seven `worked.because` fields landed at **430–506** characters against a house range
of 62–521 (median 306), so they sit inside the shipped distribution rather than above all of it.

**One handoff had to be repaired.** `IBM-M06-L02` ended "the next lecture finds value in something
everyone else was throwing away" — true while the waste lecture followed it, false the moment `L03`
was inserted between them. The promise moved to `L03`, where it is true again. This is the
across-a-skip failure the layering work measured on fourteen handoffs, and inserting a lesson is
exactly when it is created; the plan now says to check the `connects` above every insertion point.

---

## Gates

| Gate | Result |
| --- | --- |
| `node tools/check_lesson_file.mjs` | `ok: true`, **0 errors** |
| `node tools/validate_t6_bank.js "<transcripts>"` | **errors: 0**, 10 warnings, none naming the new lessons |
| `node tools/measure-syllabus-coverage.mjs --gate` | **PASS**, all four subjects 100% |
| `node tools/check-taught-vocabulary.mjs --gate` | **PASS** |
| `npm test` | **120/120** |
| `node tools/build-site.mjs` | 19 assets |
| `node tools/screenshot.mjs --port 8099` | **16/16 ok** |

## Real browser

LAW-47 through the committed check, real subject rail, empty `lessonsRead`: **IBM 12 routes, 0
violations, 0 skipped**, re-run after the batch.

`ui-audit` fetched from the server and evaluated in the page, all seven new lessons expanded in the
lesson index: **0** on overflow, clipped, circleFit, overlaps, tapTargets, ragged, hiddenScroll,
cutRows, barInset and sub-floor type at 1280; no sideways scroll. All seven titles render and five
string probes confirm full bodies rather than titles alone — including `607 million`,
`227 units across 93 towns`, `90 to 92%`, `Rs 5 a kilo for rejects` and the `mission creep` gloss.

---

## D5 — SCLM modules 1, 4 and 8 (same session, later)

Seven further lessons complete **SCLM M01 9/9, M04 8/8, M08 4/4**. File **171 → 178**, backlog
**112 → 105**. Six modules are now complete across two subjects.

| lecture | lesson title |
| --- | --- |
| `SCLM-M01-L07` | The KPI tree: from a financial number down to a driver you can move |
| `SCLM-M01-L09` | Information, sourcing and pricing: the three that cut across departments |
| `SCLM-M04-L03` | Contracts as incentive design, not price negotiation |
| `SCLM-M04-L06` | Five reasons coordination fails, and the lever for each |
| `SCLM-M04-L07` | CRP, VMI and CPFR: coordination as a working arrangement |
| `SCLM-M04-L08` | The first half in one line, and what the second half changes |
| `SCLM-M08-L02` | Akshaya Patra: the constraints a meal supply chain runs inside |

**Two more source traps, both refused.** `push versus pull` returns zero because the transcript
says "the push versus **the** pull systems"; `days payable outstanding` returns zero because the
course writes "days**'** payable outstanding". Neither became a glossary heading, and the forms that
do verify — `push system`, `pull system` — were used instead. With `hub-andspoke` and
`selfdetermination`, that is four, which is roughly one per module and is now stated as the
expected rate.

**A second handoff repair.** `SCLM-M04-L02` promised "what happens across the whole chain when they
do not", which pointed at the bullwhip lecture and became false once `L03` was inserted between
them — the same defect as `IBM-M06-L02` earlier in this session. Two instances in one day from
the same cause makes it a pattern rather than an accident, and the plan now carries it.

**Prose length is a routine pre-commit check now, and one draft failed it.** `SCLM-M04-L08`'s
`worked.because` measured **534** against the house maximum of **521** and was trimmed to 468. The
other six landed at 463—502 first time.

**The lesson file is not reliably in course order.** SCLM module 1 sits L01-L05, then **L08, then
L06**. Pre-existing, left alone rather than reordered because moving whole blocks is a large diff
for a readability-only gain, and recorded in the plan so the next author does not assume sorted
neighbours.

Gates: `check_lesson_file` **0 errors**; bank validator **errors: 0** with none of the ten standing
warnings naming a new lesson; coverage and taught-vocabulary **PASS**; `npm test` **120/120**; build
19 assets; screenshots **16/16**. LAW-47 on SCLM: **12 routes, 0 violations, 0 skipped**.
`ui-audit` with all seven expanded in the lesson index: **0** on overflow, clipped, circleFit,
overlaps, tapTargets, ragged, hiddenScroll, cutRows, barInset and sub-floor type; no sideways
scroll. All seven titles render, and five string probes confirm full bodies — `12.28 lakh`,
`60 degrees centigrade`, `profit margin times asset turnover`, `order 100 hoping to get 75`, and
the `category captain` gloss.

---

## Status

The **seven IBM-M02 lessons** from earlier today are `ACCEPTED` — the owner approved that prose in
chat on 2026-08-18. That clears their content gate; it is not faculty review and creates no
subject-matter authority.

The **fourteen lessons written after that approval** — seven IBM (M04, M06) and seven SCLM
(M01, M04, M08) — have not been read by anyone, so they remain
`WAITING_OWNER_CONTENT_ACCEPTANCE`. Not merged, not deployed.

**Still open:** 105 lectures in the backlog; no second reader on any lesson prose; `app/admin.css`
still ignores the theme by owner decision.
