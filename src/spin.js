import gsap from 'gsap';

/**
 * Girar o livro em 360°.
 *  - #float gira em X (inclina a vista), #camera gira em Y (o livro gira no próprio eixo).
 *  - Mouse: arrastar em qualquer lugar gira (sem precisar ativar nada).
 *  - Toque: ativa pelo botão "360°" (senão o arrasto vira página).
 *  - Botão de novo / Esc / duplo clique: volta ao lugar.
 */
export function createSpin({ float, camera, stage, button, hint, canStart, onChange }) {
  let active = false;
  let rx = 0;
  let ry = 0;
  let drag = null;
  let moved = false;
  let hintTimer;
  // liga/desliga do recurso (lembrado). No toque começa desligado,
  // para o deslize do dedo continuar virando página.
  const KEY = 'livro.spin';
  let enabled = !window.matchMedia('(pointer: coarse)').matches;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) enabled = saved === 'on';
  } catch {}
  const syncButton = () => {
    button.setAttribute('aria-pressed', String(enabled));
    button.classList.toggle('is-off', !enabled);
    button.title = enabled ? 'Giro 360° ligado — clique para desligar' : 'Giro 360° desligado — clique para ligar';
  };
  syncButton();

  const apply = () => {
    gsap.set(float, { rotationX: rx });
    gsap.set(camera, { rotationY: ry });
  };

  function setActive(on) {
    active = on;
    document.body.classList.toggle('is-spin', on);
    onChange?.(on);
    clearTimeout(hintTimer);
    hint.classList.toggle('is-shown', on);
    if (on) hintTimer = setTimeout(() => hint.classList.remove('is-shown'), 3200);
  }

  function reset() {
    gsap.killTweensOf([float, camera], 'rotationX,rotationY');
    // volta pelo caminho mais curto
    const target = Math.round(ry / 360) * 360;
    const proxy = { rx, ry };
    gsap.to(proxy, {
      rx: 0,
      ry: target,
      duration: 1.3,
      ease: 'power3.inOut',
      onUpdate: () => {
        rx = proxy.rx;
        ry = proxy.ry;
        apply();
      },
      onComplete: () => {
        ry = 0;
        apply();
      },
    });
    setActive(false);
  }

  /** dá uma volta completa para mostrar que gira */
  function showcase() {
    const proxy = { rx, ry };
    gsap.to(proxy, {
      keyframes: [
        { rx: 16, ry: ry - 200, duration: 1.4, ease: 'power2.inOut' },
        { rx: 12, ry: ry - 330, duration: 1.1, ease: 'power2.out' },
      ],
      onUpdate: () => {
        rx = proxy.rx;
        ry = proxy.ry;
        apply();
      },
    });
  }

  button.addEventListener('click', () => {
    if (!canStart()) return;
    enabled = !enabled;
    try {
      localStorage.setItem(KEY, enabled ? 'on' : 'off');
    } catch {}
    syncButton();
    if (enabled) {
      setActive(true);
      showcase();
    } else {
      reset();
    }
  });

  stage.addEventListener('pointerdown', (e) => {
    if (!canStart() || e.button !== 0 || !enabled || e.__page) return;
    if (e.pointerType !== 'mouse' && !active) return;
    if (e.target.closest('#ui, #menu, #desk-props, #talk, input, textarea, [data-copy]')) return;
    if (e.target.closest('a, button') && !e.target.closest('.leaf')) return;
    gsap.killTweensOf([float, camera]);
    drag = { x: e.clientX, y: e.clientY, rx, ry, t: performance.now(), vx: 0, vy: 0, id: e.pointerId };
    moved = false;
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    if (!moved) {
      moved = true;
      document.body.classList.add('is-dragging');
      if (!active) setActive(true);
      try { stage.setPointerCapture(e.pointerId); } catch {}
    }
    const k = 360 / Math.max(700, window.innerWidth);
    const nrx = Math.max(-80, Math.min(80, drag.rx - dy * k));
    const nry = drag.ry + dx * k;
    const now = performance.now();
    const dt = Math.max(1, now - drag.t);
    drag.vx = ((nry - ry) / dt) * 16;
    drag.vy = ((nrx - rx) / dt) * 16;
    drag.t = now;
    rx = nrx;
    ry = nry;
    apply();
  });

  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const { vx, vy } = drag;
    drag = null;
    document.body.classList.remove('is-dragging');
    if (!moved) return;
    setTimeout(() => (moved = false), 60);
    // inércia
    const proxy = { rx, ry };
    gsap.to(proxy, {
      rx: Math.max(-80, Math.min(80, rx + vy * 9)),
      ry: ry + vx * 9,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        rx = proxy.rx;
        ry = proxy.ry;
        apply();
      },
    });
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // um arrasto não deve virar clique (cantos de página, links)
  window.addEventListener('click', (e) => {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  }, true);

  stage.addEventListener('dblclick', (e) => {
    if (active && !e.target.closest('a, button, [data-curl]')) reset();
  });

  return {
    get enabled() {
      return enabled;
    },
    get active() {
      return active;
    },
    get rotated() {
      return active || Math.abs(rx) > 0.5 || Math.abs(ry % 360) > 0.5;
    },
    reset,
    /** volta ao lugar sem animação (ex.: reiniciar a abertura) */
    resetNow() {
      gsap.killTweensOf([float, camera]);
      drag = null;
      rx = 0;
      ry = 0;
      apply();
      if (active) setActive(false);
    },
  };
}
