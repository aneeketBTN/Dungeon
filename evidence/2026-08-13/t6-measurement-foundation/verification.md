# T6 measurement foundation — verification

Status: `VERIFIED(REAL_BROWSER + AUTOMATED)` on `codex/measurement-foundation`

Date: 2026-08-13

Scope: response timing, rapid-response Strong eligibility, saved-state fairness, disclosure, source
reconciliation, and the Mac workstation handoff. This branch is not merged, pushed, or deployed.

## Acceptance boundary

- A response classified as rapid keeps its correctness, diagnosis, feedback, and scheduling effect.
- Only Strong eligibility changes. Slow responses are never penalised or interpreted.
- Elapsed time is computed at explicit answer commit, so a multi-select or edited response is not
  truncated at its first selected option. Raw response milliseconds do not enter the saved
  response, attempt, local profile, or D1 payload.
- Historical untimed attempts remain eligible. A complete response restored after reload has
  unknown timing rather than a false page-lifetime duration.
- A later rapid-but-correct response cannot demote an already Strong body: it contributes no new
  Strong evidence, and the recency gate reads the newest eligible attempt. A rapid wrong answer
  still reaches ordinary error handling because speed never changes correctness.
- The threshold is provisional: 10% of authored/default expected response time, clamped to 3–10
  seconds. This verification proves implementation consistency, not empirical validity.
- No telemetry endpoint, queue drain, model call, or production route was added.

## Source conflict resolved

The 2026-08-11 evidence brief said not to infer unknown learner state from speed. The owner-supplied
2026-08-13 measurement brief asked for latency as implicit evidence. C31 in
`docs/governance/DESIGN_SOURCE_INDEX.md` resolves the two narrowly: speed is not correctness,
confidence, ability, motivation, or effort; it can only prevent an implausibly fast response from
supplying the product claim Strong. LAW-57 carries the implementation and verification boundary.

## Real Browser evidence

Origin: `http://127.0.0.1:8099/app/t6.html`, isolated `?scenario=` fixtures in the in-app Browser.
Scenario mode does not write the normal browser profile or call the backend.

### Deterministic evidence pair

`?scenario=measurement-evidence`, inspected with
`tools/browser-checks/measurement-evidence.js`:

```json
{
  "scenario": "measurement-evidence",
  "strongCount": 1,
  "developingCount": 1,
  "rapidReasonCount": 1,
  "rapidConceptIds": ["brgsa_m1_evidence"],
  "ok": true
}
```

Both concepts have five correct attempts, three formats, two blocks, and applied evidence. The
second concept differs only in its fifth response: `under-5s`, `rapidGuess: true`,
`strongEligible: false`. It remains Developing and renders: “1 fast response kept its result but
did not count toward Strong evidence.”

### Live clock paths

1. `?scenario=measurement-question`: selected the known-correct option and committed immediately.
   Feedback rendered **Correct**. Returning to the dashboard produced one rapid reason on
   `brgsa_m1_demand`, state Developing.
2. Reloaded the same fixture, waited 6.5 seconds (the one-minute MCQ default produces a six-second
   threshold), selected the same correct option, and committed. Returning to the dashboard produced
   zero rapid reasons; state remained Developing because the other Strong gates are still open.
3. `?scenario=measurement-restored-question`: rendered a pre-selected complete response and
   committed immediately. Returning to the dashboard produced zero rapid reasons, proving restored
   state is timing-unknown rather than falsely instant.
4. `?scenario=measurement-msq-question`: selected one option immediately, waited 10.5 seconds,
   selected another, and committed. The dashboard produced zero rapid reasons. This is the
   regression for the commit boundary: stopping at the first tick would have misclassified the
   composed multi-select response as rapid.
5. Post-audit regression `?scenario=measurement-established-strong` adds a sixth,
   rapid-but-correct attempt after an otherwise Strong five-attempt body. The concept remains
   Strong while still reporting that the fast response kept its result and did not count toward
   Strong evidence. This closes the demotion edge case found during the high-effort review.

No screenshot is required for this slice: it changes evidence computation and text, not layout,
colour, or motion. The rendered DOM and real interactions are the acceptance source.

## Persistence and privacy inspection

`responseTiming` contains page-lifetime `startedAt` only in the IIFE's ephemeral variable.
`recordAttempt()` and session responses persist only:

```text
durationBucket
rapidGuess
strongEligible
```

Targeted search found no response-timing object property named `durationMs`, `elapsedMs`, `shownAt`,
or `viewedAt` in `app/t6.js`. The duration enum exactly matches
`.agents/contracts/tester-event.schema.json`: `under-5s`, `5-15s`, `15-30s`, `30-60s`, `1-3m`,
`3-10m`, `over-10m`, `unknown`.

`docs/community/PRIVACY.md` now names the coarse band, the Strong-only purpose, the raw-time
prohibition, and the no-slow-penalty rule. The in-app agreement already names revision attempts and
the purpose remains operating the learner's revision progress; no agreement version was changed on
this unmerged branch.

## Automated verification

- `node --check app/t6.js` — pass.
- `git diff --check` — pass.
- `node tools/build-site.mjs` — pass; 16 public assets and the production worker prepared.
- `npm test` — **46/46 pass** after the local-authority continuation added seven grader tests; the
  measurement fixtures remain green.
- `npm run check:palette` — pass; 140 required contrast checks and four shape signatures.
- `node tools/validate_t6_bank.js "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"`
  — `ok: true`, non-empty coverage, 106 lessons; BRGSA 187/187, IBM 177/177, SCLM 184/184,
  SPMS 200/200 scheduled questions fully taught. The pre-existing IBM option-length warning remains.
- `npm run check:exam` — expected non-zero baseline: SCLM Section B remains 4/6 numericals (two
  missing, eight mock marks unavailable), with the two existing SCLM prompt-variety warnings.
  SPMS, BRGSA, and IBM sections pass. This slice did not touch the bank or examiner pattern.

## Mac handoff status

`docs/ops/MAC_TRANSFER.md` is `IMPLEMENTED`: official ChatGPT Computer Use installation and macOS
permissions, a copy-ready guarded prompt, local and trusted-LAN routing, Git/live-deploy boundaries,
and the loopback-only local-model constraint are documented. It is not `VERIFIED(MAC)` because the
MacBook Pro was not available to this Browser session. `WAITING_COMPUTER_USE` remains for the real
Mac permission and smoke pass.

## Deliberately deferred

- read-only live D1 coverage/sample audit;
- empirical per-item or per-format rapid threshold calibration;
- confidence-calibration curve UI and retention forecast;
- post-exam debrief collection pending purpose/consent/retention/deletion decision;
- any machine judgement contributing Strong;
- any Workers AI production inference path;
- installing LM Studio or downloading a local model.
