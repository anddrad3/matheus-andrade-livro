import { author, prologue, arsenal, works, formation, epilogue, diary, colophon, index } from './content.js';
import {
  guilloche, medallion, corner, rule, fleuron, waxSeal, barcode, arrow, roman,
  handArrow, handCircle, handUnderline, phonePlate, tape,
} from './ornaments.js';

/**
 * Mapa do livro — 12 folhas, 24 faces.
 * Folha k: frente = página 2k (direita), verso = página 2k+1 (esquerda).
 * Espelho s mostra as páginas 2s−1 (esquerda) e 2s (direita).
 */
export const PAGE_COUNT = 24;

const FOLIO = { 2: 'i', 3: 'ii', 4: 'iii' };
for (let p = 5; p <= 21; p++) FOLIO[p] = String(p - 4);
export const folioOf = (p) => FOLIO[p] ?? '';
const pageOfFolio = (f) => (typeof f === 'number' ? f + 4 : Number(Object.keys(FOLIO).find((k) => FOLIO[k] === f)));

export const CHAPTERS = [
  { id: 'sumario', label: 'Sumário', page: 4 },
  { id: 'prologo', label: prologue.title, sub: prologue.heading, page: 5, tab: 'Pról.' },
  { id: 'arsenal', label: arsenal.title, sub: arsenal.heading, page: 7, num: 1, tab: 'I' },
  { id: 'obras', label: works.title, sub: works.heading, page: 9, num: 2, tab: 'II' },
  { id: 'formacao', label: formation.title, sub: formation.heading, page: 15, num: 3, tab: 'III' },
  { id: 'epilogo', label: epilogue.title, sub: `${epilogue.heading} & diário de bordo`, page: 17, tab: 'Epíl.' },
  { id: 'colofao', label: 'Colofão', page: 20 },
  { id: 'indice', label: 'Índice remissivo', page: 21, tab: 'Índ.' },
];

/** Abas de dicionário: em qual folha cada capítulo começa */
export const TABS = CHAPTERS.filter((c) => c.tab).map((c, i, all) => ({
  ...c,
  leaf: Math.floor(c.page / 2),
  pos: +(i / (all.length - 1)).toFixed(3),
  color: ['#6e1d14', '#1f3a2d', '#5a3a12'][i % 3],
}));

export function chapterOf(p) {
  if (p <= 0) return 'Capa';
  if (p === 1 || p === 22) return 'Guarda';
  if (p === 2) return 'Folha de rosto';
  if (p === 3) return 'Frontispício';
  if (p >= 23) return 'Contracapa';
  if (p === 19) return diary.title;
  let ch = CHAPTERS[0];
  for (const c of CHAPTERS) if (p >= c.page) ch = c;
  return ch.label;
}

/* ───────────── helpers ───────────── */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let revealIndex = 0;
const rv = (tag, cls, inner, attrs = '') =>
  `<${tag} class="reveal ${cls}" style="--i:${revealIndex++}" ${attrs}>${inner}</${tag}>`;

/** Anotação à mão na margem */
const note = (text, { style = '', arrowDir = null, arrowStyle = '', cls = '' } = {}) =>
  `<div class="note ${cls}" style="${style}" aria-hidden="true">
    <span class="note-text">${esc(text)}</span>
    ${arrowDir ? `<span class="note-arrow" style="${arrowStyle}">${handArrow(arrowDir)}</span>` : ''}
  </div>`;

function paper(p, side, inner, { head = true, cls = '', notes = '' } = {}) {
  const running = side === 'left' ? author.name : chapterOf(p);
  return `<div class="page paper ${side} ${cls}" data-page="${p}">
    <div class="paper-shade"></div>
    ${head ? `<header class="running-head"><span>${esc(running)}</span></header>` : ''}
    <div class="page-body">${inner}</div>
    ${notes}
    ${folioOf(p) ? `<footer class="folio"><span class="folio-mark">·</span>${folioOf(p)}<span class="folio-mark">·</span></footer>` : ''}
    <button class="curl curl-${side === 'left' ? 'prev' : 'next'}" tabindex="-1" aria-hidden="true" data-curl="${side === 'left' ? 'prev' : 'next'}"></button>
  </div>`;
}

function epigraph(e) {
  return `<blockquote class="epigraph reveal" style="--i:${revealIndex++}">
    <p>${esc(e.text)}</p>
    <cite>— ${esc(e.source)}</cite>
  </blockquote>`;
}

function opener({ p, label, num, title, ep, intro, extra = '', notes = '' }) {
  return paper(
    p,
    'left',
    `<div class="opener${extra ? ' has-extra' : ''}">
      ${rv('p', 'opener-label', num ? `Capítulo ${roman(num)}` : label)}
      ${num ? rv('div', 'opener-numeral', roman(num), 'aria-hidden="true"') : rv('div', 'opener-numeral is-orn', fleuron('opener-fleuron'))}
      ${rv('h2', 'opener-title', esc(title))}
      ${rule('opener-rule reveal-rule')}
      ${epigraph(ep)}
      ${intro ? rv('p', 'opener-intro', esc(intro)) : ''}
      ${extra || `<div class="opener-vignette reveal" style="--i:${revealIndex++}">${fleuron()}</div>`}
    </div>`,
    { cls: 'is-opener', notes },
  );
}

/* ───────────── capa e guardas ───────────── */

function cover() {
  return `<div class="page board cover" data-page="0">
    <div class="leather"></div>
    <div class="cover-frame">
      ${corner('c-tl')}${corner('c-tr')}${corner('c-bl')}${corner('c-br')}
    </div>
    <div class="cover-content">
      ${fleuron('cover-fleuron foil-stroke')}
      <p class="cover-kicker foil">Vol. I · ${roman(author.year)}</p>
      <h1 class="cover-title">
        <span class="foil">${esc(author.first)}</span>
        <span class="foil">${esc(author.last)}</span>
      </h1>
      ${rule('cover-rule foil-stroke')}
      <p class="cover-role foil">${esc(author.role)}</p>
      ${medallion(author.monogram, { a: 8, b: 3, loops: 36, r: 0.52 }, 'cover-medallion foil-stroke')}
    </div>
    <div class="cover-glint"></div>
    <div class="cover-sheen"></div>
  </div>`;
}

function endpaper(p, side) {
  return `<div class="page board endboard ${side}" data-page="${p}">
    <div class="leather"></div>
    <div class="endpaper">
      <div class="marble"></div>
      ${p === 1 ? `<div class="exlibris">
          <span class="exlibris-top">Ex Libris</span>
          ${fleuron('exlibris-fleuron')}
          <span class="exlibris-name">do leitor curioso</span>
          <span class="exlibris-hand">você ✎</span>
        </div>` : ''}
    </div>
  </div>`;
}

function backCover() {
  return `<div class="page board cover back-cover" data-page="23">
    <div class="leather"></div>
    <div class="cover-frame">
      ${corner('c-tl')}${corner('c-tr')}${corner('c-bl')}${corner('c-br')}
    </div>
    <div class="back-content">
      ${fleuron('foil-stroke back-fleuron')}
      <p class="back-blurb foil">${esc(author.blurb)}</p>
      ${rule('foil-stroke back-rule')}
      <p class="back-author foil">${esc(author.fullName)}</p>
      ${barcode()}
    </div>
    <div class="cover-sheen"></div>
  </div>`;
}

/* ───────────── páginas iniciais ───────────── */

function titlePage() {
  return paper(
    2,
    'right',
    `<div class="title-page">
      ${rv('p', 'tp-author', 'Desenvolvedor')}
      ${rule('tp-rule reveal-rule')}
      ${rv('h1', 'tp-title', `<em>${esc(author.first)}</em><em>${esc(author.last)}</em><span>${esc(author.roleShort.join(' '))}</span>`)}
      ${rv('p', 'tp-subtitle', esc(author.subtitle))}
      ${fleuron('tp-fleuron')}
      <div class="tp-imprint">
        ${medallion(author.monogram, { a: 7, b: 2, loops: 24, r: 0.5 }, 'tp-mark')}
        <p>${esc(author.edition)}</p>
        <p class="sc">${esc(author.city)} · ${roman(author.year)}</p>
      </div>
    </div>`,
    { head: false, cls: 'is-title' },
  );
}

function frontispiece() {
  return paper(
    3,
    'left',
    `<div class="frontis">
      <div class="frontis-plate">
        ${corner('c-tl')}${corner('c-tr')}${corner('c-bl')}${corner('c-br')}
        ${medallion(author.monogram, { a: 5, b: 2, loops: 44, r: 0.56 }, 'frontis-medallion')}
        <p class="plate-caption">Retrato do autor, em guilloché</p>
      </div>
      ${epigraph(author.epigraph)}
    </div>`,
    { head: false, cls: 'is-frontis' },
  );
}

function contents() {
  const items = CHAPTERS.slice(1)
    .map((c, i) => {
      const num = c.num ? roman(c.num) : c.id === 'prologo' || c.id === 'epilogo' ? '§' : '';
      return `<li class="reveal" style="--i:${i + 2}">
        <a href="#${c.id}" data-goto="${c.page}">
          <span class="toc-num">${num}</span>
          <span class="toc-text">
            <span class="toc-title">${esc(c.label)}</span>
            ${c.sub ? `<span class="toc-sub">${esc(c.sub)}</span>` : ''}
          </span>
          <span class="toc-leader" aria-hidden="true"></span>
          <span class="toc-page">${folioOf(c.page)}</span>
        </a>
      </li>`;
    })
    .join('');
  return paper(
    4,
    'right',
    `<nav class="toc" aria-label="Sumário">
      <h2 class="toc-heading reveal" style="--i:0">Sumário</h2>
      ${rule('toc-rule reveal-rule')}
      <ol>${items}</ol>
      <p class="toc-hint reveal" style="--i:10">Escolha um capítulo, use as abas na lateral — ou vire a página.</p>
    </nav>`,
    {
      cls: 'is-toc',
      notes: note('comece por aqui', { style: 'top:6.6em;right:1.6em;--r:5deg', arrowDir: 'down', arrowStyle: 'right:2.4em;top:1.25em' }),
    },
  );
}

/* ───────────── prólogo ───────────── */

function prologueText() {
  const [first, ...rest] = prologue.paragraphs;
  return paper(
    6,
    'right',
    `<article class="prose">
      ${rv('h3', 'section-heading', esc(prologue.heading))}
      <p class="dropcap-p reveal" style="--i:${revealIndex++}"><span class="dropcap" aria-hidden="true">${first[0]}</span><span class="sr-only">${first[0]}</span>${esc(first.slice(1))}</p>
      ${rest.map((t) => rv('p', '', esc(t))).join('')}
      ${rv('blockquote', 'pull', `<p>${esc(prologue.quote)}</p>`)}
      <dl class="catalog reveal" style="--i:${revealIndex++}">
        <div class="catalog-title">Ficha catalográfica</div>
        ${prologue.facts.map(([k, v]) => `<div class="catalog-row"><dt>${esc(k)}</dt><dd>${esc(v)}${v.startsWith('Aberto') ? `<span class="catalog-circle">${handCircle}</span>` : ''}</dd></div>`).join('')}
      </dl>
    </article>`,
    { notes: note(prologue.note, { style: 'bottom:2.2em;left:3.4em;--r:-3deg' }) },
  );
}

/* ───────────── arsenal ───────────── */

function arsenalText() {
  return paper(
    8,
    'right',
    `<article class="index">
      ${rv('h3', 'section-heading', 'Índice de ferramentas')}
      ${arsenal.groups
        .map(
          (g) => `<section class="index-group reveal" style="--i:${revealIndex++}">
            <h4>${esc(g.name)}</h4>
            <ul>${g.items.map((it) => `<li>${it === 'Kotlin' ? `<span class="hand-mark">${esc(it)}${handUnderline}</span>` : esc(it)}</li>`).join('')}</ul>
          </section>`,
        )
        .join('')}
    </article>`,
    { notes: note(arsenal.note, { style: 'bottom:4.4em;right:3em;--r:-4deg' }) },
  );
}

/* ───────────── obras ───────────── */

function plateFor(item, i) {
  const pl = item.plate;
  const cap = () => `<figcaption>Prancha ${roman(i + 1)} — <em>${esc(item.title)}</em></figcaption>`;
  if (pl.kind === 'photo') {
    return `<figure class="plate photo mount-${pl.mount} reveal" style="--i:${revealIndex++}">
      <div class="photo-frame">
        <img src="${pl.src}" alt="Captura de tela do site ${esc(item.title)}" loading="lazy" decoding="async" style="object-position:${pl.pos}" />
        <span class="halftone"></span>
        ${pl.mount === 'corners' ? '<i class="pc pc-tl"></i><i class="pc pc-tr"></i><i class="pc pc-bl"></i><i class="pc pc-br"></i>' : `${tape('t-l')}${tape('t-r')}`}
      </div>
      ${cap('fotografado no ar')}
    </figure>`;
  }
  if (pl.kind === 'phone') {
    return `<figure class="plate drawn reveal" style="--i:${revealIndex++}">
      <div class="plate-inner">${phonePlate()}</div>
      ${cap('desenho em traço')}
    </figure>`;
  }
  return `<figure class="plate data reveal" style="--i:${revealIndex++}">
    <div class="plate-inner">
      ${guilloche({ a: 9, b: 4, loops: 48, r: 0.62 }, { cls: 'data-rose' })}
      <div class="data-figure">
        <span class="data-number">${esc(pl.number)}</span>
        <span class="data-label">${esc(pl.label)}</span>
        <span class="data-sub">${esc(pl.sub)}</span>
      </div>
    </div>
    ${cap('em números')}
  </figure>`;
}

function workPage(item, i, p, side) {
  const notePos = side === 'right'
    ? { style: 'top:16.6em;right:1.4em;--r:5deg' }
    : { style: 'top:16.6em;right:2.2em;--r:-5deg' };
  return paper(
    p,
    side,
    `<article class="work">
      ${rv('p', 'work-meta', `<span>Obra ${roman(i + 1)}</span><span>${esc(item.tag)}</span>`)}
      ${plateFor(item, i)}
      ${rv('h3', 'work-title', esc(item.title))}
      ${rv('p', 'work-kicker', esc(item.kicker))}
      ${rv('p', 'work-desc', esc(item.description))}
      <dl class="work-facts reveal" style="--i:${revealIndex++}">
        <div><dt>Técnica</dt><dd>${item.stack.map(esc).join(' · ')}</dd></div>
      </dl>
      <div class="work-links reveal" style="--i:${revealIndex++}">
        ${item.site ? `<a class="work-link" href="${item.site}" target="_blank" rel="noopener">${esc(item.siteLabel ?? 'Visitar a obra')} ${arrow}</a>` : ''}
        <a class="work-link is-code" href="${item.repo}" target="_blank" rel="noopener">Ler o código ${arrow}</a>
      </div>
    </article>`,
    { cls: `is-work work-${item.id}`, notes: note(item.note, notePos) },
  );
}

const worksIndex = () => `
  <ol class="mini-toc reveal" style="--i:${revealIndex++}">
    ${works.items
      .map(
        (w, i) => `<li><a href="#obras" data-goto="${10 + i}"><span class="toc-num">${roman(i + 1)}</span><span class="toc-title">${esc(w.title)}</span><span class="toc-leader"></span><span class="toc-page">${folioOf(10 + i)}</span></a></li>`,
      )
      .join('')}
  </ol>`;

/* ───────────── formação ───────────── */

function formationText() {
  return paper(
    16,
    'right',
    `<article class="timeline">
      ${rv('h3', 'section-heading', esc(formation.heading))}
      <ol>
        ${formation.items
          .map(
            (it) => `<li class="reveal${it.future ? ' is-future' : ''}" style="--i:${revealIndex++}">
              <span class="tl-period">${esc(it.when)}</span>
              <span class="tl-node" aria-hidden="true"></span>
              <div class="tl-body">
                <h4>${esc(it.what)}</h4>
                <p class="tl-place">${esc(it.where)}</p>
              </div>
            </li>`,
          )
          .join('')}
      </ol>
    </article>`,
    { notes: note(formation.note, { style: 'bottom:2.6em;right:2.6em;--r:-6deg' }) },
  );
}

/* ───────────── epílogo ───────────── */

function contactText() {
  return paper(
    18,
    'right',
    `<article class="letter">
      ${rv('p', 'letter-date', `${esc(author.city)}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`)}
      ${rv('p', 'letter-salutation', 'Caro leitor,')}
      ${rv('p', 'letter-body', 'Para projetos freelance, colaborações em educação e tecnologia, ou uma boa conversa sobre código e pesquisa, escreva para:')}
      <div class="letter-email reveal" style="--i:${revealIndex++}">
        <a href="mailto:${epilogue.email}">${esc(epilogue.email)}</a>
        <button class="copy" data-copy="${epilogue.email}" type="button">copiar</button>
      </div>
      <ul class="letter-links reveal" style="--i:${revealIndex++}">
        ${epilogue.links.map(([t, h]) => `<li><a href="${h}" target="_blank" rel="noopener">${esc(t)} ${arrow}</a></li>`).join('')}
      </ul>
      ${rv('p', 'letter-note', esc(epilogue.availability))}
      <div class="letter-sign">
        <span class="sign-pre reveal" style="--i:${revealIndex++}">Com estima,</span>
        <svg class="signature" viewBox="0 0 520 96" role="img" aria-label="${esc(author.name)}">
          <text x="8" y="66">${esc(author.name)}</text>
        </svg>
      </div>
      <div class="letter-seal">${waxSeal(author.monogram)}</div>
    </article>`,
  );
}

function diaryPage() {
  const fmt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace(' de ', ' ').replace('.', '');
  return paper(
    19,
    'left',
    `<article class="diary">
      ${rv('h3', 'section-heading', esc(diary.title))}
      ${rv('p', 'diary-intro', esc(diary.intro))}
      <ol class="diary-list reveal" style="--i:${revealIndex++}" data-diary>
        ${diary.fallback
          .map(
            (c) => `<li>
              <span class="d-date">${fmt(c.date)}</span>
              <span class="d-repo">${esc(c.repo)}</span>
              <span class="d-msg">${esc(c.message)}</span>
            </li>`,
          )
          .join('')}
      </ol>
      <p class="diary-status reveal" style="--i:${revealIndex++}" data-diary-status>registro impresso</p>
    </article>`,
    { cls: 'is-diary', notes: note('ao vivo do GitHub ✦', { style: 'bottom:5.4em;right:3.2em;--r:-4deg' }) },
  );
}

function colophonPage() {
  return paper(
    20,
    'right',
    `<div class="colophon">
      ${rv('h3', 'colophon-title', 'Colofão')}
      ${medallion(author.monogram, { a: 6, b: 5, loops: 30, r: 0.55 }, 'colophon-mark')}
      ${colophon.text.map((t) => rv('p', '', esc(t))).join('')}
      ${rv('p', 'colophon-date sc', `${esc(author.city)} · ${roman(author.year)}`)}
      ${rv('p', 'fin', `${fleuron('fin-orn')}<span>Fim</span>`)}
    </div>`,
    { head: false, cls: 'is-colophon' },
  );
}

function indexPage() {
  let last = '';
  const items = index
    .map(([term, refs]) => {
      const letter = term[0].toUpperCase();
      const first = letter !== last;
      last = letter;
      return `<li${first ? ' class="ix-first"' : ''}>
        <span class="ix-term">${esc(term)}</span>
        <span class="ix-refs">${refs.map((r) => `<a href="#" data-goto="${pageOfFolio(r)}">${r}</a>`).join(', ')}</span>
      </li>`;
    })
    .join('');
  return paper(
    21,
    'left',
    `<article class="ix">
      ${rv('h3', 'section-heading', 'Índice remissivo')}
      <ul class="ix-list reveal" style="--i:${revealIndex++}">${items}</ul>
    </article>`,
    { cls: 'is-index', notes: note('clique num número!', { style: 'bottom:2.4em;right:3em;--r:-4deg' }) },
  );
}

/* ───────────── montagem ───────────── */

export function buildPages() {
  const builders = [
    cover, // 0
    () => endpaper(1, 'left'), // 1
    titlePage, // 2
    frontispiece, // 3
    contents, // 4
    () => opener({ p: 5, label: prologue.title, title: prologue.title, ep: prologue.epigraph, intro: prologue.intro }),
    prologueText, // 6
    () =>
      opener({
        p: 7,
        num: 1,
        title: arsenal.title,
        ep: arsenal.epigraph,
        intro: arsenal.intro,
        extra: `<ul class="principles reveal" style="--i:6">${arsenal.principles
          .map(([a, b]) => `<li><strong>${esc(a)}</strong> ${esc(b)}</li>`)
          .join('')}</ul>`,
        notes: note(arsenal.principlesNote, { style: 'bottom:8.6em;left:2.4em;--r:-3deg' }),
      }),
    arsenalText, // 8
    () => {
      revealIndex = 6;
      const extra = worksIndex();
      revealIndex = 0;
      return opener({ p: 9, num: 2, title: works.title, ep: works.epigraph, intro: works.intro, extra });
    },
    () => workPage(works.items[0], 0, 10, 'right'),
    () => workPage(works.items[1], 1, 11, 'left'),
    () => workPage(works.items[2], 2, 12, 'right'),
    () => workPage(works.items[3], 3, 13, 'left'),
    () => workPage(works.items[4], 4, 14, 'right'),
    () => opener({ p: 15, num: 3, title: formation.title, ep: formation.epigraph, intro: formation.intro }),
    formationText, // 16
    () => opener({ p: 17, label: epilogue.title, title: epilogue.title, ep: epilogue.epigraph, intro: epilogue.intro }),
    contactText, // 18
    diaryPage, // 19
    colophonPage, // 20
    indexPage, // 21
    () => endpaper(22, 'right'), // 22
    backCover, // 23
  ];
  return builders.map((build) => {
    revealIndex = 0;
    return build();
  });
}

export function pageLabel(p) {
  const folio = folioOf(p);
  return folio ? `${chapterOf(p)}, página ${folio}` : chapterOf(p);
}

export function pageForHash(hash) {
  const id = hash.replace('#', '');
  if (id === 'diario') return 19;
  return CHAPTERS.find((c) => c.id === id)?.page ?? null;
}

export function hashForPage(p) {
  if (p < 4 || p > 21) return '';
  let id = '';
  for (const c of CHAPTERS) if (p >= c.page) id = c.id;
  return id;
}
