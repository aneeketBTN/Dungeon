# Term 6 Revision Dashboard

The active route is a plain revision dashboard for all four Term 6 subjects. It shows what is
Strong, Developing, Needs practice, or Not started; recommends the next useful practice; and keeps
every generic practice shape directly available.

Current status: the dashboard, all four source-traced course banks, constructed self-review, and
generic practice modes are verified in a real Browser. The controlled tester-release build is
implemented and tested. This is the first Term 6 final, so the product targets a documented
assessment envelope rather than claiming an exact paper blueprint.

## Start

From this folder:

```text
python mock/server.py 8099
```

Open:

```text
http://localhost:8099/
```

There is no npm install or build step. The server uses Python's standard library.

## What the student sees

- Four immediately available subjects: BRGSA, IBM, SCLM, and SPMS.
- A staged Overview, Concepts, and Study plan so the page does not expose everything at once.
- A 64-concept overview and an evidence-over-time trend for the selected subject, with only one
  two-concept module opened at a time.
- Ten available sets per subject: eight module sets, one concept-connection set, and one flexible
  generic practice check. Completing all ten is not compulsory.
- One-click subject practice that prioritises Needs practice, then Developing, then untouched
  concepts, with a button that names the concrete action.
- Clickable concepts for focused practice.
- MCQ, cloze, case-cloze, match, short-answer, and three-step boss questions, with sampled
  confidence before checking high-value diagnostic work.
- A generic practice setup that can emphasise recognition, application, explanation, or a mixed
  set, with either immediate teaching or correctness held until the results screen.
- One-day, three-day, and seven-day study plans that protect breaks and sleep and label same-day
  success as current evidence rather than delayed retention.
- Immediate answers, causal concept bridges, and later re-attempts from another perspective.
- Results that say which concepts changed and what to do next.

A concept becomes Strong only after at least five scored attempts, four correct answers, three
question types, correct evidence in two practice blocks, applied evidence from a new case or valid
reasoning step, a latest correct scored answer, and no open misconception, confident-error repair,
uncertain-correct confirmation, or relevant failed reasoning step. Whole-chain boss completion is
shown separately. Same-day evidence is not presented as delayed retention.

## Exam-format boundary

No same-course Term 6 final exists for this first cohort. Public programme policy permits MCQs,
caselets, or subjective assessments but does not establish their proportions or rules. This
version practises
grounded MCQ, cloze, case-cloze, match, short-answer, and boss decisions. Short answers reveal a
source-grounded rubric and exemplar for transparent self-review; they are not automatically graded
and cannot independently create Strong evidence. The generic practice check is not an exam replica
or score prediction. It does not claim the final paper's exact sections, marks, duration, option
rules, or negative marking.

The first real Term 6 final can inform later cohorts. It cannot be treated as a missing source this
cohort should wait for.

## Progress and privacy

Progress stays in this browser under the internal key:

```text
term6.revision.v2
```

An unfinished set resumes automatically after reload. **Reset local progress** asks for
confirmation and removes only this browser profile. The web app does not write to the learning
engine's live `state/` or `history/` files. The controlled tester release does not add accounts,
analytics, advertising trackers, or a server-side learner database. See `PRIVACY.md`.

## Controlled tester release

`npm run build` creates a ten-asset deployment artifact containing only the active T6 learner
route, three course-bank scripts, the owner control room, and `robots.txt`. It excludes live
`state/`, `history/`, local CLA analysis, owner source packs, transfer notes, work files, test
fixtures, credentials, tester addresses, and community invites. `npm test` checks that boundary,
the health route, learner/admin redirects, private-cache policy, no-index rules, and security
headers. No package installation is required.

The intended tester gate uses one-time email sign-in through Cloudflare Access. A tester can be
revoked individually; there is no cohort password to leak. The app stays out of search indexing
and question-bearing scripts are not shared-cacheable. This prevents anonymous and casual bulk
collection, not copying by an already approved tester. See
`briefs/TESTER_ACCESS_AND_ADMIN.md` for the threat boundary.

The owner dashboard is `/mock/admin.html` locally and will be `/dungeon/admin` on the protected
domain. It checks production health and the release allowlist, explains tester add/revoke steps,
provides a feedback template, and drafts—but never autonomously sends—change announcements.

The current production Sites URL is owner-only. Exact `aneeketdas.com/dungeon` routing is paused
before Cloudflare Zero Trust activation because that step requires accepting Cloudflare terms and
authorising the saved card for any usage above the free limits.

Tester conduct and feedback live in `TESTER_GUIDE.md`; moderation and announcement procedures live
in `COMMUNITY_PLAYBOOK.md`; private security reports follow `SECURITY.md`.

## Source pack

The embedded banks are grounded in the owner-supplied pack at:

```text
C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack
```

Every question retains stable lecture provenance in its data for audit. Internal IDs are hidden
from the learner-facing question card. The external pack does not need to be present merely to run
the browser experience.

## Deterministic test routes

Append one scenario to `/mock/t6.html`:

- `?scenario=dashboard-progress`
- `?scenario=dashboard-concepts`
- `?scenario=dashboard-plan`
- `?scenario=question`
- `?scenario=question-mcq`
- `?scenario=question-cloze`
- `?scenario=question-match`
- `?scenario=question-boss`
- `?scenario=question-boss-review`
- `?scenario=question-short-answer`
- `?scenario=question-short-answer-review`
- `?scenario=question-routine`
- `?scenario=practice-setup`
- `?scenario=simulation-results`
- `?scenario=feedback`
- `?scenario=priority`
- `?scenario=results`

Scenario routes do not save normal browser progress.

## Legacy references

The Term 5 procedural engine in `PROMPT.md`, its live state/history, the earlier cinematic product
prototype at `/mock/rogue.html`, and the older Open Mock pages remain preserved for reference. They
are not part of the active student path.

Product decisions and remaining gates are in `briefs/T6_REVISION_FALLBACK.md`.
