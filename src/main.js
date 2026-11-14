import gsap from 'gsap';
import './styles/base.css';
import './styles/book.css';
import './styles/pages.css';
import './styles/ui.css';
import './styles/extras.css';
import { installTextures } from './textures.js';
import { startAmbient } from './ambient.js';
import { buildPages, chapterOf, folioOf, pageForHash, hashForPage, pageLabel, TABS } from './pages.js';
import { Book } from './book.js';
import { createSound } from './sound.js';
import { loadDiary } from './diary.js';
import { createSpin } from './spin.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

const texturesReady = installTextures();
const sound = createSound();
startAmbient({ canvas: $('#dust'), spot: $('#spot'), reduced });

const book = new Book({
  el: $('#book'),
  pages: buildPages(),
  tabs: TABS,
  reduced,
  onChange: updateUI,
  onFlip: (count) => sound.flip(count),
});

const ui = {
  root: $('#ui'),
  prev: $('#prev'),
  next: $('#next'),
  folio: $('#folio-num'),
  chapter: $('#folio-chapter'),
  live: $('#live'),
  prompt: $('#prompt'),
  skip: $('#skip'),
  progress: $('#progress-bar'),
};

function updateUI(b = book) {
  const p = b.page;
  const pages = b.visiblePages();
  const f = pages.map(folioOf).filter(Boolean);
  ui.folio.textContent = f.length ? f.join(' – ') : '';
  ui.chapter.textContent = chapterOf(p);
  ui.prev.disabled = !b.canPrev();
  ui.next.disabled = !b.canNext() || (b.mode === 'mobile' && b.s === b.N);
  ui.progress.style.transform = `scaleX(${(b.s / b.N).toFixed(3)})`;
  ui.live.textContent = pages.map(pageLabel).join(' e ');
  const hash = hashForPage(pages[pages.length - 1]);
  const url = hash ? `#${hash}` : window.location.pathname + window.location.search;
  if (opened) history.replaceState(null, '', url);
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('is-active', hashForPage(p) === a.dataset.nav);
  });
}

/* ───────────── abertura ───────────── */

let opened = false;
const rig = $('#rig');
const float = $('#float');
const camera = $('#camera');
const cover = book.leaves[0];

const cine = {
  veil: $('.cine-veil'),
  bars: document.querySelectorAll('.cine-bar'),
  place: $('.cine-place'),
  pre: $('.ct-pre'),
  name: $('.ct-name'),
  light: $('.desk-light'),
  desk: $('.desk'),
};

function setClosedPose() {
  // plano aéreo: bem alto, quase de cima, girado sobre a mesa
  gsap.set(camera, { rotationX: 6, rotationZ: -42, rotationY: 0, z: -3000, y: 40, opacity: 1 });
  gsap.set(cine.light, { opacity: 0 });
}

let floatTween;
let enterTl = null;
let autoOpen = null;
/** cutscene: a luz acende, a câmera desce da altura até o livro sobre a mesa */
function enter() {
  setClosedPose();
  const tl = gsap.timeline({ delay: 0.2 });
  enterTl = tl;
  tl
    // a luminária acende, hesitando
    .to(cine.light, { keyframes: [
      { opacity: 0.5, duration: 0.08 }, { opacity: 0.05, duration: 0.12 },
      { opacity: 0.8, duration: 0.07 }, { opacity: 0.3, duration: 0.18 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
    ] }, 0.3)
    .to(cine.veil, { opacity: 0, duration: 2.2, ease: 'power2.inOut' }, 0.35)
    // grua: desce e gira em direção ao livro
    .to(camera, { z: -1250, rotationZ: -24, rotationX: 18, y: 30, duration: 3.4, ease: 'power1.inOut' }, 0.2)
    .to(camera, { z: -260, rotationZ: -11, rotationX: 34, rotationY: 4, y: 24, duration: 2.8, ease: 'power3.out' }, 3.6)
    // letreiros
    .to(cine.place, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 1.0)
    .fromTo(cine.pre, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 1.9)
    .fromTo(cine.name, { opacity: 0, y: 14, letterSpacing: '0.12em' }, { opacity: 1, y: 0, letterSpacing: '0.02em', duration: 1.8, ease: 'power3.out' }, 2.1)
    .to([cine.pre, cine.name], { opacity: 0, y: -10, duration: 1, ease: 'power2.in' }, 4.3)
    .to(cine.place, { opacity: 0, duration: 0.8 }, 5.2)
    // as faixas de cinema recolhem
    .to(cine.bars, { scaleY: 0, duration: 1.2, ease: 'power3.inOut' }, 5.5)
    .add(() => {
      if (opened || openTl) return;
      floatTween = gsap.to(float, { y: -10, rotationZ: 0.8, rotationX: 2, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      document.body.classList.add('can-open');
      // se a pessoa não interagir, o livro se abre sozinho
      autoOpen = gsap.delayedCall(3.2, () => !opened && !openTl && open());
    }, 6.1);
  return tl;
}

let openTl = null;
function open() {
  if (opened || openTl) return;
  document.body.classList.remove('can-open');
  document.body.classList.add('is-opening');
  book.cull([0, 1]);
  sound.unlock();
  sound.open();
  floatTween?.kill();
  enterTl?.kill();
  autoOpen?.kill();

  const tl = gsap.timeline({ onComplete: finish });
  openTl = tl;

  tl.to(float, { y: 0, rotationZ: 0, rotationX: 0, duration: 1.6, ease: 'power2.inOut' }, 0)
    .to(camera, { rotationX: 0, rotationZ: 0, rotationY: 0, z: 0, y: 0, opacity: 1, duration: 2.4, ease: 'power3.inOut' }, 0)
    // a capa se abre
    .to(cover, {
      rotationY: -180,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => cover.style.setProperty('--lift', Math.sin((-gsap.getProperty(cover, 'rotationY') / 180) * Math.PI).toFixed(3)),
    }, 0.55)
    .to(cover, { z: book.N * book.d + 10, duration: 0.9, ease: 'power1.out' }, 0.55)
    .to(cover, { z: 0, duration: 1.1, ease: 'power1.in' }, 1.45)
    .to(book.el, { x: book.xFor(1, 'right'), duration: 2, ease: 'power3.inOut' }, 0.55)
    .to(book.shadow, { scaleX: 1, xPercent: 0, duration: 2, ease: 'power3.inOut' }, 0.55)
    .to(book.edges, { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 1.2)
    // encerra a cutscene: faixas, letreiros e a mesa 3D dão lugar ao fundo
    .to(cine.veil, { opacity: 0, duration: 0.6 }, 0)
    .to(cine.bars, { scaleY: 0, duration: 0.9, ease: 'power3.inOut' }, 0)
    .to([cine.place, cine.pre, cine.name], { opacity: 0, duration: 0.5 }, 0)
    .to(cine.light, { opacity: 1, duration: 0.5 }, 0)
    .to(cine.desk, { opacity: 0, duration: 1.4, ease: 'power1.inOut' }, 1.0);

  // o bloco de páginas "assenta"
  book.leaves.slice(1).forEach((leaf, i) => {
    tl.to(leaf, { z: book.zFor(i + 1, false, book.dOpen), duration: 1.6, ease: 'power2.inOut' }, 0.9);
  });
  tl.add(() => {
    book.d = book.dOpen;
    book.s = 1;
    book.side = 'right';
    book.updateVisibility([1, 2, 3, 4]);
  }, 2.55);
  // pausa na folha de rosto, depois vira para o sumário (ou o capítulo do link)
  tl.add(() => {}, 3.15);
}

function finish() {
  openTl = null;
  opened = true;
  book.d = book.dOpen;
  book.s = 1;
  book.side = 'right';
  document.body.classList.remove('is-opening');
  document.body.classList.add('is-open');
  const target = pageForHash(window.location.hash) ?? 4;
  book.goToPage(target).then(() => updateUI());
  updateUI();
  enableParallax();
}

function skipIntro() {
  if (opened) return;
  floatTween?.kill();
  if (!openTl) open();
  openTl?.progress(1);
}

/* ───────────── girar 360° e voltar à capa ───────────── */

const spin = createSpin({
  float,
  camera,
  stage: $('#stage'),
  button: $('#spin'),
  hint: $('#spin-hint'),
  canStart: () => opened && !openTl,
});

function goHome() {
  if (!opened) return;
  if (spin.rotated) spin.reset();
  book.goTo(0).then(() => updateUI());
}

/* ───────────── interações ───────────── */

function bindControls() {
  ui.next.addEventListener('click', () => book.next());
  ui.prev.addEventListener('click', () => book.prev());
  ui.skip.addEventListener('click', skipIntro);
  const soundBtn = document.querySelector('#sound');
  const syncSound = () => {
    soundBtn.setAttribute('aria-pressed', String(sound.enabled));
    soundBtn.classList.toggle('is-off', !sound.enabled);
  };
  soundBtn.addEventListener('click', () => {
    sound.toggle();
    syncSound();
  });
  syncSound();

  document.addEventListener('click', (e) => {
    const home = e.target.closest('[data-home]');
    if (home) {
      e.preventDefault();
      goHome();
      return;
    }
    const goto = e.target.closest('[data-goto]');
    if (goto) {
      e.preventDefault();
      if (!opened) return;
      book.goToPage(Number(goto.dataset.goto));
      return;
    }
    const curl = e.target.closest('[data-curl]');
    if (curl && opened) {
      curl.dataset.curl === 'next' ? book.next() : book.prev();
      return;
    }
    // livro fechado na capa: um clique abre de novo
    if (opened && book.s === 0 && e.target.closest('#stage')) {
      book.next();
      return;
    }
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
        copy.textContent = 'copiado ✓';
        setTimeout(() => (copy.textContent = 'copiar'), 1800);
      });
      return;
    }
    if (!opened && e.target.closest('#stage, #prompt')) open();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (!opened) {
      if (['Enter', ' ', 'ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        open();
      } else if (e.key === 'Escape') skipIntro();
      return;
    }
    if (e.key === 'Escape' && spin.rotated) { spin.reset(); return; }
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); book.next(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); book.prev(); }
    if (e.key === 'Home') { e.preventDefault(); book.goToPage(4); }
    if (e.key === 'End') { e.preventDefault(); book.goToPage(18); }
  });

  // roda do mouse folheia (com trava)
  let acc = 0;
  let lock = 0;
  window.addEventListener('wheel', (e) => {
    if (!opened) {
      if (e.deltaY > 10) open();
      return;
    }
    const now = performance.now();
    if (now < lock) return;
    acc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(acc) > 70) {
      acc > 0 ? book.next() : book.prev();
      acc = 0;
      lock = now + 900;
    }
  }, { passive: true });

  // gesto de arrastar no toque
  let tx = 0;
  let ty = 0;
  let tt = 0;
  window.addEventListener('touchstart', (e) => {
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
    tt = performance.now();
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (performance.now() - tt > 700 || spin.active) return;
    if (!opened) {
      if (Math.abs(dx) > 40 || dy < -40) open();
      return;
    }
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) dx < 0 ? book.next() : book.prev();
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    const p = pageForHash(window.location.hash);
    if (p != null && opened) book.goToPage(p);
  });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      book.relayout();
      if (!opened && !openTl) gsap.set(book.el, { x: book.xFor(0) });
      updateUI();
    }, 120);
  });
}

/* ───────────── paralaxe sutil ───────────── */

function enableParallax() {
  if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
  const rx = gsap.quickTo(rig, 'rotationX', { duration: 1.4, ease: 'power3.out' });
  const ry = gsap.quickTo(rig, 'rotationY', { duration: 1.4, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    rx(-ny * 3);
    ry(nx * 4);
  }, { passive: true });
}

// brilho do ouro acompanha o cursor — só nas capas, só quando estão à vista,
// no máximo uma vez por quadro (variável no :root recalcularia a página inteira)
const boards = [book.leaves[0], book.leaves[book.N - 1]];
let mxQueued = false;
let mxEvent = null;
window.addEventListener('pointermove', (e) => {
  mxEvent = e;
  if (mxQueued) return;
  mxQueued = true;
  requestAnimationFrame(() => {
    mxQueued = false;
    if (opened && book.s > 0 && book.s < book.N) return;
    const mx = (mxEvent.clientX / window.innerWidth).toFixed(2);
    const my = (mxEvent.clientY / window.innerHeight).toFixed(2);
    boards.forEach((b) => {
      b.style.setProperty('--mx', mx);
      b.style.setProperty('--my', my);
    });
  });
}, { passive: true });

/* ───────────── início ───────────── */

bindControls();
updateUI();
loadDiary(document.querySelector('[data-diary]'), document.querySelector('[data-diary-status]'));

const ready = document.fonts?.ready ?? Promise.resolve();
Promise.race([Promise.all([ready, texturesReady]), new Promise((r) => setTimeout(r, 3000))]).then(() => {
  document.body.classList.add('is-ready');
  if (reduced) {
    gsap.set(camera, { opacity: 1 });
    gsap.set(book.edges, { opacity: 0 });
    book.d = book.dOpen;
    book.s = 2;
    book.side = 'right';
    opened = true;
    document.body.classList.add('is-open');
    const target = pageForHash(window.location.hash);
    book.applyStatic();
    if (target != null) book.goToPage(target);
    updateUI();
    return;
  }
  enter();
});
