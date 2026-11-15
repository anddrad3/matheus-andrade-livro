import gsap from 'gsap';
import './styles/objmodal.css'; // só baixa quando o card é preparado

/**
 * Card do objeto da mesa: o objeto aparece grande, com espessura (camadas
 * empilhadas em Z) e pode ser girado 360° com o mouse ou o dedo. Abaixo,
 * as falas do objeto no tom do tema; "outra história" passa para a próxima.
 */
const DEPTH = { glasses: 4, pen: 10, note: 3, ring: 14, whisky: 26, ashtray: 18, lighter: 16, notepad: 6 };
const WIDTH = { glasses: 300, pen: 320, note: 230, ring: 200, whisky: 210, ashtray: 260, lighter: 120, notepad: 200 };

export function createObjModal({ getTheme, talk, onOpen }) {
  const root = document.getElementById('obj-modal');
  const obj = root.querySelector('.om-obj');
  const stage = root.querySelector('.om-stage');
  const nameEl = root.querySelector('.om-name');
  const textEl = root.querySelector('.om-text');
  const idx = {};
  let current = null;
  let rx = -12;
  let ry = -25;
  let spinTween = null; // giro lento de vitrine
  let glide = null; // inércia depois de soltar
  let drag = null;
  let lastFocus = null;

  const apply = () => gsap.set(obj, { rotationX: rx, rotationY: ry });

  function idle() {
    spinTween?.kill();
    const st = { ry };
    spinTween = gsap.to(st, {
      ry: ry + 360,
      duration: 14,
      ease: 'none',
      repeat: -1,
      onUpdate: () => {
        ry = st.ry;
        apply();
      },
    });
  }

  function build(prop) {
    const src = document.querySelector(`#desk-props .dp-${prop}`);
    obj.innerHTML = '';
    if (!src) return;
    const depth = DEPTH[prop] ?? 6;
    const n = depth > 12 ? 6 : depth > 5 ? 5 : 4;
    obj.style.setProperty('--omw', `${WIDTH[prop] ?? 220}px`);
    for (let i = 0; i < n; i++) {
      const layer = document.createElement('div');
      layer.className = 'om-layer';
      const z = (i / (n - 1) - 0.5) * depth;
      layer.style.transform = `translateZ(${z.toFixed(1)}px)`;
      // faces da frente e de trás claras; camadas internas escuras formam a borda
      if (i > 0 && i < n - 1) layer.classList.add('is-edge');
      const clone = src.cloneNode(true);
      clone.removeAttribute('data-prop');
      clone.setAttribute('tabindex', '-1');
      clone.setAttribute('aria-hidden', 'true');
      // ids únicos por camada (degradês do SVG)
      clone.innerHTML = clone.innerHTML.replace(/(id="|url\(#)([\w-]+)/g, `$1$2-m${i}`);
      layer.appendChild(clone);
      obj.appendChild(layer);
    }
  }

  function say() {
    const t = getTheme();
    const d = talk[t][current];
    const key = `${t}:${current}`;
    const i = (idx[key] = ((idx[key] ?? -1) + 1) % d.lines.length);
    nameEl.textContent = d.name;
    textEl.textContent = d.lines[i];
    gsap.fromTo(textEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }

  function open(prop) {
    current = prop;
    lastFocus = document.activeElement;
    build(prop);
    say();
    root.hidden = false;
    rx = -12;
    ry = -205;
    apply();
    requestAnimationFrame(() => root.classList.add('is-open'));
    spinTween?.kill();
    const st = { ry };
    gsap.to(st, {
      ry: -25,
      duration: 1.1,
      ease: 'expo.out',
      onUpdate: () => {
        ry = st.ry;
        apply();
      },
      onComplete: idle,
    });
    root.querySelector('.om-next').focus({ preventScroll: true });
    onOpen?.();
  }

  function close() {
    if (root.hidden) return;
    root.classList.remove('is-open');
    spinTween?.kill();
    glide?.kill();
    drag = null;
    setTimeout(() => {
      if (!root.classList.contains('is-open')) {
        root.hidden = true;
        obj.innerHTML = '';
      }
    }, 300);
    lastFocus?.focus?.({ preventScroll: true });
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-om-close]')) close();
  });
  root.querySelector('.om-next').addEventListener('click', say);
  document.addEventListener(
    'keydown',
    (e) => {
      if (!root.hidden && e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    },
    true,
  );
  window.addEventListener('themechange', () => {
    if (!root.hidden) {
      build(current);
      say();
    }
  });

  stage.addEventListener('pointerdown', (e) => {
    if (drag) return; // um dedo por vez
    spinTween?.kill();
    glide?.kill();
    gsap.killTweensOf(obj);
    drag = { x: e.clientX, y: e.clientY, rx, ry, id: e.pointerId, t: performance.now(), v: 0, moved: false, hist: [] };
    try {
      stage.setPointerCapture(e.pointerId);
    } catch {}
    stage.classList.add('is-grabbing');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return; // encostar não gira
    drag.moved = true;
    const now = performance.now();
    ry = drag.ry + dx * 0.55;
    rx = Math.max(-70, Math.min(70, drag.rx - dy * 0.45));
    // velocidade média dos últimos ~100 ms (eventos chegam em rajadas)
    drag.hist.push([now, ry]);
    while (drag.hist.length > 2 && now - drag.hist[0][0] > 100) drag.hist.shift();
    drag.t = now;
    apply();
  });
  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const h = drag.hist;
    let v = 0; // graus por milissegundo
    if (drag.moved && h.length > 1 && performance.now() - drag.t < 80) v = (h[h.length - 1][1] - h[0][1]) / Math.max(16, h[h.length - 1][0] - h[0][0]);
    drag = null;
    stage.classList.remove('is-grabbing');
    // impulso limitado: no máximo ~meia volta
    const extra = Math.max(-180, Math.min(180, v * 420));
    const st = { ry };
    glide = gsap.to(st, {
      ry: ry + extra,
      duration: 0.9 + Math.abs(extra) / 300,
      ease: 'power3.out',
      onUpdate: () => {
        ry = st.ry;
        apply();
      },
      onComplete: idle,
    });
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  return {
    open,
    close,
    get isOpen() {
      return !root.hidden;
    },
  };
}
