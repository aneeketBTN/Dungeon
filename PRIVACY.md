# Privacy notice for the Dungeon closed test

Effective: 11 August 2026

Dungeon is a small, invite-only revision-product test. This notice explains the limited learner
data used to provide access, save progress, and detect obvious account sharing.

## What Dungeon stores

- the approved email address supplied to the owner;
- revision progress and game state associated with that email, including answers, attempts,
  confidence choices, completion state, and the time the state was last saved;
- an opaque, hashed browser-session token and its expiry time;
- the closed-test agreement version and acceptance time;
- the time the private WhatsApp invite was opened, the time the tester acknowledged joining, and
  the time an owner bump was recorded, if any;
- the coarse Cloudflare country code observed at first login and on later requests; and
- account-security state, including whether an active session exists or a country-change lock was
  triggered.

Dungeon does not request precise GPS location. The application database does not store the raw IP
address. Cloudflare may process ordinary network, request, and security metadata when delivering
and protecting the site.

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
