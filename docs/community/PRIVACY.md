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
- whether active hashed browser sessions exist. Dungeon does not store or enforce a first-login
  country lock; and
- when hosted written checking is activated, a per-day count of written checks for the approved
  email, used only to enforce the daily allowance. This counter contains no question, answer,
  retrieved text, or model result. A second counter records the whole cohort's daily total and
  contains no email; and
- **your written practice answers themselves, kept for up to three months.** This is a deliberate
  change and it is the one item on this list that is not needed to run your own session. Dungeon
  keeps the text you wrote so the owner can check whether the machine marking agreed with a fair
  human reading, correct the rubrics where it did not, and build better prompts for the students
  who take this course after you. Your own dashboard shows you your results; the stored text is for
  improving the marking. It is not published, sold, or shown to other testers, and you can ask for
  yours to be deleted at any time.

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
agreement, sends your answer to an AI model to be checked against the course material. That model
may be Cloudflare Workers AI, or a third-party AI provider reached through a routing service. The
route can change if a provider is unavailable, so Dungeon cannot promise in advance which company
processes a given answer, and those companies operate under their own terms and may be outside
India. Dungeon sends the answer, the question, and the relevant course passages, and nothing that
identifies you: no name, no email, and no account identifier travels with it.

The course evidence used for checking is fixed for each question and ships with the application, so
no request needs to search a hosted index of the course material.

There is no public arbitrary-question coaching route. An authored Examiner answer may be processed
only after submission, when the paper score is already frozen. If the exact model, approved corpus,
or activation flag does not match, machine checking is unavailable and the existing rubric and
self-review path remains usable.

If something you write reads as personal distress rather than an exam answer, Dungeon stops before
the check runs. That response is not sent to any AI provider, is not marked, is not stored, and
does not affect your progress. You are shown support information instead.

## Why it is used

The data is used to grant or revoke closed-test access, restore revision progress across visits,
operate the learning experience, support the tester, track the required community
acknowledgement/reminder workflow, and detect obvious use of one account from multiple browsers or
countries. It is not used for advertising or sold to another party.

Written answers have one additional purpose, stated plainly because it is the only use here that
serves someone other than you: **improving Dungeon's marking for future students.** The machine
marking is not yet reliable enough to be treated as a grade, and the honest way to make it better is
to compare what it decided against what a person reading the same answer would decide. That work
needs the answers. It does not need your name attached to them, and the model that checks your work
never receives it.

## Important security limits

The approved email acts as a lightweight password; Dungeon does not verify inbox ownership. The
tester agreement requires personal account use and asks testers to use one active browser at a
time, but Dungeon no longer enforces a device-count limit or automatically locks an account when
Cloudflare reports a different country. A device or region pattern may still prompt a conversation
about the personal-use term, but it is not proof of misconduct.
The system cannot reliably detect same-country sequential sharing, photographs taken with another
device, or every form of copying.

## Retention, removal, and correction

Revoking a tester in the owner dashboard deletes that tester's active sessions and saved Dungeon
progress from the application database. The owner should remove closed-test accounts when they
are no longer required for the exam-season test. A tester may ask the owner to correct their
approved email, withdraw from the test, or delete their Dungeon account data.

**Written practice answers are deleted three months after they are written.** That window exists so
the owner can review marking quality after the exam season and improve the rubrics for the next
cohort; it is not open-ended. You can ask for your answers to be deleted sooner, and withdrawing
from the test deletes them along with the rest of your account data. Deletion is a request to the
owner, who does it by hand — there is no self-service button for it today, and this notice will say
so until there is.

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
