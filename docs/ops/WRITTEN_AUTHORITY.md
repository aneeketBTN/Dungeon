# Dungeon written authority — local and website runbook

Status: `IMPLEMENTED` on `codex/measurement-foundation`; local runtime operational;
hosted runtime fail-closed and `WAITING_HOSTED_CORPUS + WAITING_OWNER_CALIBRATION + WAITING_OWNER_DEPLOY`.

Date: 2026-08-13

## What Dungeon can now do

The learner contract is deliberately narrow. BRGSA and IBM receive authored short-form and case
questions for every concept; SPMS and SCLM do not receive prose their papers exclude. Every prompt
has a server-owned rubric, declared lecture IDs, and bounded missing/misunderstood gap codes. Qwen makes one compact criterion judgement; Dungeon
issues a practice mark only when deterministic schema, English-script, citation, and literal
candidate-evidence checks all pass. Uncertainty or any invalid field abstains. The mark is not an IIMB grade and
cannot create Strong evidence. Learners enter through **Practise written answers**, which schedules
four authored prompts, alternates short and case transfer, and preserves teach-before-test. Only
accepted server-owned gap codes enter the corrective pool.

A subject-wide question/answer analyzer still exists in the local tooling for retrieval and model
evaluation. It is not linked from the learner app. The authored Examiner uses the same two-pass
coach only after submission, bound to the question's own rubric and lecture IDs; free-form public
coaching remains unavailable.

Examiner never calls a model while the clock is running. After submission it automatically runs the
ordinary rubric pass, then a larger-budget analyst plus independent verifier. The machine score is
already frozen. Failed bounded criteria can prioritise Dungeon lessons and fresh written re-tests;
passed mock criteria cannot close a gap or create mastery. Narrative review is not saved.

The candidate answer is never part of the retrieval query. It is untrusted material judged *after*
the authority corpus has been selected, so a claim or instruction in the answer cannot choose the
sources that supposedly validate it.

For local authored questions, a 900 ms idle pause asks the Windows server to prepare only the
question's declared course evidence. No partial answer is included. The candidate answer is sent
once, when the learner presses **Check**, which removes transcript loading and retrieval from the
critical path without judging an unfinished draft.

## Local Windows–Mac runtime

LM Studio on the Mac must have both exact IDs loaded:

- generation: `qwen3.6-35b-a3b-claude-4.6-opus-reasoning-distilled`
- retrieval: `text-embedding-nomic-embed-text-v1.5`

Keep LM Studio on `127.0.0.1:1234`, network serving off, and Mullvad disconnected only while the
private SSH session is needed. From the Windows checkout:

```powershell
powershell -ExecutionPolicy Bypass -File tools/start-windows-mac-grader.ps1
```

The launcher checks both exact model IDs, opens Windows `127.0.0.1:12340` to Mac loopback over
`dungeon-mac`, loads the 283-lecture external pack, and starts Dungeon at
`http://127.0.0.1:8099/`. Authored grading retrieves only within each question's declared lectures.
The internal evaluation analyzer can use hybrid lexical + embedding retrieval across a selected
subject. Authored case prompts carry the principle lecture and the applied lecture that supplied
the case; short prompts use understanding and decision-use criteria, while case prompts add specific
case evidence and reasoning. If the
embedding model fails mid-request, the internal result is explicitly marked as a lexical fallback;
model, citation, or output-encoding failure still abstains. Stray CJK/mojibake in
model-authored English triggers one clean regeneration and then fails closed if it recurs.
The Python subprocess and JSON response are explicitly UTF-8; the browser repeats the script check
after transport. The Examiner analyst has a 4,096-token generation budget and the verifier 2,048,
because this reasoning-heavy checkpoint otherwise spends its smaller budget before closing JSON.

## Hosted website architecture

The website uses native Cloudflare bindings; it never calls the Mac:

- Workers AI generation: `@cf/qwen/qwen3-30b-a3b-fp8`
- Workers AI embeddings: `@cf/qwen/qwen3-embedding-0.6b`
- Vectorize: `dungeon-t6-course-rag-v1`, 1,024 dimensions, cosine
- authenticated same-origin Worker routes under `/dungeon/api/written-authority/`
- one D1 counter per tester per UTC day, with no question, answer, retrieved text, or result in that
  table; default maximum 20 checks per learner per day

The committed configuration is intentionally inert:

```text
DUNGEON_HOSTED_WRITTEN=off
DUNGEON_HOSTED_WRITTEN_APPROVED_MODEL=not-approved
DUNGEON_HOSTED_WRITTEN_CORPUS=not-indexed
```

All three activation conditions, the bindings, and a non-empty index must agree. Until then authored
written practice remains available through its transparent rubric/exemplar fallback while the
machine check reports unavailable. Changing the model ID or corpus version withdraws authority
again.

## Prepare the private course index

These commands create paid-account resources and upload the external transcript material. They are
owner actions; do not run them as part of a build or test. Metadata indexes must exist **before**
vectors are inserted.

```powershell
cd cloudflare
npx wrangler vectorize create dungeon-t6-course-rag-v1 --dimensions=1024 --metric=cosine
npx wrangler vectorize create-metadata-index dungeon-t6-course-rag-v1 --propertyName=courseId --type=string
npx wrangler vectorize create-metadata-index dungeon-t6-course-rag-v1 --propertyName=lectureId --type=string
npx wrangler vectorize create-metadata-index dungeon-t6-course-rag-v1 --propertyName=corpusVersion --type=string
```

Create a least-privilege token with Workers AI and Vectorize permissions, place it only in the
terminal environment, and build the ignored NDJSON file:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
$env:CLOUDFLARE_API_TOKEN = "YOUR_TEMPORARY_TOKEN"
cd ..
npm run build:course-rag -- "C:\path\to\Term 6 Clean Transcripts" t6-clean-2026-08-13-v1
cd cloudflare
npx wrangler vectorize insert dungeon-t6-course-rag-v1 --file "..\work\course-rag.t6-clean-2026-08-13-v1.ndjson"
npx wrangler vectorize info dungeon-t6-course-rag-v1
```

The current source pack deterministically produces 3,470 chunks from 283 lectures: BRGSA 989, IBM
722, SCLM 798, and SPMS 961; the longest metadata text is 1,500 characters. The script prints only
counts and paths, never transcript text. The NDJSON stays ignored and must not be committed.

## Calibrate before activation

Local calibration does not transfer to the hosted checkpoint. Run the same 48 owner-marked cases
against the actual Workers AI model and actual Vectorize corpus:

```powershell
npm run evaluate:hosted-grader -- "C:\private\owner-marked-48.jsonl" t6-clean-2026-08-13-v1
```

The provisional gate requires 12 cases per subject, at most 5% false awards, at least 85% exact
cases, at most 30% abstention, and no issued mark on an owner-labelled ambiguous case. These are
product acceptance thresholds, not psychometric validation. The internal subject-wide analyzer may
be evaluated separately as tooling, but it is not an activation dependency because it is not a
learner-facing or public API capability.

Only after the authored-rubric review passes:

1. update the tester agreement and increment `AGREEMENT_VERSION` so every tester explicitly accepts
   hosted AI processing;
2. apply `0005_written_authority.sql` to D1;
3. set the approved exact model, approved corpus version, and hosted flag in a branch;
4. rerun tests, bank/palette gates, Worker dry-run, and real Browser acceptance;
5. open a pull request and let the owner merge—never push or merge `main` directly.

## Cost boundary

At current Cloudflare list pricing, generation is billed per actual input/output tokens and Qwen
embeddings are inexpensive relative to the two generation passes. The 20-check daily per-tester cap
bounds both abuse and spend. Measure real token/Neuron use during hosted calibration before setting
a monthly budget; do not estimate from `max_tokens`, which is a ceiling rather than actual output.

## Verification

```powershell
npm test
npm run build
npm run check:palette
cd cloudflare
npm run check
```

No hosted-resource creation, transcript upload, D1 migration, deployment, or feature activation is
part of those checks.
