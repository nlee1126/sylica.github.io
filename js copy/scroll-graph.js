/**
 * scroll-graph.js
 *
 * 1. Scroll-reveal: .graph-node-reveal elements fade+scale in on entry.
 * 2. Spine: injects an SVG inside .sections-track that draws curved paths
 *    between adjacent node-ring circles, making the page look like you're
 *    traversing a knowledge graph. Paths brighten as each section enters view.
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ─────────────────────────────────────────────
     1. Scroll-reveal
  ───────────────────────────────────────────── */
  function initScrollReveal() {
    const els = document.querySelectorAll('.graph-node-reveal');
    if (!els.length) return;

    if (reducedMotion) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 }
    );

    els.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────────
     2. Spine SVG between node-rings
  ───────────────────────────────────────────── */
  let spineSvg = null;
  let pathEls  = [];
  let rings    = [];

  function initSpine() {
    if (reducedMotion) return;

    const track = document.getElementById('sectionsTrack');
    if (!track) return;

    rings = Array.from(track.querySelectorAll('.node-ring'));
    if (rings.length < 2) return;

    // Create SVG overlay inside the track
    spineSvg = document.createElementNS(NS, 'svg');
    spineSvg.classList.add('spine-svg');
    spineSvg.setAttribute('aria-hidden', 'true');
    track.prepend(spineSvg); // behind content (z-index 0 via CSS)

    // One path per adjacent pair
    pathEls = rings.slice(0, -1).map((_, i) => {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(212,196,176,0.12)');
      path.setAttribute('stroke-width', '1.5');
      spineSvg.appendChild(path);
      return path;
    });

    // Also one dot per ring (shows node position on spine)
    rings.forEach(() => {
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', 'rgba(212,196,176,0.18)');
      dot.setAttribute('stroke', 'rgba(212,196,176,0.25)');
      dot.setAttribute('stroke-width', '1');
      spineSvg.appendChild(dot);
    });

    drawSpine();
    window.addEventListener('resize', drawSpine);

    // Brighten paths when target section enters view
    const sections = track.querySelectorAll('.node-section');
    sections.forEach((section, i) => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const active = entry.isIntersecting;
          // Incoming path (i > 0 → path index i-1)
          if (i > 0 && pathEls[i - 1]) {
            pathEls[i - 1].setAttribute(
              'stroke',
              active ? 'rgba(212,196,176,0.42)' : 'rgba(212,196,176,0.12)'
            );
            pathEls[i - 1].style.filter = active
              ? 'drop-shadow(0 0 3px rgba(212,196,176,0.3))'
              : '';
          }
          // Outgoing path (path index i)
          if (pathEls[i]) {
            pathEls[i].setAttribute(
              'stroke',
              active ? 'rgba(212,196,176,0.28)' : 'rgba(212,196,176,0.12)'
            );
          }
          // Dot for this ring
          const dots = spineSvg.querySelectorAll('circle');
          if (dots[i]) {
            dots[i].setAttribute(
              'fill',
              active ? 'rgba(212,196,176,0.65)' : 'rgba(212,196,176,0.18)'
            );
            dots[i].style.filter = active
              ? 'drop-shadow(0 0 5px rgba(212,196,176,0.55))'
              : '';
          }
        });
      }, { threshold: 0.2 });

      obs.observe(section);
    });
  }

  function drawSpine() {
    if (!spineSvg || !rings.length) return;

    const trackRect = spineSvg.parentElement.getBoundingClientRect();
    const totalH    = spineSvg.parentElement.scrollHeight;
    const totalW    = spineSvg.parentElement.offsetWidth;

    spineSvg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
    spineSvg.style.height = totalH + 'px';
    spineSvg.style.width  = '100%';

    // Get absolute center of each ring within the track
    const ringCenters = rings.map(ring => {
      const r = ring.getBoundingClientRect();
      const t = spineSvg.parentElement.getBoundingClientRect();
      return {
        x: r.left - t.left + r.width  / 2,
        y: r.top  - t.top  + window.scrollY - (trackRect.top - spineSvg.parentElement.getBoundingClientRect().top) + r.height / 2,
      };
    });

    // Draw cubic bezier paths between adjacent rings
    pathEls.forEach((path, i) => {
      const a = ringCenters[i];
      const b = ringCenters[i + 1];
      if (!a || !b) return;

      // Horizontal wobble gives it organic feel
      const wobble = (b.x - a.x) * 0.45;
      const d = `M ${a.x} ${a.y} C ${a.x + wobble} ${a.y + (b.y - a.y) * 0.4}, ${b.x - wobble} ${b.y - (b.y - a.y) * 0.4}, ${b.x} ${b.y}`;
      path.setAttribute('d', d);
    });

    // Update dots
    const dots = spineSvg.querySelectorAll('circle');
    ringCenters.forEach((c, i) => {
      if (dots[i]) {
        dots[i].setAttribute('cx', c.x);
        dots[i].setAttribute('cy', c.y);
      }
    });
  }

  /* ─────────────────────────────────────────────
     Init
  ───────────────────────────────────────────── */
  function init() {
    initScrollReveal();
    // Spine needs layout to be ready
    if (document.readyState === 'complete') {
      initSpine();
    } else {
      window.addEventListener('load', initSpine);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
