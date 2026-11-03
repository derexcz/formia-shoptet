/* =========================================================
   FORMIA – Zimní výzdoba
   Padající sníh, vločky, hvězdičky a stromečky v pozadí
   + roztomilá vločka u kurzoru.
   V košíku a objednávce se nezobrazuje (aby nic nerušilo).
   Sama se vypne od data KONEC. Vypnout hned = smazat řádek
   se zima.js ze Shoptetu.
   ========================================================= */
(function () {
  "use strict";

  var KONEC = "2027-03-01"; // od tohoto dne se výzdoba už nezobrazí
  if (new Date() >= new Date(KONEC + "T00:00:00")) return;
  if (/\/(kosik|objednavka)(\/|$)/.test(location.pathname)) return;

  var d = document, w = window, html = d.documentElement;
  var RM = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = w.matchMedia && w.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- SVG ---------- */
  // ramena vločky (6×) – podklad a světlejší vrstva, aby byla vidět i na krémovém pozadí
  function arms(color, width) {
    var a = "";
    for (var i = 0; i < 6; i++) {
      a += '<g transform="rotate(' + i * 60 + ')" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round" fill="none">' +
        '<path d="M0 0V-40M0 -24L-10 -33M0 -24L10 -33M0 -12L-7 -18M0 -12L7 -18"/></g>';
    }
    return a;
  }
  var FLAKE = '<svg viewBox="-50 -50 100 100" aria-hidden="true">' + arms("#B8CAD6", 9) + arms("#fff", 5) + "</svg>";
  var DOT = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#fff"/></svg>';

  var CUTE =
    '<svg viewBox="-50 -50 100 100" aria-hidden="true">' + arms("#AFC3D1", 10) + arms("#fff", 6) +
    '<circle r="22" fill="#fff" stroke="#AFC3D1" stroke-width="3"/>' +
    '<g class="wn-eyes"><ellipse cx="-8" cy="-3" rx="3.4" ry="4.4" fill="#3a2621"/><ellipse cx="8" cy="-3" rx="3.4" ry="4.4" fill="#3a2621"/>' +
    '<circle cx="-6.8" cy="-4.6" r="1.2" fill="#fff"/><circle cx="9.2" cy="-4.6" r="1.2" fill="#fff"/></g>' +
    '<ellipse cx="-14" cy="6" rx="4" ry="2.5" fill="#F2B0A0" opacity=".85"/><ellipse cx="14" cy="6" rx="4" ry="2.5" fill="#F2B0A0" opacity=".85"/>' +
    '<path d="M-4 6q4 4 8 0" stroke="#3a2621" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0q1.2 8.8 10 10q-8.8 1.2-10 10q-1.2-8.8-10-10q8.8-1.2 10-10z" fill="#D3A184"/></svg>';

  var TREE =
    '<svg viewBox="0 0 60 76" aria-hidden="true">' +
    '<rect x="26" y="62" width="8" height="12" rx="2" fill="#7A5A4B"/>' +
    '<path d="M30 4L46 28H38L52 46H42L56 64H4L18 46H8L22 28H14Z" fill="#8E9B6E"/>' +
    '<path d="M30 4L38 16Q30 20 22 16Z" fill="#fff"/>' +
    '<path d="M16 34Q30 40 44 34L46 36Q30 44 14 36Z" fill="#fff" opacity=".9"/>' +
    '<path d="M10 52Q30 60 50 52L52 54Q30 64 8 54Z" fill="#fff" opacity=".9"/>' +
    '<circle cx="30" cy="4" r="3.5" fill="#D3A184"/>' +
    "</svg>";

  /* ---------- CSS ---------- */
  var css =
    ".wn-sky{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}" +
    ".wn-sky svg{display:block;width:100%;height:auto}" +
    /* padající sníh */
    ".wn-fall{position:absolute;top:-40px;will-change:transform;animation:wn-fall var(--t) linear var(--dl) infinite}" +
    "@keyframes wn-fall{to{transform:translate3d(0,calc(100vh + 80px),0)}}" +
    ".wn-sway{animation:wn-sway var(--s) ease-in-out var(--dl) infinite alternate}" +
    "@keyframes wn-sway{from{transform:translateX(-24px) rotate(0)}to{transform:translateX(24px) rotate(var(--rot))}}" +
    ".wn-fall svg{filter:drop-shadow(0 1px 2px rgba(80,105,125,.35))}" +
    /* plovoucí dekorace s parallaxem */
    ".wn-item{position:absolute;left:0;top:0;will-change:transform}" +
    ".wn-item svg{filter:drop-shadow(0 8px 10px rgba(90,57,49,.16))}" +
    ".wn-spin{animation:wn-spin var(--t,30s) linear var(--dl,0s) infinite}" +
    "@keyframes wn-spin{to{transform:rotate(360deg)}}" +
    ".wn-bob{animation:wn-bob var(--t,7s) ease-in-out var(--dl,0s) infinite}" +
    "@keyframes wn-bob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}" +
    ".wn-twinkle{animation:wn-twinkle var(--t,3s) ease-in-out var(--dl,0s) infinite}" +
    "@keyframes wn-twinkle{0%,100%{opacity:.25;transform:scale(.7) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}" +
    /* vločka u kurzoru */
    ".wn-cur{position:fixed;left:0;top:0;width:58px;z-index:2147483000;pointer-events:none;opacity:0;transition:opacity .45s}" +
    ".wn-cur.is-on{opacity:1}" +
    ".wn-cur__spin{animation:wn-curspin 9s linear infinite}" +
    "@keyframes wn-curspin{0%{transform:rotate(0)}50%{transform:rotate(20deg)}100%{transform:rotate(0)}}" +
    ".wn-cur__bob{animation:wn-curbob 2s ease-in-out infinite}" +
    "@keyframes wn-curbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}" +
    ".wn-cur svg{display:block;width:100%;height:auto;filter:drop-shadow(0 8px 12px rgba(70,95,115,.35))}" +
    ".wn-eyes{transform-box:fill-box;transform-origin:center;animation:wn-blink 4.4s infinite}" +
    "@keyframes wn-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}" +
    ".wn-cur.is-pop .wn-cur__bob{animation:wn-pop .5s cubic-bezier(.3,1.6,.5,1)}" +
    "@keyframes wn-pop{0%{transform:scale(1) rotate(0)}40%{transform:scale(1.3) rotate(30deg)}100%{transform:scale(1) rotate(0)}}" +
    ".wn-puff{position:fixed;left:0;top:0;width:12px;z-index:2147482999;pointer-events:none;animation:wn-puff 1s ease-out forwards}" +
    "@keyframes wn-puff{from{opacity:1;transform:translate(var(--x),var(--y)) scale(1)}to{opacity:0;transform:translate(calc(var(--x) + var(--dx)),calc(var(--y) + var(--dy))) scale(.3) rotate(120deg)}}" +
    "@media (prefers-reduced-motion:reduce){.wn-fall,.wn-sway,.wn-spin,.wn-bob,.wn-twinkle,.wn-eyes{animation:none!important}.wn-fall{display:none}}";

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------- Pozadí ---------- */
  function sky() {
    var mobile = w.innerWidth < 768;
    var layer = d.createElement("div");
    layer.className = "wn-sky";
    layer.setAttribute("aria-hidden", "true");

    // 1) padající sníh
    var count = mobile ? 16 : 34;
    for (var i = 0; i < count; i++) {
      var fall = d.createElement("div");
      fall.className = "wn-fall";
      var dot = Math.random() < 0.45;
      var size = dot ? rnd(5, 10) : rnd(10, mobile ? 20 : 26);
      var t = rnd(14, 28);
      fall.style.left = rnd(0, 100).toFixed(2) + "%";
      fall.style.width = size.toFixed(1) + "px";
      fall.style.opacity = (dot ? rnd(.55, .9) : rnd(.6, 1)).toFixed(2);
      fall.style.setProperty("--t", t.toFixed(1) + "s");
      fall.style.setProperty("--dl", (-rnd(0, t)).toFixed(1) + "s");
      var sway = d.createElement("div");
      sway.className = "wn-sway";
      sway.style.setProperty("--s", rnd(3, 6).toFixed(1) + "s");
      sway.style.setProperty("--rot", (rnd(-1, 1) > 0 ? 1 : -1) * rnd(60, 180) + "deg");
      sway.innerHTML = dot ? DOT : FLAKE;
      fall.appendChild(sway);
      layer.appendChild(fall);
    }

    // 2) větší dekorace s parallaxem  [typ, x %, y %, velikost px, hloubka]
    var plan = [
      ["f", 4, 14, 60, .35], ["t", 92, 10, 54, .45], ["s", 18, 30, 16, .15],
      ["f", 90, 42, 46, .25], ["t", 6, 56, 62, .5], ["s", 80, 22, 14, .1],
      ["f", 14, 84, 40, .25], ["t", 94, 74, 46, .4], ["s", 50, 6, 12, .12],
      ["f", 84, 94, 56, .35], ["s", 70, 58, 18, .2], ["s", 2, 72, 14, .12]
    ];
    if (mobile) plan = plan.filter(function (_, i) { return i % 2 === 0; });

    var items = plan.map(function (p, i) {
      var el = d.createElement("div");
      var size = mobile ? Math.round(p[3] * 0.7) : p[3];
      el.className = "wn-item";
      el.style.width = size + "px";
      var inner = d.createElement("div");
      inner.className = p[0] === "f" ? "wn-spin" : p[0] === "s" ? "wn-twinkle" : "wn-bob";
      inner.style.setProperty("--t", (p[0] === "f" ? 26 + i * 3 : 5 + (i % 5) * 1.3).toFixed(1) + "s");
      inner.style.setProperty("--dl", (-i * 0.9).toFixed(1) + "s");
      inner.innerHTML = p[0] === "f" ? FLAKE : p[0] === "s" ? STAR : TREE;
      el.appendChild(inner);
      el.style.opacity = p[0] === "s" ? "1" : (0.5 + p[4]).toFixed(2);
      layer.appendChild(el);
      return { el: el, x: p[1], y: p[2], depth: p[4], size: size };
    });
    d.body.appendChild(layer);

    var ticking = false;
    function place() {
      ticking = false;
      var W = w.innerWidth, H = w.innerHeight, sy = RM ? 0 : (w.pageYOffset || html.scrollTop);
      var range = H + 160;
      items.forEach(function (it) {
        var x = it.x / 100 * (W - it.size);
        var y = (it.y / 100 * range - sy * it.depth) % range;
        if (y < 0) y += range;
        y -= 80;
        it.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      });
    }
    function req() { if (!ticking) { ticking = true; w.requestAnimationFrame(place); } }
    w.addEventListener("scroll", req, { passive: true });
    w.addEventListener("resize", req, { passive: true });
    place();
  }

  /* ---------- Vločka u kurzoru ---------- */
  function cursorFlake() {
    if (!FINE || RM) return;
    var g = d.createElement("div");
    g.className = "wn-cur";
    g.setAttribute("aria-hidden", "true");
    g.innerHTML = '<div class="wn-cur__bob"><div class="wn-cur__spin">' + CUTE + "</div></div>";
    d.body.appendChild(g);

    var mx = -100, my = -100, x = -100, y = -100, rot = 0, running = false, first = true;
    var OX = 22, OY = 18; // odsazení od kurzoru, aby vločka nepřekážela klikání

    function loop() {
      var vx = (mx + OX - x) * 0.11, vy = (my + OY - y) * 0.11;
      x += vx; y += vy;
      rot += (Math.max(-25, Math.min(25, vx * 2)) - rot) * 0.15;
      g.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + rot.toFixed(2) + "deg)";
      if (Math.abs(vx) + Math.abs(vy) > 0.05 || Math.abs(rot) > 0.1) w.requestAnimationFrame(loop);
      else running = false;
    }
    function start() { if (!running) { running = true; w.requestAnimationFrame(loop); } }

    d.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (first) { x = mx + OX; y = my + OY; first = false; }
      g.classList.add("is-on");
      start();
    }, { passive: true });
    d.addEventListener("mouseleave", function () { g.classList.remove("is-on"); });
    html.addEventListener("mouseleave", function () { g.classList.remove("is-on"); });

    // po kliknutí se vločka zatočí a vypustí pár malých vloček
    d.addEventListener("mousedown", function (e) {
      g.classList.remove("is-pop"); void g.offsetWidth; g.classList.add("is-pop");
      for (var i = 0; i < 6; i++) {
        var p = d.createElement("div");
        p.className = "wn-puff";
        p.innerHTML = i % 2 ? STAR : FLAKE;
        var a = Math.random() * Math.PI * 2, r = 26 + Math.random() * 24;
        p.style.setProperty("--x", e.clientX - 6 + "px");
        p.style.setProperty("--y", e.clientY - 6 + "px");
        p.style.setProperty("--dx", Math.cos(a) * r + "px");
        p.style.setProperty("--dy", Math.sin(a) * r + "px");
        d.body.appendChild(p);
        setTimeout(function (n) { return function () { n.remove(); }; }(p), 1050);
      }
    }, { passive: true });
  }

  function init() {
    if (d.body && /\b(ordering-process|type-cart|type-order)\b/.test(d.body.className)) return;
    var st = d.createElement("style");
    st.id = "formia-zima";
    st.textContent = css;
    d.head.appendChild(st);
    try { sky(); } catch (e) {}
    try { cursorFlake(); } catch (e) {}
  }
  d.readyState !== "loading" ? init() : d.addEventListener("DOMContentLoaded", init);
})();
