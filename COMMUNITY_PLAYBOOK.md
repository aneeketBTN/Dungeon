# Dungeon tester community playbook

## Community structure

- **Announcements** — owner/admin posts only; releases, test requests, known incidents, and
  resolved issues.
- **Dungeon Testers** — open discussion between testers.
- **Dungeon Feedback** — structured evaluation, bugs, confusion, and improvement requests.

## Community description

Dungeon is an early Term 6 revision-tool test. Be specific, be kind, and discuss the product—not
people's ability. Do not share passwords, private academic records, pirated course material, spam,
or anyone else's personal information. Urgent privacy or security reports go privately to the
owner.

## Moderation defaults

- Keep the community invite link controlled during the first cohort.
- Let testers post in discussion and feedback groups.
- Keep announcements admin-only.
- Remove spam, harassment, leaked personal data, and copyrighted course-pack uploads.
- Record product decisions outside WhatsApp so important feedback is not lost in chat history.

## Join and bump protocol

- The invite is disclosed in Dungeon only after an approved email reaches first-login agreement;
  existing signed-in testers also see the protected in-app reminder.
- Opening the invite enables a separate self-attestation. Dungeon records the open and
  acknowledgement but cannot independently verify WhatsApp membership.
- Use **Bump missing group joins** in the Control Room to record an in-app reminder for everyone
  still missing the acknowledgement and copy one message for manual sending. A tester row also has
  a one-person **Bump** action.
- The message should state that continued tester access requires joining and giving useful feedback,
  and that non-participation after reminders may lead to removal.
- Never remove or threaten removal for low accuracy, slow learning, or critical feedback. Review
  non-participation manually; bumping never revokes access automatically.

## Change announcement

Every change testers can see gets one announcement in **Announcements** when it reaches production.
No silent releases: a tester who notices a difference must be able to find out why. Draft it from
two questions.

1. **What changed?** One plain sentence, in the words a learner would use.
   Example: *Written practice now keeps the rubric hidden until the end of a practice check.*
2. **What should testers do?** One specific action, not "have a look".
   Example: *Try one Explain in your own words check and report anything unclear.*

Paste format:

```
Dungeon update

What changed
[What changed]

What to try
[What testers should try]

Please post one structured report in Dungeon Feedback if anything is unclear or broken.
```

Rules for the announcement:

- Post it after the change is live, never before; a push to `main` deploys, so announce once the
  new version is serving.
- Say plainly when a change asks something of the tester — signing in again, re-accepting the
  agreement, or losing a saved position.
- Name a real limitation when the change has one. Do not describe practice as exam prediction.
- Keep it to the two answers plus the feedback line. Longer notes belong in `CHANGELOG.md`.
