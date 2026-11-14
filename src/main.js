import gsap from 'gsap';
import './styles/base.css';
import './styles/book.css';
import './styles/pages.css';
import './styles/ui.css';
import './styles/extras.css';
import './styles/spin3d.css';
import './styles/theme.css';
import './styles/theme-dark-auto.css';
import './styles/sombria.css';
import './styles/interface.css';
import './styles/texture.css';
import { installTextures, applyTextures } from './textures.js';
import { startAmbient } from './ambient.js';
import { buildPages, chapterOf, folioOf, pageForHash, hashForPage, pageLabel, TABS, CHAPTERS } from './pages.js';
import { deskTalk } from './content.js';
import { createMusic } from './music.js';
import { createPortal } from './portal.js';
import { Book } from './book.js';
import { createSound } from './sound.js';
import { loadDiary } from './diary.js';
import { createSpin } from './spin.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

const theme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const texturesReady = installTextures(theme());
const sound = createSound();
const music = createMusic({ getTheme: () => theme(), onChange: () => syncMusicUI() });
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
// voltou de uma obra visitada: reabre direto na mesma página, sem cutscene
let returnPage = null;
try {
  const back = sessionStorage.getItem('livro.back');
  if (back != null) {
    returnPage = Number(back);
    sessionStorage.removeItem('livro.back');
  }
} catch {}
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
  measureMargins();
  const target = returnPage ?? pageForHash(window.location.hash) ?? 4;
  returnPage = null;
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
  exit: $('#spin-exit'),
  hint: $('#spin-hint'),
  canStart: () => opened && !openTl,
  onChange: (on) => book.setThick(on),
});

function goHome() {
  if (!opened) return;
  if (spin.rotated) spin.reset();
  book.goTo(0).then(() => updateUI());
}

/* ───────────── virar a página com a mão (estilo iPad) ───────────── */

// Computador: pegue a página em qualquer ponto e arraste — a folha segue o ponteiro.
// Celular: deslize o dedo — a página acompanha. Soltar depois da metade (ou num
// gesto rápido) completa; antes disso, a página volta.
let pageDrag = null;
let pageDragged = false;
const NO_DRAG = 'input, textarea, [data-copy], #ui, #menu, #desk-props, #talk';

// se o gesto virou arrasto, o clique no fim (num link, aba ou canto) não conta
document.addEventListener('click', (e) => {
  if (pageDragged && e.target.closest('.leaf')) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

function spineX() {
  const r = rig.getBoundingClientRect();
  const scale = r.width / (2 * book.pw);
  return { x: r.left + r.width / 2 + gsap.getProperty(book.el, 'x') * scale, scale };
}

function thetaAt(clientX) {
  const { x, scale } = spineX();
  const dx = (clientX - x) / (book.pw * scale);
  return (Math.acos(Math.max(-1, Math.min(1, dx))) * 180) / Math.PI;
}

document.addEventListener('pointerdown', (e) => {
  if (!opened || openTl || e.button !== 0 || spin.rotated || spin.active) return;
  if (e.target.closest(NO_DRAG)) return;
  const mobile = book.mode === 'mobile';
  if (!e.target.closest('.leaf') && !(mobile && e.target.closest('#stage'))) return;
  e.__page = true; // o giro 360° não pega este gesto
  pageDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, live: false, p: 0, t: 0, v: 0 };
  pageDragged = false;
}, true);

window.addEventListener('pointermove', (e) => {
  const g = pageDrag;
  if (!g || e.pointerId !== g.id) return;
  const dx = e.clientX - g.x;
  const dy = e.clientY - g.y;
  if (!g.live) {
    if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.3) {
      pageDrag = null; // gesto vertical: não é virar página
      return;
    }
    let dir;
    if (book.mode === 'desktop') {
      dir = g.x > spineX().x ? 1 : -1; // pegou a página da direita → avança
      if (book.s === 0) dir = 1;
      if (book.s === book.N) dir = -1;
    } else dir = dx < 0 ? 1 : -1;
    if (!book.dragStart(dir)) {
      pageDrag = null;
      return;
    }
    g.live = true;
    g.dir = dir;
    g.th0 = thetaAt(g.x);
    pageDragged = true;
    document.body.classList.add('is-page-drag');
    g.t = performance.now();
  }
  let p;
  if (book.mode === 'desktop' && book.drag?.leaf) {
    // a borda da folha acompanha o ponteiro, partindo de onde ele pegou
    const th = thetaAt(e.clientX);
    p = g.dir > 0 ? (th - g.th0) / Math.max(20, 180 - g.th0) : (g.th0 - th) / Math.max(20, g.th0);
  } else {
    p = (-g.dir * dx) / (window.innerWidth * (book.drag?.leaf ? 0.78 : 0.6));
  }
  const now = performance.now();
  g.v = ((p - g.p) / Math.max(1, now - g.t)) * 16;
  g.p = p;
  g.t = now;
  book.dragMove(p);
});

function endPageDrag(e) {
  const g = pageDrag;
  if (!g || (e && e.pointerId !== g.id)) return;
  pageDrag = null;
  if (!g.live) return;
  document.body.classList.remove('is-page-drag');
  const v = performance.now() - g.t > 90 ? 0 : g.v; // parou antes de soltar: sem impulso
  book.dragEnd(v).then(() => updateUI());
  setTimeout(() => (pageDragged = false), 80);
}
window.addEventListener('pointerup', endPageDrag);
window.addEventListener('pointercancel', endPageDrag);

/* ───────────── reiniciar a abertura ───────────── */

function replay() {
  closeMenu();
  hideTalk();
  enterTl?.kill();
  openTl?.kill();
  openTl = null;
  floatTween?.kill();
  autoOpen?.kill();
  spin.resetNow();
  book.setThick(false);
  if (book.tl) book.tl.progress(1);
  gsap.killTweensOf([camera, float, book.el, book.shadow, book.edges, cine.veil, cine.bars, cine.place, cine.pre, cine.name, cine.light, cine.desk, ...book.leaves]);
  book.drag = null;
  opened = false;
  history.replaceState(null, '', window.location.pathname + window.location.search);
  document.body.classList.remove('is-open', 'is-opening', 'can-open');
  // livro fechado e encorpado de novo
  book.d = 2.4;
  book.s = 0;
  book.side = 'right';
  book.leaves.forEach((l) => l.style.setProperty('--lift', 0));
  book.applyStatic();
  book.castShadow(null);
  gsap.set(book.edges, { opacity: 1 });
  gsap.set(float, { y: 0, rotationX: 0, rotationZ: 0 });
  gsap.set(cine.veil, { opacity: 1 });
  gsap.set(cine.bars, { scaleY: 1 });
  gsap.set([cine.place, cine.pre, cine.name], { opacity: 0 });
  gsap.set(cine.desk, { opacity: 1 });
  updateUI();
  enter();
}
$('#replay').addEventListener('click', replay);

/* ───────────── objetos da mesa: clique e eles falam ───────────── */

const propsEl = $('#desk-props');
const talkEl = $('#talk');
const talkIndex = {};
let talkTimer;

// as peças são as mesmas da cutscene (ids dos degradês renomeados)
propsEl.querySelector('.dp-glasses').innerHTML = $('.prop-glasses').innerHTML;
propsEl.querySelector('.dp-pen').innerHTML = $('.prop-pen').innerHTML.replace(/pen-g\b/g, 'pen-g2').replace(/pen-au\b/g, 'pen-au2');
propsEl.querySelector('.dp-note').innerHTML = $('.prop-note').innerHTML;
const cloneIds = (html) => html.replace(/(id="|url\(#)([\w-]+)/g, '$1$2-2');
propsEl.querySelector('.dp-whisky').innerHTML = cloneIds($('.prop-whisky').innerHTML);
propsEl.querySelector('.dp-ashtray').innerHTML = cloneIds($('.prop-ashtray').innerHTML);

function measureMargins() {
  const m = (window.innerWidth - 2 * book.pw) / 2;
  document.documentElement.style.setProperty('--m', `${Math.max(0, m)}px`);
  document.documentElement.classList.toggle('no-props', book.mode === 'mobile' || m < 96);
}

function talk(prop, anchor) {
  const t = theme();
  const d = deskTalk[t][prop];
  const key = `${t}:${prop}`;
  const i = (talkIndex[key] = ((talkIndex[key] ?? -1) + 1) % d.lines.length);
  talkEl.querySelector('.talk-name').textContent = d.name;
  talkEl.querySelector('.talk-text').textContent = d.lines[i];
  talkEl.querySelector('.talk-more').textContent = window.matchMedia('(pointer: coarse)').matches ? 'toque de novo ↻' : 'clique de novo ↻';
  talkEl.hidden = false;
  talkEl.classList.remove('is-shown');
  talkEl.style.left = talkEl.style.top = '';
  talkEl.classList.toggle('is-docked', !anchor);
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    const w = talkEl.offsetWidth;
    const h = talkEl.offsetHeight;
    const left = r.left + r.width / 2 < window.innerWidth / 2 ? r.right + 14 : r.left - 14 - w;
    const top = Math.max(76, Math.min(window.innerHeight - h - 90, r.top + r.height / 2 - h / 2));
    talkEl.style.left = `${Math.max(12, Math.min(window.innerWidth - w - 12, left))}px`;
    talkEl.style.top = `${top}px`;
  }
  requestAnimationFrame(() => talkEl.classList.add('is-shown'));
  sound.flip(1);
  clearTimeout(talkTimer);
  talkTimer = setTimeout(hideTalk, 9000);
}

function hideTalk() {
  clearTimeout(talkTimer);
  talkEl.classList.remove('is-shown');
  setTimeout(() => !talkEl.classList.contains('is-shown') && (talkEl.hidden = true), 300);
}

propsEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-prop]');
  if (b) talk(b.dataset.prop, b);
});
document.addEventListener('pointerdown', (e) => {
  if (!talkEl.hidden && !e.target.closest('#talk, [data-prop], [data-talk]')) hideTalk();
});
window.addEventListener('themechange', hideTalk);

/* ───────────── menu (celular) ───────────── */

const menu = $('#menu');
const menuBtn = $('#menu-btn');
const MENU_ITEMS = [
  ...CHAPTERS.map((c) => ({ label: c.label, page: c.page })),
  { label: 'Carta e contato', page: 18 },
  { label: 'Diário de bordo', page: 19 },
].sort((a, b) => a.page - b.page);
menu.querySelector('.menu-chapters').innerHTML =
  '<li><button type="button" data-home data-menu-close>Capa</button></li>' +
  MENU_ITEMS.map((it) => `<li><button type="button" data-goto="${it.page}" data-menu-close>${it.label}</button></li>`).join('');

function renderMenuProps() {
  menu.querySelector('.menu-props').innerHTML = Object.entries(deskTalk[theme()])
    .map(([k, d]) => `<button type="button" data-talk="${k}">${d.name}</button>`)
    .join('');
}

function syncMenuStates() {
  const st = {
    theme: theme() === 'dark' ? 'sombria' : 'clássica',
    sound: sound.enabled ? 'ligado' : 'desligado',
    spin: spin.enabled ? 'ligado' : 'desligado',
  };
  menu.querySelectorAll('[data-state]').forEach((el) => (el.textContent = st[el.dataset.state] ?? ''));
}

function openMenu() {
  renderMenuProps();
  syncMenuStates();
  menu.hidden = false;
  menuBtn.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => menu.classList.add('is-open'));
}

function closeMenu() {
  if (menu.hidden) return;
  menu.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  setTimeout(() => !menu.classList.contains('is-open') && (menu.hidden = true), 320);
}

menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
menu.addEventListener('click', (e) => {
  const proxy = e.target.closest('[data-proxy]');
  if (proxy) {
    const id = proxy.dataset.proxy;
    if (id === 'replay') {
      replay();
      return;
    }
    $(`#${id}`).click();
    setTimeout(syncMenuStates, 400);
    return;
  }
  const tk = e.target.closest('[data-talk]');
  if (tk) {
    closeMenu();
    setTimeout(() => talk(tk.dataset.talk, null), 250);
    return;
  }
  if (e.target.closest('[data-menu-close]')) closeMenu();
});
window.addEventListener('themechange', () => {
  if (!menu.hidden) {
    renderMenuProps();
    syncMenuStates();
  }
});

/* ───────────── "Visitar a obra": mergulho de câmera ───────────── */

const portal = createPortal({
  rig,
  reduced,
  beforeLeave: () => {
    try {
      sessionStorage.setItem('livro.back', String(book.page));
    } catch {}
    music.duck(1.2);
    hideTalk();
  },
  onReturn: () => {
    try {
      sessionStorage.removeItem('livro.back');
    } catch {}
    music.unduck();
  },
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-visit]');
  if (!a || e.defaultPrevented) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nova aba: deixa o navegador
  e.preventDefault();
  e.stopPropagation();
  if (spin.rotated) spin.resetNow();
  const frame = a.closest('.work')?.querySelector('.photo-frame, .plate-inner');
  portal.go(a.href, frame, a.dataset.title || 'a obra');
});
// pré-conecta ao destino quando o ponteiro chega no link
document.addEventListener('pointerover', (e) => {
  const a = e.target.closest?.('[data-visit]');
  if (a) portal.warm(a.href);
});

/* ───────────── trilha sonora: volume ───────────── */

const musicBtn = $('#music');
const volPop = $('#vol-pop');
const volRanges = [$('#vol'), $('#vol-m')];
const volOut = $('#vol-out');
const volMutes = [$('#vol-mute'), $('#vol-mute-m')];
const musicHint = $('#music-hint');

function syncMusicUI() {
  const v = Math.round(music.volume * 100);
  volRanges.forEach((r) => {
    if (document.activeElement !== r) r.value = String(v);
    r.style.setProperty('--v', `${music.muted ? 0 : v}%`);
  });
  volOut.textContent = music.muted ? '—' : String(v);
  volMutes.forEach((b) => {
    b.textContent = music.muted ? 'ligar' : 'mudo';
    b.setAttribute('aria-pressed', String(music.muted));
  });
  musicBtn.classList.toggle('is-off', !music.enabled);
  musicBtn.setAttribute('aria-pressed', String(music.enabled));
  musicBtn.title = `Trilha sonora — volume ${music.muted ? 'mudo' : v}`;
  musicHint.hidden = !(music.blocked && !music.muted);
}

musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  volPop.hidden = !volPop.hidden;
});
volRanges.forEach((r) => r.addEventListener('input', () => music.setVolume(Number(r.value) / 100)));
volMutes.forEach((b) => b.addEventListener('click', () => music.toggle()));
document.addEventListener('pointerdown', (e) => {
  if (!volPop.hidden && !e.target.closest('.vol-wrap')) volPop.hidden = true;
});
musicHint.addEventListener('click', () => (musicHint.hidden = true));
syncMusicUI();

/* ───────────── tema claro (clássico) × escuro (Edição Sombria) ───────────── */

const THEME_COLOR = { light: '#0b0807', dark: '#050506' };
let switching = false;
async function setTheme(next, origin) {
  if (switching || next === theme()) return;
  switching = true;
  const veil = $('#theme-veil');
  if (origin) {
    veil.style.setProperty('--vx', `${origin.x}px`);
    veil.style.setProperty('--vy', `${origin.y}px`);
  }
  veil.classList.add('is-on');
  // texturas do novo tema prontas antes de revelar
  await Promise.all([applyTextures(next), new Promise((r) => setTimeout(r, 330))]);
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
  try {
    localStorage.setItem('livro.theme', next);
  } catch {}
  window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  syncThemeButton();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  veil.classList.remove('is-on');
  sound.flip(1);
  setTimeout(() => (switching = false), 350);
}

function syncThemeButton() {
  const b = $('#theme');
  const dark = theme() === 'dark';
  b.setAttribute('aria-pressed', String(dark));
  b.title = dark ? 'Edição Sombria — clique para a edição clássica' : 'Edição clássica — clique para a Edição Sombria';
  b.querySelector('.theme-label').textContent = dark ? 'sombria' : 'clássica';
}

$('#theme').addEventListener('click', (e) => {
  setTheme(theme() === 'dark' ? 'light' : 'dark', { x: e.clientX, y: e.clientY });
});
syncThemeButton();

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
    if (curl && pageDragged) return;
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
    if (performance.now() - tt > 700 || opened) return;
    if (Math.abs(dx) > 40 || dy < -40) open();
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
      measureMargins();
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
  if (returnPage != null) skipIntro();
});

// Firefox ignora -webkit-user-drag: impede o arrasto nativo de links/imagens nas páginas
document.addEventListener('dragstart', (e) => {
  if (e.target.closest?.('.leaves')) e.preventDefault();
});
