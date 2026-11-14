import gsap from 'gsap';

/**
 * Modo 360°: girar o livro nas mãos.
 *  - Desligado por padrão: nada gira por acidente e as páginas folheiam normalmente.
 *  - Ligar (botão 360° ou menu): o livro dá uma volta, ganha espessura e
 *    arrastar em qualquer lugar (mouse ou dedo) gira. Folhear fica pausado.
 *  - Sair: botão "voltar ao livro", o próprio 360°, Esc ou duplo clique.
 *  #float gira em X (inclina a vista), #camera gira em Y (o livro gira no próprio eixo).
 */
export function createSpin({ float, camera, stage, button, exit, hint, canStart, onChange }) {
  let active = false;
  let rx = 0;
  let ry = 0;
  let drag = null;
  let moved = false;
  let hintTimer;
  let raf = 0;

  // aplica no máximo uma vez por quadro (eventos de ponteiro chegam a 120+/s)
  const apply = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      gsap.set(float, { rotationX: rx });
      gsap.set(camera, { rotationY: ry });
    });
  };

  function syncButton() {
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-off', !active);
    button.title = active ? 'Sair do modo 360°' : 'Girar o livro em 360°';
    exit.hidden = !active;
  }

  function setActive(on) {
    if (active === on) return;
    active = on;
    document.body.classList.toggle('is-spin', on);
    syncButton();
    onChange?.(on);
    clearTimeout(hintTimer);
    hint.classList.toggle('is-shown', on);
    if (on) hintTimer = setTimeout(() => hint.classList.remove('is-shown'), 3200);
  }
  syncButton();

  function tweenTo(to, opts) {
    gsap.killTweensOf(state);
    state.rx = rx;
    state.ry = ry;
    return gsap.to(state, {
      ...to,
      ...opts,
      onUpdate: () => {
        rx = state.rx;
        ry = state.ry;
        apply();
      },
    });
  }
  const state = { rx: 0, ry: 0 };

  /** sai do modo e volta o livro de frente, pelo caminho mais curto */
  function reset() {
    drag = null;
    const target = Math.round(ry / 360) * 360;
    tweenTo({ rx: 0, ry: target }, {
      duration: 1.2,
      ease: 'power3.inOut',
      onComplete: () => {
        ry = 0;
        rx = 0;
        apply();
      },
    });
    setActive(false);
  }

  function enter() {
    if (!canStart()) return;
    setActive(true);
    // uma volta para mostrar que gira
    tweenTo({ keyframes: [{ rx: 14, ry: ry - 200, duration: 1.3, ease: 'power2.inOut' }, { rx: 6, ry: ry - 360, duration: 1, ease: 'power2.out' }] }, {});
  }

  button.addEventListener('click', () => (active ? reset() : enter()));
  exit.addEventListener('click', reset);

  // em qualquer ponto do palco ou da mesa (no celular o livro ocupa quase a tela toda)
  document.addEventListener('pointerdown', (e) => {
    if (!active || e.button !== 0 || e.__page) return;
    if (!e.target.closest('#stage, #desk-props')) return;
    if (e.target.closest('#ui, #talk, #spin-exit, #obj-modal, #phone-modal, input, textarea')) return;
    gsap.killTweensOf(state);
    drag = { x: e.clientX, y: e.clientY, rx, ry, t: performance.now(), vx: 0, vy: 0, id: e.pointerId };
    moved = false;
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    if (!moved) {
      // trava de eixo: gesto claramente horizontal só gira; claramente vertical só inclina
      drag.lock = Math.abs(dx) > Math.abs(dy) * 2 ? 'y' : Math.abs(dy) > Math.abs(dx) * 2 ? 'x' : null;
      moved = true;
      document.body.classList.add('is-dragging');
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {}
    }
    // atravessar a largura da tela ≈ uma volta completa
    const k = 360 / Math.max(320, Math.min(window.innerWidth, 1400));
    const nrx = drag.lock === 'y' ? drag.rx : Math.max(-75, Math.min(75, drag.rx - dy * k * 0.7));
    const nry = drag.lock === 'x' ? drag.ry : drag.ry + dx * k;
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
    const { vx, vy, t } = drag;
    drag = null;
    document.body.classList.remove('is-dragging');
    if (!moved) return;
    setTimeout(() => (moved = false), 60);
    if (performance.now() - t > 90) return; // parou antes de soltar: sem inércia
    tweenTo({ rx: Math.max(-75, Math.min(75, rx + vy * 8)), ry: ry + vx * 8 }, { duration: 1.1, ease: 'power3.out' });
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // um giro não deve virar clique (links, abas, cantos de página)
  window.addEventListener('click', (e) => {
    if (moved) {
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }
  }, true);

  stage.addEventListener('dblclick', () => active && reset());

  return {
    get enabled() {
      return active;
    },
    get active() {
      return active;
    },
    /** livro praticamente de frente: dá para folhear mesmo no modo 360° */
    get frontal() {
      const y = ((ry % 360) + 540) % 360 - 180;
      return Math.abs(rx) < 22 && Math.abs(y) < 22;
    },
    get rotated() {
      return active || Math.abs(rx) > 0.5 || Math.abs(ry % 360) > 0.5;
    },
    reset,
    /** volta ao lugar sem animação (ex.: reiniciar a abertura) */
    resetNow() {
      gsap.killTweensOf(state);
      drag = null;
      rx = 0;
      ry = 0;
      gsap.set(float, { rotationX: 0 });
      gsap.set(camera, { rotationY: 0 });
      setActive(false);
    },
  };
}
