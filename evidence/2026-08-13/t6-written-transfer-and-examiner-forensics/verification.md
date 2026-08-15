# Written transfer and post-submit Examiner forensics — verification

Date: 2026-08-13  
Branch: `codex/measurement-foundation`  
Status: `VERIFIED(REAL_BROWSER + REAL_MAC_MODEL + AUTOMATED)` for the branch-local Learn and
post-submit Examiner paths.  
Open gates: `WAITING_OWNER_CONTENT_ACCEPTANCE + WAITING_OWNER_CALIBRATION +
WAITING_HOSTED_CORPUS + WAITING_OWNER_CONSENT + WAITING_OWNER_DEPLOY`.

Nothing was committed, pushed, merged, or deployed. No Cloudflare resource, D1 database, live
tester state, or production feature flag was changed.

## Product contract verified

- BRGSA and IBM each have 16 short explanations plus 16 case answers: one of each per concept.
- SCLM and SPMS do not receive invented written formats. Their current papers use numerical,
  matching, MCQ, and MSQ surfaces instead.
- Every authored written prompt owns a bounded taxonomy of missing and misunderstood answer gaps.
  Qwen may select only those gap codes; it cannot invent a durable learner diagnosis.
- Learn chooses weak or fresh concepts first, alternates short and case transfer, teaches an exact
  accepted gap, and schedules a different authored surface for confirmation.
- A Learn-side accepted success reduces only the matching open confirmation. It never creates
  Strong evidence.
- Examiner sends no model request and gives no feedback while the clock is running. After submit,
  machine scoring is frozen and written answers remain outside the official-looking machine total.
- Examiner then runs a slower two-stage review against the authored question, rubric, and declared
  lectures: bounded criterion coverage first, followed by an analyst/verifier coaching pass.
- Only accepted `not_met` criteria open or reinforce revision gaps. A successful mock criterion
  closes nothing, because one timed answer is diagnostic rather than proof of repair.
- Exact gap codes feed `examMisses`, the four-concept repair sitting, and Learn's recommended route.
  Candidate/model narrative is not copied into the durable revision profile.

## Real Qwen and Browser

Local authority health at verification time:

```json
{
  "available": true,
  "provider": "local-lm-studio",
  "model": "qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled",
  "embeddingModel": "text-embedding-nomic-embed-text-v1.5",
  "lectureCount": 283,
  "capabilities": ["rubric-mark", "subject-coach"]
}
```

The real BRGSA Examiner scenario was submitted in the app Browser. The first compact rubric pass
accepted 3 of 3 requirements. The deeper analyst/verifier pass then rendered:

- a non-official `3 of 3 rubric requirements evidenced` statement;
- a course-grounded answer summary;
- three strengths tied to literal candidate evidence;
- three bounded improvements;
- a stronger answer ending in complete punctuation;
- compact `BRGSA M1` source tags.

The full post-submit sequence completed in roughly 90 seconds. The compact mark took about 24
seconds and the final deeper coach about 54 seconds; it is intentionally not an in-answer latency
path. The result screen had 0 horizontal overflow at 1280×720, its 820px review card was centred,
and no model feedback appeared before submission.

A real pass exposed three defects and the final pass includes their fixes:

1. A 1,800-token coach budget ended at `finish_reason: length` before valid JSON. The analyst and
   verifier now receive 4,096 and 2,048 tokens respectively, schema output stays bounded to three
   strengths and three improvements, and incomplete prose is rejected.
2. Windows Python decoded Node's UTF-8 output using the system code page, changing an em dash into
   visible mojibake after the model-side script check. The subprocess and JSON response now declare
   UTF-8 explicitly, and the browser repeats the unexpected-script guard before rendering.
3. An accepted strength used a valid supplied chunk that Qwen omitted from its separate top-level
   citation list. Server validation accepted the nested citation while the browser correctly
   withheld the inconsistent envelope. Accepted point-level citations are now canonicalised into
   the top-level list before the response leaves the authority.

The deterministic `?scenario=written-repair` Browser path also proved the Learn handoff:

1. an accepted 0 of 2 result named `Course idea not explained` and `Decision use is missing`;
2. Continue opened an unscored `Repair:` intervention with one authored repair per exact gap;
3. teach-before-test inserted the two unread cited lessons;
4. the next authored surface was a fresh case labelled `Dungeon is re-checking` with both exact
   gaps visible;
5. horizontal overflow was 0 and no visible active-screen target was under 44px at 1280×720.

The executable rendered-page probe is `tools/browser-checks/written-adaptation.js`.

## Automated and source gates

```text
npm test
63 tests, 63 pass, 0 fail

node tools/build-site.mjs
Prepared 16 public assets and the production worker.

npm run build:written-authority
Prepared 64 rubric-marked questions for the hosted authority.
BRGSA 32; IBM 32; questions without gap taxonomy 0.

node tools/validate_t6_bank.js "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"
ok: true; 748 scheduled questions fully taught; 0 errors.
BRGSA 32 constructed responses; IBM 32; SCLM 0; SPMS 0.

node tools/check_lesson_file.mjs "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"
ok: true; 0 errors.

node tools/check-palette.mjs
All required pairings within tolerance in both themes; all four evidence states shape-distinct.

node --check app/t6.js
node --check app/sets/t6_challenges.js
node --check tools/local-grader.mjs
node --check tools/lib/written_authority.mjs
node --check cloudflare/src/written-authority.mjs
pass

git diff --check
pass
```

The bank validator retains the pre-existing IBM option-rank warning. `npm run check:exam` retains
the pre-existing SCLM gap: Section B has 4 of 6 numerical questions, leaving 8 marks unavailable,
plus the existing SCLM prompt-repetition warnings. BRGSA Section C and IBM Section A now both have
32 authored written questions and pass their volume checks. This work does not disguise or waive
the SCLM failure.

## Release boundary

The hosted code is present but still fail-closed. Public coaching requires a server-owned
`questionId`; the arbitrary free-form analyzer remains local/internal only. Hosted activation still
requires the private corpus, exact hosted-model calibration, owner-approved consent/agreement
changes, a quota decision for multi-answer papers, a signed-in live Browser pass, and owner merge.
Local M4 Pro results do not validate a different hosted checkpoint.
