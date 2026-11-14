/**
 * Atmosfera: partículas de poeira dançando num facho de luz
 * e um refletor suave que acompanha o cursor.
 */

export function startAmbient({ canvas, spot, reduced }) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let dpr = 1;
  const motes = [];
  const pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(110, (w * h) / 14000));
    while (motes.length < target) motes.push(spawn(true));
    motes.length = target;
  }

  function spawn(anywhere) {
    const depth = Math.random();
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.4 + depth * 1.8,
      depth,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(0.04 + Math.random() * 0.12) * (0.4 + depth),
      phase: Math.random() * Math.PI * 2,
      tw: 0.4 + Math.random() * 1.2,
      blur: depth > 0.82,
    };
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    // Facho de luz vindo do alto
    const cx = w * (0.5 + (pointer.x - 0.5) * 0.06);
    for (const m of motes) {
      m.x += m.vx + Math.sin(t * 0.0003 + m.phase) * 0.06 * m.depth;
      m.y += m.vy;
      if (m.y < -10 || m.x < -10 || m.x > w + 10) Object.assign(m, spawn(false));
      // Mais brilho dentro do cone de luz
      const dx = Math.abs(m.x - cx) / (w * 0.42 + (m.y / h) * w * 0.12);
      const inBeam = Math.max(0, 1 - dx * dx);
      const twinkle = 0.55 + 0.45 * Math.sin(t * 0.001 * m.tw + m.phase);
      const a = (0.08 + inBeam * 0.55) * twinkle * (0.35 + m.depth * 0.65);
      if (a < 0.02) continue;
      if (m.blur) {
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0, `rgba(255,214,150,${a * 0.5})`);
        g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255,226,178,${a})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  let raf = 0;
  function loop(t) {
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    spot.style.setProperty('--sx', `${(pointer.x * 100).toFixed(2)}%`);
    spot.style.setProperty('--sy', `${(pointer.y * 100).toFixed(2)}%`);
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = e.clientY / window.innerHeight;
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
  });

  resize();
  if (reduced) draw(0);
  else raf = requestAnimationFrame(loop);
}
