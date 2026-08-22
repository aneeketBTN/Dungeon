# IBM/SCLM exam priority, Study PDF, mock launch, and owner auth verification

Date: 2026-08-22
Branch: `codex/notes-primary-chambers`
Deployment state: local only; no production publish performed.

## Scope

- Make IBM and SCLM the active Examiner priorities while retaining BRGSA as hidden reference.
- Replace the permanent Study course card with an eased hover/focus navigator.
- Offer a module PDF action at the top and bottom, plus one-lecture PDF actions.
- Give print/PDF its own aligned A4 layout and visually inspect representative output.
- Repair inert mock cards and re-author IBM/SCLM mocks toward the observed direct exam level.
- Fix the owner authentication timeout/reload loop without weakening the Access boundary.

## Study UI and printing

- Desktop navigator: 64px resting rail, 270px expanded width, 280ms
  `cubic-bezier(.22,1,.36,1)` reveal. Keyboard `:focus-within` receives the same state; reduced
  motion removes transitions. At 720px and below the navigator is complete and static.
- The top `Download this module (PDF)` action remains beside the reader identity. The same action
  returns after the module navigation. Each lecture title includes a 44px download icon with an
  explicit accessible label.
- Module and lecture printing render separate document scopes and temporarily set a descriptive
  document title for the browser's Save as PDF filename.
- A4 print rules use 15/16/18mm margins, 9.5pt body copy, aligned glossary columns, controlled
  heading/page breaks and expanded worked-answer reasoning. Interactive controls, the skip link,
  module chamber, navigation rail, shadows and download buttons are removed.

### Visual PDF pass

Chromium generated the exact production print markup for IBM module 1 and `IBM-M01-L01`. Every page
was rasterised and inspected after each meaningful print-CSS revision.

- First pass exposed a skip-link chip on every page, a released-case action stranded on its own
  page, and repeated large blank areas caused by forcing each lecture onto a new page.
- Second pass removed all interactive artifacts and let long lectures flow naturally. Module 1
  fell from 21 to 13 pages without reducing content.
- Final pass kept lecture metadata, title and objective together. Result: module 1 = 13 A4 pages;
  lecture 1 = 2 A4 pages; zero clipped text, overlaps, isolated headings, blank action pages or
  unreadable glossary rows.

## Examiner repair

- `EXAM_HOME_ORDER` is IBM, SCLM, SPMS. BRGSA pattern and writing blocks remain hidden.
- One delegated click listener on `#exam-papers` owns every current and future paper card. The old
  per-render button listeners are removed. A null/empty paper produces a toast rather than a dead
  click.
- Every SCLM numeric question now has `caselet = authored scenario` and
  `stem = prompt = authored calculation task`; all 8 numeric items satisfy the distinction.
- IBM case questions explicitly name the framework and ask for decision first, one case fact and
  its causal justification in one paragraph.
- IBM numbered papers use 2 integrated + 8 direct framework cases. Direct cases spread across all
  eight modules before seeded backfill. The deterministic cycle remains 7 sets and reaches all
  65 written-relevant records.

## Owner authentication repair

- Root cause: `createRemoteJWKSet()` started empty on every protected request. The admin document,
  assets and APIs could each block on the Access certificate endpoint; a later reload benefited
  from warmed upstream state.
- The Worker keeps only jose's serialisable public JWKS data in a bounded, origin-keyed map. Every
  request creates its own resolver, so in-flight I/O, JWTs and request state are never shared.
- A generated RS256 key pair and signed Access-style JWT exercise the real verifier. Two owner
  requests fetch `/cdn-cgi/access/certs` exactly once and both validate the owner payload.

## Gates

- `npm test`: **159/159 PASS**.
- `npm run build`: **24 public assets**.
- `npm run check:exam`: **0 errors / 0 warnings**.
- `npm run check:mini-mocks`: PASS.
- `npm run check:final-sprints`: PASS.
- `npm run check:revision-personas`: PASS.
- `npm run check:palette`: all required pairings and four state silhouettes PASS in both themes.
- `node --test tests/preparedness-fixes.test.mjs tests/integrated-scenarios.test.mjs`: **17/17 PASS**;
  every IBM paper retains eight modules and the seven-paper cycle reaches 65/65.
- `cloudflare/node_modules/.bin/wrangler --version`: **4.120.1**.
- `npm run check` in `cloudflare/`: authenticated Wrangler dry run PASS; 28 static deployment
  assets read, D1/AI/assets/variables recognized, no upload performed.
