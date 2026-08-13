# Privacy notice for the Dungeon closed test

Effective: 13 August 2026

Dungeon is a small, invite-only revision-product test. This notice explains the limited learner
data used to provide access, save progress, and detect obvious account sharing.

## What Dungeon stores

- the approved email address supplied to the owner;
- revision progress and game state associated with that email, including answers, attempts,
  confidence choices, completion state, a coarse response-time band and whether a response was too
  rapid to count toward the learning system's Strong label, and the time the state was last saved;
- for an accepted written-practice check, criterion-level practice history: which authored prompt
  was checked, whether each visible criterion was met, when it was checked, and how many fresh
  confirmations remain before Dungeon treats that writing gap as repaired, plus a bounded label for
  whether the answer move was missing or misunderstood. This summary never
  counts toward Strong and does not add another copy of the learner's prose;
- a summary of every mock paper submitted in the examiner: which paper and set, when, the marks
  scored out of the marks available, how much of the paper was attempted, how long it took, and
  counts of guessed or changed answers. Your written answers and the options you chose are **not**
  stored — only the summary — and the concepts a mock exposed are kept to reorder what the learning
  system offers you next, never to score you. Post-submit written review stores only those bounded
  corrective codes and concept priorities; it does not add the mock answer, model explanation, or
  suggested answer to the saved profile;
- an opaque, hashed browser-session token and its expiry time;
- the closed-test agreement version and acceptance time;
- the time the private WhatsApp invite was opened, the time the tester acknowledged joining, and
  the time an owner bump was recorded, if any;
- the coarse Cloudflare country code observed at first login and on later requests; and
- account-security state, including whether an active session exists or a country-change lock was
  triggered; and
- when hosted written checking is activated, a per-day count of written checks for the approved
  email, used only to enforce the daily allowance. This counter contains no question, answer,
  retrieved text, or model result.

Dungeon does not request precise GPS location. The application database does not store the raw IP
address. Cloudflare may process ordinary network, request, and security metadata when delivering
and protecting the site.

Dungeon does not save exact per-question response time. The browser uses an ephemeral timer to
derive the coarse band and rapid-response flag, then discards the raw elapsed milliseconds. A fast
answer keeps its correctness; the flag is used only to stop that response from independently
supporting the Strong label. Slow responses are not penalised.

The owner's localhost development mode is separate from this closed-test service. When explicitly
started with the local written grader for an exact owner-approved model ID, a practice answer is
sent only between the localhost browser and Dungeon server on the owner's Windows machine and LM
Studio on the owner's Mac through an encrypted SSH loopback tunnel. Neither service listens on a
LAN or public model port. The answer and bounded rubric result may be kept in that localhost
browser's progress copy for resume; they are not sent to Cloudflare D1 or a model vendor. The
normal local server and LAN clients have no route to the laptop grader. A timed examiner has no
model route while the paper is running; after submission, localhost may run the same bounded rubric
check plus a slower independently verified coach. Clearing localhost site data removes the browser
copy.

The live written-checking feature, when separately activated and accepted under an updated tester
agreement, uses Cloudflare Workers AI and a private Vectorize index of the Term 6 course material.
For a Dungeon-authored practice question, the answer is already part of the revision progress
described above and is also processed to produce the criterion check. The Worker does not log the
answer, retrieved passages, or output, and the written-authority usage table stores only the daily
count described above. There is no public arbitrary-question coaching route. An authored Examiner
answer may be processed only after submission, when the paper score is already frozen. If the exact model, approved corpus, or activation flag does not
match, machine checking is unavailable and the existing rubric/self-review path remains usable.

## Why it is used

The data is used only to grant or revoke closed-test access, restore revision progress across
visits, operate the learning experience, support the tester, track the required community
acknowledgement/reminder workflow, and detect obvious use of one account from multiple browsers or
countries. It is not used for advertising or sold to another party.

## Important security limits

The approved email acts as a lightweight password; Dungeon does not verify inbox ownership. One
active browser session is allowed per email. A request from a different country than the first
login locks the Dungeon account for owner review. Country detection can be affected by travel,
VPNs, mobile networks, and network routing, so it is a risk signal rather than proof of misconduct.
The system cannot reliably detect same-country sequential sharing, photographs taken with another
device, or every form of copying.

## Retention, removal, and correction

Revoking a tester in the owner dashboard deletes that tester's active sessions and saved Dungeon
progress from the application database. The owner should remove closed-test accounts when they
are no longer required for the exam-season test. A tester may ask the owner to correct their
approved email, explain a lock, withdraw from the test, or delete their Dungeon account data.

Local browser storage remains as a recovery copy for the learner experience. A tester can remove
that copy with **Progress settings -> Reset progress** or by clearing the site's browser data.

## WhatsApp community

WhatsApp community participation is separate from the web app. Testers who join may share the
profile name, phone-number visibility, messages, and other information that WhatsApp makes
available under its own settings and policies. Testers should not post sensitive academic or
personal information.

Dungeon can record that the invite was opened and that a tester explicitly acknowledged joining.
It cannot independently inspect or verify WhatsApp membership. The owner may record and manually
send a reminder when the acknowledgement is missing; no message is sent automatically by Dungeon.

## Contact

Questions, access/correction requests, security concerns, or deletion requests should be sent
privately to Aneeket through the contact channel used for onboarding.
