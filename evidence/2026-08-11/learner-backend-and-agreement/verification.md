# Approved-email access, shared learner backend, and closed tester agreement

Date: 2026-08-11
Route: `https://aneeketdas.com/dungeon/`
Status claim: `VERIFIED(LIVE_EDGE + REAL_BROWSER + AUTOMATED)` for admission, denial, agreement
acceptance, dashboard entry, online progress status, sign-out, revocation, and the narrow agreement
layout. The client CSS repair found in the first pass is live.

## What the system now does

1. The owner adds an email in the Control Room. That email is the only admission check.
2. The learner opens `/dungeon/`, types the approved email, and enters. Nothing is emailed.
3. An unapproved email receives the private denial `Ask Aneeket to add you in.` The allowlist is
   never disclosed.
4. A first approved login is held at a one-time agreement screen. The tick and `Accept and enter`
   record only the agreement version and acceptance time; a returning tester on the same version
   goes straight in.
5. Progress is stored server-side per email in Cloudflare D1, with the browser copy kept as an
   offline fallback and a dirty-state reconciliation on load.
6. One active browser per email. A country change from the first login locks the account for owner
   review. Revocation deletes sessions and server-side progress.

## Live edge checks (production, this session)

| Check | Command / action | Result |
| --- | --- | --- |
| Health and storage model | `GET /dungeon/health` | `200 {"status":"ok","storage":"cloudflare-d1","access":"dashboard-allowlist"}` |
| Anonymous learner entry | `GET /dungeon/` | `200`, serves the login page, not the dashboard |
| Anonymous bank fetch | `GET /dungeon/sets/t6_challenges.js` | `401 LOGIN_REQUIRED` |
| Unapproved email | `POST /dungeon/api/session` with `definitely-not-a-tester@example.com` | `403 NOT_APPROVED`, `Ask Aneeket to add you in.` |
| Approved email, first login | `POST /dungeon/api/session` with the owner/browser address | `428 AGREEMENT_REQUIRED`, `agreementVersion 2026-08-11`, **no session cookie issued and no state written** |
| Deployed client assets | live `/dungeon/login.js` and `/dungeon/login.css` vs `mock/` sources | byte-identical |

The approved-email probe deliberately stopped at the agreement gate, so no production session,
acceptance record, or progress row was created by this verification.

## Real Browser acceptance (live domain)

Browser pane on `https://aneeketdas.com/dungeon/`:

- The anonymous route renders the login panel only: email field, `Open revision dashboard`, and the
  privacy note.
- Submitting the approved email swaps the panel to the agreement step: `One-time agreement`,
  `Keep the closed test private`, four plain-language limits, a `Read the full agreement` disclosure
  with the five full clauses, the acknowledgement checkbox, `Accept and enter`, and
  `← Use a different email`.
- At a 390-pixel viewport the agreement step has `0` horizontal overflow, a full-width panel, a
  20-pixel checkbox, and a 52-pixel primary button.

### Defect found and repaired

`mock/login.css` set `form { display: grid; }` with no `[hidden]` guard. An author type selector
beats the user-agent `[hidden] { display: none }` rule, so on the agreement step the email form was
marked `hidden` in the DOM but still painted 174 pixels of stale controls under the agreement.
Measured live: `login-form.hidden === true` with `getBoundingClientRect().height === 174`.

Repair: `[hidden] { display: none !important; }` in `mock/login.css`, matching the guard `mock/t6.css`
already carried. Verified on the live page by inserting the same rule through CSSOM: the stale form
collapsed to `0` at desktop and at 390 pixels, and the agreement panel was unaffected. `mock/admin.css`
was checked and does not need the guard; `mock/admin.js` never toggles `hidden`.

This repair is in source, both release builds, and the live edge. The final Browser pass showed the
agreement without stale email controls.

## Automated checks

- `npm test` — 23/23 pass, including first-login agreement recording, approved/unapproved admission,
  cross-session progress durability, single-browser and country-lock behaviour, revocation deleting
  sessions and progress, admin isolation, and the static allowlist.
- `npm run build` — 13 allowlisted public assets plus the production worker.
- `node cloudflare/scripts/build-standalone.mjs` — 14 embedded assets, 391,652 bytes.
- `node --check` clean on `mock/t6.js`, `mock/login.js`, `cloudflare/src/index.mjs`.

## Agreement document

`outputs/Dungeon_Closed_Tester_Agreement.docx` and `.pdf`, built by
`work/build_tester_agreement.py`.

Owner direction this session: the agreement is a gentlemen's agreement, not a signed contract. The
tester name, approved-email, tester-signature, and owner-signature blanks were removed. Section 9
now states that no signature is needed, that acceptance happens by ticking both acknowledgement
boxes at first login, and that Dungeon records only the version and time. The group-membership
section and shaded acknowledgement panel match the live WhatsApp-group requirement and exact
in-app checkbox wording. Two pages, exported through Word and visually read at
`evidence/2026-08-11/closed-tester-agreement/render-group-final3/`. Earlier `render*` folders in
that directory are superseded drafts; send the files in `outputs/`.

## Honest boundary

- This is a light admission check, not identity proof. Anyone who knows an approved email can enter
  as that tester. It is chosen deliberately for a small exam-season cohort.
- Country locking uses the Cloudflare country code only. City and region changes are not used: they
  are too noisy to justify an automatic permanent ban, and travel, VPNs, mobile networks, and
  routing all produce legitimate changes. A lock is an owner review prompt, not proof of misconduct.
- An approved technical tester can still download the client-side question bank. Server-side item
  delivery remains `UNSTARTED`.

## Follow-up pass: onboarding, dashboard, and push-to-deploy

Deployed and verified after the original pass above.

- **WhatsApp group requirement.** The agreement step gates on two acknowledgements. Verified live
  that ticking only the terms box leaves the second required and blocks entry, and that the group
  link carries `target="_blank"` with `rel="noopener"`.
- **Cohort onboarding.** `POST /dungeon/admin/api/testers` accepts an `emails` array, writes the
  Access group once, and returns `added`, `alreadyApproved`, and `rejected`. Test asserts the owner
  address and malformed entries are rejected while valid ones are granted.
- **Lock recovery.** `PATCH` with `action: "unlock"` clears the lock and re-baselines the country.
  Test signs a tester in from `IN`, saves progress, signs out, triggers the `US` lock, unlocks, signs
  back in from `US`, and asserts the saved state is byte-identical. It also asserts the Access group
  was never rewritten, so unlocking cannot widen access.
- **Cohort aggregation.** `summarizeCohort` counts only `scored`, non-`isReattempt` records, so
  retries and self-review practice cannot inflate apparent knowledge. Test covers owner exclusion,
  an unparseable `state_json` row, a retry, and an unscored attempt.
- **Owner boundary.** `GET /dungeon/admin/api/insights` returns `302` to Cloudflare Access
  anonymously — the new endpoint is not publicly reachable.
- **Real Browser.** The Control Room was driven with stubbed API responses at desktop and 390 px:
  four tester rows, `Clear lock` present only on the locked tester, three participation rows, four
  ranked concepts, and `0` horizontal overflow at both widths.
- **Push-to-deploy.** `aneeketBTN/Dungeon` connected to Workers Builds with root directory
  `cloudflare`, build `npm --prefix .. run build`, deploy `npx wrangler deploy`. The dashboard's
  auto-filled root of `/` was corrected: wrangler would not have found `cloudflare/wrangler.jsonc`,
  and the worker's `jose` dependency would not have been installed. First Git-triggered build is
  version `6ebc486b`, attributed to the commit rather than `Manually deployed`.

`npm test` passes 27/27.

## Final live acceptance and cleanup

Production was checked again after deployment with a temporary address under the owner's domain:

1. The Control Room added the address, increasing the approved count from 9 to 10.
2. The fresh learner login stopped at `Keep the closed test private` and displayed neither the
   learner dashboard nor stale email controls.
3. Both required acknowledgements were present: the closed tester terms and confirmation that the
   tester joined the private WhatsApp group.
4. After both were checked, `Accept and enter` opened `Term 6 Revision — Learn, practise, improve`.
   The learner header showed `Saved online` and `0 of 64`.
5. `Sign out` returned to the email-entry page.
6. The temporary address was revoked. The Control Room returned to `9 approved testers`, with no
   temporary row left behind.

The deployed Worker content response reported deployment
`8b515b1471db4519ad198fee832541c9`. The production D1 schema carries migrations 0001-0003,
including agreement version and acceptance time.

## Remaining

- The approved-email mechanism remains a binary possession-of-address check, not identity proof.
- Server-side item delivery is still unstarted, so an authorised technical tester can inspect the
  client question bundle.
- Cohort numbers below the documented attempt thresholds remain noise rather than evidence.
