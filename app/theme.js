/* Theme bootstrap.
 *
 * This file exists, rather than living in t6.js, for one reason: it has to run
 * before the first paint. t6.js and the five bank files load at the end of <body>,
 * so a learner who has chosen a theme that differs from their system setting would
 * see the wrong one render and then swap — on every load. The usual fix is a small
 * inline <script> in <head>, but the Worker serves `script-src 'self'` (see
 * cloudflare/src/index.mjs), which blocks inline script without a hash. A separate
 * synchronous file in <head> is the version of that trick which the release's own
 * security headers allow.
 *
 * Keep it small and keep it dependency-free: everything here blocks the first paint.
 *
 * The stored value is deliberately *not* part of the learner profile. The profile
 * syncs to D1, and a theme is a property of the device you are reading on, not of
 * what you know — syncing it would force a phone read at night into the laptop's
 * daylight setting. It also loads async, which would reintroduce the flash this
 * file exists to prevent.
 */
window.T6Theme = (function () {
  "use strict";

  var KEY = "t6-theme";
  var MODES = ["system", "light", "dark"];
  var root = document.documentElement;
  var listeners = [];
  var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function read() {
    try {
      var saved = localStorage.getItem(KEY);
      return MODES.indexOf(saved) > 0 ? saved : "system";
    } catch (error) {
      /* Private browsing can throw on read. Following the system setting is the
         correct answer when we cannot know what was chosen. */
      return "system";
    }
  }

  function apply(mode) {
    /* No attribute means follow the system, which is what :root's `color-scheme:
       light dark` already does. Setting the attribute pins it. */
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
  }

  /* Flipping `color-scheme` re-resolves every `light-dark()` token — but a property
     that is being *transitioned* does not follow. It keeps the previous theme's value,
     and not briefly: it stays wrong until something else forces a style recalculation.
     Measured on the dashboard, 34 of the 35 visible elements carrying a background
     transition — every button on the screen — kept the old fill after a switch, which
     is what "the theme toggle only half works" looks like from the outside.

     So the switch turns transitions off, changes the attribute, forces the
     recalculation while they are still off, and turns them back on. Reading a layout
     property is what makes that recalculation happen *now*; without it the attribute
     goes on and comes off within one frame and nothing has changed in between.

     It also drops the page-wide cross-fade, which was never wanted: every hover
     transition on screen firing at once is not a theme change, it is a smear. */
  function repaint(change) {
    root.setAttribute("data-theme-switching", "");
    change();
    void root.offsetWidth;
    /* Both, and deliberately. A frame callback is the right moment to release, but a
       tab that is not compositing never gets one — and this attribute kills every
       transition on the page while it is set, so a switch in a background tab would
       leave the product with no animation at all once the learner came back to it.
       The timer is the floor under that; whichever fires first wins and the second is
       a no-op. */
    var release = function () { root.removeAttribute("data-theme-switching"); };
    if (window.requestAnimationFrame) requestAnimationFrame(release);
    setTimeout(release, 100);
  }

  var current = read();
  apply(current);

  function resolved() {
    if (current !== "system") return current;
    return query && query.matches ? "dark" : "light";
  }

  function announce() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](resolved(), current); } catch (error) {}
    }
  }

  /* A learner on "system" whose machine switches at sunset must get the same
     repaint as one who pressed the button — the canvas radar reads its colours
     once and would otherwise keep the old theme's ink. */
  if (query) {
    /* The same freeze applies here and there is no attribute change to hang it on:
       the tokens re-resolve because the *system* moved, so the repaint has to be
       forced explicitly or a machine switching at sunset half-changes too. */
    var onQuery = function () {
      if (current !== "system") return;
      repaint(function () {});
      announce();
    };
    if (query.addEventListener) query.addEventListener("change", onQuery);
    else if (query.addListener) query.addListener(onQuery);
  }

  return {
    modes: MODES,
    get: function () { return current; },
    resolved: resolved,
    set: function (mode) {
      if (MODES.indexOf(mode) < 0) return;
      current = mode;
      repaint(function () { apply(mode); });
      try {
        if (mode === "system") localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, mode);
      } catch (error) {
        /* Storage refused: the choice still applies for this page, it just will
           not survive a reload. Better than throwing away the interaction. */
      }
      announce();
    },
    next: function () {
      return MODES[(MODES.indexOf(current) + 1) % MODES.length];
    },
    onChange: function (fn) { listeners.push(fn); }
  };
})();
