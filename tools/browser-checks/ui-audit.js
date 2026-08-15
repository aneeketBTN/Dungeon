/* UI audit probe. Evaluate this file's contents *in the page* — it measures the
 * rendered result, which is the only place these properties exist.
 *
 *   node -e "..." will tell you nothing. Paste it into the console, or evaluate it
 *   through the Browser pane, with the screen you want to audit already showing.
 *
 * It reports nine classes of defect that this project keeps re-introducing:
 *
 *   overflow      anything crossing the viewport's right edge, which on a phone is
 *                 the difference between a layout and a sideways scroll
 *   clipped       content larger than the box holding it — cut off silently by
 *                 `overflow: hidden`, or spilling over whatever is next
 *   circleFit     text inside a round container that is wider than the circle at the
 *                 height it sits, which no bounding-box check can see
 *   overlaps      two text-bearing siblings drawn on top of each other
 *   tapTargets    interactive elements under 44px, the floor the dashboard holds to
 *   radii         corner radii outside the four-step scale in t6.css
 *   density       paragraphs long enough to read as a wall of text on a phone
 *   typeScale     font sizes below the readable floor, and how many distinct sizes
 *                 are in play at once
 *   ragged        siblings in a row that should share a width or a height and do not
 *   hiddenScroll  a horizontal scroller showing less than 60% of its own content, so
 *                 items exist that nobody can see they can reach
 *   cutRows       a scroll container whose height draws a child in half, which reads as
 *                 a rendering fault rather than as "there is more below"
 *   barInset      stacked top bars whose content starts at different x, so two bars a
 *                 candidate reads as one block do not line up
 *
 * The last three were added 2026-08-15 after all three defects were found by eye on a
 * screen this file had just reported clean — the standing lesson being that a clean
 * report from a probe blind to the defect class reads exactly like a clean screen. Each
 * was verified to fire on the real defect and to go quiet when it is fixed.
 * `docs/governance/UI-CHECKLIST.md` carries the checks that still need a person.
 *
 * Returns a JSON-serialisable object. Empty arrays mean the screen is clean.
 */
(function () {
  "use strict";

  var SCALE = [3, 7, 9, 10, 50, 99, 999];      // --r-mark/control/card/panel + pills
  var TAP_FLOOR = 44;
  var DENSE_CHARS = 260;                        // one paragraph before it needs a break

  /* The type floor is the design system's, read from the token rather than repeated
     here.
     This was hard-coded at 12 while `app/t6.css` declared `--t-micro: 11px` and
     documented it as "the smallest thing we ask anyone to read". Nobody reconciled
     them, so `typeTooSmall` reported 111 elements on the dashboard alone, was
     truncated to ten by the slice below, and was quietly non-empty on every run of
     every screen — which means a genuine drop to 10px would have landed in a list
     that was already full. A detector that always fires cannot fail.
     Reading the token means the two can never disagree again: move the scale and the
     floor moves with it. The fallback is 11 rather than 12 so a page served without
     the stylesheet does not silently re-introduce the same drift. */
  var TYPE_FLOOR = (function () {
    var declared = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--t-micro"));
    return declared > 0 ? declared : 11;
  })();

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

  /* An element that an ancestor has already clipped away cannot be painted past the
     viewport, whatever its own rect says.
     -------------------------------------------------------------------------------
     The header's Learn/Examiner switch collapses to `max-width: 0; opacity: 0` while
     the coin at the top of the page is in view, because the coin is already offering
     that choice. Its two 53px buttons keep their natural width inside a 0px box with
     `overflow: hidden`, so at 375 `#mode-exam` measured right=381 and the detector
     called it a 6px overflow — on the dashboard's default state, every time, while
     `documentElement.scrollWidth` stayed at exactly 375. Scroll the coin out of view
     and the same probe went quiet, which is the intermittency LAW-46 is about.
     What can actually be painted is the intersection with every clipping ancestor;
     if that does not cross the viewport, there is nothing to see and nothing to fix.
     This subsumes the scroller allowlist below rather than replacing it — the
     allowlist stays because it says which scrollers are deliberate. */
  var clippedShortOfTheEdge = function (el) {
    var r = el.getBoundingClientRect();
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      var s = getComputedStyle(p);
      if (s.overflowX === "visible" && s.overflowY === "visible") continue;
      var pr = p.getBoundingClientRect();
      if (Math.min(r.right, pr.right) <= vw + 1 && Math.max(r.left, pr.left) >= -1) return true;
    }
    return false;
  };

  /* --- overflow ------------------------------------------------------------- */
  var overflow = all.filter(function (el) {
    var r = el.getBoundingClientRect();
    if (r.right <= vw + 1 && r.left >= -1) return false;
    /* A deliberate horizontal scroller is not an overflow; its children are meant to
       sit outside the viewport. */
    var scroller = el.closest("[data-scroll], .course-grid, .match-board, .rail-scroll");
    if (scroller && scroller !== el && scroller.scrollWidth > scroller.clientWidth) return false;
    if (clippedShortOfTheEdge(el)) return false;
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

  /* --- clipped and spilling content ----------------------------------------- *
   *
   * The class of defect this probe used to miss entirely. A percentage ring reported
   * "16 scored questions" inside a 142px circle with a 10px border — 122px of usable
   * width for text that needed more — so the caption ran under the ring's own border
   * and out the other side. Every existing detector passed it: it is inside the
   * viewport, it is above the tap floor, its corner is on the scale, its font is above
   * the floor, and it has no siblings to be ragged against.
   *
   * The measurable property is content bigger than the box holding it. `overflow:
   * hidden` cuts it off silently and `visible` lets it spill over whatever is next;
   * both are unreadable, so both are reported. Real scrollers are excluded — there the
   * overflow is the point. */
  var SCROLLABLE = /^(auto|scroll|overlay)$/;
  /* Visually-hidden text: a ~1px box with `overflow: hidden` holding a whole sentence,
     which is the pattern rather than one class name — `.sr-only` and `.bag-label` both
     do it. Detected by shape so a third one written tomorrow is covered too. */
  var hiddenLabel = function (el) {
    return Boolean(el.closest(".sr-only")) || Array.prototype.some.call(
      [el].concat(Array.prototype.slice.call(el.querySelectorAll("*"))).concat(
        el.parentElement ? [el.parentElement] : []),
      function (node) {
        var s = getComputedStyle(node);
        return node.clientWidth <= 2 && node.clientHeight <= 2 && s.overflow === "hidden" &&
          (node === el || node.contains(el));
      });
  };
  /* Measured against the glyphs, not `scrollWidth`.
   *
   * `scrollWidth`/`clientWidth` describe an inline box's *containing block*, so every
   * wrapped `<b>` in a paragraph reads as overflowing by tens of pixels and the real
   * defects drown in it. A `data-tip` tooltip drawn as a pseudo-element inflates it
   * the same way. What is actually being asked is "is any text painted outside the box
   * that owns it", and the text runs answer that directly — including under
   * `overflow: hidden`, where clipping happens at paint time and the run rect still
   * reports where the glyphs wanted to go. */
  var clipped = [];
  all.forEach(function (el) {
    var s = getComputedStyle(el);
    if (SCROLLABLE.test(s.overflowX) || SCROLLABLE.test(s.overflowY)) return;
    if (el.closest("[data-scroll], .course-grid, .match-board, .rail-scroll")) return;
    if (hiddenLabel(el)) return;
    var direct = Array.prototype.filter.call(el.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim();
    });
    if (!direct.length) return;
    /* An inline box has no width of its own — it hugs whatever it wraps, and when it
       wraps onto two lines its union rect is not a container at all. The box that can
       actually be escaped is the block that lays the text out, so measure against that
       one. Without this every bold run inside a wrapped sentence reports as overflowing
       by the width of its own second line. */
    var holder = el;
    var holderStyle = s;
    while (holder && /^(inline|ruby|contents)$/.test(holderStyle.display)) {
      holder = holder.parentElement;
      if (!holder) return;
      holderStyle = getComputedStyle(holder);
    }
    var box = holder.getBoundingClientRect();
    var left = box.left + (Number.parseFloat(holderStyle.paddingLeft) || 0) + (Number.parseFloat(holderStyle.borderLeftWidth) || 0);
    var right = box.right - (Number.parseFloat(holderStyle.paddingRight) || 0) - (Number.parseFloat(holderStyle.borderRightWidth) || 0);
    var bottom = box.bottom - (Number.parseFloat(holderStyle.paddingBottom) || 0) - (Number.parseFloat(holderStyle.borderBottomWidth) || 0);
    var worst = 0, axis = "", sample = "";
    direct.forEach(function (node) {
      var range = document.createRange();
      range.selectNodeContents(node);
      Array.prototype.slice.call(range.getClientRects()).forEach(function (run) {
        if (!run.width) return;
        var sideways = Math.max(run.right - right, left - run.left);
        // A descender stands a pixel or two below its line box on a large serif.
        var down = run.bottom - bottom - 3;
        var over = Math.max(sideways, down);
        if (over > worst) {
          worst = over;
          axis = sideways >= down ? "horizontally" : "vertically";
          sample = node.textContent.trim().slice(0, 40);
        }
      });
    });
    if (worst > 1) {
      clipped.push({
        el: name(el),
        insideOf: holder === el ? "itself" : name(holder),
        box: Math.round(box.width) + "x" + Math.round(box.height),
        escapesBy: Math.round(worst) + "px " + axis,
        overflow: s.overflowX === s.overflowY ? s.overflowX : s.overflowX + "/" + s.overflowY,
        fontSize: s.fontSize,
        text: sample
      });
    }
  });

  /* --- text inside a circle -------------------------------------------------- *
   *
   * A round container is narrower than its own box everywhere except the middle, so
   * "fits the bounding box" is the wrong test and passing it is how a caption ends up
   * lying across the ring's stroke. The results ring reported "16 scored questions" at
   * 120px inside a 122px box — inside the box, and 5px wider than the circle actually
   * is at the height the caption sits, which is below centre because the percentage is
   * above it.
   *
   * The real constraint is the chord: at vertical distance dy from the centre a circle
   * of radius r is 2·sqrt(r² − dy²) wide. Measured at the text's far edge, since that
   * is where the circle is narrowest across the line. */
  var circleFit = [];
  all.forEach(function (el) {
    var s = getComputedStyle(el);
    var round = s.borderTopLeftRadius.indexOf("%") >= 0
      ? Number.parseFloat(s.borderTopLeftRadius) >= 50
      : Number.parseFloat(s.borderTopLeftRadius) >= Math.min(el.clientWidth, el.clientHeight) / 2 - 1;
    if (!round || !el.clientWidth) return;
    if (hiddenLabel(el)) return;                                  // see `clipped`
    if (Math.abs(el.clientWidth - el.clientHeight) > 2) return;   // a pill, not a circle
    var box = el.getBoundingClientRect();
    var radius = el.clientWidth / 2;
    var centreY = box.top + (box.height / 2);
    var centreX = box.left + (box.width / 2);
    Array.prototype.slice.call(el.querySelectorAll("*")).concat([el]).forEach(function (child) {
      if (hiddenLabel(child)) return;
      var text = Array.prototype.filter.call(child.childNodes, function (n) {
        return n.nodeType === 3 && n.textContent.trim();
      }).map(function (n) { return n.textContent.trim(); }).join(" ");
      if (!text) return;
      var r = child.getBoundingClientRect();
      if (!r.width) return;
      var ink = Number.parseFloat(getComputedStyle(child).fontSize) * 0.75;
      // Measure the text run itself, not the block it is laid out in.
      var range = document.createRange();
      range.selectNodeContents(child);
      var runs = Array.prototype.slice.call(range.getClientRects());
      runs.forEach(function (run) {
        if (!run.width) return;
        /* Against the glyphs, not the line box. A 14px badge holding an 11px "i" on a
           29px line has a run rect taller than the circle, and measuring that rect says
           the circle is zero wide — which flags every icon badge in the app while the
           letter sits comfortably inside it. Cap height either side of the run's centre
           is the ink that has to fit. */
        var dy = Math.abs(((run.top + run.bottom) / 2) - centreY) + (ink / 2);
        var chord = 2 * Math.sqrt(Math.max(0, (radius * radius) - (dy * dy)));
        var reach = Math.max(Math.abs(run.left - centreX), Math.abs(run.right - centreX)) * 2;
        if (reach > chord + 1) {
          circleFit.push({
            circle: name(el),
            text: text.slice(0, 40),
            needs: Math.round(reach),
            circleIsWideHere: Math.round(chord),
            outsideBy: Math.round(reach - chord)
          });
        }
      });
    });
  });

  /* --- overlapping siblings -------------------------------------------------- *
   *
   * Two things drawn on top of each other, where neither was positioned to be. Kept
   * narrow on purpose: siblings only, both carrying text, neither positioned out of
   * flow, neither containing the other. A wider rule reports every decorative overlay
   * in the app and the real collisions drown in it. */
  var overlaps = [];
  var textish = all.filter(function (el) {
    if (!(el.textContent || "").trim()) return false;
    var s = getComputedStyle(el);
    if (s.position === "absolute" || s.position === "fixed" || s.transform !== "none") return false;
    return Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
  });
  textish.forEach(function (el, index) {
    for (var other = index + 1; other < textish.length; other += 1) {
      var mate = textish[other];
      if (el.parentElement !== mate.parentElement) continue;
      if (el.contains(mate) || mate.contains(el)) continue;
      var a = el.getBoundingClientRect();
      var b = mate.getBoundingClientRect();
      var overlapW = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      var overlapH = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (overlapW > 2 && overlapH > 2) {
        overlaps.push({a: name(el), b: name(mate), by: Math.round(overlapW) + "x" + Math.round(overlapH)});
      }
    }
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

  /* --- a scroller that hides more than it shows ------------------------------ */
  /* `.exam-sections` at 375 had a 108px viewport over 266px of content, so two of three
     section tabs were simply absent along with their question counts. A horizontal
     scroller squeezed by its siblings is not navigation, and nothing here could see it:
     it does not overflow the viewport, nothing is clipped by its own box, and the row is
     not ragged. Flagged above 40% hidden, which leaves genuinely long scrollers (a wide
     table, a tag rail) alone. */
  var hiddenScroll = [];
  Array.prototype.slice.call(document.querySelectorAll("*")).filter(function (el) {
    return inActiveScreen(el) && visible(el);
  }).forEach(function (el) {
    var style = getComputedStyle(el);
    if (style.overflowX !== "auto" && style.overflowX !== "scroll") return;
    if (el.clientWidth < 24 || el.scrollWidth <= el.clientWidth + 1) return;
    var hidden = 1 - (el.clientWidth / el.scrollWidth);
    if (hidden > 0.4) {
      hiddenScroll.push({el: name(el), visibleW: el.clientWidth, contentW: el.scrollWidth,
        hiddenPercent: Math.round(hidden * 100)});
    }
  });

  /* --- a fixed-height grid that cuts a row in half --------------------------- */
  /* Shipped twice, independently, in the same component: `max-height: 46vh` resolved to
     414px and cut row nine of the exam palette through the middle of the chips, and the
     mobile rule's flat 100px cut 5px into a third row. A `vh` height almost never lands on
     a row boundary. Any child whose box straddles the scroll container's bottom edge while
     other children sit below it is a half-drawn row. */
  var cutRows = [];
  Array.prototype.slice.call(document.querySelectorAll("*")).filter(function (el) {
    return inActiveScreen(el) && visible(el);
  }).forEach(function (el) {
    var style = getComputedStyle(el);
    if (style.overflowY !== "auto" && style.overflowY !== "scroll") return;
    if (el.scrollHeight <= el.clientHeight + 1) return;
    var edge = el.getBoundingClientRect().bottom;
    var straddling = Array.prototype.slice.call(el.children).filter(function (kid) {
      var r = kid.getBoundingClientRect();
      /* A child taller than the container can never be shown whole at any scroll
         position, so the edge crossing it is a document being scrolled rather than a
         row being drawn in half. This detector exists for the palette — many equal
         chip rows, the container height landing mid-chip — and a single long child is
         not that. Without this it fires on any scrollable panel holding one block,
         which would make the correct treatment of long content look like a defect.
         Verified still to fire on the original 46vh palette shape. */
      if (r.height > el.clientHeight + 1) return false;
      /* Straddling by more than a hairline, and by less than its whole height — a child
         entirely below the fold is scrolled-away, not cut. */
      return r.top < edge - 1 && r.bottom > edge + 1;
    });
    if (straddling.length) {
      cutRows.push({el: name(el), cutChildren: straddling.length,
        childHeight: Math.round(straddling[0].getBoundingClientRect().height),
        containerHeight: el.clientHeight});
    }
  });

  /* --- stacked bars that do not share one inset ------------------------------ */
  /* `.app-header` used clamp(16px,3vw,40px) and `.exam-bar` clamp(12px,2.5vw,22px), so at
     1280 the logo started at x=38.4 and the section tabs directly beneath it at x=22. Two
     bars stacked at the top of a screen read as one block, and a 16px step between their
     leading edges reads as a mistake. Compares the first visible child of each. */
  var barInset = [];
  var bars = Array.prototype.slice.call(document.querySelectorAll(".app-header, .exam-bar, .practice-header"))
    .filter(function (el) { return inActiveScreen(el) && visible(el); });
  for (var bi = 0; bi < bars.length - 1; bi++) {
    for (var bj = bi + 1; bj < bars.length; bj++) {
      var firstOf = function (bar) {
        return Array.prototype.slice.call(bar.children).filter(visible)[0] || null;
      };
      var a = firstOf(bars[bi]), b = firstOf(bars[bj]);
      if (!a || !b) continue;
      var la = a.getBoundingClientRect().left, lb = b.getBoundingClientRect().left;
      if (Math.abs(la - lb) > 3) {
        barInset.push({a: name(bars[bi]), aStartsAt: Math.round(la * 10) / 10,
          b: name(bars[bj]), bStartsAt: Math.round(lb * 10) / 10,
          stepPx: Math.round(Math.abs(la - lb) * 10) / 10});
      }
    }
  }

  return {
    viewport: vw + "x" + window.innerHeight,
    screen: (document.querySelector(".screen.active") || {}).id || "none",
    theme: document.documentElement.getAttribute("data-theme") || "system",
    pageScrollsSideways: document.documentElement.scrollWidth > vw + 1,
    overflow: overflow.slice(0, 12),
    clipped: clipped.slice(0, 12),
    circleFit: circleFit.slice(0, 12),
    overlaps: overlaps.slice(0, 12),
    tapTargets: tapTargets.slice(0, 12),
    radiiOffScale: offScale.slice(0, 12),
    distinctRadii: Object.keys(radiusUse).length,
    density: density.slice(0, 10),
    typeSizesInUse: Object.keys(sizes).map(Number).sort(function (a, b) { return a - b; }),
    typeFloor: TYPE_FLOOR,
    /* The full count travels with the truncated list. A reader seeing exactly ten
       entries cannot tell ten from a hundred and ten, which is how this detector
       stayed broken. */
    typeTooSmallCount: tooSmall.length,
    typeTooSmall: tooSmall.slice(0, 10),
    ragged: ragged.slice(0, 10),
    hiddenScroll: hiddenScroll.slice(0, 10),
    cutRows: cutRows.slice(0, 10),
    barInset: barInset.slice(0, 10)
  };
})()
