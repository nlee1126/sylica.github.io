/**
 * background-canvas.js
 * Animated knowledge graph background — slowly drifting nodes connected by edges.
 * Very subtle: opacity controlled by CSS (#bgCanvas { opacity: 0.09 }).
 */

(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const NODE_COUNT = 22;
  const CONNECT_DIST = 180;
  const NODE_COLOR = 'rgba(212,196,176,1)';
  const EDGE_COLOR = 'rgba(212,196,176,0.45)';

  let W, H, nodes, raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function makeNode() {
    return {
      x:   randomBetween(0.05, 0.95) * W,
      y:   randomBetween(0.05, 0.95) * H,
      vx:  randomBetween(-0.12, 0.12),
      vy:  randomBetween(-0.12, 0.12),
      r:   randomBetween(2.2, 4.0),
      phase: randomBetween(0, Math.PI * 2),
      speed: randomBetween(0.004, 0.009),
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    // Update node positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // Draw edges
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.55;
          ctx.strokeStyle = EDGE_COLOR.replace('0.45', alpha.toFixed(3));
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      const pulse = n.r + Math.sin(ts * n.speed + n.phase) * 0.9;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = NODE_COLOR;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  init();
  raf = requestAnimationFrame(draw);
  window.addEventListener('resize', () => { resize(); });
})();
