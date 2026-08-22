# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a university learner preparing for a near-term exam, often in a compressed revision window and moving between a laptop and a phone. The immediate job is to choose the relevant subject, read the complete course in teaching order, retrieve specific concepts quickly when needed, and test recall against the real paper pattern.

## Product Purpose

Dungeon turns one authored course into three coordinated surfaces: Notes for complete, sequential study; Learn for focused remediation after evidenced mistakes; and Examiner for practice in the exact shape and level of the real exam. Success means the learner can get from course material to a defensible exam answer quickly without navigating a second curriculum or an unnecessarily demanding learning game.

## Positioning

Dungeon pairs comprehensive course-grounded notes with evidence-driven weak-concept repair and deterministic exam-format practice. Notes are the primary learning interface; Learn appears where diagnosis shows it is useful; Examiner reproduces the paper rather than inventing a harder proxy for it.

## Operating Context

The learner commonly arrives during last-minute revision, chooses IBM or SCLM, reads modules in order, searches or jumps only when necessary, prints modules or individual lectures for offline study, and then moves directly into a mock, Speedrun, or Mini. The interface must remain useful while commuting or revising on a small screen and must support printable/PDF study material.

## Capabilities and Constraints

- Four subjects exist: SPMS, BRGSA, IBM, and SCLM. IBM and SCLM are the current exam priority; BRGSA is complete and should not compete for attention.
- Notes contain the complete authored course and must preserve teaching order, worked examples, relevant concept maps, glossary material, connections, numerical methods, search, module navigation, whole-module PDF export, and single-lecture export.
- Learn is a remediation mechanism for weak concepts, not the default path through every concept.
- Examiner must preserve each subject's observed paper structure and direct question level. SCLM is exactly 50 one-mark MCQs, six four-mark numericals, and three two-mark matching questions: 80 marks in 120 minutes with a scientific calculator and no negative marking.
- IBM uses direct, named course lenses for written case application while retaining enough depth for ten-mark answers.
- Existing course content, concept identifiers, progress evidence, accessibility behavior, authentication, and print support are product truth and must survive visual redesign.
- The application is a static HTML/CSS/JavaScript frontend with a Cloudflare backend and is deployed from the repository.

## Brand Commitments

The product name is Dungeon. The voice is direct, calm, course-grounded, and respectful of a learner's limited time. The interface should feel deliberate and editorial rather than gamified or generic. Serif display type and restrained cyan accents are established identity signals, but the current fixed-card composition is not binding.

## Evidence on Hand

- The authored course, question bank, lessons, exam specifications, and released IBM case live in `app/`, `docs/briefs/`, and `app/sets/`.
- Exam feedback is stored in `docs/research/` and the governance ledger.
- Real paper-pattern evidence includes the SCLM 50/6/3 pattern and the released IBM inclusive-business prompt.
- There are no faculty-approved marking rubrics beyond the recorded exam specifications; revision heuristics must not be presented as official marking schemes.

## Product Principles

1. Put the subject and useful content before product explanation.
2. Teach through complete notes; diagnose before prescribing remediation.
3. Match the exam's directness, structure, marks, and timing exactly.
4. Reveal navigation and supporting material where they become useful, not as a wall before the lesson.
5. Make every study action work on both a laptop and a phone, including print and export.

## Accessibility & Inclusion

Keyboard operation, visible focus, semantic controls, reduced-motion support, responsive reflow, readable contrast, and minimum comfortable touch targets are required. No essential content or action may depend on hover alone.
