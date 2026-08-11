# Evidence

This directory stores the artifacts required to promote work through:

`DIAGNOSED → IMPLEMENTED → VERIFIED(<evidence>) → DONE`

## Layout

Use:

`evidence/YYYY-MM-DD/<task-id-or-short-name>/`

For small documentation/admin tasks, a dated Markdown evidence file directly under the date
directory is acceptable.

## Required metadata

Every evidence note names:

- goal/feature and status transition;
- build/version or changed files;
- environment and viewport when visual;
- test profile/scenario;
- exact reproduction or verification steps;
- expected and observed result;
- artifact paths;
- primary versus secondary evidence;
- remaining gates.

## Acceptance hierarchy

- Web layout/interaction: real Browser capture is primary.
- Windows desktop/app interaction: Computer Use capture is primary.
- Visual asset: in-context capture at intended size is primary; isolated image is secondary.
- Code correctness: relevant automated check plus targeted runtime scenario.
- Learning correctness: deterministic answer/rubric evidence grounded in `PROMPT.md` and the active
  concept graph.
- Persistence: isolated test profile plus before/after state evidence.
- Documentation/admin: file/reference audit and instruction-source verification.

Synthetic, source-only, or local evidence must be labeled secondary and cannot clear a gate whose
declared source is real Browser, Computer Use, owner taste approval, or production data.

## Naming

Prefer descriptive names:

- `fresh-player-desktop.mp4`
- `wrong-answer-state.png`
- `reduced-motion-completion.png`
- `scenario-results.json`
- `admin-system-verification.md`

Do not place real learner data, secrets, credentials, or unredacted personal information in
evidence.
