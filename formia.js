(function () {
  "use strict";
  var d = document, html = d.documentElement, w = window;
  var RM = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!RM) html.classList.add("fx-anim");

  function ready(fn) { d.readyState !== "loading" ? fn() : d.addEventListener("DOMContentLoaded", fn); }
  function safe(fn) { try { fn(); } catch (e) { if (w.console) console.warn("[formia-fx]", e); } }
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* 1) Běžící text v horní liště */
  function marquee() {
    var t = $(".site-msg.information .text");
    if (!t || t.getAttribute("data-fx") || RM) return;
    t.setAttribute("data-fx", "1");
    var src = t.innerHTML.trim();
    var unit = "<span>" + src + "</span><i>✦</i>", g = "";
    for (var i = 0; i < 4; i++) g += unit;
    t.innerHTML = '<span class="sr-only">' + src + "</span>" +
      '<div class="fx-marquee" aria-hidden="true"><div class="fx-marquee__g">' + g + '</div><div class="fx-marquee__g">' + g + "</div></div>";
  }

  /* 2) Animace prvků při scrollu */
  var SEL = [
    ".next-to-carousel-banners .banner-wrapper",
    ".benefitBanner__item",
    ".homepage-group-title",
    ".products-wrapper",
    ".welcome",
    ".products-block .product",
    ".custom-footer > div",
    ".category-perex",
    ".news-item",
    ".p-detail-tabs-wrapper"
  ].join(",");
  var io = null;
  function prepReveal(root) {
    if (RM || !("IntersectionObserver" in w)) return;
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    }
    $$(SEL, root).forEach(function (el) {
      if (el.getAttribute("data-fx-r") || el.closest(".product-slider")) return;
      el.setAttribute("data-fx-r", "1");
      var r = el.getBoundingClientRect();
      if (r.top < w.innerHeight * 0.95 && r.bottom > 0) return; // už je vidět – neschovávat
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el) % 4;
      el.style.setProperty("--fx-d", idx * 90 + "ms");
      el.classList.add("fx-r");
      io.observe(el);
    });
  }

  /* 3) Scroll: hlavička, progress, tlačítko nahoru, parallax hero */
  function scrollFx() {
    var bar = d.createElement("div"); bar.className = "fx-progress"; d.body.appendChild(bar);
    var top = d.createElement("button");
    top.className = "fx-top"; top.type = "button"; top.setAttribute("aria-label", "Zpět nahoru");
    top.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    top.addEventListener("click", function () { w.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); });
    d.body.appendChild(top);

    var heroImg = $("#carousel .item img");
    var scrolled = false, ticking = false;
    function update() {
      ticking = false;
      var y = w.pageYOffset || html.scrollTop;
      if (!scrolled && y > 170) { scrolled = true; html.classList.add("fx-scrolled"); }
      else if (scrolled && y < 24) { scrolled = false; html.classList.remove("fx-scrolled"); }
      var max = Math.max(1, html.scrollHeight - w.innerHeight);
      bar.style.transform = "scaleX(" + Math.min(1, y / max) + ")";
      top.classList.toggle("is-on", y > 700);
      if (heroImg && !RM && w.innerWidth >= 992 && y < w.innerHeight * 1.5) {
        heroImg.style.translate = "0 " + (y * 0.18).toFixed(1) + "px";
      }
    }
    w.addEventListener("scroll", function () { if (!ticking) { ticking = true; w.requestAnimationFrame(update); } }, { passive: true });
    w.addEventListener("resize", update, { passive: true });
    update();
  }

  /* 4) Varianty jako klikací dlaždice (původní select zůstává a řídí košík) */
  function variantPills() {
    $$(".p-variants-block select, .variant-list select").forEach(function (sel) {
      if (sel.getAttribute("data-fx")) return;
      var opts = Array.prototype.slice.call(sel.options).filter(function (o) { return o.value !== ""; });
      if (opts.length < 2 || opts.length > 12) return;
      sel.setAttribute("data-fx", "1");

      var data = (w.shoptet && shoptet.variantsSplit && shoptet.variantsSplit.necessaryVariantData) || {};
      var pid = sel.getAttribute("data-parameter-id");
      var singleParam = $$("select", sel.closest(".p-variants-block") || d).length === 1;

      var box = d.createElement("div");
      box.className = "fx-pills"; box.setAttribute("role", "radiogroup");
      var lbl = sel.getAttribute("data-parameter-name") || "Varianta";
      box.setAttribute("aria-label", lbl);

      opts.forEach(function (o) {
        var b = d.createElement("button");
        b.type = "button"; b.className = "fx-pill"; b.setAttribute("role", "radio");
        b.setAttribute("data-value", o.value);
        var price = "";
        if (singleParam && pid && data[pid + "-" + o.value] && data[pid + "-" + o.value].price) price = data[pid + "-" + o.value].price;
        b.innerHTML = "<span></span>" + (price ? "<small></small>" : "");
        b.firstChild.textContent = o.textContent.trim();
        if (price) b.lastChild.textContent = price;
        if (o.disabled) b.disabled = true;
        b.addEventListener("click", function () {
          if (sel.value === o.value) return;
          sel.value = o.value;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          sync();
        });
        box.appendChild(b);
      });

      function sync() {
        $$(".fx-pill", box).forEach(function (b) {
          b.setAttribute("aria-checked", b.getAttribute("data-value") === sel.value ? "true" : "false");
          var o = sel.querySelector('option[value="' + b.getAttribute("data-value") + '"]');
          if (o) b.disabled = !!o.disabled;
        });
      }
      sel.addEventListener("change", sync);
      sel.parentNode.insertBefore(box, sel.nextSibling);
      sel.parentNode.classList.add("fx-has-pills");
      sync();
    });
  }

  /* 5) Plovoucí lišta „Do košíku“ na detailu produktu */
  function buyBar() {
    var btn = $(".p-detail .add-to-cart-button");
    if (!btn || !("IntersectionObserver" in w) || $(".fx-buybar")) return;
    var nameEl = $(".p-detail-inner-header h1");
    var priceEl = $(".p-detail .p-price-wrapper .price-final");
    var bar = d.createElement("div");
    bar.className = "fx-buybar"; bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<span class="fx-buybar__name"></span><span class="fx-buybar__price"></span><button type="button" class="fx-buybar__btn" tabindex="-1">Do košíku</button>';
    var bName = bar.children[0], bPrice = bar.children[1], bBtn = bar.children[2];
    bName.textContent = nameEl ? nameEl.textContent.trim() : "";
    function setPrice() {
      if (!priceEl) return;
      // u variant má Shoptet v ceně více „holderů“ a nepoužité skrývá třídou no-display
      var h = priceEl.querySelector(".price-final-holder:not(.no-display):not(.noDisplay)");
      bPrice.textContent = (h || priceEl).textContent.replace(/\s+/g, " ").trim();
    }
    setPrice();
    if (priceEl && "MutationObserver" in w) new MutationObserver(setPrice).observe(priceEl, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    d.body.appendChild(bar);

    bBtn.addEventListener("click", function () {
      var missing = $$(".p-variants-block select").filter(function (s) { return !s.value; })[0];
      if (missing) {
        var block = $(".p-variants-block");
        block.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" });
        block.classList.remove("fx-flash"); void block.offsetWidth; block.classList.add("fx-flash");
        return;
      }
      btn.click();
    });

    var past = false;
    new IntersectionObserver(function (en) {
      var e = en[0];
      past = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("is-on", past);
      html.classList.toggle("fx-buybar-on", past);
    }).observe(btn);
  }

  /* 6) Nově načtený obsah (filtry, řazení, AJAX) */
  function watchAjax() {
    var root = $("#content-wrapper") || d.body;
    if (!("MutationObserver" in w)) return;
    var t;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { safe(function () { prepReveal(root); }); safe(variantPills); }, 120);
    }).observe(root, { childList: true, subtree: true });
  }

  ready(function () {
    safe(marquee);
    safe(scrollFx);
    safe(variantPills);
    safe(buyBar);
    safe(function () { prepReveal(d); });
    safe(watchAjax);
  });
})();
