# Verification — final revision, released IBM case, subject fold, and access controls

Date: 2026-08-22

Source branch: `fix/theme-switch-and-login-theming`

Release state: merged to `main` and first deployed from `2a50196` on 2026-08-22 as Cloudflare
Worker version `30a8ff04-9161-418c-bb59-6ae9f5aba26a`. The Cloudflare rate-rule exclusion and
remote D1 migrations 0005–0008 are live.

## What is implemented

- Examiner has three explicit modes by distance to the exam: Full mocks (1+ week out), Speedrun
  (within a week), and Minis (last 25–30 minutes). Speedruns no longer live inside full-mock cards.
- `app/sets/t6_final_sprints.js` authors 32 retrieval prompts: four subjects × eight modules, with
  answer spines, near-miss checks, and subject traps.
- `app/sets/t6_ibm_case.js` keeps the released prompt verbatim and adds one assumption-led inclusive
  model plus ten complete, examiner-only written questions. Released-case questions are excluded
  from numbered papers and Learn scheduling.
- Quick Notes carries the released case, assumptions, model mechanics, answer shape, and ten lenses.
- The full subject cards fold into a compact, sticky, clearly selected rail after first selection;
  GSAP provides the transition and `prefers-reduced-motion` provides an immediate fallback.
- Login/session handling allows concurrent devices and country changes. Personal access and one
  active browser remain terms. Admin retains sign-out/revoke but no lock/unlock control.
- The production Cloudflare rate-limit rule excludes `/dungeon/admin` and descendants from the
  learner burst rule. Verified expression:
  `http.host eq "aneeketdas.com" and starts_with(http.request.uri.path, "/dungeon") and not (http.request.uri.path eq "/dungeon/admin" or starts_with(http.request.uri.path, "/dungeon/admin/"))`.

## Defects the loop found and repaired

1. The released case initially entered ordinary numbered IBM selection; every mirrored `examPool`
   now excludes `releasedCase`.
2. The released-paper builder treated the object-backed bank as an array and produced an empty
   paper; it now unwraps each object/group and verifies 10/10 questions.
3. The floating Speedrun action reappeared over Minis and Full mocks; mode switching now owns
   its visibility.
4. Two released-case questions linked IBM concepts classified objective-only; the validator caught
   and removed those written-surface links.
5. A phrase in question 4 used an unintroduced time comparison; LAW-61 caught and repaired it.
6. The official IBM Mini capture showed SPMS, and the Released case capture stopped on the paper
   chooser. Direct deterministic scenarios and explicit subject assertions now make the screenshot
   evidence truthful.
7. Released-paper readiness reported the whole 65-concept numbered pool rather than the 29 concepts
   on that fixed paper. Set-specific readiness now derives from the selected paper only.
8. Readiness said `Learn run 1 of 8` while the product shows a nine-run path. It now points to the
   same `courseRunPath` used by Learn.
9. A parallel gate run collided with a test fixture temporarily raising a syllabus floor to 101%;
   final gates were rerun serially and passed at the committed 100% floors.
10. The Worker dry run rebuilt a 245-question hosted written bank against an old frozen evidence
    pack. Rebuilding with the clean-transcript source froze 1,462 in-boundary chunks for all 245
    questions; the hosted-authority contract then passed.
11. IBM Speedrun written answers opened a second self-marking rubric, silently doubling the intended
    interaction. They now submit once and reveal a 40–85-word case-grounded answer spine without
    grading or creating Strong evidence. Visual inspection then rejected a first, generic spine and
    replaced it with concrete sentences from the question exemplar.

## Verification results

- `npm test` — **147/147 PASS**.
- `node tools/validate_t6_bank.js "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"`
  — `ok: true`, 2,837 questions, 219 concepts, 0 errors, populated coverage for all four subjects;
  69 source-PDF extraction warnings remain visible.
- `node tools/check_lesson_file.mjs "C:\\Users\\knigh\\OneDrive\\Desktop\\exam\\Term 6 Clean Transcripts"`
  — 283/283 scheduled, 0 errors, 0 warnings.
- `npm run review`, `check:syllabus`, `check:taught`, `check:tested`, `check:names`, `check:spine`,
  `check:exam`, `check:mini-mocks`, `check:final-sprints`, `check:revision-personas`,
  `check:palette`, and `agents:check` — PASS. The personality gate covers Brilliant-but-lazy,
  Average Joe and Dumb-but-diligent across both Speedruns and Minis in all four subjects.
- `node tools/check-lesson-lecture-match.mjs "...Term 6 Clean Transcripts" --gate` — expected owner-
  accepted exception `SPMS-M01-L01` and nothing else.
- `npm run build` — 23 public assets.
- `npm --prefix cloudflare run check` — authenticated Wrangler 4.120.1 dry run PASS with D1, AI,
  and Assets bindings.
- `node tools/check-ui-layout.mjs --port 8099` — **32/32 PASS** across 16 scenes × two viewports.
- `node tools/screenshot.mjs --port 8099` — **36/36** valid captures.
- `node tools/screenshot.mjs --port 8099 --optical` — **36/36** valid captures.
- Live Browser — GSAP subject fold, Mini timer/reveal, Full mocks, IBM Released case briefing,
  and mode-switch overlay behaviour verified without console errors.

## Production deployment

- `npm test` was rerun immediately before release — **147/147 PASS**.
- Remote D1 migrations `0005_written_authority.sql` through
  `0008_remove_device_and_country_enforcement.sql` applied successfully; a post-release migration
  listing reports none pending.
- Post-migration readback reports 3/3 written-authority tables present, 0 tester country rows,
  0 locked tester rows and 0 session-country rows.
- `main` fast-forwarded from `6fcc875` to `2a50196`; Cloudflare published Worker version
  `30a8ff04-9161-418c-bb59-6ae9f5aba26a` at 100% traffic.
- Live `/dungeon/health` returns 200 and names Cloudflare D1; the anonymous entry serves the new
  access copy without the retired device-switch prompt; `/dungeon/admin/` returns the expected
  Access redirect rather than a rate-limit response.
- The protected Examiner requires an admitted learner session. Its exact production asset bundle
  is the 23-asset build already exercised above; the existing signed-in owner tab needs a reload to
  replace the page captured before deployment.

## Release handoff

Completed in the safe order: remote migrations, `main` push, Worker/assets publication, then health,
Access-boundary and D1 readback checks. For future releases, `main` remains owner-authorised only.
