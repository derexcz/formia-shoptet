/* =========================================================
   FORMIA – Halloweenská výzdoba
   Dýně a duchové v pozadí + roztomilý duch u kurzoru.
   Sama se vypne po datu KONEC. Vypnout hned = smazat řádek
   s halloween.js ze Shoptetu.
   ========================================================= */
(function () {
  "use strict";

  var KONEC = "2026-11-03"; // od tohoto dne se výzdoba už nezobrazí
  if (new Date() >= new Date(KONEC + "T00:00:00")) return;

  var d = document, w = window, html = d.documentElement;
  var RM = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = w.matchMedia && w.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- SVG ---------- */
  var GHOST =
    '<svg viewBox="0 0 60 70" aria-hidden="true">' +
    '<path d="M30 4C16 4 7 15 7 30V61q4 6 8 0q4 6 8 0q3.5 6 7 0q3.5 6 7 0q4 6 8 0q4 6 8 0V30C53 15 44 4 30 4z" fill="#fff"/>' +
    '<g class="hw-eyes"><ellipse cx="22" cy="31" rx="3.6" ry="4.6" fill="#3a2621"/><ellipse cx="38" cy="31" rx="3.6" ry="4.6" fill="#3a2621"/>' +
    '<circle cx="23.3" cy="29.3" r="1.3" fill="#fff"/><circle cx="39.3" cy="29.3" r="1.3" fill="#fff"/></g>' +
    '<ellipse cx="15.5" cy="39" rx="4" ry="2.4" fill="#F2B0A0" opacity=".85"/><ellipse cx="44.5" cy="39" rx="4" ry="2.4" fill="#F2B0A0" opacity=".85"/>' +
    '<path d="M27 39q3 3.2 6 0" stroke="#3a2621" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    "</svg>";

  function pumpkin(face) {
    return '<svg viewBox="0 0 64 62" aria-hidden="true">' +
      '<path d="M32 15c0-5 1.5-9 6-11" stroke="#5A3931" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M37 9c6-7 15-5 17 1-7 4-13 3-17-1z" fill="#8E9B6E"/>' +
      '<ellipse cx="19" cy="38" rx="15" ry="20" fill="#C9763F"/>' +
      '<ellipse cx="45" cy="38" rx="15" ry="20" fill="#C9763F"/>' +
      '<ellipse cx="32" cy="38" rx="14.5" ry="21.5" fill="#E0925E"/>' +
      '<ellipse cx="26" cy="29" rx="3" ry="7" fill="#fff" opacity=".22"/>' +
      (face
        ? '<ellipse cx="25" cy="37" rx="2.6" ry="3.3" fill="#5A3931"/><ellipse cx="39" cy="37" rx="2.6" ry="3.3" fill="#5A3931"/>' +
          '<path d="M27 45q5 4.5 10 0" stroke="#5A3931" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
          '<ellipse cx="20" cy="43" rx="3" ry="1.8" fill="#F2B0A0" opacity=".7"/><ellipse cx="44" cy="43" rx="3" ry="1.8" fill="#F2B0A0" opacity=".7"/>'
        : "") +
      "</svg>";
  }

  var SPARK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0q1.2 8.8 10 10q-8.8 1.2-10 10q-1.2-8.8-10-10q8.8-1.2 10-10z" fill="#D3A184"/></svg>';

  /* ---------- CSS ---------- */
  var css =
    ".hw-sky{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}" +
    ".hw-item{position:absolute;left:0;top:0;will-change:transform}" +
    ".hw-item svg{display:block;width:100%;height:auto;filter:drop-shadow(0 8px 10px rgba(90,57,49,.18))}" +
    ".hw-float{animation:hw-float var(--hw-t,7s) ease-in-out var(--hw-dl,0s) infinite}" +
    "@keyframes hw-float{0%,100%{transform:translateY(0) rotate(var(--hw-r1,-6deg))}50%{transform:translateY(-14px) rotate(var(--hw-r2,6deg))}}" +
    ".hw-eyes{transform-box:fill-box;transform-origin:center;animation:hw-blink 4.6s infinite}" +
    "@keyframes hw-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}" +
    ".hw-spark{animation:hw-twinkle var(--hw-t,3s) ease-in-out var(--hw-dl,0s) infinite}" +
    "@keyframes hw-twinkle{0%,100%{opacity:.25;transform:scale(.7) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}" +
    /* duch u kurzoru */
    ".hw-ghost{position:fixed;left:0;top:0;width:44px;z-index:2147483000;pointer-events:none;opacity:0;transition:opacity .45s}" +
    ".hw-ghost.is-on{opacity:1}" +
    ".hw-ghost__flip{transition:transform .35s cubic-bezier(.2,.8,.2,1)}" +
    ".hw-ghost__bob{animation:hw-bob 1.8s ease-in-out infinite}" +
    ".hw-ghost svg{display:block;width:100%;height:auto;filter:drop-shadow(0 10px 12px rgba(90,57,49,.28))}" +
    "@keyframes hw-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}" +
    ".hw-ghost.is-boo .hw-ghost__bob{animation:hw-boo .5s cubic-bezier(.3,1.6,.5,1)}" +
    "@keyframes hw-boo{0%{transform:scale(1)}35%{transform:scale(1.35,.8)}70%{transform:scale(.9,1.15)}100%{transform:scale(1)}}" +
    ".hw-puff{position:fixed;left:0;top:0;width:12px;z-index:2147482999;pointer-events:none;animation:hw-puff .9s ease-out forwards}" +
    "@keyframes hw-puff{from{opacity:1;transform:translate(var(--x),var(--y)) scale(1)}to{opacity:0;transform:translate(calc(var(--x) + var(--dx)),calc(var(--y) + var(--dy))) scale(.3) rotate(90deg)}}" +
    "@media (prefers-reduced-motion:reduce){.hw-float,.hw-spark,.hw-eyes,.hw-ghost__bob{animation:none!important}}";

  /* ---------- Pozadí s dýněmi a duchy ---------- */
  function sky() {
    var mobile = w.innerWidth < 768;
    var layer = d.createElement("div");
    layer.className = "hw-sky";
    layer.setAttribute("aria-hidden", "true");

    // [typ, x %, y %, velikost px, hloubka (rychlost parallaxu)]
    var plan = [
      ["g", 4, 12, 58, .35], ["p", 92, 8, 64, .45], ["s", 18, 30, 16, .15],
      ["pf", 6, 52, 70, .5], ["g", 88, 40, 48, .25], ["s", 80, 22, 14, .1],
      ["p", 14, 82, 44, .25], ["g", 94, 70, 62, .4], ["s", 50, 6, 12, .12],
      ["pf", 84, 92, 54, .35], ["g", 30, 64, 34, .15], ["s", 70, 58, 18, .2],
      ["p", 60, 96, 38, .2], ["g", 46, 36, 30, .1], ["s", 96, 50, 12, .1],
      ["s", 2, 70, 14, .12]
    ];
    if (mobile) plan = plan.filter(function (_, i) { return i % 2 === 0; });

    var items = plan.map(function (p, i) {
      var el = d.createElement("div");
      var size = mobile ? Math.round(p[3] * 0.7) : p[3];
      el.className = "hw-item";
      el.style.width = size + "px";
      var inner = d.createElement("div");
      inner.className = p[0] === "s" ? "hw-spark" : "hw-float";
      inner.style.setProperty("--hw-t", (5 + (i % 5) * 1.3).toFixed(1) + "s");
      inner.style.setProperty("--hw-dl", (-i * 0.7).toFixed(1) + "s");
      inner.style.setProperty("--hw-r1", (i % 2 ? -8 : 5) + "deg");
      inner.style.setProperty("--hw-r2", (i % 2 ? 6 : -7) + "deg");
      inner.innerHTML = p[0] === "g" ? GHOST : p[0] === "s" ? SPARK : pumpkin(p[0] === "pf");
      el.appendChild(inner);
      // vzdálenější (pomalejší) prvky jsou průhlednější
      el.style.opacity = p[0] === "s" ? "1" : (0.45 + p[4]).toFixed(2);
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

  /* ---------- Duch u kurzoru ---------- */
  function cursorGhost() {
    if (!FINE || RM) return;
    var g = d.createElement("div");
    g.className = "hw-ghost";
    g.setAttribute("aria-hidden", "true");
    g.innerHTML = '<div class="hw-ghost__flip"><div class="hw-ghost__bob">' + GHOST + "</div></div>";
    d.body.appendChild(g);
    var flip = g.firstChild;

    var mx = -100, my = -100, x = -100, y = -100, rot = 0, facing = 1, running = false, first = true;
    var OX = 22, OY = 18; // odsazení od kurzoru, aby duch nepřekážel klikání

    function loop() {
      var tx = mx + OX, ty = my + OY;
      var vx = (tx - x) * 0.11, vy = (ty - y) * 0.11;
      x += vx; y += vy;
      rot += (Math.max(-20, Math.min(20, vx * 1.6)) - rot) * 0.15;
      if (vx < -0.6 && facing !== -1) { facing = -1; flip.style.transform = "scaleX(-1)"; }
      else if (vx > 0.6 && facing !== 1) { facing = 1; flip.style.transform = "scaleX(1)"; }
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

    // po kliknutí duch udělá „búú“ a vypustí pár jiskřiček
    d.addEventListener("mousedown", function (e) {
      g.classList.remove("is-boo"); void g.offsetWidth; g.classList.add("is-boo");
      for (var i = 0; i < 5; i++) {
        var p = d.createElement("div");
        p.className = "hw-puff";
        p.innerHTML = SPARK;
        var a = Math.random() * Math.PI * 2, r = 26 + Math.random() * 22;
        p.style.setProperty("--x", e.clientX - 6 + "px");
        p.style.setProperty("--y", e.clientY - 6 + "px");
        p.style.setProperty("--dx", Math.cos(a) * r + "px");
        p.style.setProperty("--dy", Math.sin(a) * r + "px");
        d.body.appendChild(p);
        setTimeout(function (n) { return function () { n.remove(); }; }(p), 950);
      }
    }, { passive: true });
  }

  function init() {
    var st = d.createElement("style");
    st.id = "formia-halloween";
    st.textContent = css;
    d.head.appendChild(st);
    try { sky(); } catch (e) {}
    try { cursorGhost(); } catch (e) {}
  }
  d.readyState !== "loading" ? init() : d.addEventListener("DOMContentLoaded", init);
})();
