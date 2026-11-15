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
import './styles/objmodal.css';
import './styles/mobile.css';
// phone.css fica no CSS principal: inserir uma folha nova depois (com o módulo)
// obrigava o navegador a recalcular o estilo da página inteira — travada de >1 s no celular
import './styles/phone.css';
import { installTextures, applyTextures, preloadTextures } from './textures.js';
import { startAmbient } from './ambient.js';
import { buildPages, chapterOf, folioOf, pageForHash, hashForPage, pageLabel, TABS, CHAPTERS } from './pages.js';
import { deskTalk } from './content.js';
import { createMusic } from './music.js';
import { createPortal } from './portal.js';
import { inkify } from './ink.js';
import { view, vw, vpt, vrect, isPhone } from './view.js';
import { Book, setLift } from './book.js';
import { createSound } from './sound.js';
import { createSpin } from './spin.js';
import { t, EN, setLang } from './lang.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

const theme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const texturesReady = installTextures(theme());
const sound = createSound();
const music = createMusic({ getTheme: () => theme(), onChange: () => syncMusicUI() });
let phone = null; // o celular da mesa (criado mais abaixo)
// GSAP lê o estilo de cada elemento no primeiro toque: lê todos de uma vez, antes
// de qualquer escrita (um recálculo de estilo só, em vez de um por elemento).
// Aqui, cedo, quase tudo ainda está oculto (display: none até o CSS chegar) e a
// leitura sai barata (~30 ms no celular); depois do CSS e das fontes custaria 10× mais.
['#rig', '#float', '#camera', '#book', '.book-shadow', '.edges', '#flash', '.cine-veil', '.cine-place', '.ct-pre', '.ct-name', '.desk-light', '.desk', '#stage']
  .forEach((s) => document.querySelectorAll(s).forEach((el) => gsap.getProperty(el, 'x')));
if (!isPhone()) startAmbient({ canvas: $('#dust'), spot: $('#spot'), reduced });

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
let diaryLoaded = false;
const tbProgress = $('#tb-progress');
const whereCh = $('#where-ch');
const whereNum = $('#where-num');

function updateUI(b = book) {
  const p = b.page;
  const pages = b.visiblePages();
  const f = pages.map(folioOf).filter(Boolean);
  ui.folio.textContent = f.length ? f.join(' – ') : '';
  ui.chapter.textContent = chapterOf(p);
  ui.prev.disabled = !b.canPrev();
  ui.next.disabled = !b.canNext();
  ui.progress.style.transform = `scaleX(${(b.s / b.N).toFixed(3)})`;
  tbProgress.style.transform = ui.progress.style.transform;
  whereCh.textContent = ui.chapter.textContent;
  whereNum.textContent = ui.folio.textContent;
  ui.live.textContent = pages.map(pageLabel).join(t(' e ', ' and '));
  // diário de bordo: só busca no GitHub quando o leitor se aproxima dele
  if (!diaryLoaded && b.s >= 8) {
    diaryLoaded = true;
    import('./diary.js').then(({ loadDiary }) => loadDiary(document.querySelector('[data-diary]'), document.querySelector('[data-diary-status]')));
  }
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

/**
 * Origem da transformação escrita direto no estilo. Via gsap.set, o GSAP lê antes a
 * origem atual (getComputedStyle) — e essa leitura força o navegador a recalcular o
 * estilo da página inteira no meio da animação (40–80 ms por vez no celular).
 */
function setOrigin(el, origin) {
  el.style.transformOrigin = origin;
}

function setClosedPose() {
  // plano aéreo: bem alto, quase de cima, girado sobre a mesa
  gsap.set(camera, { rotationX: 6, rotationZ: -42, rotationY: 0, z: -3000, y: 40, opacity: 1 });
  gsap.set(cine.light, { opacity: 0 });
}

let floatTween;
let enterTl = null;
let levitate = null;
let warmedScene = false; // a cena já foi pré-desenhada sob o monograma (warmScene)
let enteredOnce = false;
/** cutscene: a luz acende, a câmera desce da altura até o livro sobre a mesa */
function enter() {
  setClosedPose();
  // sob o véu preto: mostra o verso do livro por 2 quadros para o navegador já
  // pintar contracapa, lombada e corte (senão isso acontece no meio do giro)
  // as folhas que a abertura mostra (capa, guardas, contracapa) já são desenhadas
  // aqui, com o livro pequeno sob o véu — acordá-las depois contava como uma
  // "pintura nova e grande" e atrasava o LCP para o fim da cena
  // capa e contracapa já; o miolo em duas etapas pequenas, com o livro ainda longe
  // (pintar páginas grandes no fim da cena atrasaria o LCP; tudo de uma vez travaria o início)
  if (warmedScene && !enteredOnce) {
    // primeira abertura: o pré-desenho (warmScene) já montou tudo sob o monograma
    book.cull([0, 1, 2, book.N - 1]);
  } else {
    book.cull([0, book.N - 1]);
    setTimeout(() => !opened && book.cull([0, 1, book.N - 1]), 900);
    setTimeout(() => !opened && book.cull([0, 1, 2, book.N - 1]), 1500);
    gsap.set(book.el, { rotationY: -180 });
    setOrigin(book.el, '75% 50%');
    requestAnimationFrame(() => requestAnimationFrame(() => gsap.set(book.el, { rotationY: 0 })));
  }
  enteredOnce = true;
  const tl = gsap.timeline({ delay: 0.2 });
  enterTl = tl;
  tl
    // a luminária acende, hesitando
    .to(cine.light, { keyframes: [
      { opacity: 0.5, duration: 0.08 }, { opacity: 0.05, duration: 0.12 },
      { opacity: 0.8, duration: 0.07 }, { opacity: 0.3, duration: 0.18 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' },
    ] }, 0.3)
    .to(cine.veil, { opacity: 0, duration: 1.5, ease: 'power2.inOut' }, 0.3)
    // grua: desce e gira em direção ao livro
    .to(camera, { z: -1250, rotationZ: -24, rotationX: 18, y: 30, duration: 2.9, ease: 'power1.inOut' }, 0.2)
    .to(camera, { z: -260, rotationZ: -11, rotationX: 34, rotationY: 4, y: 24, duration: 2.5, ease: 'power3.out' }, 3.1)
    // letreiros
    .to(cine.place, { opacity: 1, duration: 1.1, ease: 'power1.out' }, 0.8)
    .fromTo(cine.pre, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 1.5)
    .fromTo(cine.name, { opacity: 0, y: 14, letterSpacing: '0.12em' }, { opacity: 1, y: 0, letterSpacing: '0.02em', duration: 1.7, ease: 'power3.out' }, 1.7)
    .to([cine.pre, cine.name], { opacity: 0, y: -10, duration: 0.9, ease: 'power2.in' }, 3.7)
    .to(cine.place, { opacity: 0, duration: 0.8 }, 4.4)
    // as faixas de cinema recolhem
    .to(cine.bars, { scaleY: 0, duration: 1.1, ease: 'power3.inOut' }, 4.6)
    .add(() => {
      if (opened || openTl) return;
      // o livro levita sobre a mesa, girando de leve no ar (a mesa fica parada)
      setOrigin(book.el, '75% 50%');
      levitate = gsap.timeline({ repeat: -1, yoyo: true })
        .to(book.el, { z: 70, rotationZ: -4, rotationX: 4, duration: 2.2, ease: 'sine.inOut' })
        .to(book.el, { z: 95, rotationZ: 3, rotationX: -2, duration: 2.2, ease: 'sine.inOut' });
      gsap.to(book.shadow, { opacity: 0.45, duration: 1.2 });
      prepareOpen();
      document.body.classList.add('can-open');
    }, 5.4);
  return tl;
}

let openTl = null;
let skipping = false;
let hintShown = false;
let prepared = false;

/**
 * Enquanto o livro levita, deixa pronto tudo o que a abertura vai mostrar:
 * capa, contracapa e as primeiras folhas desenhadas (sem "pular"), e as
 * páginas iniciais já preparadas para a escrita — nada pesado no meio do giro.
 */
function prepareOpen() {
  if (prepared) return;
  prepared = true;
  book.cull([0, 1, 2, book.N - 1]);
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 60));
  idle(() => [1, 2, 3, 4].forEach((p) => inkify(book.pageEls[p])));
}

/** pré-carrega o que aparece depois: fotos dos projetos, imagens e o outro tema */
let warmed = false;
function warmAssets() {
  if (warmed) return;
  warmed = true;
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  idle(() => {
    decodeImages();
    // conexão econômica: o outro tema só baixa se for escolhido
    const slow = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''));
    if (!slow) preloadTextures(theme() === 'dark' ? 'light' : 'dark');
  });
}
/**
 * Deixa as imagens do livro prontas para aparecer, uma de cada vez e só as do
 * tema atual (decodificar todas juntas estourava a memória de celulares).
 */
function decodeImages() {
  const skip = theme() === 'dark' ? '.only-light' : '.only-dark';
  const imgs = [...document.querySelectorAll('.leaves img')].filter((i) => !i.closest(skip));
  imgs.forEach((i) => (i.loading = 'eager')); // começa a baixar já (antes eram preguiçosas)
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 120));
  let k = 0;
  const next = () => {
    const img = imgs[k++];
    if (!img) return;
    const p = img.decode ? img.decode() : Promise.resolve();
    p.catch(() => {}).finally(() => idle(next));
  };
  next();
}
window.addEventListener('themechange', () => warmed && setTimeout(decodeImages, 400));
const flash = $('#flash');

/**
 * Abertura no estilo "livro mágico":
 *  1. o livro, levitando, dá uma volta completa no ar (lombada, contracapa, corte);
 *  2. a capa se abre de supetão enquanto a câmera mergulha na folha de rosto;
 *  3. uma estrela de luz toma a tela — e se dissolve revelando o livro aberto.
 */
function open() {
  if (opened || openTl) return;
  document.body.classList.remove('can-open');
  document.body.classList.add('is-opening');
  prepareOpen();
  // escrita direta: via gsap.set o GSAP lia o valor atual antes, forçando o navegador a
  // recalcular o estilo da página inteira no instante do toque (~55 ms no celular)
  rig.style.willChange = 'transform';
  sound.unlock();
  sound.flip(5); // sopro de páginas enquanto gira
  floatTween?.kill();
  levitate?.kill();
  enterTl?.kill();
  
  const tl = gsap.timeline({ onComplete: finish });
  openTl = tl;
  const x1 = book.xFor(1, 'right');

  // encerra os elementos de cinema
  tl.to(cine.veil, { opacity: 0, duration: 0.4 }, 0)
    .to(cine.bars, { scaleY: 0, duration: 0.6, ease: 'power3.inOut' }, 0)
    .to([cine.place, cine.pre, cine.name], { opacity: 0, duration: 0.3 }, 0)
    .to(cine.light, { opacity: 1, duration: 0.4 }, 0)
    .to(float, { y: 0, rotationZ: 0, rotationX: 0, duration: 0.8, ease: 'power2.out' }, 0);

  // 1 · a volta completa no ar (gira em torno do centro do livro fechado)
  setOrigin(book.el, '75% 50%');
  // giro com aceleração suave e chegada desacelerada (sem "tranco" no fim)
  tl.to(camera, { rotationX: 14, rotationZ: 0, rotationY: 0, z: -160, y: 0, duration: 1.15, ease: 'sine.inOut' }, 0)
    .to(book.el, { rotationY: -360, rotationZ: 0, rotationX: 0, z: 150, duration: 1.2, ease: 'expo.inOut' }, 0)
    .to(book.shadow, { opacity: 0.25, duration: 0.6 }, 0)
    .add(() => sound.open(), 0.95)
    .add(() => { gsap.set(book.el, { rotationY: 0 }); setOrigin(book.el, '50% 50%'); }, 1.2); // 360° = identidade

  // 2 · a capa abre de supetão; o miolo assenta; o livro centraliza
  tl.to(cover, {
    rotationY: -180,
    duration: 0.75,
    ease: 'power3.out',
    onUpdate: () => setLift(cover, Math.sin((-gsap.getProperty(cover, 'rotationY') / 180) * Math.PI)),
  }, 1.05)
    .to(book.el, { x: x1, duration: 0.75, ease: 'power3.out' }, 1.05)
    .to(book.shadow, { scaleX: 1, xPercent: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }, 1.05)
    .to(book.edges, { opacity: 0, duration: 0.5 }, 1.25);
  book.leaves.slice(1).forEach((leaf, i) => {
    tl.to(leaf, { z: book.zFor(i + 1, false, book.dOpen), duration: 0.6, ease: 'power2.out' }, 1.15);
  });
  tl.add(() => {
    book.d = book.dOpen;
    book.s = 1;
    book.side = 'right';
    book.updateVisibility([1, 2, 3, 4]);
  }, 1.2);

  // 3 · a câmera mergulha na página da direita até a estrela de luz tomar a tela
  // (sem medir o rig nem deixar o GSAP ler a origem atual: cada leitura forçava um
  // recálculo de layout de ~45 ms bem no meio do mergulho)
  tl.add(() => {
    rig.style.transformOrigin = '75% 45%';
  }, 1.2)
    .to(camera, { rotationX: 0, z: 0, duration: 0.9, ease: 'sine.inOut' }, 1.15)
    .to(book.el, { z: 0, duration: 0.9, ease: 'sine.inOut' }, 1.15)
    .to(rig, { scale: 3, duration: 0.95, ease: 'power2.in' }, 1.2)
    .fromTo(flash, { opacity: 0, scale: 0.3, rotation: -25 }, { opacity: 1, scale: 1.25, rotation: 0, duration: 0.65, ease: 'power1.in' }, 1.45)
    .to(cine.desk, { opacity: 0, duration: 0.3 }, 1.8)
    .add(() => {}, 2.12);
}

function finish() {
  openTl = null;
  opened = true;
  book.d = book.dOpen;
  book.s = 1;
  book.side = 'right';
  // corte escondido pela luz: câmera e livro voltam ao enquadramento de leitura
  gsap.set(rig, { scale: 1 });
  rig.style.transformOrigin = '';
  gsap.set(book.el, { rotationY: 0, rotationX: 0, rotationZ: 0, z: 0 });
  setOrigin(book.el, '50% 50%');
  gsap.set(camera, { rotationX: 0, rotationY: 0, rotationZ: 0, z: 0, y: 0 });
  if (skipping) gsap.set(flash, { opacity: 0 });
  // a troca de cena (pesada) acontece com a luz parada cobrindo tudo; a luz só
  // começa a se dissolver dois quadros depois — nenhuma engasgada visível
  else requestAnimationFrame(() => requestAnimationFrame(() => gsap.to(flash, { opacity: 0, scale: 3.2, rotation: 18, duration: 0.85, delay: 0.28, ease: 'power2.out' })));
  const wasSkipping = skipping;
  skipping = false;
  document.body.classList.remove('is-opening');
  document.body.classList.add('is-open');
  layoutProps();
  if (book.mode === 'mobile' && !hintShown) {
    hintShown = true;
    const h = $('#read-hint');
    h.hidden = false;
    setTimeout(() => h.classList.add('is-gone'), 4200);
    setTimeout(() => (h.hidden = true), 5000);
  }
  const target = returnPage ?? pageForHash(window.location.hash) ?? 4;
  returnPage = null;
  rig.style.willChange = 'auto'; // escrita direta (via GSAP custava uma leitura forçada de ~65 ms)
  prepared = false;
  updateUI();
  enableParallax();
  setTimeout(warmAssets, 1800); // depois que o livro assentar
  setTimeout(() => (window.requestIdleCallback || setTimeout)(() => { getObjModal(); getPhone(); }), 2500);
  // deixa a luz se dissolver e a cena assentar antes de virar para o sumário
  gsap.delayedCall(wasSkipping ? 0 : 0.85, () => {
    book.noBendOnce = true;
    book.goToPage(target).then(() => updateUI());
  });
}

function skipIntro() {
  if (opened) return;
  floatTween?.kill();
  levitate?.kill();
  skipping = true;
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
  onChange: (on) => {
    if (on) {
      resetPZ();
      if (view.lying) exitLyingNow();
    }
    book.setThick(on);
    syncTabbar();
  },
});

function goHome() {
  if (!opened) return;
  resetPZ();
  if (spin.rotated) spin.reset();
  book.goTo(0).then(() => updateUI());
}

/* ───────────── pinça: aproximar e afastar ───────────── */

// Dois dedos aproximam/afastam o livro em torno do ponto entre eles; aproximado,
// um dedo (ou o mouse) arrasta a vista. No computador: Ctrl + roda / pinça do trackpad.
const zoomBtn = $('#zoom-out');
const pz = { s: 1, x: 0, y: 0 };
const touches = new Map(); // dedos no palco (coordenadas do palco)
let pinch = null;
let pan = null;
const zoomed = () => pz.s > 1.04;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

function renderPZ(animate) {
  const z = zoomed();
  document.body.classList.toggle('is-zoomed', z);
  zoomBtn.hidden = !z || book.mode === 'desktop';
  const vars = { scale: pz.s, x: pz.x, y: pz.y };
  if (animate) gsap.to(rig, { ...vars, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  else {
    gsap.killTweensOf(rig, 'scale,x,y');
    gsap.set(rig, vars);
  }
}

/** mantém a página à vista: dá para passear só até a borda do que foi ampliado */
function clampPZ() {
  pz.s = Math.max(1, Math.min(4, pz.s));
  const visW = book.spread ? 2 * book.pw : book.pw;
  const mx = (visW * (pz.s - 1)) / 2 + 24;
  const my = (book.ph * (pz.s - 1)) / 2 + 24;
  pz.x = Math.max(-mx, Math.min(mx, pz.x));
  pz.y = Math.max(-my, Math.min(my, pz.y));
  if (pz.s <= 1.001) pz.x = pz.y = 0;
}

function resetPZ(instant = false) {
  pinch = null;
  pan = null;
  const idle = pz.s === 1 && pz.x === 0 && pz.y === 0;
  pz.s = 1;
  pz.x = 0;
  pz.y = 0;
  renderPZ(!instant && !idle);
}

/** centro do livro na tela, sem a translação da pinça */
function rigCenter() {
  const r = vrect(rig);
  return { x: r.left + r.width / 2 - pz.x, y: r.top + r.height / 2 - pz.y };
}

/** amplia para a escala s mantendo o ponto p parado */
function zoomAt(p, s, animate) {
  const c = rigCenter();
  const qx = (p.x - c.x - pz.x) / pz.s;
  const qy = (p.y - c.y - pz.y) / pz.s;
  pz.s = s;
  pz.x = p.x - c.x - s * qx;
  pz.y = p.y - c.y - s * qy;
  clampPZ();
  renderPZ(animate);
}

function startPinch() {
  const [a, b] = [...touches.values()];
  cancelPageDrag();
  pan = null;
  pageDragged = true; // os dedos que sobem não viram clique
  gsap.killTweensOf(rig, 'scale,x,y');
  const c = rigCenter();
  const m = mid(a, b);
  pinch = { d0: Math.max(20, dist(a, b)), s0: pz.s, c, qx: (m.x - c.x - pz.x) / pz.s, qy: (m.y - c.y - pz.y) / pz.s };
  document.body.classList.add('is-pinching');
}

function movePinch() {
  const [a, b] = [...touches.values()];
  const m = mid(a, b);
  // um pouco de elasticidade abaixo de 1× e acima de 4×
  let s = pinch.s0 * (dist(a, b) / pinch.d0);
  if (s < 1) s = 1 - (1 - s) * 0.4;
  if (s > 4) s = 4 + (s - 4) * 0.3;
  pz.s = s;
  pz.x = m.x - pinch.c.x - s * pinch.qx;
  pz.y = m.y - pinch.c.y - s * pinch.qy;
  renderPZ(false);
}

function endPinch() {
  pinch = null;
  document.body.classList.remove('is-pinching');
  setTimeout(() => (pageDragged = false), 120);
  if (pz.s < 1.08) return resetPZ();
  clampPZ();
  renderPZ(true);
}

zoomBtn.addEventListener('click', () => resetPZ());

/** aproximar/afastar um passo, em torno do centro do livro (botões e teclas + −) */
function zoomBy(dir) {
  if (!opened || openTl || spin.active) return;
  const s = Math.max(1, Math.min(4, pz.s * (dir > 0 ? 1.25 : 0.8)));
  if (s <= 1.02) return resetPZ();
  const r = vrect(rig);
  zoomAt({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, s, true);
}
// roda do mouse (e pinça do trackpad) aproxima/afasta em torno do cursor
window.addEventListener('wheel', (e) => {
  if (!opened || openTl || spin.active) return;
  if (modalOpen() || e.target.closest?.('#phone-modal, #obj-modal, #ui')) return;
  e.preventDefault();
  // linhas (Firefox) ou páginas → pixels; pinça do trackpad chega como Ctrl + roda, mais fina
  const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1;
  const dy = Math.max(-240, Math.min(240, e.deltaY * unit));
  const s = Math.max(1, Math.min(4, pz.s * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0022))));
  if (s <= 1.02) return pz.s > 1 && resetPZ();
  zoomAt(vpt(e.clientX, e.clientY), s, false);
}, { passive: false });

/* ───────────── celular: uma página ou duas (escolha do leitor) ───────────── */

// Um botão discreto no topo ("2 páginas") alterna o modo. Com o celular em pé,
// "duas páginas" deita o livro na tela (é só virar o aparelho); com o celular
// deitado, as duas aparecem lado a lado. Girar o aparelho NÃO muda o modo
// escolhido — só o jeito de mostrar.
const stageEl = $('#stage');
const lieExit = $('#lie-exit');
const lieHint = $('#lie-hint');
const pagesBtn = $('#pages-mode');
let lieHintTimer;

/** o livro precisa ser deitado (duas páginas com o celular em pé)? */
const wantsLying = () => view.double && opened && book.mode === 'mobile' && window.innerHeight > window.innerWidth;

function syncPagesBtn() {
  pagesBtn.setAttribute('aria-pressed', String(view.double));
  pagesBtn.querySelector('span').textContent = view.double ? t('1 página', '1 page') : t('2 páginas', '2 pages');
  pagesBtn.title = view.double ? t('Ver uma página por vez', 'Show one page at a time') : t('Ver as duas páginas', 'Show both pages');
}

function applyMode() {
  const lying = wantsLying();
  const changed = lying !== view.lying;
  view.lying = lying;
  document.body.classList.toggle('is-lying', lying);
  document.body.classList.toggle('is-double', view.double);
  lieExit.hidden = !lying;
  if (!lying) {
    clearTimeout(lieHintTimer);
    lieHint.hidden = true;
  }
  syncPagesBtn();
  book.relayout();
  layoutProps();
  updateUI();
  return changed && lying;
}

function setPagesMode(double) {
  if (view.double === double || !opened || openTl) return;
  if (spin.active) spin.resetNow();
  cancelPageDrag();
  if (book.tl) book.tl.progress(1);
  resetPZ(true);
  gsap.killTweensOf(stageEl);
  gsap.to(stageEl, {
    opacity: 0,
    duration: 0.16,
    ease: 'power1.in',
    onComplete: () => {
      view.double = double;
      try {
        sessionStorage.setItem('livro.pages', double ? '2' : '1');
      } catch {}
      const nowLying = applyMode();
      gsap.to(stageEl, { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' });
      if (nowLying) {
        lieHint.hidden = false;
        lieHint.classList.remove('is-gone');
        clearTimeout(lieHintTimer);
        lieHintTimer = setTimeout(() => {
          lieHint.classList.add('is-gone');
          lieHintTimer = setTimeout(() => (lieHint.hidden = true), 600);
        }, 2600);
      }
    },
  });
}
const setLying = (on) => setPagesMode(!!on);

/** volta a uma página na hora (sem transição) */
function exitLyingNow() {
  if (!view.double && !view.lying) return;
  gsap.killTweensOf(stageEl);
  gsap.set(stageEl, { clearProps: 'opacity' });
  view.double = false;
  applyMode();
}

try {
  view.double = sessionStorage.getItem('livro.pages') === '2';
} catch {}
syncPagesBtn();
pagesBtn.addEventListener('click', () => setPagesMode(!view.double));
lieExit.addEventListener('click', () => setPagesMode(false));

/* ───────────── virar a página com a mão (estilo iPad) ───────────── */

// Computador: pegue a página em qualquer ponto e arraste — a folha segue o ponteiro.
// Celular: deslize o dedo — a página acompanha. Soltar depois da metade (ou num
// gesto rápido) completa; antes disso, a página volta.
// (Todas as medidas em coordenadas do palco: com o livro deitado, a tela gira.)
let pageDrag = null;
let pageDragged = false;
const NO_DRAG = 'input, textarea, [data-copy], #ui, #desk-props, #talk, #lie-exit';

// se o gesto virou arrasto, o clique no fim (num link, aba ou canto) não conta
document.addEventListener('click', (e) => {
  if (pageDragged && e.target.closest('.leaf')) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

function spineX() {
  const r = vrect(rig);
  const scale = r.width / (2 * book.pw);
  return { x: r.left + r.width / 2 + gsap.getProperty(book.el, 'x') * scale, scale };
}

function thetaAt(x) {
  const sp = spineX();
  const dx = (x - sp.x) / (book.pw * sp.scale);
  return (Math.acos(Math.max(-1, Math.min(1, dx))) * 180) / Math.PI;
}

/** desiste do gesto em andamento (a folha volta ao lugar) */
function cancelPageDrag() {
  const g = pageDrag;
  pageDrag = null;
  document.body.classList.remove('is-page-drag');
  if (g?.live && book.drag) {
    book.dragMove(0);
    book.dragEnd(0).then(() => updateUI());
  }
}

document.addEventListener('pointerdown', (e) => {
  if (!opened || openTl) return;
  const onStage = !!e.target.closest('#stage');
  // dois dedos no livro: pinça
  if (e.pointerType === 'touch' && onStage && !spin.active) {
    touches.set(e.pointerId, vpt(e.clientX, e.clientY));
    if (touches.size >= 2) {
      e.__page = true;
      startPinch();
      return;
    }
  }
  if (e.button !== 0 || pinch) return;
  // no 360°: com o livro de frente, arrastar a página vira a página; girado, gira o livro
  const flipInSpin = spin.active && spin.frontal && e.pointerType === 'mouse' && e.target.closest('.leaf');
  if ((spin.active || spin.rotated) && !flipInSpin) return;
  if (e.target.closest(NO_DRAG)) return;
  const pt = vpt(e.clientX, e.clientY);
  // aproximado: arrastar passeia pela página
  if (zoomed() && onStage) {
    e.__page = true;
    pan = { id: e.pointerId, x: pt.x, y: pt.y, px: pz.x, py: pz.y, moved: false };
    gsap.killTweensOf(rig, 'scale,x,y');
    pageDragged = false;
    return;
  }
  const mobile = book.mode === 'mobile';
  if (!e.target.closest('.leaf') && !(mobile && onStage)) return;
  e.__page = true; // o giro 360° não pega este gesto
  pageDrag = { id: e.pointerId, x: pt.x, y: pt.y, live: false, p: 0, t: 0, v: 0, target: e.target, lx: pt.x, ly: pt.y };
  pageDragged = false;
}, true);

window.addEventListener('pointermove', (e) => {
  if (touches.has(e.pointerId)) touches.set(e.pointerId, vpt(e.clientX, e.clientY));
  if (pinch) {
    if (touches.size >= 2) movePinch();
    return;
  }
  if (pan && e.pointerId === pan.id) {
    const pt = vpt(e.clientX, e.clientY);
    const dx = pt.x - pan.x;
    const dy = pt.y - pan.y;
    if (!pan.moved && Math.hypot(dx, dy) < 6) return;
    pan.moved = true;
    pageDragged = true;
    pz.x = pan.px + dx;
    pz.y = pan.py + dy;
    clampPZ();
    renderPZ(false);
    return;
  }
  const g = pageDrag;
  if (!g || e.pointerId !== g.id) return;
  const pt = vpt(e.clientX, e.clientY);
  const dx = pt.x - g.x;
  const dy = pt.y - g.y;
  g.lx = pt.x;
  g.ly = pt.y;
  if (!g.live) {
    if (Math.abs(dx) < 7 && Math.abs(dy) < 7) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.3) {
      pageDrag = null; // gesto vertical: não é virar página
      return;
    }
    let dir;
    if (book.spread) {
      dir = g.x > spineX().x ? 1 : -1; // pegou a página da direita → avança
      if (book.s === 0) dir = 1;
      if (book.s === book.N) dir = -1;
    } else dir = dx < 0 ? 1 : -1;
    // levantou por cima ou por baixo? (−1 topo … 1 base) — o canto puxado vai à frente
    const rr = vrect(rig);
    const tilt = Math.max(-1, Math.min(1, ((g.y - rr.top) / rr.height - 0.5) * 2.2));
    if (!book.dragStart(dir, tilt)) {
      pageDrag = null;
      return;
    }
    g.live = true;
    g.dir = dir;
    g.th0 = thetaAt(g.x);
    // completa quando o ponteiro cruza a lombada (como num livro real)
    if (book.spread && book.drag?.leaf) {
      book.drag.commitAt = dir > 0 ? (90 - g.th0) / Math.max(20, 180 - g.th0) : (g.th0 - 90) / Math.max(20, g.th0);
      book.drag.commitAt = Math.max(0.2, Math.min(0.6, book.drag.commitAt));
    }
    pageDragged = true;
    document.body.classList.add('is-page-drag');
    g.t = performance.now();
  }
  let p;
  if (book.spread && book.drag?.leaf) {
    // a borda da folha acompanha o ponteiro, partindo de onde ele pegou
    const th = thetaAt(pt.x);
    p = g.dir > 0 ? (th - g.th0) / Math.max(20, 180 - g.th0) : (g.th0 - th) / Math.max(20, g.th0);
  } else {
    p = (-g.dir * dx) / (vw() * (book.drag?.leaf ? 0.78 : 0.6));
  }
  const now = performance.now();
  g.v = ((p - g.p) / Math.max(1, now - g.t)) * 16;
  g.p = p;
  g.t = now;
  book.dragMove(p);
});

function endPageDrag(e) {
  if (e) touches.delete(e.pointerId);
  if (pinch) {
    if (touches.size < 2) endPinch();
    return;
  }
  if (pan && (!e || e.pointerId === pan.id)) {
    const moved = pan.moved;
    pan = null;
    if (moved) {
      setTimeout(() => (pageDragged = false), 80);
      clampPZ();
      renderPZ(true);
    }
    return;
  }
  const g = pageDrag;
  if (!g || (e && e.pointerId !== g.id)) return;
  pageDrag = null;
  const pt = e ? vpt(e.clientX, e.clientY) : { x: g.lx, y: g.ly };
  const dx = pt.x - g.x;
  const dy = pt.y - g.y;
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
  hideTalk();
  objModal?.close();
  phone?.close();
  cancelPageDrag();
  touches.clear();
  exitLyingNow();
  enterTl?.kill();
  openTl?.kill();
  openTl = null;
  floatTween?.kill();
    spin.resetNow();
  resetPZ(true);
  book.setThick(false);
  if (book.tl) book.tl.progress(1);
  gsap.killTweensOf([camera, float, book.el, book.shadow, book.edges, cine.veil, cine.bars, cine.place, cine.pre, cine.name, cine.light, cine.desk, ...book.leaves]);
  book.drag = null;
  document.querySelectorAll('.bend').forEach((b) => b.remove());
  book.leaves.forEach((l) => l.classList.remove('is-bending'));
  opened = false;
  history.replaceState(null, '', window.location.pathname + window.location.search);
  document.body.classList.remove('is-open', 'is-opening', 'can-open');
  // livro fechado e encorpado de novo
  book.d = 2.4;
  book.s = 0;
  book.side = 'right';
  book.leaves.forEach((l) => setLift(l, 0));
  book.applyStatic();
  book.castShadow(null);
  gsap.set(book.edges, { opacity: 1 });
  levitate?.kill();
  gsap.killTweensOf([rig, flash]);
  gsap.set(rig, { scale: 1, x: 0, y: 0, clearProps: 'transformOrigin' });
  gsap.set(book.el, { rotationY: 0, rotationX: 0, rotationZ: 0, z: 0, transformOrigin: '50% 50%' });
  gsap.set(book.shadow, { opacity: 1 });
  gsap.set(flash, { opacity: 0 });
  gsap.set(float, { y: 0, rotationX: 0, rotationZ: 0 });
  gsap.set(cine.veil, { opacity: 1 });
  gsap.set(cine.bars, { scaleY: 1 });
  gsap.set([cine.place, cine.pre, cine.name], { opacity: 0 });
  gsap.set(cine.desk, { opacity: 1 });
  updateUI();
  layoutProps();
  // a trilha recomeça junto com a abertura
  music.restart();
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
propsEl.querySelector('.dp-lighter').innerHTML = cloneIds($('.prop-lighter').innerHTML);
propsEl.querySelector('.dp-notepad').innerHTML = $('.prop-notepad').innerHTML;
// fumaça e brasa do cigarro em HTML (animam na GPU, sem repintar o desenho)
const SMOKE = '<i class="emb" aria-hidden="true"></i><i class="smk" aria-hidden="true"><i></i><i></i><i></i></i>';
propsEl.querySelector('.dp-ashtray').insertAdjacentHTML('beforeend', SMOKE);
$('.prop-ashtray').insertAdjacentHTML('beforeend', SMOKE);

/**
 * Onde a mesa aparece em volta do livro (os objetos ficam ali):
 *  - computador e celular deitado: margens à esquerda e à direita;
 *  - celular em pé: uma faixa acima e outra abaixo da página.
 * Sem espaço suficiente (ou com o livro deitado/aproximado), os objetos saem.
 */
// As medidas dos objetos (--m, --bt…) ficam no próprio #desk-props, não no :root:
// variável no :root é herdada pelos ~2.000 elementos da página e cada escrita
// recalculava o estilo de todos (≈150 ms no celular, bem na troca de cena).
const deskPropsEl = $('#desk-props');
function setPropVar(name, value) {
  if (deskPropsEl.style.getPropertyValue(name) !== value) deskPropsEl.style.setProperty(name, value);
}
function layoutProps() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const root = document.documentElement;
  const st = root.style;
  let hide = view.lying;
  if (book.orient === 'land') {
    const rail = book.mode === 'desktop' ? 0 : parseFloat(st.getPropertyValue('--rail')) || 0;
    const m = (W - rail - (book.spread ? 2 : 1) * book.pw) / 2;
    setPropVar('--m', `${Math.max(0, m)}px`);
    hide = hide || m < (book.mode === 'desktop' ? 96 : 64);
  } else {
    const top = 58;
    const nav = parseFloat(st.getPropertyValue('--navh')) || 66;
    const bookTop = H / 2 - (book.lift ?? 0) - book.ph / 2;
    const bt = Math.max(0, bookTop - top);
    const bb = Math.max(0, H - nav - (bookTop + book.ph));
    setPropVar('--btop', `${top}px`);
    setPropVar('--bt', `${bt.toFixed(1)}px`);
    setPropVar('--bb', `${bb.toFixed(1)}px`);
    setPropVar('--m', '0px');
    hide = hide || Math.min(bt, bb) < 54;
  }
  if (root.classList.contains('no-props') !== hide) root.classList.toggle('no-props', hide);
}

const modalOpen = () => !!objModal?.isOpen || !!phone?.isOpen;

// card dos objetos e celular: baixados só quando usados pela primeira vez
// (e adiantados no tempo ocioso depois que o livro abre)
let objModal = null;
let objModalP = null;
const getObjModal = () =>
  (objModalP ??= import('./objmodal.js').then(({ createObjModal }) => (objModal = createObjModal({ getTheme: () => theme(), talk: deskTalk, onOpen: () => sound.flip(1) }))));
let phoneP = null;
const getPhone = () =>
  (phoneP ??= import('./phone.js').then(({ createPhone }) => {
    phone = createPhone({ music, sound, getTheme: () => theme(), switchTheme: () => toggleTheme(null), onSound: syncSound });
    return phone;
  }));
const openPhone = () => getPhone().then((ph) => ph.open());

// clicar num objeto abre o card dele (girável em 360°)
function talk(prop) {
  hideTalk();
  if (prop === 'phone') return openPhone();
  getObjModal().then((m) => m.open(prop));
}

function talkBubble(prop, anchor) {
  const t = theme();
  const d = deskTalk[t][prop];
  const key = `${t}:${prop}`;
  const i = (talkIndex[key] = ((talkIndex[key] ?? -1) + 1) % d.lines.length);
  talkEl.querySelector('.talk-name').textContent = d.name;
  talkEl.querySelector('.talk-text').textContent = d.lines[i];
  talkEl.querySelector('.talk-more').textContent = window.matchMedia('(pointer: coarse)').matches ? t('toque de novo ↻', 'tap again ↻') : t('clique de novo ↻', 'click again ↻');
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

/* ───────────── barra de ajustes (celular) ───────────── */

// No celular: uma barra no rodapé (como nos apps) só com o essencial —
// tema, música (abre o celular da mesa), som das páginas, 360° e abertura.
const tabbar = $('#tabbar');
const tb = (act) => tabbar.querySelector(`[data-act="${act}"]`);

function syncTabbar() {
  tb('sound').setAttribute('aria-pressed', String(sound.enabled));
  tb('sound').classList.toggle('is-off', !sound.enabled);
  tb('music').classList.toggle('is-off', !music.enabled);
  tb('spin').setAttribute('aria-pressed', String(spin.active));
}

tabbar.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'theme') {
    const r = b.getBoundingClientRect();
    toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  } else if (act === 'music') openPhone();
  else if (act === 'sound') toggleSound();
  else if (act === 'spin') $('#spin').click();
  else if (act === 'replay') replay();
  syncTabbar();
});

/* ───────────── "Visitar a obra": mergulho de câmera ───────────── */

const portal = createPortal({
  rig,
  reduced,
  beforeLeave: () => {
    music.duck(1.0);
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
  // clicar na foto (prancha) do projeto também mergulha no site
  const plate = !e.target.closest('[data-visit]') && e.target.closest('.work .plate');
  const a = e.target.closest('[data-visit]') || (plate && plate.closest('.work').querySelector('[data-visit]'));
  if (!a || e.defaultPrevented) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // nova aba: deixa o navegador
  e.preventDefault();
  e.stopPropagation();
  if (spin.rotated) spin.resetNow();
  exitLyingNow();
  resetPZ(true);
  const frame = a.closest('.work')?.querySelector('.photo-frame, .plate-inner');
  portal.go(a.href, frame, a.dataset.title || 'a obra');
});
// pré-conecta ao destino quando o ponteiro chega no link
document.addEventListener('pointerover', (e) => {
  const a = e.target.closest?.('[data-visit]');
  if (a) portal.warm(a.href);
});

/* ───────────── trilha sonora e som das páginas ───────────── */

const musicBtn = $('#music');
const soundBtn = $('#sound');

function syncMusicUI() {
  const v = Math.round(music.volume * 100);
  musicBtn.classList.toggle('is-off', !music.enabled);
  musicBtn.setAttribute('aria-pressed', String(music.enabled));
  musicBtn.title = t(`Trilha sonora — volume ${music.muted ? 'mudo' : v} · abre o celular`, `Soundtrack — volume ${music.muted ? 'muted' : v} · opens the phone`);
  syncTabbar();
  phone?.sync();
}

function syncSound() {
  soundBtn.setAttribute('aria-pressed', String(sound.enabled));
  soundBtn.classList.toggle('is-off', !sound.enabled);
  syncTabbar();
  phone?.sync();
}

function toggleSound() {
  sound.toggle();
  syncSound();
}

// o botão de música (no computador e na barra do celular) abre o celular da mesa
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  openPhone();
});
soundBtn.addEventListener('click', toggleSound);

syncMusicUI();
syncSound();

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
  await Promise.all([applyTextures(next), new Promise((r) => setTimeout(r, 200))]);
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
  try {
    sessionStorage.setItem('livro.theme', next);
  } catch {}
  const fav = document.getElementById('favicon');
  if (fav) fav.href = `favicon-${next}.svg`;
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
  b.title = dark ? t('Edição Sombria — clique para a edição clássica', 'Dark Edition — click for the classic edition') : t('Edição clássica — clique para a Edição Sombria', 'Classic edition — click for the Dark Edition');
  b.querySelector('.theme-label').textContent = dark ? t('sombria', 'dark') : t('clássica', 'classic');
}

function toggleTheme(origin) {
  setTheme(theme() === 'dark' ? 'light' : 'dark', origin);
}

$('#theme').addEventListener('click', (e) => toggleTheme({ x: e.clientX, y: e.clientY }));

// o tema do aparelho mudou (ex.: modo escuro automático à noite) e o leitor não escolheu outro
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
  let chosen = null;
  try {
    chosen = sessionStorage.getItem('livro.theme');
  } catch {}
  if (!chosen) setTheme(e.matches ? 'dark' : 'light');
});

/* ───────────── idioma: PT ⇄ EN ───────────── */

const langBtn = $('#lang');
langBtn.setAttribute('aria-checked', String(EN));
langBtn.classList.toggle('is-en', EN);
langBtn.addEventListener('click', () => {
  // a transição de cor só existe no clique (ao carregar, o estado entra direto: sem animação)
  langBtn.classList.add('is-live');
  langBtn.classList.toggle('is-en');
  setLang(EN ? 'pt' : 'en');
  // reabre no mesmo ponto, sem a abertura, já no outro idioma
  try {
    if (opened) sessionStorage.setItem('livro.back', String(book.page));
  } catch {}
  document.body.classList.add('is-switching-lang');
  setTimeout(() => window.location.reload(), 220);
});
syncThemeButton();

/* ───────────── interações ───────────── */

function bindControls() {
  ui.next.addEventListener('click', () => book.next());
  ui.prev.addEventListener('click', () => book.prev());
  ui.skip.addEventListener('click', skipIntro);

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
      book.nextTilt = curl.classList.contains('curl-top') ? -0.6 : 0.6; // canto de cima ou de baixo
      curl.dataset.curl === 'next' ? book.next() : book.prev();
      return;
    }
    // livro fechado na capa: um clique abre de novo
    if (opened && book.s === 0 && e.target.closest('#stage')) {
      book.next();
      return;
    }
    // clicar na página vira: página da direita avança, da esquerda volta
    // (no celular com uma página só: toque no terço esquerdo volta, no resto avança)
    // (o lado sai da posição do clique em relação à lombada: no 3D o alvo pode ser a folha inteira)
    const pg = opened && !e.defaultPrevented && !spin.active && !pageDragged && e.target.closest('.leaf');
    if (pg && !e.target.closest('a, button, input, textarea, label, [data-goto], [data-copy], [data-diary], .plate, .tab')) {
      const x = vpt(e.clientX, e.clientY).x;
      let fwd;
      if (book.s === book.N) fwd = false;
      else if (!book.spread) fwd = x > vw() * 0.33;
      else fwd = x > spineX().x;
      const r = vrect(rig);
      book.nextTilt = vpt(e.clientX, e.clientY).y < r.top + r.height / 2 ? -0.5 : 0.5; // levanta pelo canto mais perto
      fwd ? book.next() : book.prev();
      return;
    }
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
        copy.textContent = t('copiado ✓', 'copied ✓');
        setTimeout(() => (copy.textContent = t('copiar', 'copy')), 1800);
      });
      return;
    }
    if (!opened && e.target.closest('#stage, #prompt')) open();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || modalOpen()) return;
    if (!opened) {
      if (['Enter', ' ', 'ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        open();
      } else if (e.key === 'Escape') skipIntro();
      return;
    }
    if (e.key === 'Escape' && zoomed()) { resetPZ(); return; }
    if (['+', '='].includes(e.key)) { zoomBy(1); return; }
    if (e.key === '-') { zoomBy(-1); return; }
    if (e.key === '0') { resetPZ(); return; }
    if (e.key === 'Escape' && view.double) { setPagesMode(false); return; }
    if (e.key === 'Escape' && spin.rotated) { spin.reset(); return; }
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); book.next(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); book.prev(); }
    if (e.key === 'Home') { e.preventDefault(); book.goToPage(4); }
    if (e.key === 'End') { e.preventDefault(); book.goToPage(18); }
  });

  // livro fechado (abertura): rolar a roda para baixo abre; aberto, a roda é zoom
  window.addEventListener('wheel', (e) => {
    if (!opened && !modalOpen() && e.deltaY > 10) open();
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

  // aba em segundo plano: o navegador às vezes informa medidas falsas — ignora
  let rt;
  window.addEventListener('resize', () => {
    if (document.hidden) return;
    clearTimeout(rt);
    rt = setTimeout(relayoutNow, 150);
  });
}

let laidOut = '';
function relayoutNow(force = false) {
  const key = `${window.innerWidth}x${window.innerHeight}`;
  if (!force && key === laidOut) return;
  laidOut = key;
  // girou o aparelho: mantém o modo escolhido (uma ou duas páginas), muda só o jeito de mostrar
  if (opened) {
    applyMode();
    if (zoomed()) {
      clampPZ();
      renderPZ(false);
    }
    return;
  }
  book.relayout();
  if (!opened && !openTl) gsap.set(book.el, { x: book.xFor(0) });
  if (opened) layoutProps();
  if (zoomed()) {
    clampPZ();
    renderPZ(false);
  }
  updateUI();
}

/**
 * Ao voltar para a aba (depois de abrir um projeto, trocar de app ou de aba):
 * gestos que ficaram "presos" (o dedo saiu da tela em outra aba) são
 * desfeitos, o mergulho do portal é encerrado e as medidas, refeitas.
 */
function heal() {
  if (document.hidden) return;
  touches.clear();
  if (pinch) endPinch();
  pan = null;
  cancelPageDrag();
  pageDragged = false;
  document.body.classList.remove('is-page-drag', 'is-dragging', 'is-pinching');
  portal.heal();
  relayoutNow();
  if (opened && !openTl) layoutProps();
}
document.addEventListener('visibilitychange', () => setTimeout(heal, 80));
window.addEventListener('pageshow', () => setTimeout(heal, 80));

/* ───────────── paralaxe sutil ───────────── */

function enableParallax() {
  if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
  const rx = gsap.quickTo(rig, 'rotationX', { duration: 1.4, ease: 'power3.out' });
  const ry = gsap.quickTo(rig, 'rotationY', { duration: 1.4, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    if (document.body.classList.contains('is-spin')) {
      rx(0);
      ry(0);
      return;
    }
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

/* ───────────── textos da interface em inglês ───────────── */

function translateStatic() {
  if (!EN) return;
  const T = [
    // [seletor, texto (ou null), atributos]
    ['#stage', null, { 'aria-label': 'Book: Matheus Andrade, Full Stack Developer' }],
    ['.ui-mark', null, { 'aria-label': 'Home: close the book and go back to the cover', title: 'Back to the cover' }],
    ['.ui-links', null, { 'aria-label': 'Shortcuts' }],
    ['[data-nav="sumario"]', 'Contents'],
    ['[data-nav="obras"]', 'Works'],
    ['[data-nav="epilogo"]', 'Contact'],
    ['#spin', null, { 'aria-label': 'Rotate the book 360 degrees', title: 'Drag to rotate' }],
    ['#theme', null, { 'aria-label': 'Switch between light and dark themes' }],
    ['#sound', null, { 'aria-label': 'Page sounds' }],
    ['#sound .snd-label', 'sound'],
    ['#music', null, { 'aria-label': 'Soundtrack' }],
    ['#music .snd-label', 'music'],
    ['#replay', null, { 'aria-label': 'Replay the opening', title: 'Replay the opening' }],
    ['#replay .snd-label', 'opening'],
    ['#prev', null, { 'aria-label': 'Previous page' }],
    ['#prev span', 'previous'],
    ['#next', null, { 'aria-label': 'Next page' }],
    ['#next span', 'next'],
    ['#tabbar', null, { 'aria-label': 'Settings' }],
    ['[data-act="theme"]', null, { 'aria-label': 'Switch edition: classic or dark' }],
    ['[data-act="theme"] .tb-label', 'theme'],
    ['[data-act="music"]', null, { 'aria-label': 'Music: open the phone' }],
    ['[data-act="music"] .tb-label', 'music'],
    ['[data-act="sound"]', null, { 'aria-label': 'Page sounds' }],
    ['[data-act="sound"] .tb-label', 'pages'],
    ['[data-act="spin"]', null, { 'aria-label': 'Rotate the book 360 degrees' }],
    ['[data-act="replay"]', null, { 'aria-label': 'Replay the opening' }],
    ['[data-act="replay"] .tb-label', 'opening'],
    ['.prompt-text', 'Tap to open'],
    ['.ct-pre', 'a book by'],
    ['.cine-place', 'Franca, Brazil &nbsp;·&nbsp; MMXXVI', null, true],
    ['#spin-hint', '360° mode · drag outside the book to rotate · facing you, drag the page to turn it'],
    ['#spin-exit', null, null, false, (el) => (el.lastChild.textContent = 'back to the book')],
    ['#skip', 'Skip intro <kbd>Esc</kbd>', null, true],
    ['#zoom-out', '⤢ original size'],
    ['#lie-exit', '↺ one page'],
    ['#lie-hint', '<span class="lh-phone"></span>turn your phone to read both pages', null, true],
    ['#read-hint', 'swipe to turn · “2 pages” shows both · pinch to zoom'],
    ['#desk-props', null, { 'aria-label': 'Desk objects' }],
    ['.dp-glasses', null, { 'aria-label': 'Work glasses' }],
    ['.dp-ring', null, { 'aria-label': 'Coffee ring or candle' }],
    ['.dp-pen', null, { 'aria-label': 'Fountain pen' }],
    ['.dp-note', null, { 'aria-label': '“Read me” note' }],
    ['.dp-whisky', null, { 'aria-label': 'Glass of whisky' }],
    ['.dp-ashtray', null, { 'aria-label': 'Cigarette in the ashtray' }],
    ['.dp-lighter', null, { 'aria-label': 'Lighter' }],
    ['.dp-notepad', null, { 'aria-label': 'Notepad' }],
    ['.dp-phone', null, { 'aria-label': 'Phone: what is playing' }],
    ['.om-x', null, { 'aria-label': 'Close' }],
    ['.om-hint', 'drag to rotate 360°'],
    ['.om-next', 'another story ↻'],
    ['.pm-device', null, { 'aria-label': 'Phone — now playing' }],
    ['.pm-down', null, { 'aria-label': 'Close the phone' }],
    ['.pm-head small', 'now playing'],
    ['.pm-seek .sr-only', 'Track position'],
    ['.pm-restart', null, { 'aria-label': 'Back to the start of the track' }],
    ['.pm-vol .sr-only', 'Soundtrack volume'],
    ['.pm-pages span', 'page sounds'],
    ['.talk-more', 'click again ↻'],
  ];
  for (const [sel, text, attrs, html, fn] of T) {
    document.querySelectorAll(sel).forEach((el) => {
      if (text != null) el[html ? 'innerHTML' : 'textContent'] = text;
      if (attrs) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      fn?.(el);
    });
  }
}
translateStatic();

/* ───────────── início ───────────── */

bindControls();
laidOut = `${window.innerWidth}x${window.innerHeight}`;
updateUI();

const loaderEl = $('#loader');
// o CSS principal chega sem bloquear a primeira pintura; o livro espera por ele
const cssReady = import.meta.env.DEV ? Promise.resolve() : window.__cssReady || Promise.resolve();
cssReady.then(() => {
  document.documentElement.classList.add('css');
  if (book.mode === 'mobile') relayoutNow(true); // margem da barra de gestos (vem do CSS)
});
const ready = document.fonts?.ready ?? Promise.resolve();
cssReady.then(() => Promise.race([Promise.all([ready, texturesReady]), new Promise((r) => setTimeout(r, 3000))])).then(() => {
  if (reduced) {
    document.body.classList.add('is-ready');
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
  startWithMusic();
});

/**
 * Os navegadores só deixam tocar som depois de um toque/clique/tecla na página.
 * Se o som já está liberado (o Chrome libera para quem já visitou), a abertura
 * começa direto com a trilha. Senão, o monograma pede um toque — e esse mesmo
 * toque liga a música e dá a partida na cena, para as duas começarem juntas.
 */
/**
 * Pré-desenha a cena enquanto o monograma espera (o toque, ou o teste de som).
 * A câmera ficava invisível e atrás de duas camadas pretas opacas (loader e véu):
 * o navegador não desenhava nada, e no toque rasterizava mesa, livro, objetos e
 * texturas de uma vez — ~1 s de tela congelada no celular. Aqui a cena já fica
 * montada por baixo, na pose inicial, com o loader e o véu a 99,6% (diferença
 * invisível, mas deixam de ser "opacos" e o navegador desenha o que há atrás).
 */
function warmScene() {
  if (warmedScene || reduced) return;
  warmedScene = true;
  setClosedPose();
  gsap.set(cine.veil, { opacity: 0.996 });
  loaderEl.classList.add('is-warm');
  book.cull([0, book.N - 1]);
  // verso do livro por dois quadros: contracapa, lombada e corte também ficam desenhados
  gsap.set(book.el, { rotationY: -180 });
  setOrigin(book.el, '75% 50%');
  requestAnimationFrame(() => requestAnimationFrame(() => gsap.set(book.el, { rotationY: 0 })));
  // as primeiras folhas (guardas e folha de rosto) uma de cada vez — montá-las custava
  // ~250 ms cada e acontecia no meio da cena; aqui ninguém vê
  setTimeout(() => !enteredOnce && book.cull([0, 1, book.N - 1]), 250);
  setTimeout(() => !enteredOnce && book.cull([0, 1, 2, book.N - 1]), 500);
}

async function startWithMusic() {
  warmScene();
  const go = () => {
    loaderEl.classList.remove('is-gate');
    document.body.classList.add('is-ready');
    enter();
    if (returnPage != null) skipIntro();
  };
  let ok = music.muted;
  if (!ok) ok = await Promise.race([music.autoplay, new Promise((r) => setTimeout(() => r(false), 700))]);
  if (ok) return go();
  loaderEl.classList.add('is-gate');
  loaderEl.setAttribute('aria-hidden', 'false');
  loaderEl.setAttribute('role', 'button');
  const start = (e) => {
    if (e.type === 'keydown' && e.key === 'Tab') return;
    e.stopPropagation(); // a mesma tecla não deve também pular a abertura
    ['pointerup', 'keydown'].forEach((t) => window.removeEventListener(t, start, true));
    go();
  };
  ['pointerup', 'keydown'].forEach((t) => window.addEventListener(t, start, true));
}

// Firefox ignora -webkit-user-drag: impede o arrasto nativo de links/imagens nas páginas
document.addEventListener('dragstart', (e) => {
  if (e.target.closest?.('.leaves')) e.preventDefault();
});
