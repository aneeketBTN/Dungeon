# Tester access and owner-dashboard verification

Date: 2026-08-11  
Status: `VERIFIED` for the allowlisted build, private-cache/no-index worker policy, owner-dashboard
desktop interaction, announcement generation, and Sites owner-only access. Exact Cloudflare path
routing and per-tester email access are `WAITING_OWNER_CLOUDFLARE_ZERO_TRUST_TERMS`.

## Automated checks

The bundled Node runtime ran:

```text
node --check mock/admin.js
node --check site/worker.mjs
node scripts/build-site.mjs
node --test tests/site-release.test.mjs
```

Observed: all commands exited 0; the build prepared ten public assets; five tests passed and none
failed. The tests cover learner and admin redirects, health, security/no-index/private-cache
headers, and the source/deployment allowlist.

The release manifest contains exactly:

- learner `t6.html`, `t6.css`, and `t6.js`;
- `t6_brgsa.js`, `t6_catalog.js`, and `t6_challenges.js`;
- owner `admin.html`, `admin.css`, and `admin.js`;
- `robots.txt`.

No live learner state/history, owner source pack, CLA analysis, work output, transfer material,
credential, tester email, or WhatsApp invite is present.

## Real Browser observations

Route: `http://127.0.0.1:8099/mock/admin.html`  
Browser: Codex in-app Browser  
Viewport: 1280 CSS pixels wide  
Profile: local owner-dashboard fixture; no learner state was read or changed.

- The page exposed one H1 and four labelled regions: tester access, release checklist, feedback
  triage, and change announcement.
- Health and manifest checks correctly reported unavailable against the legacy Python development
  server, which does not implement production `/health` or the release artifact. The dashboard did
  not convert those failures into a green status.
- Filling both announcement fields immediately produced a complete draft with What changed, What
  to try, and the structured feedback request.
- All four desktop panels were 580 pixels wide inside a 1,265-pixel document at inner width 1,280;
  no horizontal overflow was present.
- The Access panel explicitly states that approved users can still copy visible content and that
  the controls are containment, not perfect DRM.

The claimed Browser tab does not expose the viewport-override capability, so 390-pixel visual
acceptance remains open. The stylesheet includes a single-column breakpoint and reduced-motion
handling; that source inspection is secondary evidence only.

## Cloudflare state

- Cloudflare account and `aneeketdas.com` were observed in the owner's authenticated dashboard.
- Zero Trust was not previously activated.
- The Free plan advertises 50 seats and $0 per seat, but activation requires two confirmations:
  acceptance of Cloudflare's terms/privacy policy and authorisation to charge the saved card for
  usage beyond free limits.
- No checkbox was selected and Activate was not clicked. Configuration stopped before any plan,
  Access group, route, Worker, billing authorisation, or tester grant was created.

## Sites state

- `https://dungeon-term6.aneeket.chatgpt.site` has a successful production version.
- Access was returned to custom owner-only after the owner requested a tester gate; only the owner
  remains allowed and no tester has been invited.
- The next protected build includes the owner dashboard and header hardening; its version and URL
  are recorded after the deployment step below.

## Remaining gates

- Owner acceptance of Cloudflare Zero Trust terms and overage-card authorisation.
- Owner-supplied tester email addresses.
- 390-pixel real-Browser dashboard capture.
- Private-origin path proxy and rate-limit verification.
- Strong protection against scraping by an already authorised tester requires server-side item
  delivery; the current identity-gated client bundle does not make that claim.
