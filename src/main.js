import gsap from 'gsap';
import './styles/base.css';
import './styles/book.css';
import './styles/pages.css';
import './styles/ui.css';
import { installTextures } from './textures.js';
import { startAmbient } from './ambient.js';
import { buildPages, chapterOf, folioOf, pageForHash, hashForPage, pageLabel } from './pages.js';
import { Book } from './book.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

installTextures();
startAmbient({ canvas: $('#dust'), spot: $('#spot'), reduced });

const book = new Book({
  el: $('#book'),
  pages: buildPages(),
  reduced,
  onChange: updateUI,
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

function setClosedPose() {
  gsap.set(camera, { rotationX: 62, rotationZ: -26, rotationY: 6, z: -900, y: 140, opacity: 0 });
}

let floatTween;
let enterTl = null;
function enter() {
  setClosedPose();
  const tl = gsap.timeline({ delay: 0.25 });
  enterTl = tl;
  tl.to(camera, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0)
    .to(camera, { rotationX: 34, rotationZ: -11, rotationY: 4, z: -260, y: 24, duration: 2.6, ease: 'expo.out' }, 0)
    .add(() => {
      if (opened || openTl) return;
      floatTween = gsap.to(float, { y: -10, rotationZ: 0.8, rotationX: 2, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      document.body.classList.add('can-open');
    }, 1.2);
  return tl;
}

let openTl = null;
function open() {
  if (opened || openTl) return;
  document.body.classList.remove('can-open');
  document.body.classList.add('is-opening');
  floatTween?.kill();
  enterTl?.kill();

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
    .to(book.edges, { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 1.2);

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

/* ───────────── interações ───────────── */

function bindControls() {
  ui.next.addEventListener('click', () => book.next());
  ui.prev.addEventListener('click', () => book.prev());
  ui.skip.addEventListener('click', skipIntro);

  document.addEventListener('click', (e) => {
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
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); book.next(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); book.prev(); }
    if (e.key === 'Home') { e.preventDefault(); book.goToPage(4); }
    if (e.key === 'End') { e.preventDefault(); book.goToPage(16); }
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
    if (performance.now() - tt > 700) return;
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

// brilho do ouro acompanha o cursor (capa e contracapa)
window.addEventListener('pointermove', (e) => {
  const root = document.documentElement.style;
  root.setProperty('--mx', (e.clientX / window.innerWidth).toFixed(3));
  root.setProperty('--my', (e.clientY / window.innerHeight).toFixed(3));
}, { passive: true });

/* ───────────── início ───────────── */

bindControls();
updateUI();

const ready = document.fonts?.ready ?? Promise.resolve();
Promise.race([ready, new Promise((r) => setTimeout(r, 2500))]).then(() => {
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
  // se a pessoa não interagir, o livro se abre sozinho
  setTimeout(() => !opened && !openTl && open(), 6500);
});
