/**
 * Sylica marketing site: mobile nav, use-case tabs, FAQ accordions, stat animation.
 */
(function () {
  "use strict";

document.getElementById("year").textContent = new Date().getFullYear();

var nav = document.getElementById("nav");
var toggle = document.getElementById("menuToggle");
if (toggle && nav) {
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-label", nav.classList.contains("open") ? "Close menu" : "Open menu");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });
}

document.querySelectorAll(".tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    var id = tab.getAttribute("data-panel");
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.querySelectorAll(".panel").forEach(function (p) {
      var on = p.id === id;
      p.classList.toggle("active", on);
      p.hidden = !on;
    });
  });
});

document.querySelectorAll(".faq-item button").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var item = btn.closest(".faq-item");
    var open = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(function (i) {
      i.classList.remove("open");
      i.querySelector("button").setAttribute("aria-expanded", "false");
    });
    if (!open) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

var stat = document.getElementById("statNum");
if (stat) {
  var target = parseInt(stat.getAttribute("data-target"), 10) || 0;
  var done = false;
  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || done) return;
        done = true;
        var start = 0;
        var dur = 1400;
        var t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.floor(eased * target);
          stat.textContent = val.toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  obs.observe(stat);
}
})();
