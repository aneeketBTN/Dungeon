# How to take a screenshot of this app

**Short version:** the Browser pane's screenshot does not work here. Use this instead.

```bash
node tools/screenshot.mjs --port 8099
```

That is the whole answer. The rest of this page exists because sessions keep re-deriving it, and
because the failure mode costs more than the lost picture.

---

## The procedure

1. Start the dev server. The Browser pane's `preview_start` with `{name: "dungeon-dev-server"}`
   does it, or `python tools/server.py 8099` directly. Note the port.
2. Run the tool against that port:

```bash
node tools/screenshot.mjs --port 8099
```

3. Read the PNGs back. They land in `outputs/shots/`, named
   `<scene>_<subject>_<width>x<height>_<theme>.png`. **Open them** — a shot nobody looked at is
   not acceptance, and this repository has filed "screenshots taken" as evidence for a screen no
   one read.

Useful flags: `--only <scene>` (one scene while iterating), `--out <dir>`, `--chrome <path>`,
and `--optical` for a second pass with `optical-audit.js`'s gridlines drawn on, suffixed `_grid`.

Default sweep is 16 shots: 5 screens × 2 viewports × both themes. Scenes are `dashboard`,
`lesson`, `question`, `exam-home`, `exam-question`. Exits non-zero and names any shot whose scene
did not complete — a failed drive paints a loud red panel titled `SHOT FAILED` rather than
photographing whatever happened to be on screen, because a blank picture and a broken driver look
identical otherwise.

It needs Chrome or Edge on the machine and nothing else. No CDP, no WebSocket, no npm dependency.

---

## Why the Browser pane cannot do this

`computer{action: "screenshot"}` returns:

> the Browser pane is not displayed, so the page is not compositing frames

This is not a bug to route around with retries, `tabs_select`, a reload, or a resize. **All four
have been tried in separate sessions and none works** — the pane composites only when a human has
it on screen, and an agent cannot put it there.

Headless Chrome has no pane to display, so it composites unconditionally. `tools/shots/frame.html`
supplies the part headless Chrome lacks — it is same-origin with the app, so it opens `/app/t6.html`
in a fixed-width iframe, walks it to the requested screen through the real controls, waits for each
step, settles every animation, and holds still for the shutter.

---

## The trap that costs more than the picture

**A non-compositing pane freezes `document.timeline.currentTime` at 0.** Every CSS transition
therefore reads as its *start* value, for ever, no matter how long you wait. `getComputedStyle`
reports the pre-transition value and there is nothing on the element to say why.

So a perfectly correct rule reads as broken:

- an element whose `opacity` transitions 0 → 1 reads `opacity: 0` permanently
- `getAnimations()` shows the transition `playState: "running"` with `currentTime: 0`, stuck
- specificity, `!important`, media queries and rule order all check out, because none of them is
  the cause

**Two apparent CSS bugs in one session were this artefact**, and it recurred on 2026-08-18 against
`.rail-scroll`'s edge fade — which was very nearly filed as a defect after the matching rule, its
specificity and the whole stylesheet had been walked looking for an override that did not exist.

Before believing any transition-related finding from the pane, run this:

```js
(function(){var t=document.timeline.currentTime;var p=performance.now();
  return new Promise(function(r){setTimeout(function(){
    r(document.timeline.currentTime===t && performance.now()-p>100
      ? 'TIMELINE FROZEN — pane not compositing; every transition reads as its start value'
      : 'timeline running — transition readings are trustworthy');},300);});})()
```

If it says frozen, **take the finding to `tools/screenshot.mjs` instead**. Layout, geometry, text
and colour are still measurable in the pane — those do not depend on the timeline — which is why
`ui-audit.js` stays trustworthy there. Anything that animates does not.

Do not "fix" this by injecting `transition: none` to read ground truth: that forces the very
recalculation that repairs the symptom, so it reports success whether or not the code is right
(the same mistake is recorded against the theme-switch work, `LAW-68`).

---

## What a screenshot still cannot tell you

A picture is acceptance of what a screen *looks like*, not of what it *does*. It cannot see a hover
state, a focus ring reached by keyboard, the direction a transition travels, or a screen reader.

Keep running `tools/browser-checks/ui-audit.js` for the numbers. A picture and a measurement fail
differently — that is the whole lesson of `LAW-64`, where a probe blind to a defect class reported
a screen clean that was visibly broken.

---

## See also

- `tools/screenshot.mjs` — the tool, with its reasoning in the header
- `tools/shots/frame.html` — the driver frame it photographs
- `docs/governance/UI-CHECKLIST.md` — what to check before calling a UI change done
- `LAW-64`, `LAW-68`, `LAW-71` in `docs/governance/BUG-LAWS.md`
