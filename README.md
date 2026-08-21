# Dungeon — Term 6 revision

Dungeon is three surfaces over one complete four-subject course: **Learn** sequences 283 teaching
entries and 219 trackable concepts, **Examiner** offers Full mocks, final-week Speedruns and
last-minute Minis, and **Quick Notes** exposes the authored course in searchable,
printable teaching order.

The released IBM prompt is now its own fixed ten-question paper with explicit assumptions and one
coherent inclusive-business model. Numbered IBM papers remain rotating transfer practice. The
learner home opens with four full subject cards, then folds them into a compact, animated subject
rail once a subject is selected.

## Start

From this folder:

```text
python tools/server.py 8099
```

Open:

```text
http://localhost:8099/
```

The local server uses Python's standard library. Node dependencies are needed for tests and the
release build:

```text
npm install
npm test
npm run build
```

## What the student sees

- Four immediately available subjects: BRGSA, IBM, SCLM, and SPMS, with a full first-load view and
  compact active-subject rail after selection.
- A fixed nine-run Learn path per subject, one uncleared run at a time, plus evidence-led repair.
- MCQ, MSQ, cloze, case-cloze, match, numeric, short-answer, and multi-step questions.
- Examiner tabs ordered by distance to the exam: **Full mocks (1+ week out)**, **Speedrun (within a
  week)**, and **Minis (last 25–30 minutes)**.
- Interactive last-minute Minis: eight objective questions, one per module, immediate teaching,
  rotating families, and a subject-first UI that folds after selection. SPMS includes real P-type
  two-selection controls and 2 / 1 / 0 scoring.
- Deterministic full-paper coverage cycles, dynamic Weakest links papers, and the fixed IBM
  Released case paper.
- Quick Notes covering every registered teaching entry, with search, print/PDF, concept maps, and
  numerical setup guides.
- Immediate explanations in Speedruns and deliberately delayed feedback in Full mocks.

A concept becomes Strong only after at least five scored attempts, four correct answers, three
question types, correct evidence in two practice blocks, applied evidence from a new case or valid
reasoning step, a latest correct scored answer, and no open misconception, confident-error repair,
uncertain-correct confirmation, or relevant failed reasoning step. Whole-chain boss completion is
shown separately. Same-day evidence is not presented as delayed retention.

## Exam-format boundary

The owner-supplied Batch 1 paper pattern is encoded in
`docs/briefs/T6_EXAM_PATTERN.md`: four 120-minute papers with their actual section shapes. Full
papers preserve those shapes; they do not predict difficulty, topic weight, likely score, or pass
probability. Constructed responses use transparent course-grounded rubrics and exemplars for
self-review, never an official mark. The released IBM design prompt is known; the ten questions
the faculty will ask about it are not.

## Progress and privacy

Progress is stored in Cloudflare D1 for approved testers, with this browser key as the offline
fallback:

```text
term6.revision.v2
```

An unfinished set resumes automatically after reload. **Reset local progress** asks for
confirmation. Dungeon stores no advertising analytics or precise location. Approved access remains
personal under the tester terms, but there is no automatic device ceiling or country lock. See
`docs/community/PRIVACY.md`.

## Controlled tester release

`npm run build` creates a 23-asset deployment artifact containing only the active learner/login/
privacy surfaces, allowlisted course and revision scripts, the owner control room, the self-hosted
animation runtime, and `robots.txt`. It excludes live
`data/state/`, `data/history/`, local CLA analysis, owner source packs, transfer notes, work files, test
fixtures, credentials, tester addresses, and community invites. `npm test` checks that boundary,
the health route, learner/admin redirects, private-cache policy, no-index rules, and security
headers. No package installation is required.

The live protected route is [https://aneeketdas.com/dungeon/](https://aneeketdas.com/dungeon/).
Approved testers use one-time email sign-in through Cloudflare Access. A tester can be
revoked individually; there is no cohort password to leak. The app stays out of search indexing
and question-bearing scripts are not shared-cacheable. This prevents anonymous and casual bulk
collection, not copying by an already approved tester. See
`docs/briefs/TESTER_ACCESS_AND_ADMIN.md` for the threat boundary.

The owner dashboard is `/app/admin.html` locally and
`https://aneeketdas.com/dungeon/admin/` on the protected domain. It checks production health and
the release allowlist, provides direct tester add/list/revoke controls,
provides a feedback template, and drafts—but never autonomously sends—change announcements.

The Sites URL remains an owner-only backup. The Cloudflare route is live with separate tester and
owner Access policies, signed-token verification at the Worker, private/no-index responses, and
learner-path rapid-request rate limiting. The authenticated admin path is excluded from that burst
rule so its own API fan-out cannot throttle the owner.

Tester conduct and feedback live in `docs/community/TESTER_GUIDE.md`; moderation and announcement procedures live
in `docs/community/COMMUNITY_PLAYBOOK.md`; private security reports follow `SECURITY.md`.

## Source pack

The embedded banks are grounded in the owner-supplied pack at:

```text
C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack
```

Every question retains stable lecture provenance in its data for audit. Internal IDs are hidden
from the learner-facing question card. The external pack does not need to be present merely to run
the browser experience.

## Deterministic test routes

Append one scenario to `/app/t6.html`:

- `?scenario=dashboard-progress`
- `?scenario=dashboard-folded`
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
- `?scenario=exam-mini`
- `?scenario=exam-final`
- `?scenario=exam-full`
- `?scenario=exam-released`
- `?scenario=notes-ibm`

Scenario routes do not save normal browser progress.

## Legacy references

The Term 5 procedural engine in `docs/engine/PROMPT.md`, its live data/state/history, the earlier cinematic product
prototype at `/legacy/rogue/rogue.html`, and the older Open Mock pages remain preserved for reference. They
are not part of the active student path.

Product decisions and remaining gates are in `docs/briefs/T6_REVISION_FALLBACK.md`.
