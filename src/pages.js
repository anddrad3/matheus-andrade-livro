import { author, prologue, arsenal, works, journey, epilogue, colophon } from './content.js';
import { guilloche, medallion, corner, rule, fleuron, waxSeal, barcode, arrow, roman } from './ornaments.js';

/**
 * Mapa do livro — 10 folhas, 20 faces.
 * Folha k: frente = página 2k (direita), verso = página 2k+1 (esquerda).
 * Espelho s mostra as páginas 2s−1 (esquerda) e 2s (direita).
 */

const FOLIO = { 2: 'i', 3: 'ii', 4: 'iii' };
for (let p = 5; p <= 17; p++) FOLIO[p] = String(p - 4);

export const CHAPTERS = [
  { id: 'sumario', label: 'Sumário', page: 4 },
  { id: 'prologo', label: prologue.title, sub: prologue.heading, page: 5, num: '' },
  { id: 'arsenal', label: arsenal.title, sub: arsenal.heading, page: 7, num: 1 },
  { id: 'obras', label: works.title, sub: works.heading, page: 9, num: 2 },
  { id: 'jornada', label: journey.title, sub: journey.heading, page: 13, num: 3 },
  { id: 'epilogo', label: epilogue.title, sub: epilogue.heading, page: 15, num: '' },
  { id: 'colofao', label: 'Colofão', page: 17 },
];

export function chapterOf(p) {
  if (p <= 0) return 'Capa';
  if (p === 1 || p === 18) return 'Guarda';
  if (p === 2) return 'Folha de rosto';
  if (p === 3) return 'Frontispício';
  if (p >= 19) return 'Contracapa';
  let ch = CHAPTERS[0];
  for (const c of CHAPTERS) if (p >= c.page) ch = c;
  return ch.label;
}

export const folioOf = (p) => FOLIO[p] ?? '';

/* ───────────── helpers ───────────── */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
let revealIndex = 0;
const rv = (tag, cls, inner, attrs = '') =>
  `<${tag} class="reveal ${cls}" style="--i:${revealIndex++}" ${attrs}>${inner}</${tag}>`;

function paper(p, side, inner, { head = true, cls = '' } = {}) {
  const running = side === 'left' ? author.name : chapterOf(p);
  return `<div class="page paper ${side} ${cls}" data-page="${p}">
    <div class="paper-shade"></div>
    ${head ? `<header class="running-head"><span>${esc(running)}</span></header>` : ''}
    <div class="page-body">${inner}</div>
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

function opener({ p, label, num, title, ep, intro, extra = '' }) {
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
    { cls: 'is-opener' },
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
        </div>` : ''}
    </div>
  </div>`;
}

function backCover() {
  return `<div class="page board cover back-cover" data-page="19">
    <div class="leather"></div>
    <div class="cover-frame">
      ${corner('c-tl')}${corner('c-tr')}${corner('c-bl')}${corner('c-br')}
    </div>
    <div class="back-content">
      ${fleuron('foil-stroke back-fleuron')}
      <p class="back-blurb foil">“${esc(prologue.quote)}”</p>
      ${rule('foil-stroke back-rule')}
      <p class="back-author foil">${esc(author.name)}</p>
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
      ${rv('p', 'tp-author', esc(author.name))}
      ${rule('tp-rule reveal-rule')}
      ${rv('h1', 'tp-title', `<em>${esc(author.role.split(' ')[0])}</em><span>${esc(author.role.split(' ').slice(1).join(' '))}</span>`)}
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
      const num = c.num ? roman(c.num) : '';
      return `<li class="reveal" style="--i:${i + 2}">
        <a href="#${c.id}" data-goto="${c.page}">
          <span class="toc-num">${num || (c.id === 'colofao' ? '' : '§')}</span>
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
  revealIndex = 0;
  return paper(
    4,
    'right',
    `<nav class="toc" aria-label="Sumário">
      <h2 class="toc-heading reveal" style="--i:0">Sumário</h2>
      ${rule('toc-rule reveal-rule')}
      <ol>${items}</ol>
      <p class="toc-hint reveal" style="--i:9">Escolha um capítulo — ou vire a página.</p>
    </nav>`,
    { cls: 'is-toc' },
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
        ${prologue.facts.map(([k, v]) => `<div class="catalog-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    </article>`,
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
            <ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
          </section>`,
        )
        .join('')}
      ${fleuron('index-fleuron')}
    </article>`,
  );
}

/* ───────────── obras ───────────── */

function workPage(item, i, p, side) {
  return paper(
    p,
    side,
    `<article class="work">
      ${rv('p', 'work-meta', `<span>Obra ${roman(i + 1)}</span><span>${esc(item.year)}</span>`)}
      <figure class="plate reveal" style="--i:${revealIndex++}">
        <div class="plate-inner">${guilloche(item.seed, { cls: 'plate-rose' })}<span class="plate-letter">${esc(item.title[0])}</span></div>
        <figcaption>Prancha ${roman(i + 1)} — <em>${esc(item.title)}</em></figcaption>
      </figure>
      ${rv('h3', 'work-title', esc(item.title))}
      ${rv('p', 'work-kicker', esc(item.kicker))}
      ${rv('p', 'work-desc', esc(item.description))}
      <dl class="work-facts reveal" style="--i:${revealIndex++}">
        <div><dt>Papel</dt><dd>${esc(item.role)}</dd></div>
        <div><dt>Técnica</dt><dd>${item.stack.map(esc).join(' · ')}</dd></div>
      </dl>
      ${rv('a', 'work-link', `Visitar a obra ${arrow}`, `href="${item.link}" target="_blank" rel="noopener"`)}
    </article>`,
    { cls: 'is-work' },
  );
}

const worksIndex = () => `
  <ol class="mini-toc reveal" style="--i:${revealIndex++}">
    ${works.items
      .map(
        (w, i) => `<li><a href="#obras" data-goto="${10 + i}"><span class="toc-num">${roman(i + 1)}</span><span class="toc-title">${esc(w.title)}</span><span class="toc-leader"></span><span class="toc-page">${folioOf(10 + i)}</span></a></li>`,
      )
      .join('')}
  </ol>
  <div class="minor reveal" style="--i:${revealIndex++}">
    <p class="minor-title">Obras menores</p>
    <ul>${works.minor.map(([t, h]) => `<li><a href="${h}" target="_blank" rel="noopener">${esc(t)} ${arrow}</a></li>`).join('')}</ul>
  </div>`;

/* ───────────── jornada ───────────── */

function journeyText() {
  return paper(
    14,
    'right',
    `<article class="timeline">
      ${rv('h3', 'section-heading', esc(journey.heading))}
      <ol>
        ${journey.items
          .map(
            (it) => `<li class="reveal" style="--i:${revealIndex++}">
              <span class="tl-period">${esc(it.period)}</span>
              <span class="tl-node" aria-hidden="true"></span>
              <div class="tl-body">
                <h4>${esc(it.role)}</h4>
                <p class="tl-place">${esc(it.place)}</p>
                <p>${esc(it.text)}</p>
              </div>
            </li>`,
          )
          .join('')}
      </ol>
    </article>`,
  );
}

/* ───────────── epílogo ───────────── */

function contactText() {
  return paper(
    16,
    'right',
    `<article class="letter">
      ${rv('p', 'letter-date', `${esc(author.city)}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`)}
      ${rv('p', 'letter-salutation', 'Caro leitor,')}
      ${rv('p', 'letter-body', 'Para encomendas, colaborações ou uma boa conversa sobre tipografia e código, escreva para:')}
      <div class="letter-email reveal" style="--i:${revealIndex++}">
        <a href="mailto:${epilogue.email}">${esc(epilogue.email)}</a>
        <button class="copy" data-copy="${epilogue.email}" type="button">copiar</button>
      </div>
      <ul class="letter-links reveal" style="--i:${revealIndex++}">
        ${epilogue.links.map(([t, h]) => `<li><a href="${h}" target="_blank" rel="noopener">${esc(t)} ${arrow}</a></li>`).join('')}
      </ul>
      ${rv('p', 'letter-note', esc(epilogue.availability))}
      <div class="letter-sign reveal" style="--i:${revealIndex++}">
        <span class="sign-pre">Com estima,</span>
        <span class="signature">${esc(author.name)}</span>
      </div>
      <div class="letter-seal">${waxSeal(author.monogram)}</div>
    </article>`,
  );
}

function colophonPage() {
  return paper(
    17,
    'left',
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
    () => opener({ p: 13, num: 3, title: journey.title, ep: journey.epigraph, intro: journey.intro }),
    journeyText, // 14
    () => opener({ p: 15, label: epilogue.title, title: epilogue.title, ep: epilogue.epigraph, intro: epilogue.intro }),
    contactText, // 16
    colophonPage, // 17
    () => endpaper(18, 'right'), // 18
    backCover, // 19
  ];
  return builders.map((build) => {
    revealIndex = 0;
    return build();
  });
}

/** Rótulos acessíveis de cada página */
export function pageLabel(p) {
  const folio = folioOf(p);
  return folio ? `${chapterOf(p)}, página ${folio}` : chapterOf(p);
}

/** Hash → página */
export function pageForHash(hash) {
  const id = hash.replace('#', '');
  return CHAPTERS.find((c) => c.id === id)?.page ?? null;
}

/** Página → hash do capítulo */
export function hashForPage(p) {
  let id = '';
  for (const c of CHAPTERS) if (p >= c.page) id = c.id;
  if (p < 4 || p > 17) id = '';
  return id;
}
