/**
 * Hero pointer-driven crossfade from mock IC datasheet to parameter graph.
 */
(function () {
  "use strict";

var stage = document.getElementById("dsDemoStage");
var sheet = document.getElementById("dsDemoSheet");
var graph = document.getElementById("dsDemoGraph");
var cursor = document.getElementById("dsDemoCursor");
if (!stage || !sheet || !graph) return;

var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var cols = 10;
var rows = 8;
var total = cols * rows;
var visited = {};
var visitedCount = 0;
var targetProgress = 0;
var currentProgress = 0;
var hintEl = document.querySelector("#heroDatasheetDemo .ds-demo__hint span:last-child");
var raf = null;

function easeOut(t) {
  return 1 - Math.pow(1 - t, 2.2);
}

function markCell(ix, iy) {
  var key = ix + "," + iy;
  if (visited[key]) return;
  visited[key] = true;
  visitedCount++;
  targetProgress = Math.min(1, (visitedCount / total) * 1.15);
}

function pointerToCell(clientX, clientY) {
  var r = stage.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return;
  var x = (clientX - r.left) / r.width;
  var y = (clientY - r.top) / r.height;
  if (x < 0 || x > 1 || y < 0 || y > 1) return;
  var ix = Math.min(cols - 1, Math.max(0, Math.floor(x * cols)));
  var iy = Math.min(rows - 1, Math.max(0, Math.floor(y * rows)));
  markCell(ix, iy);
  if (cursor) {
    cursor.style.left = x * 100 + "%";
    cursor.style.top = y * 100 + "%";
  }
}

function applyVisual() {
  var e = easeOut(currentProgress);
  sheet.style.opacity = String(1 - e * 0.96);
  graph.style.opacity = String(0.04 + e * 0.96);
  graph.classList.toggle("is-rich", e > 0.62);
  if (hintEl) {
    if (e > 0.92) hintEl.textContent = "Graph · JSON · API";
    else if (e > 0.2) hintEl.textContent = "Extracting relationships…";
    else hintEl.textContent = "Drag across the datasheet";
  }
}

function tick() {
  raf = null;
  var diff = targetProgress - currentProgress;
  if (Math.abs(diff) < 0.001) {
    currentProgress = targetProgress;
    applyVisual();
    return;
  }
  currentProgress += diff * 0.12;
  applyVisual();
  raf = requestAnimationFrame(tick);
}

function scheduleTick() {
  if (raf != null) return;
  raf = requestAnimationFrame(tick);
}

if (reduceMotion) {
  currentProgress = targetProgress = 0.55;
  applyVisual();
  stage.classList.add("is-active");
  if (hintEl) hintEl.textContent = "Graph preview (reduced motion)";
  return;
}

function onMove(ev) {
  pointerToCell(ev.clientX, ev.clientY);
  stage.classList.add("is-active");
  scheduleTick();
}

stage.addEventListener("pointermove", onMove);
stage.addEventListener("pointerdown", function (ev) {
  try {
    stage.setPointerCapture(ev.pointerId);
  } catch (err) {}
  onMove(ev);
});
stage.addEventListener("pointerenter", function (ev) {
  onMove(ev);
});

applyVisual();
})();
