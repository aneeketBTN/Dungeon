# Tester-agent readiness verification

Date: 2026-08-11
Status: `VERIFIED` as `PREPARED_NOT_ACTIVATED`; three schedules are registered `PAUSED` and no
agent is running.

## Checks

```text
npm run agents:check
node --test tests/agent-readiness.test.mjs
```

Observed scaffold status: healthy and `WAITING_BACKEND`. All three agent declarations have
`enabled: false`, a named automation ID, and `automationStatus: paused`. Synthetic event
fixtures validate; direct name, email, phone, WhatsApp, IP, user-agent, raw-text, and written-
response fields are absent from the contract and rejected when supplied. External actions are
schema-fixed to `proposed-not-executed` and owner approval required.

`npm run agents:activation-check` is expected to exit nonzero until every backend, consent,
pseudonymous mapping, retention/deletion, reviewer, adapter, synthetic acceptance, and owner-
activation gate is true. That failure is the safety property, not a deployment defect.

## Registered paused schedules

- `dungeon-learning-signal-auditor` — GPT-5.6 Terra, medium reasoning, intended hourly cadence;
- `dungeon-question-bank-steward` — GPT-5.6 Sol, high reasoning, intended daily cadence;
- `dungeon-tester-cohort-steward` — GPT-5.6 Terra, medium reasoning, intended daily cadence.

The create calls requested paused status, but direct inspection found the first persisted TOML
definitions set to `ACTIVE`. Each existing automation was immediately updated to `PAUSED` and
re-read. No scheduled interval elapsed and the automation directory contains no run output. This
discovery is recorded in `BUG-LAWS.md` LAW-29.

No production learner data was read and no external action was sent. The app still sends no
learning events to a server, as stated in `PRIVACY.md`.
