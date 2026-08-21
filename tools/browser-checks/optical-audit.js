/* Optical audit. Evaluate this file's contents *in the page*, like `ui-audit.js`.
 *
 *   node -e "..." will tell you nothing. Paste it into the console, or evaluate it
 *   through the Browser pane, with the screen you want to audit already showing.
 *
 * Why this exists
 * ===============================================================================
 * `ui-audit.js` measures boxes. Every defect it catches is a box crossing a line it
 * should not cross: past the viewport, out of its container, on top of a sibling.
 * That probe has been green on screens with visible defects three times now, and the
 * pattern in all three is the same — **the box was right and the ink was wrong.**
 *
 *   - `.block-heading` set a correct 26px below itself; the reader saw 42.5px,
 *     because the next box was a 44px control band with an 11px label centred in it.
 *   - Four subject cards were exactly the same width; two of them drew their text
 *     2px further in, because the marker on those two was a `border`.
 *   - The coin says `Learn` in Georgia and the heading below says `Your next step`
 *     in Georgia, 21px apart, because one is inside a padded panel and one is not.
 *     Both boxes start on the column. Neither probe nor stylesheet is wrong.
 *
 * A reader does not see boxes, padding, or the column. They see **ink on gridlines**.
 * Two lines of ink either share a line or clearly do not; what reads as broken is the
 * near miss — close enough to look intended, far enough to look failed.
 *
 * So this probe throws the boxes away and measures what is drawn:
 *
 *   gridlines     the vertical lines the page's ink actually forms, strongest first,
 *                 built from `Range.getClientRects()` and not from any box
 *   nearMiss      ink sitting 1–24px off a stronger gridline: the defect class above
 *   insetDrift    panels whose text inset disagrees — one inset is a system, three
 *                 are an accident, and the reader reads the disagreement
 *   flatSurface   a surface whose background matches what is behind it, with no
 *                 border and no shadow to separate them, so it has no depth
 *   deadShadow    a `box-shadow` that computes to `none` because its value is
 *                 invalid — the elevation is in the stylesheet and not on the screen
 *   baselineDrift text in one visual row not sharing a baseline
 *
 * `optical.overlay()` draws the gridlines onto the page so a screenshot shows them.
 * That is the point of the whole file: a number says 21, a gridline shows you the
 * two words that do not sit on it.
 *
 * Tolerances
 * ----------
 * NEAR is 24px because that is roughly where a reader stops reading two lines as a
 * failed alignment and starts reading them as two different things. Below 0.75px is
 * subpixel and is treated as on the line. Both are judgement calls, stated here so
 * the next session argues with the number rather than rediscovering it.
 */
(function () {
  var NEAR = 24;          // within this of a stronger line and not on it = a near miss
  var ON = 0.75;          // subpixel; anything under this is the same line
  var MIN_MEMBERS = 3;    // a gridline needs this many pieces of ink to be a line
  var FLAT = 1.06;        // contrast ratio below which two surfaces read as one

  var vw = window.innerWidth;
  var name = function (el) {
    return el.tagName.toLowerCase() +
      (el.id ? "#" + el.id : "") +
      (typeof el.className === "string" && el.className.trim()
        ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
  };
  var round = function (n) { return Math.round(n * 100) / 100; };
  var visible = function (el) {
    var s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || (s.opacity === "0" && s.pointerEvents === "none")) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var inActiveScreen = function (el) {
    var screen = el.closest(".screen");
    return !screen || screen.classList.contains("active");
  };

  /* --- ink ------------------------------------------------------------------
     The left edge of the glyphs, not of the box. An element whose text wraps has
     one rect per line; the first line is the one the eye lines up, so `left` is the
     first rect's, while `min` covers the whole run. Elements with no text node of
     their own are skipped: a wrapper has no ink. */
  var inkOf = function (el) {
    var run = null;
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) { run = run || document.createRange(); run.selectNodeContents(el); break; }
    }
    if (!run) return null;
    var rects = Array.prototype.slice.call(run.getClientRects()).filter(function (r) { return r.width > 0 && r.height > 0; });
    if (!rects.length) return null;
    var first = rects.reduce(function (a, b) { return b.top < a.top - 1 ? b : a; });
    return {
      left: round(first.left),
      right: round(rects.reduce(function (m, r) { return Math.max(m, r.right); }, -Infinity)),
      baseline: round(first.bottom),
      lines: rects.length,
      text: (el.textContent || "").trim().slice(0, 40)
    };
  };

  var all = Array.prototype.slice.call(document.querySelectorAll("body *"))
    .filter(function (el) { return inActiveScreen(el) && visible(el); });

  var inked = [];
  all.forEach(function (el) {
    var ink = inkOf(el);
    if (!ink) return;
    var s = getComputedStyle(el);
    /* Weight: a reader's eye is caught by size and by weight, so a 40px serif title
       anchors a gridline that a 11px label does not. This only orders the report —
       it never suppresses a finding. */
    var size = parseFloat(s.fontSize) || 12;
    inked.push({
      el: el, name: name(el), ink: ink, size: size,
      weight: size * (parseFloat(s.fontWeight) >= 650 ? 1.4 : 1),
      serif: /Georgia|serif/i.test(s.fontFamily)
    });
  });

  /* --- gridlines -------------------------------------------------------------
     Cluster ink-left positions. A cluster is a gridline when enough ink sits on it;
     its strength is the summed weight, which is what makes "the column" outrank a
     line formed by three stray labels. */
  var cluster = function (items, key) {
    var sorted = items.slice().sort(function (a, b) { return key(a) - key(b); });
    var out = [], cur = null;
    sorted.forEach(function (it) {
      var v = key(it);
      if (cur && v - cur.at <= ON) { cur.members.push(it); cur.strength += it.weight; }
      else { cur = { at: v, members: [it], strength: it.weight }; out.push(cur); }
    });
    return out;
  };

  var lines = cluster(inked, function (i) { return i.ink.left; })
    .filter(function (c) { return c.members.length >= MIN_MEMBERS; })
    .sort(function (a, b) { return b.strength - a.strength; });

  var gridlines = lines.map(function (c) {
    return {
      x: c.at, ink: c.members.length, strength: Math.round(c.strength),
      sample: c.members.slice(0, 3).map(function (m) { return m.name; })
    };
  });

  /* --- near misses -----------------------------------------------------------
     Ink close to a *stronger* line but not on it. Compared against stronger lines
     only, because the weaker line is the one that looks wrong: a 40px serif title
     does not read as misaligned with a label, the label reads as misaligned with it.
     Among the lines in range, take the **strongest**, not the nearest. The first
     draft took the nearest and buried the defect that prompted the whole file:
     `Learn` sits 4px off a minor line and 21px off the page's main column, and it is
     the column the eye is holding it against. Nearest-first reported the 4px. */
  var nearMiss = [];
  inked.forEach(function (it) {
    var x = it.ink.left;
    var own = null, best = null;
    lines.forEach(function (c) {
      if (Math.abs(x - c.at) <= ON) { if (!own || c.strength > own.strength) own = c; }
    });
    lines.forEach(function (c) {
      var d = Math.abs(x - c.at);
      if (d <= ON || d > NEAR) return;
      if (own && c.strength <= own.strength) return;         // a line at least as strong is already ours
      if (!best || c.strength > best.c.strength) best = { c: c, d: d };
    });
    if (best) {
      nearMiss.push({
        el: it.name, text: it.ink.text, inkX: x,
        offGridline: best.c.at, by: round(best.d),
        gridlineStrength: Math.round(best.c.strength),
        gridlineHeldBy: best.c.members.slice(0, 3).map(function (m) { return m.name; }),
        y: it.ink.baseline                                   // where to draw the marker
      });
    }
  });
  /* Strongest line missed first, then by how far. A big miss on a weak line matters
     less than a smaller one on the column everything else is sitting on. */
  nearMiss.sort(function (a, b) {
    return b.gridlineStrength - a.gridlineStrength || b.by - a.by;
  });

  /* --- inset drift -----------------------------------------------------------
     For every panel — anything with its own background or border — how far its first
     ink sits from its own left edge. The page should have very few answers. */
  var isSurface = function (el) {
    var s = getComputedStyle(el);
    return (s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)") ||
      parseFloat(s.borderLeftWidth) > 0 || (s.boxShadow && s.boxShadow !== "none");
  };
  var insets = {};
  all.filter(isSurface).forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 28) return;               // chips and pills are not panels
    var first = null;
    inked.forEach(function (it) {
      if (!el.contains(it.el) || it.el === el) return;
      if (it.ink.left < r.left - 1 || it.ink.left > r.right) return;
      if (!first || it.ink.baseline < first.ink.baseline - 1) first = it;
    });
    if (!first) return;
    var d = round(first.ink.left - r.left);
    if (d < 0 || d > 80) return;
    var k = String(d);
    (insets[k] = insets[k] || []).push({ panel: name(el), firstInk: first.name, text: first.ink.text });
  });
  var insetDrift = Object.keys(insets)
    .map(function (k) { return { inset: Number(k), panels: insets[k].length, sample: insets[k].slice(0, 4) }; })
    .sort(function (a, b) { return b.panels - a.panels; });

  /* --- depth -----------------------------------------------------------------
     A surface with a background sitting on a backdrop of the same colour, with no
     border and no shadow, is not a surface. `elementsFromPoint` gives what is
     actually behind it, which is the only way to catch a floating element over a
     panel it does not descend from. */
  var parse = function (c) {
    var m = /rgba?\(([^)]+)\)/.exec(c || "");
    if (!m) return null;
    var p = m[1].split(",").map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  var lum = function (c) {
    var f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b);
  };
  var ratio = function (a, b) {
    var la = lum(a), lb = lum(b);
    return round((Math.max(la, lb) + .05) / (Math.min(la, lb) + .05));
  };

  var flatSurface = [], deadShadow = [];
  all.forEach(function (el) {
    /* A `.screen` is the page canvas, not a card sitting on that canvas. Its job is
       to inherit or deliberately match the body background; requiring elevation or
       an outline there would create a false-positive and encourage a decorative box
       around the whole application. Descendant panels remain fully audited. */
    if (el.classList && el.classList.contains("screen")) return;
    var s = getComputedStyle(el);
    var r = el.getBoundingClientRect();

    if (r.width < 60 || r.height < 24) return;
    var own = parse(s.backgroundColor);
    if (!own || own.a < .5) return;                          // transparent: nothing to separate

    var cx = Math.min(vw - 2, Math.max(2, r.left + r.width / 2));
    var cy = Math.min(window.innerHeight - 2, Math.max(2, r.top + Math.min(r.height / 2, 12)));
    var stack = document.elementsFromPoint(cx, cy);
    var idx = stack.indexOf(el);
    if (idx < 0) return;
    var behind = null;
    for (var j = idx + 1; j < stack.length; j++) {
      var bs = getComputedStyle(stack[j]);
      var bc = parse(bs.backgroundColor);
      if (bc && bc.a >= .5) { behind = { el: stack[j], c: bc }; break; }
    }
    if (!behind || el.contains(behind.el)) return;

    var cr = ratio(own, behind.c);
    if (cr > FLAT) return;                                   // it separates by colour alone

    /* Any side, not just the top. A sticky header separates itself from the page with
       its *bottom* border, and a top-only check reported `.app-header` as flat while it
       was drawing exactly the line it needed. `backdrop-filter` counts too: a blur is a
       real separation even when the two backgrounds match. */
    var hasShadow = s.boxShadow && s.boxShadow !== "none";
    var blurs = s.backdropFilter && s.backdropFilter !== "none";
    var edge = null;
    ["Top", "Right", "Bottom", "Left"].forEach(function (side) {
      var bw = parseFloat(s["border" + side + "Width"]) || 0;
      var bc2 = parse(s["border" + side + "Color"]);
      if (bw > 0 && bc2 && bc2.a >= .3 && ratio(bc2, own) > FLAT) edge = side.toLowerCase() + " " + bw + "px";
    });
    if (hasShadow || blurs || edge) return;

    flatSurface.push({
      el: name(el), on: name(behind.el),
      background: s.backgroundColor, backdrop: getComputedStyle(behind.el).backgroundColor,
      contrast: cr, border: "none that separates", shadow: s.boxShadow
    });
  });

  /* Dead shadows, read from the stylesheets rather than from elements: an invalid
     value leaves no trace on the element to find.

     `rule.cssRules && rule.cssRules.length`, and no `continue` after recursing.
     Since CSS nesting shipped, `CSSStyleRule` carries its own `cssRules` — an
     *empty* list, which is an object and therefore truthy. A plain
     `if (rule.cssRules) { walk(...); continue; }` recurses into nothing and skips
     the declaration, so this probe reported zero dead shadows on a page where all
     sixteen were dead. A grouping rule can also have both, so both run. */
  var seen = {};
  for (var si = 0; si < document.styleSheets.length; si++) {
    var rules;
    try { rules = document.styleSheets[si].cssRules; } catch (e) { continue; }   // cross-origin
    (function walk(list) {
      for (var ri = 0; ri < list.length; ri++) {
        var rule = list[ri];
        if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules);
        if (!rule.style || !rule.selectorText) continue;
        var want = rule.style.getPropertyValue("box-shadow");
        if (!want || want === "none" || seen[rule.selectorText + want]) continue;
        var el;
        try { el = document.querySelector(rule.selectorText.split(",")[0].replace(/::?[a-z-]+(\([^)]*\))?/g, "").trim() || "*"); }
        catch (e) { continue; }                                // `&`-nested and other selectors querySelector cannot take
        if (!el) continue;
        if (getComputedStyle(el).boxShadow !== "none") continue;
        var probe = document.createElement("div");
        document.body.appendChild(probe);
        probe.style.boxShadow = want;
        var got = getComputedStyle(probe).boxShadow;
        probe.remove();
        if (got === "none") {
          seen[rule.selectorText + want] = 1;
          deadShadow.push({ selector: rule.selectorText.slice(0, 70), declared: want, computesTo: "none" });
        }
      }
    })(rules);
  }

  /* --- baselines -------------------------------------------------------------
     Ink sharing a visual row but not a baseline. Only flags a gap small enough to
     read as a failed alignment; deliberately stacked text is far apart. */
  var baselineDrift = [];
  var rows = cluster(inked.filter(function (i) { return i.ink.lines === 1; }), function (i) { return Math.round(i.ink.baseline / 8) * 8; });
  rows.forEach(function (row) {
    if (row.members.length < 2) return;
    var bs = row.members.map(function (m) { return m.ink.baseline; });
    var lo = Math.min.apply(null, bs), hi = Math.max.apply(null, bs);
    if (hi - lo <= ON || hi - lo > 6) return;
    var tops = row.members.map(function (m) { return m.el.getBoundingClientRect().top; });
    if (Math.max.apply(null, tops) - Math.min.apply(null, tops) > 40) return;   // not one row
    baselineDrift.push({
      by: round(hi - lo),
      members: row.members.slice(0, 4).map(function (m) { return { el: m.name, baseline: m.ink.baseline, text: m.ink.text }; })
    });
  });

  /* --- overlay ---------------------------------------------------------------
     Draw the grid on the page. `optical.overlay()` to draw, `optical.overlay(false)`
     to clear, `optical.overlay({lines: 6, misses: 8})` to change how much is shown.

     Restraint is the whole design here. The first version drew all 40-odd gridlines
     and every near miss as a full-height red rule with a label at the top, and the
     screenshot came back as a barcode — every column of the page striped, every label
     piled into the same 20px of header. It was strictly more information than the
     page, and it showed less.
     So: only the strongest few lines, because a line held by three stray labels is not
     one the reader is using; and a near miss is drawn where it happens — a bracket at
     that text's own baseline spanning gridline → ink, labelled with the gap. You read
     it at the defect instead of matching a red rule to whatever it passes through. */
  window.optical = {
    overlay: function (on) {
      var old = document.getElementById("optical-overlay");
      if (old) old.remove();
      if (on === false) return "cleared";
      var opt = (on && typeof on === "object") ? on : {};
      var nLines = opt.lines || 5, nMiss = opt.misses || 6;

      var host = document.createElement("div");
      host.id = "optical-overlay";
      host.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:none;" +
        "font:11px/1.2 ui-monospace,Consolas,monospace;";
      var add = function (css, text) {
        var d = document.createElement("div");
        d.style.cssText = "position:absolute;" + css;
        if (text != null) d.textContent = text;
        host.appendChild(d);
        return d;
      };

      var shown = gridlines.slice(0, nLines);
      shown.forEach(function (g, i) {
        add("top:0;bottom:0;width:0;left:" + g.x + "px;border-left:1px " +
            (i === 0 ? "solid" : "dashed") + " rgba(0,132,255," + (i === 0 ? ".7" : ".4") + ");");
        /* Labels down the left of their own line, one step apart, so N lines do not
           write N labels into the same strip of header. */
        add("top:" + (6 + i * 15) + "px;left:" + (g.x + 3) + "px;color:#fff;" +
            "background:rgba(0,110,220,.92);padding:2px 4px;border-radius:2px;white-space:nowrap;",
            g.x + " · " + g.ink + " ink");
      });

      var drawn = 0;
      nearMiss.slice(0, nMiss).forEach(function (m) {
        var lo = Math.min(m.inkX, m.offGridline), w = Math.abs(m.inkX - m.offGridline);
        var y = Math.max(14, Math.min(window.innerHeight - 26, m.y));
        drawn++;
        /* The gap itself, as a filled band at the text's own height. */
        add("left:" + lo + "px;top:" + (y - 11) + "px;width:" + w + "px;height:13px;" +
            "background:rgba(255,45,60,.28);border-left:1px solid rgba(255,45,60,.95);" +
            "border-right:1px solid rgba(255,45,60,.95);");
        add("left:" + (m.inkX + 5) + "px;top:" + (y - 12) + "px;color:#fff;" +
            "background:rgba(214,20,40,.95);padding:2px 4px;border-radius:2px;white-space:nowrap;",
            "+" + m.by + "px  " + m.text.slice(0, 22));
      });

      document.body.appendChild(host);
      return shown.length + " gridlines, " + drawn + " near misses drawn (of " +
        gridlines.length + " and " + nearMiss.length + ")";
    }
  };

  return {
    viewport: vw + "x" + window.innerHeight,
    screen: (document.querySelector(".screen.active") || {}).id || "none",
    theme: document.documentElement.getAttribute("data-theme") || "system",
    inkMeasured: inked.length,
    gridlines: gridlines.slice(0, 10),
    nearMiss: nearMiss.slice(0, 12),
    insetDrift: insetDrift.slice(0, 8),
    flatSurface: flatSurface.slice(0, 8),
    deadShadow: deadShadow.slice(0, 10),
    baselineDrift: baselineDrift.slice(0, 6),
    overlay: "call optical.overlay() to draw, optical.overlay(false) to clear"
  };
})()
