/* UI audit probe. Evaluate this file's contents *in the page* — it measures the
 * rendered result, which is the only place these properties exist.
 *
 *   node -e "..." will tell you nothing. Paste it into the console, or evaluate it
 *   through the Browser pane, with the screen you want to audit already showing.
 *
 * It reports six classes of defect that this project keeps re-introducing:
 *
 *   overflow      anything crossing the viewport's right edge, which on a phone is
 *                 the difference between a layout and a sideways scroll
 *   tapTargets    interactive elements under 44px, the floor the dashboard holds to
 *   radii         corner radii outside the four-step scale in t6.css
 *   density       paragraphs long enough to read as a wall of text on a phone
 *   typeScale     font sizes below the readable floor, and how many distinct sizes
 *                 are in play at once
 *   ragged        siblings in a row that should share a width or a height and do not
 *
 * Returns a JSON-serialisable object. Empty arrays mean the screen is clean.
 */
(function () {
  "use strict";

  var SCALE = [3, 7, 9, 10, 50, 99, 999];      // --r-mark/control/card/panel + pills
  var TAP_FLOOR = 44;
  var TYPE_FLOOR = 12;                          // below this is unreadable on a phone
  var DENSE_CHARS = 260;                        // one paragraph before it needs a break

  var vw = window.innerWidth;
  var name = function (el) {
    return el.tagName.toLowerCase() +
      (el.id ? "#" + el.id : "") +
      (typeof el.className === "string" && el.className.trim()
        ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
  };
  var visible = function (el) {
    var s = getComputedStyle(el);
    /* Custom radios keep the native input accessible but visually and pointer-
       hidden inside a full-size label. Measure the label, not its 13px control. */
    if (s.display === "none" || s.visibility === "hidden" || (s.opacity === "0" && s.pointerEvents === "none")) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var inActiveScreen = function (el) {
    var screen = el.closest(".screen");
    return !screen || screen.classList.contains("active");
  };

  var all = Array.prototype.slice.call(document.querySelectorAll("body *"))
    .filter(function (el) { return inActiveScreen(el) && visible(el); });

  /* --- overflow ------------------------------------------------------------- */
  var overflow = all.filter(function (el) {
    var r = el.getBoundingClientRect();
    if (r.right <= vw + 1 && r.left >= -1) return false;
    /* A deliberate horizontal scroller is not an overflow; its children are meant to
       sit outside the viewport. */
    var scroller = el.closest("[data-scroll], .course-grid, .match-board, .rail-scroll");
    if (scroller && scroller !== el && scroller.scrollWidth > scroller.clientWidth) return false;
    return true;
  }).map(function (el) {
    var r = el.getBoundingClientRect();
    return {el: name(el), left: Math.round(r.left), right: Math.round(r.right), over: Math.round(r.right - vw)};
  });

  /* --- tap targets ---------------------------------------------------------- */
  var interactive = all.filter(function (el) {
    if (/^(BUTTON|A|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName)) return true;
    if (el.tagName === "INPUT" && el.type !== "hidden") return true;
    return el.getAttribute("tabindex") === "0";
  });
  var tapTargets = interactive.map(function (el) {
    var r = el.getBoundingClientRect();
    /* A hit area widened by a pseudo-element counts; measure what a finger can
       actually reach, not just the painted box. */
    var before = getComputedStyle(el, "::before");
    var padW = before.content !== "none" && before.position === "absolute" ? Number.parseFloat(before.width) || 0 : 0;
    var padH = before.content !== "none" && before.position === "absolute" ? Number.parseFloat(before.height) || 0 : 0;
    return {el: name(el), w: Math.round(Math.max(r.width, padW)), h: Math.round(Math.max(r.height, padH))};
  }).filter(function (t) { return t.h < TAP_FLOOR || t.w < 24; });

  /* --- corner scale --------------------------------------------------------- */
  var radiusUse = {};
  all.forEach(function (el) {
    var s = getComputedStyle(el);
    ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"].forEach(function (prop) {
      var v = Number.parseFloat(s[prop]);
      if (!v) return;
      var key = s[prop].indexOf("%") >= 0 ? s[prop] : Math.round(v);
      radiusUse[key] = radiusUse[key] || {count: 0, examples: []};
      radiusUse[key].count++;
      if (radiusUse[key].examples.length < 3 && radiusUse[key].examples.indexOf(name(el)) < 0) {
        radiusUse[key].examples.push(name(el));
      }
    });
  });
  var offScale = Object.keys(radiusUse).filter(function (k) {
    var n = Number.parseFloat(k);
    return String(k).indexOf("%") < 0 && SCALE.indexOf(n) < 0;
  }).map(function (k) { return {radius: k, count: radiusUse[k].count, examples: radiusUse[k].examples}; })
    .sort(function (a, b) { return b.count - a.count; });

  /* --- reading density ------------------------------------------------------ */
  var density = all.filter(function (el) {
    if (!/^(P|LI|DD|SMALL)$/.test(el.tagName)) return false;
    if (el.querySelector("p, li")) return false;
    return (el.textContent || "").trim().length > DENSE_CHARS;
  }).map(function (el) {
    var r = el.getBoundingClientRect();
    var s = getComputedStyle(el);
    return {el: name(el), chars: el.textContent.trim().length, fontSize: s.fontSize,
      lines: Math.round(r.height / (Number.parseFloat(s.lineHeight) || 20)),
      text: el.textContent.trim().slice(0, 60) + "…"};
  }).sort(function (a, b) { return b.chars - a.chars; });

  /* --- type scale ----------------------------------------------------------- */
  var sizes = {};
  var tooSmall = [];
  all.forEach(function (el) {
    if (!el.childNodes.length) return;
    var hasText = Array.prototype.some.call(el.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim();
    });
    if (!hasText) return;
    var s = getComputedStyle(el);
    var px = Math.round(Number.parseFloat(s.fontSize) * 10) / 10;
    sizes[px] = (sizes[px] || 0) + 1;
    if (px < TYPE_FLOOR) tooSmall.push({el: name(el), size: px, text: el.textContent.trim().slice(0, 30)});
  });

  /* --- ragged rows ---------------------------------------------------------- */
  var ragged = [];
  Array.prototype.slice.call(document.querySelectorAll(
    ".course-grid, .overall-stats, .route-list, .set-list, .result-stats, .hero-actions, .community-actions, .shelf-actions, .horizon-picker, .chip-row"
  )).filter(function (el) { return inActiveScreen(el) && visible(el); }).forEach(function (row) {
    var kids = Array.prototype.slice.call(row.children).filter(visible);
    if (kids.length < 2) return;
    var heights = kids.map(function (k) { return Math.round(k.getBoundingClientRect().height); });
    var widths = kids.map(function (k) { return Math.round(k.getBoundingClientRect().width); });
    var spread = function (a) { return Math.max.apply(null, a) - Math.min.apply(null, a); };
    /* Only flag a row whose items sit on one line: a wrapped grid is meant to differ
       down the page, not across it. */
    var tops = kids.map(function (k) { return Math.round(k.getBoundingClientRect().top); });
    var oneLine = spread(tops) < 4;
    if (oneLine && spread(heights) > 4) ragged.push({row: name(row), issue: "heights", values: heights});
    if (oneLine && spread(widths) > 4 && getComputedStyle(row).display === "grid") {
      ragged.push({row: name(row), issue: "widths", values: widths});
    }
  });

  return {
    viewport: vw + "x" + window.innerHeight,
    screen: (document.querySelector(".screen.active") || {}).id || "none",
    theme: document.documentElement.getAttribute("data-theme") || "system",
    pageScrollsSideways: document.documentElement.scrollWidth > vw + 1,
    overflow: overflow.slice(0, 12),
    tapTargets: tapTargets.slice(0, 12),
    radiiOffScale: offScale.slice(0, 12),
    distinctRadii: Object.keys(radiusUse).length,
    density: density.slice(0, 10),
    typeSizesInUse: Object.keys(sizes).map(Number).sort(function (a, b) { return a - b; }),
    typeTooSmall: tooSmall.slice(0, 10),
    ragged: ragged.slice(0, 10)
  };
})()
