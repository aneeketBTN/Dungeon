# Privacy notice for the Dungeon tester release

## What the web app stores

The active Term 6 dashboard stores progress only in the tester's browser under
`term6.revision.v2`. The learning app does not create a learner profile on Dungeon's server and
does not send answer history, confidence choices, written responses, or progress there.

The planned access gate is separate from learning progress. Cloudflare Access uses an approved
email address to send a one-time sign-in code and records ordinary security/request metadata so
access can be audited and revoked. Dungeon does not use that identity to grade or personalise
learning evidence.

The owner Control Room can list approved tester emails and grant or revoke website access after
the protected Cloudflare edge is activated. Those email addresses stay in the dedicated
Cloudflare Access group; the dashboard does not place them in learner storage, release metadata,
application logs, or the WhatsApp community.

## What the web app does not collect

The first tester release has no product analytics, advertising, tracking pixels, server-side
learner profiles, central leaderboard, or cross-device sync. Cloudflare may provide aggregate
traffic/security logs for operating the protected route. The production health endpoint reports
only whether the service is available and does not receive learner answers.

Three future tester-agent schedules are registered in a paused state. They have not run and have
no event endpoint to read. Their presence does not change this privacy notice: no learning
telemetry, identity mapping, automated participation review, messaging, suspension, or removal is
active. Those capabilities require a new tester consent flow, retention/deletion policy, backend
acceptance, and explicit owner activation before this notice may be revised for a live cohort.

## WhatsApp community

WhatsApp community participation is separate from the web app. Testers who join will share the
profile name, phone-number visibility, messages, and other account information that WhatsApp makes
available under its own product settings and policies. Testers should avoid posting sensitive
academic or personal information.

## Removing local progress

Use **Progress settings → Reset local progress** in the dashboard, or clear the site's browser
data. This affects only that browser profile.
