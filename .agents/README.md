# Dungeon tester-agent control plane

Status: `PREPARED_NOT_ACTIVATED`

This directory contains deployable charters and contracts for three project agents:

1. **Learning Signal Auditor** — hourly, read-only interpretation of consented tester events;
2. **Question Bank Steward** — daily or evidence-triggered, quarantined question proposals;
3. **Tester Cohort Steward** — daily participation review, warnings and removal recommendations.

They are deliberately not operating. Three Codex project schedules are registered and verified
`PAUSED`; no run history exists. Their repository declarations remain `enabled: false`, and
`deployment.json` keeps every activation gate false. Running
`npm run agents:check` validates the scaffold; it does not ingest tester data or call a model.
Running `npm run agents:activation-check` must fail until the backend, consent and review gates are
explicitly completed.

## Authority boundary

- Agents may read only consented, pseudonymous events from the future backend adapter.
- Agents may write evidence packets and quarantined proposals only to their declared work roots.
- They may not edit `mock/sets/`, mastery/scheduling logic, `data/state/`, `data/history/`, learner profiles,
  privacy text, production configuration or active access controls.
- No agent may message, suspend or remove a tester without the authority declared in the Cohort
  Steward charter. Initial permanent removals require owner approval.
- Empty, sparse, stale or unverifiable data produces an explicit no-op status, never invented
  findings.

## Activation order

1. Implement and test the versioned backend event endpoint.
2. Add tester-facing consent, withdrawal, retention and deletion paths.
3. Keep identity/contact mapping separate from learning events.
4. Build the owner review queue and access/notification adapters.
5. Validate synthetic events end-to-end.
6. Obtain owner activation approval.
7. After explicit owner activation, set its repository declaration to enabled and unpause the
   Signal Auditor only; observe dry-run reports.
8. Activate the Question and Cohort Stewards after their inputs and review queues are proven.
