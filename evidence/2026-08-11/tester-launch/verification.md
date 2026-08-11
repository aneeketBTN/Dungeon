# Controlled tester launch verification

Date: 2026-08-11  
Status: `VERIFIED` for the local release boundary, worker behavior, generic-practice interaction,
constructed self-review, held-feedback results, and desktop/narrow Browser paths described here.
The owner-only production deployment, GitHub repository, WhatsApp community, and public access are
tracked separately below and do not become verified merely from local evidence.

## Scope

- A dependency-free build publishes only the active T6 learner route and its three embedded banks.
- The production worker redirects `/` to the canonical document, exposes `/health`, serves assets,
  and adds security and cache headers.
- Progress remains in browser local storage; there are no accounts, analytics, advertising
  trackers, or server-side learner records.
- Generic practice offers recognition, application, generation, and mixed shapes with immediate
  teaching or feedback held until results.
- Each of 64 concepts has a constructed-response surface. Learners write before seeing a rubric
  and exemplar; self-review is unscored and cannot independently create Strong evidence.
- Tester, privacy, security, and community operating documents define the controlled cohort.

## Secondary automated evidence

Commands used the bundled Node runtime and all exited 0:

```text
node --check mock/t6.js
node --check mock/sets/t6_brgsa.js
node --check mock/sets/t6_catalog.js
node --check mock/sets/t6_challenges.js
node mock/validate_t6_bank.js "C:\Users\knigh\OneDrive\Desktop\exam\Term 6 AI-Ready Pack"
node scripts/build-site.mjs
node --test tests/site-release.test.mjs
```

Validator result: zero errors and zero warnings.

| Course | Total tagged | Constructed | Boss | Quarantined MCQ | Active |
| --- | ---: | ---: | ---: | ---: | ---: |
| BRGSA | 188 | 16 | 40 | 37 | 151 |
| IBM | 180 | 16 | 40 | 40 | 140 |
| SCLM | 180 | 16 | 40 | 43 | 137 |
| SPMS | 180 | 16 | 40 | 43 | 137 |
| **Total** | **728** | **64** | **160** | **163** | **565** |

The four release tests verified:

1. `/` redirects to `/mock/t6.html`;
2. `/health` reports service health and browser-local storage;
3. HTML, worker, and asset responses carry their intended security/cache policy;
4. the artifact contains exactly the six allowlisted active assets and no `state/`, `history/`,
   CLA analysis, transfer material, source pack, community invite, secret, or unrelated prototype.

## Primary real-Browser observations

Canonical route: `http://127.0.0.1:8099/mock/t6.html`  
Browser: signed-in Codex in-app Browser  
Desktop viewport: 928 CSS pixels wide  
Narrow viewport: 390 × 844 CSS pixels  
Profile: isolated browser-local T6 profile; no `state/` or `history/` fixture was used.

- The generic setup dialog opened from the dashboard, and every selected shape and feedback mode
  changed the resulting practice title, pool, controls, and feedback timing.
- Learning + generation reached a short-answer question. The response field required meaningful
  text before review; the rubric appeared only after writing; selecting a criterion and comparing
  with the exemplar produced explicit “self-review, not automatic grade” feedback.
- Practice check + recognition completed 12 items. Each save showed only “Answer saved”; no
  correctness, explanation, or answer styling appeared before the end. Results contained 12
  complete answer-review entries.
- Practice check + generation saved a written response with the `Save response` action. Neither
  rubric nor exemplar appeared after save. At results, five written-response review entries showed
  the learner copy, complete rubric, exemplar, and explicit unscored status. Only the three scored
  questions contributed to the displayed score.
- At 390 × 844, the response field, saved state, feedback, results, and expanded answer reviews had
  no horizontal overflow. Document width was 375 at an inner width of 390; review articles were
  341 pixels wide.
- Browser developer warnings and errors were empty after the final learning and held-feedback
  paths.

The active in-app Browser runtime did not expose screenshot capture, so this evidence records exact
instrumented Browser state and dimensions but no PNG. A later production-URL acceptance pass should
capture visual artifacts when that runtime is available.

## External launch controls

- Sites project `appgprj_6a7ae01a2c6481918c77e6842be2003a` is provisioned and bound in
  `.openai/hosting.json`; deployment status and URL will be appended after the owner-only deploy.
- A private repository named `Dungeon` is staged under the authenticated GitHub account
  `aneeketBTN`; it has not been created without the owner's action-time confirmation.
- A WhatsApp community named `Dungeon Testers` is staged in the owner's linked WhatsApp account;
  it has not been created, no participants have been invited, and no messages have been sent
  without the owner's action-time confirmation.
- Public Sites access remains disabled until the owner explicitly approves it or supplies an
  external tester email allowlist.

## Remaining gates

- `WAITING_OWNER_EXAM_PATTERN`: no exact final-paper blueprint is indexed.
- `WAITING_OWNER_CONTENT_ACCEPTANCE`: transcript-derived questions, constructed prompts, rubrics,
  and exemplars still need faculty/owner acceptance.
- Public cohort access, external account creation, and invitations remain owner-confirmed actions.
- No checked-in automated interaction suite covers all 40 study sets.
