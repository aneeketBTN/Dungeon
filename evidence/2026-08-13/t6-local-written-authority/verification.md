# Local written-response authority — verification

Status: `VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)` on
`codex/measurement-foundation`; `WAITING_LOCAL_MODEL_CALIBRATION` for the owner-marked quality set

Date: 2026-08-13

Scope: owner-local written-practice judgement, source-confined retrieval, two-pass agreement,
abstention, repair scheduling, interruption recovery, responsive rendering, and the Mac handoff.
This branch is not committed, pushed, merged, or deployed. The live cohort and live D1 were not
touched.

## Authority contract

- The owner authorised a local Qwen checkpoint to issue Dungeon's final per-criterion mark for
  **practice short answers only**. This is not an IIMB grade, an exam prediction, or faculty
  acceptance.
- Machine-marked writing remains `scored: false` and `strongEligible: false`; it can never create
  Strong evidence. An accepted missing criterion schedules a different question for repair.
- The examiner never calls the model. Production `/dungeon/`, LAN clients, and the ordinary local
  server have no grader route.
- The owner selected the exact installed LM Studio checkpoint
  `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` as the local practice authority. Dungeon
  reports that identifier verbatim and does not relabel the distilled checkpoint as an official
  base release.
- Exact-checkpoint approval and academic calibration are separate gates. The real model path is
  operational; marking quality remains waiting on the 48-answer owner-marked multi-subject set.
  Deterministic and synthetic answers prove transport, bounded behavior, and smoke performance,
  not marking validity.

## Implementation acceptance

`tools/local-grader.mjs` loads the real question bank server-side, finds the question by id and
course, and retrieves chunks only from its declared lecture ids. It sends two blinded structured
passes to the configured loopback OpenAI-compatible endpoint. The second pass receives reversed
rubric and evidence order and never receives the first judgement. Dungeon accepts a mark only when:

1. both passes return the exact declared criterion ids;
2. both agree on every `met` / `not_met` decision;
3. every cited chunk belongs to the retrieved evidence;
4. awarded answer evidence is the shortest exact literal substring of the candidate response,
   with no commentary wrapper; and
5. the whole result passes the browser's independent schema check.

Disagreement, malformed JSON, invented citations, missing answer evidence, timeouts, endpoint
errors, and interruption all abstain into the existing rubric/exemplar self-review. Candidate text
and lecture chunks are explicitly framed as untrusted data so embedded instructions cannot alter
the grading task.

`tools/server.py` exposes `GET /api/local-grader/health` and `POST /api/local-grade` only when
`DUNGEON_LOCAL_GRADER=on` **and** `DUNGEON_GRADER_APPROVED_MODEL` exactly matches the configured
model id. Requests must come from loopback; browser requests must carry the exact
same loopback origin; CORS is not enabled; the body is capped at 32 KiB; and only one grading
subprocess may run at a time. The grader itself rejects a non-loopback model base URL.

## High-effort audit findings

The review found and fixed four defects rather than merely re-running the earlier checks:

1. The measurement recency gate originally read the latest attempt, so a rapid-but-correct sixth
   answer could demote an otherwise Strong concept. It now reads the newest Strong-eligible attempt;
   rapid wrong answers still pass through ordinary error handling. The Browser regression
   `?scenario=measurement-established-strong` leaves the concept Strong and still reports the
   rapid-response reason.
2. Leaving practice while a model request was in flight could persist `subjectiveStage: "grading"`
   and strand the response after reload. Leaving now clears the transient stage, restored sessions
   normalise it to ready-to-grade, and a late response is ignored when its session token no longer
   matches.
3. The exact-checkpoint approval boundary was documented but not enforced by the launcher. The
   server now stays disabled unless the owner explicitly sets an approved model id that exactly
   matches the loaded id; calibration tooling works without that approval, so a candidate can be
   evaluated before its exact ID is granted authority. Quality calibration remains a separately
   visible gate after ID approval.
4. The first real-model response made a sound academic judgement but wrapped the candidate quote in
   commentary (`The candidate states ...`). The existing validator correctly abstained because the
   wrapper was not submitted answer text. The schema and prompt now require the raw shortest
   literal substring, and a regression rejects commentary-wrapped evidence rather than weakening
   the evidence boundary.

The UI audit probe itself also had two false-positive paths: its Browser evaluator lacked the bare
global `parseFloat`, and it measured visually hidden native radio inputs instead of their labels.
It now uses `Number.parseFloat` and audits the visible label target. Genuine 32px confidence and
skip targets were raised to the 44px floor.

## HTTP evidence

Origin: a verification-only server at `http://127.0.0.1:8101`, backed by a deterministic local
OpenAI-compatible fixture. Both helpers were stopped after verification.

- Health returned `200`, the configured fixture model id, and `lectureCount: 283`, proving the
  transcript pack—not merely the model endpoint—was ready. A missing transcript source now fails
  closed before the UI advertises local grading.
- With the approval variable set to a different model ID, the otherwise identical server returned
  `404`; with the exact approved ID it returned `200` and accepted a 3/3 source-cited fixture mark.
- A fully supported answer returned an accepted 3/3 criterion mark with source chunk citations.
- A partial answer returned 2/3 and the missing concept as a repair route.
- A deliberately conflicting pair of passes abstained.
- A request with `Origin: https://example.com` returned `403`; the exact same-origin request
  returned `200`.
- The ordinary server with the grader flag absent returned `404` for the health route.

The real two-machine path was then exercised through a private SSH local forward: Windows
`127.0.0.1:12340` to Mac `127.0.0.1:1234`. Mac LM Studio loaded the exact approved model at an
8192-token context, parallelism 1, maximum GPU offload, about 26.56 GiB resident. Real health
returned `available:true`, the exact model identifier, and `lectureCount:283`. SCLM and BRGSA
supported exemplars each produced accepted 3/3 marks with literal answer evidence and declared
lecture citations after the evidence-format fix.

## Real Browser evidence

The in-app Browser exercised the actual short-answer UI first against the deterministic verification
server and then against the real Mac model through the Windows localhost site:

- **Accepted:** the model id, final 3/3 mark, criterion decisions, source citations, feedback, and
  official-boundary language rendered; no Strong credit was created.
- **Partial:** 2/3 rendered, the missing criterion was explicit, and a different question was added
  to repair without creating Strong evidence.
- **Abstention:** no machine mark rendered; the existing rubric, exemplar, and manual self-review
  control remained available.
- **Interruption:** the learner left during a delayed request, resumed the same question, and saw a
  ready-to-grade state rather than a stuck spinner. The late result did not overwrite the dashboard.
- **Responsive:** at 1280×800 and 375×812 the audited screen reported zero overflow, sub-44px
  interactive targets, off-scale radii, density findings, ragged rows, or sideways layout. The new
  `.local-graded` subtree had no text below 12px. A dark mobile screenshot was visually inspected.
- **Real-model accepted path:** a BRGSA supported response rendered “Local Qwen rubric mark: 3 of
  3”, the exact model identifier, source citations, all criterion decisions, the exemplar, and the
  boundary that this is not official IIMB marking and cannot create Strong.
- **Honest wait state:** while the two real passes ran, a polite live status named the two-pass
  check, set an expectation of about 45 seconds, asked the learner to keep the page open, and stated
  the fallback. At 375×812 it remained inside a 330px content width with zero horizontal overflow;
  the sticky commit button remained visible and above the bottom edge.
- **Real interruption:** leaving during a second real-model request safely returned to the learning
  route without accepting a late result.

## Automated and repository gates

- `npm test` — **50/50 pass**, including source-boundary, agreement, abstention,
  prompt-injection, exact-answer-evidence, repair-routing, fail-closed health, calibration input,
  aggregate-only reporting, and latency tests.
- `node tools/build-site.mjs` — pass; 16 public assets and the production Worker prepared.
- `npm run check:palette` — pass; 140 required contrast checks and four distinct state shapes.
- `node tools/validate_t6_bank.js <real transcript root>` — `ok: true`, non-empty coverage,
  106 lessons; BRGSA 187/187, IBM 177/177, SCLM 184/184, SPMS 200/200 scheduled questions fully
  taught. The pre-existing IBM option-length warning remains.
- `node --check` for the app and grader tools, Python byte-compilation for the server and fixture,
  and `git diff --check` — pass.
- `bash -n tools/start-mac.sh` through Git Bash — pass.
- `pwsh -NoProfile -File tools/start-windows-mac-grader.ps1 -HealthOnly` — pass against the real
  Mac endpoint, exact model ID, and 283-lecture Windows source pack.
- `npm run check:exam` — expected existing non-zero baseline: SCLM Section B remains 4/6 numericals
  with 8 mock marks unavailable, plus the two existing SCLM prompt-variety warnings. This work did
  not alter the exam bank.

## Calibration gate

`tools/evaluate-local-grader.mjs` reads an ignored owner-marked JSONL set and reports only aggregate
metrics; candidate answers are never printed. The provisional authority gate requires at least 48
answers, at least 12 per subject, false awards at or below 5%, exact criterion agreement at or above
85%, abstention at or below 30%, and zero unsafe judgements on owner-labelled ambiguous cases.
These are product acceptance thresholds, not a psychometric validity claim.

A 12-case synthetic real-model smoke set covered all four subjects with full, partial, and
prompt-injection-shaped answers. It issued 9 marks and abstained on 3; criterion agreement against
the synthetic labels was 26/36 (72.22%), exact-case agreement 8/12 (66.67%), false awards 1/36
(2.78%), false denials 0, and all four injection-shaped cases were safely 0/3. Mean latency was
43.25 seconds, p50 44.83, and p95 48.45. One IBM “false award” depends on whether its decision
criterion is already met by causal content in the reason, so it is retained for owner review rather
than massaging the label or threshold. Because these answers are synthetic and only 12 cases, the
provisional gate correctly remains false.

The Mac handoff at `docs/ops/MAC_TRANSFER.md` is now `VERIFIED(MAC + WINDOWS_SSH)`. The Apple M4 Pro
/ 48 GB host, native Remote Login, dedicated Windows identity, exact ED25519 host fingerprint, and
Tailscale peer path were verified. The apparent Tailscale ACL failure was Mullvad's macOS PF
kill-switch: SYN packets arrived on the Mac `utun` interface but its terminal block rule suppressed
the SYN-ACK. Disconnecting Mullvad with Lockdown off restored native SSH without weakening PF rules.
No VNC, public tunnel, exit node, advertised route, Tailscale SSH, LAN model listener, repository
copy, or production path is required. The remaining evidence step is the private 48-answer
owner-marked calibration set; its answers must not be committed.
