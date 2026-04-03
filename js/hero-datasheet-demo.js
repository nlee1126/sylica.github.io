/**
 * Hero demo: pointer X drives a left→right clip swipe; datasheet stays visible
 * to the right of the reveal edge. Graph uses six-node reference topology.
 */
(function () {
  "use strict";

  var stage = document.getElementById("dsDemoStage");
  var graph = document.getElementById("dsDemoGraph");
  if (!stage || !graph) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hintEl = document.querySelector("#heroDatasheetDemo .ds-demo__hint span:last-child");
  var targetSwipe = 0;
  var currentSwipe = 0;
  var raf = null;

  function setSwipe(percent) {
    var p = Math.max(0, Math.min(100, percent));
    stage.style.setProperty("--ds-swipe", p + "%");
    graph.classList.toggle("is-rich", p > 78);
    if (hintEl) {
      if (p > 92) hintEl.textContent = "Graph · JSON · API";
      else if (p > 12) hintEl.textContent = "Extracting structure…";
      else hintEl.textContent = "Swipe right to reveal the graph";
    }
  }

  function tick() {
    raf = null;
    var diff = targetSwipe - currentSwipe;
    if (Math.abs(diff) < 0.35) {
      currentSwipe = targetSwipe;
      setSwipe(currentSwipe);
      return;
    }
    currentSwipe += diff * 0.22;
    setSwipe(currentSwipe);
    raf = requestAnimationFrame(tick);
  }

  function scheduleTick() {
    if (raf != null) return;
    raf = requestAnimationFrame(tick);
  }

  function pointerToSwipe(clientX) {
    var r = stage.getBoundingClientRect();
    if (r.width <= 0) return;
    var x = (clientX - r.left) / r.width;
    targetSwipe = Math.max(0, Math.min(100, x * 100));
    stage.classList.add("is-active");
    scheduleTick();
  }

  if (reduceMotion) {
    currentSwipe = targetSwipe = 52;
    setSwipe(currentSwipe);
    stage.classList.add("is-active");
    if (hintEl) hintEl.textContent = "Graph preview (reduced motion)";
    return;
  }

  function onMove(ev) {
    pointerToSwipe(ev.clientX);
  }

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerdown", function (ev) {
    try {
      stage.setPointerCapture(ev.pointerId);
    } catch (err) {}
    onMove(ev);
  });
  stage.addEventListener("pointerenter", onMove);
  stage.addEventListener("pointerleave", function () {
    stage.classList.remove("is-active");
  });

  setSwipe(0);
})();
