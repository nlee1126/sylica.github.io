/**
 * Sylica marketing site: mobile nav, use-case tabs, FAQ accordions.
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

})();
