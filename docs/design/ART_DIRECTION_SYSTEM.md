# Dungeon — Product Art System

Status: proposed production extension to `docs/design/ART_DIRECTION.md`

This file does not replace the existing creative thesis. It translates that thesis into a
repeatable visual language for every product surface from preload to post-run dashboard.

## Canonical decision

The target production style is **crisp, graphic, painterly 2D**. Existing pixel-like Door
assets are identity, composition, layering, and motion references—not the final rendering
standard. Until this is changed deliberately, new production assets should not introduce a
visible pixel grid.

## The experience promise

Every screen should make the player feel one of four connected beats:

1. **Called** — the Door, path, or next useful action is visible.
2. **Prepared** — the player understands the run and can make one meaningful choice.
3. **Tested** — answers visibly affect Ari and the world without obscuring the learning.
4. **Changed** — the run ends with an earned visual consequence and a useful next step.

The world supplies emotion. The interface supplies certainty.

## Identity anchors

- Ari is visually small relative to the challenge.
- Saffron represents player agency, selection, earned progress, and equipped cosmetics.
- Cyan represents insight, rules, guidance, and active Dungeon magic.
- Hostile coral represents an incorrect path, damage, and warnings.
- Pale ivory/amber represents completion and possibility beyond a Door.
- Near-black indigo, bruised violet, moss, and muted teal form the environment.
- Ruin, roots, fog, timber, stone, brass, paper, and cloth are the material vocabulary.
- Shapes are asymmetric, silhouettes are readable, and detail is concentrated around meaning.

## Product-wide visual grammar

### Color roles

| Role | Color family | Use |
|---|---|---|
| Player action | Saffron | Primary CTA, selection, equipped item, earned progress |
| Guidance | Cyan | Hint, focus response, active path, system explanation |
| Success | Saffron + ivory | Correct answer, secured step, quest completion |
| Partial | Cyan + saffron | Developing answer, assisted success, partial progress |
| Error | Hostile coral | Incorrect answer, lost Resolve, destructive confirmation |
| World | Indigo / violet / moss / teal | Backgrounds, navigation zones, atmosphere |
| Reading | Ink + parchment ivory | Questions, explanations, dashboards, market details |

Never rely on color alone. Pair each state with a symbol, short label, shape change, and
appropriate motion.

### Surface hierarchy

1. **Cinematic surface** — homepage, Door entry, boss arrival, run completion, failure.
2. **World surface** — Hall, chapter map, Ari’s climb, market stall.
3. **Reading surface** — question, explanation, rubric, response review.
4. **Utility surface** — settings, resource details, filters, accessibility controls.

Cinematic and world surfaces may be atmospheric. Reading and utility surfaces must favor
clarity, stable layout, and high contrast.

### UI materials

- Reading panels: warm parchment-dark or parchment-light with an ink contour.
- World controls: carved plaques, stitched cloth tabs, or cut-paper shapes.
- Currency and power-ups: small brass, glass, paper, or thread objects with strong silhouettes.
- Avoid glassmorphism, glossy mobile-game gradients, generic neon HUD frames, and ornate borders
  around long-form reading.

### Button hierarchy

- One primary action per decision area.
- Primary: saffron fill or saffron edge with the clearest verb.
- Secondary: parchment/ink treatment.
- Tertiary: text action for back, details, skip, and non-destructive utilities.
- Destructive: hostile coral, always with explicit consequence.
- Locked: visibly locked before interaction and paired with a reason and unlock path.
- Loading: preserve width, replace the trailing icon, and block duplicate activation.

Buttons describe the outcome: `Enter the Transmission Stair`, `Use Insight`, `Review 2 weak
concepts`, not generic `Continue` where a more meaningful label fits.

## Character system

Ari is the canonical first character. Additional explorers may change silhouette accents,
cloth, satchel, and animation personality, but not learning advantages.

Required base states:

- idle front;
- idle back;
- walk toward Door;
- climb;
- correct/secure;
- partial/recover;
- incorrect/stumble;
- Resolve lost;
- power-up use;
- quest completed;
- summit/finish;
- failure/recenter;
- market preview turn.

Cosmetics should attach to declared slots (`scarf`, `coat`, `satchel`, `trail`, `Door mark`) and
have a thumbnail, equipped preview, world-scale preview, reduced-motion fallback, and ownership
state. Cosmetics never reduce question readability or encode power.

## Motion language

| Event | Intent | Typical duration |
|---|---|---|
| Hover/focus | Acknowledge | 120–180 ms |
| Menu/selection response | Connect choice to world | 180–300 ms |
| Correct answer | Secure a step, then settle | 550–850 ms |
| Partial answer | Advance cautiously, unresolved edge | 450–700 ms |
| Incorrect answer | Fracture/stumble, then recover posture | 400–650 ms |
| Power-up | Object → target → visible effect | 650–1,100 ms |
| Door transition | Commit and cross threshold | 800–1,400 ms |
| Run completion | Earned authored beat | 1,800–3,000 ms, skippable |

Motion rules:

- Feedback text appears immediately; animation enriches it and never delays understanding.
- Correct, partial, and incorrect outcomes have different silhouettes and sound/motion rhythms.
- Ari only climbs when progress is awarded.
- Camera movement is reserved for transitions and completion.
- Input is locked only while a transition would produce duplicate state changes.
- Reduced motion removes camera, parallax, shake, and looping character motion while retaining
  opacity, light, text, and final-state changes.

## Screen-specific direction

### Preload

- Show only when loading is perceptible.
- Door seam forms as assets become ready; do not fake a slow progress bar.
- If loading exceeds a threshold, show a plain status and retry/offline path.

### Homepage

- Use “The Door Above” composition from `docs/design/ART_DIRECTION.md`.
- The first useful action owns the highest contrast.
- Returning players see `Continue`; new players see `Enter the Dungeon`.
- Market, Archive, and Settings remain discoverable but subordinate.

### Character select

- Frame selection as choosing who enters, not choosing statistical classes.
- Show one strong idle animation and one world-scale preview.
- Do not call assets placeholders in player-facing copy.

### Market

- The market is an optional place in the world, not a mandatory onboarding step.
- First visit teaches preview → price → purchase → equip.
- Unaffordable items remain previewable.
- Purchase success visibly moves the item to Ari and updates balance in one beat.
- No false scarcity, randomized purchase, or learning advantage.

### Subject and chapter selection

- Subjects are major Doors/realms; chapters are routes or floors within them.
- Every card answers: what is this, how ready am I, how long will it take, and why is it suggested?
- Locked content explains the requirement before activation.
- Selection changes both UI text and the depicted world/route.

### Run

- Question content is always the highest-contrast reading object.
- Ari’s climb is a persistent peripheral reward, not a competing information panel.
- Quest progress appears at run start, on relevant change, and on completion—not as constant noise.
- Power-ups show quantity, effect, and consequence before use.

### Correct, partial, and incorrect feedback

- Outcome label appears immediately beside the answer.
- Explain why, not merely which option.
- Correct: Ari secures the next step; path light holds.
- Partial: Ari reaches a ledge or braces; the UI says what was present and what was missing.
- Incorrect: the current step fractures; Ari stumbles but does not advance.
- After feedback, the next action is predictable and placed consistently.

### Completion

- The final answer resolves before the summit sequence starts.
- Ari reaches/opens the Door; accumulated run effects briefly return in the environment.
- The sequence lands on one memorable earned frame, then reveals results.
- It is skippable and has a reduced-motion version.

### Dashboard

- Use restrained parchment and ink over a quiet world background.
- Lead with the next useful action, not the score.
- Show learning evidence before vanity statistics.
- Recommended metrics:
  - secure / developing / missed;
  - strongest and weakest concepts;
  - unassisted versus assisted accuracy;
  - response-time outliers only when actionable;
  - Resolve and quest outcomes;
  - exact review of each response;
  - recommended next chapter/run and why.
- Do not foreground “focus changes” unless the player opted into attention tracking and the result
  changes a recommendation.

## Asset acceptance gate

An asset is production-ready only when it:

1. matches the canonical rendering style and color roles;
2. reads at its actual in-game size;
3. has all required interaction states;
4. survives grayscale and color-vision checks;
5. has a reduced-motion or static fallback when animated;
6. exports with declared dimensions, safe area, transparency, and naming;
7. is tested in its real screen rather than approved in isolation.

## Drift checks

Reject or revise work that:

- reintroduces uniform pixel rendering;
- makes Ari cute, dominant, or larger than the journey;
- uses cyan and saffron as decoration rather than meaning;
- makes incorrect feedback celebratory;
- lets UI ornament compete with question reading;
- introduces a new frame, icon family, texture, or animation rhythm for a single screen;
- copies recognizable creature, card, frame, or typography design from another game.
