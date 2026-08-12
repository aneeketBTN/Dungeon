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
    var onQuery = function () { if (current === "system") announce(); };
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
      apply(mode);
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
