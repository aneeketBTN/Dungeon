# Dungeon Coordination Charter

## Authority

- **Owner:** final authority on product scope, art taste, brand identity, economy ethics, player
  experience, and conflict resolutions.
- **Codex lead:** implementation planning, code changes, state modeling, diagnostics, verification,
  documentation maintenance, and issue prioritization within owner-approved scope.
- **Browser:** primary evidence source for local web interaction, layout, keyboard, responsive, and
  animation acceptance.
- **Computer Use:** primary evidence source for Windows desktop and cross-app interaction.
- **Image generation:** proposes or revises bitmap assets after state/acceptance criteria are
  stable; never promotes its own output to approved production art.
- **Learning engine:** `docs/engine/PROMPT.md` and active graphs are the correctness source until the owner
  explicitly changes the learning design.

## Delivery Protocol

1. Plan/source audit.
2. Conflict register and owner decision only where materially blocking.
3. Spec freeze for the coherent slice.
4. Implementation with deviations recorded.
5. Automated/source verification.
6. Real Browser or Computer Use QA by the declared acceptance source.
7. Owner preview for major visible work.
8. Evidence-backed status promotion and close-out.

## Exchange Rules

- Agents/tools publish separately owned timestamped notes under `coordination/exchange/`.
- Never edit another agent/tool's historical message.
- Allowed types: `PROPOSAL`, `REVISION`, `IMPLEMENTATION_NOTE`, `GATE_EVIDENCE`, `CORRECTION`.
- After production-code changes, the implementing party records files, decisions, deviations, and
  verification.
- The living index and ledgers may summarize an exchange; they do not rewrite its historical
  contents.
