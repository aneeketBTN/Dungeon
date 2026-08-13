# Dungeon — measurement and machine-judgement direction

Status: active direction; measurement foundation, authored written-response authority, internal
subject-wide evaluation tooling, and fail-closed hosted runtime implemented on `codex/measurement-foundation`;
local exact checkpoint operational; local and hosted owner-marked calibration waiting

Date: 2026-08-13

Source: owner-supplied research brief, [Dungeon — from self-report to measurement](https://claude.ai/code/artifact/e76a78e3-217b-4696-9ec6-e51432f6b620), reconciled with the current technical overview, evidence contract, privacy boundary, and live-cohort constraints.

## The direction

Dungeon moves from an authored rule set toward measured learning without pretending that eight
testers constitute a calibrated psychometric sample. The near-term job is to collect better
evidence safely, expose uncertainty, and make the existing Strong decision harder to fool. The
long-term job is to validate or replace authored thresholds from genuine use.

## Build now

1. **Response latency as a Strong-eligibility signal.** Start a monotonic clock when a scored
   retrieval surface is rendered and compute elapsed time when the response is committed. Persist only
   a coarse duration band and the derived `rapidGuess` / `strongEligible` flags; never persist raw
   milliseconds. A provisional rapid-response threshold is 10% of authored expected time, clamped
   to 3–10 seconds until empirical item/format means exist.
2. **Never invalidate an answer from speed.** A rapid response keeps its correctness, feedback,
   misconception, and scheduling effect. It cannot by itself contribute Strong evidence or erase
   Strong evidence already established by eligible attempts. Slowness is never penalised, labelled,
   or interpreted as low ability.
3. **Confidence calibration from existing attempts.** Preserve the existing minimum of 20 sampled
   judgments across three blocks and two formats before any aggregate language. Add a curve only
   when its points and sample sizes can be shown without turning verbal anchors into fake
   probabilities.
4. **Retention forecast as an honest scheduling aid.** Forecast a review window from the learner's
   own retrieval history, with wide uncertainty and no score prediction. This remains
   `DIAGNOSED`, not implemented in the first slice.
5. **Read-only D1 audit.** Count usable attempts, format coverage, duration-band completeness, and
   per-item sample sizes before proposing item calibration. At `n < 8`, report cases, never rates;
   at this cohort size, defect detection is plausible and psychometric calibration is not.

## Build before the 22–23 August papers, after owner decisions

- A short post-exam debrief instrument must be drafted before 22 August, but collecting its data is
  `WAITING_OWNER_DECISION`: purpose, consent scope, retention, deletion, identity treatment, and
  whether it belongs to the examiner scope must be decided first.
- Confident-error repair should be spaced and independently re-probed. It must retain the current
  two-family / two-block closure rule and never punish the confidence choice.
- Reason-first prompts can hide options until a learner states a reason, but they add friction and
  must not enter timed mocks or become universal before browser testing.

## Machine judgement

The recommended written-work path is comparative and criterion-level, not one holistic number:

1. deterministic course-vocabulary and required-term checks;
2. embeddings for routing or retrieval only, never scoring;
3. one binary decision per rubric criterion, with abstention and conservative awards;
4. comparative placement against thin, partial, and strong reviewed anchors.

Owner decision (2026-08-13): Qwen may issue Dungeon's authoritative **local practice rubric mark**
for a written response. This means Dungeon may say which visible criteria were met and route a
missing criterion back into practice. It does not mean an official IIMB grade, an exam-score
prediction, or Strong evidence.

Owner decision (2026-08-13, confirmed): the installed checkpoint
`qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled` is Dungeon's exact local practice authority.
That identifier is reported verbatim by LM Studio and must not be relabelled as an official base
checkpoint. It is operational on the M4 Pro Mac with an 8192-token context and has completed a
real-model smoke set. Approval of this exact checkpoint does not waive the separate owner-marked
calibration gate.

The authored-question authority contract is narrower than “ask the model”:

1. retrieval is confined to the exact lecture IDs already declared on the question;
2. the candidate answer is untrusted data, never an instruction;
3. one compact pass marks each criterion; repeated calls to the same checkpoint are an audit and
   calibration option, not independent authority and not part of the everyday answer path;
4. a decision is accepted only when it quotes text actually present in the answer for an awarded
   criterion and cites a chunk that the server really retrieved;
5. any disagreement, malformed output, invented citation, unavailable source, timeout, or model
   failure becomes an abstention and the transparent self-review path appears;
6. any accepted missing criterion inserts a deterministic, unscored writing repair immediately,
   tags the next fresh authored prompt as a transfer check, and schedules a different question on
   the affected course concept later in the run;
7. each missing criterion must select one or two server-owned gap codes, so Dungeon distinguishes
   an omitted move from a misunderstood course idea without saving model prose as learner state;
8. criterion outcomes and bounded gap codes are saved in a separate written-practice profile. A miss opens two fresh
   confirmations; each later accepted success closes one. This changes Dungeon's recommendation and
   written-prompt order, but never concept mastery;
9. the answer attempt remains `scored:false` in the learning-evidence model, so it cannot create Strong.
10. the local HTTP authority remains absent until an owner-set approved model ID exactly matches the
   configured model ID; changing checkpoints withdraws authority until the new exact ID is
   explicitly approved. Its quality status remains waiting until that checkpoint is separately
   calibrated.

The same evidence boundary supports a slower two-pass coach. Free-form owner evaluation still
retrieves within one subject and never invents a numeric mark. For a Dungeon-authored Examiner
question after submission, the coach instead binds to the server-owned question, rubric, and exact
lecture IDs. It returns grounded strengths, improvements, citations, and a stronger answer only
after a separate verification pass. Its prose is page-lifetime; only accepted bounded rubric gaps
change the corrective pool.

Written format follows the paper contract. BRGSA and IBM each have a short framework response and a
case response for all sixteen concepts. SPMS and SCLM do not receive an invented prose path; their
application practice remains MSQ, numerical, matching, case-cloze, and other paper-aligned formats.

The local deterministic engine, server boundary, hybrid retrieval, schema, and UI plumbing are
implemented, and the exact approved checkpoint plus embedding model run on the Mac. Real-model
Browser and synthetic smoke evidence prove the operating path, not marking validity. Answer
quality remains `WAITING_LOCAL_MODEL_CALIBRATION` until 48 owner-marked thin, partial, strong,
adversarial and ambiguous authored-question answers have been reviewed. The internal analyzer may
be evaluated separately, but it is not a learner-product activation gate.

## Two-machine architecture

- **Windows:** remains the authoritative checkout, local Dungeon server, Browser path, transcript
  source, and evaluation workstation. `tools/start-windows-mac-grader.ps1` opens a private SSH
  loopback forward from Windows `127.0.0.1:12340` to Mac `127.0.0.1:1234`, verifies the exact model
  identifier, enables the guarded grader, and launches the local site. Branch and PR workflow only;
  `main` remains the live deploy trigger.
- **Mac local model:** LM Studio exposes the exact owner-selected checkpoint on loopback only. The
  encrypted SSH path does not advertise routes, enable an exit node, use Tailscale SSH, expose a
  public port, or require a second repository checkout. Dungeon retrieves question-bound chunks
  from the Windows transcript pack, prepares question-only evidence after an idle pause, sends the
  answer only on Check, runs one compact structured judgement, validates its schema, citations and
  literal answer evidence, and returns a bounded rubric result. It
  receives no live tester data and is never reachable from the public site.
- **Production:** the live inference implementation now exists behind the authenticated Cloudflare
  Worker using native Workers AI, Qwen embeddings, and a filtered Vectorize course index. It uses
  the shared compact-judgement plus deterministic validation contract, a 16 KiB request ceiling, same-origin enforcement, a
  20-check per-user daily quota, abstention, and the existing non-AI fallback. Candidate content is
  not logged by the Worker or stored by the written-authority endpoint. The browser never calls the
  Mac or a model vendor directly. The committed feature flag, model approval, and corpus approval
  deliberately fail closed; index creation, hosted calibration, updated consent, D1 migration,
  real-Browser acceptance, owner merge, and deployment remain waiting.

## Explicit non-goals

- leaderboards, streaks, or time-on-task rewards;
- inferring ability, confidence, or motivation from speed;
- holistic 1–5 written grades;
- a permanent learner-ability label from a small written sample; Dungeon reports only the open
  writing move and the observed confirmation count;
- pass probabilities or calibrated difficulty claims from this cohort;
- silent telemetry transmission;
- making a laptop a production dependency.

## Decisions still owned by Aneeket

1. May machine judgement ever contribute Strong? Current decision: **no**; changing this requires a
   new explicit decision plus calibrated reviewed evidence.
2. Is the post-exam debrief collected, under which separate consent scope and retention period?
3. Complete and review the 48-answer owner-marked calibration set for
   `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled`. The checkpoint decision is resolved;
   changing it withdraws authority until that new exact identifier is separately approved and
   calibrated.
4. Review the slow Examiner coach on a representative adversarial set; keep free-form analysis
   unlinked, while authored post-submit coaching remains question-ID and lecture-bound.
5. Approve the hosted exact checkpoint and corpus only after the separate Workers AI calibration;
   local checkpoint evidence cannot be reused as hosted-model evidence.
