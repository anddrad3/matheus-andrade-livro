/**
 * "Escrito à mão": prepara uma página para ser escrita diante do leitor.
 * Cada palavra vira um <ink-w class="w"> com seu número na ordem de leitura;
 * o CSS faz a tinta aparecer palavra a palavra quando a página fica visível.
 * O ritmo se ajusta ao tamanho do texto (≈1,5 s no total), e nada bloqueia a
 * interação — links funcionam desde o primeiro instante.
 * Feito uma vez por página, na primeira vez que ela aparece.
 */
const SKIP = 'svg, script, style, .sr-only, .note, .signature, .dropcap, .folio, .running-head, .w, [data-diary], .copy';

export function inkify(page) {
  if (!page || page.dataset.ink) return;
  page.dataset.ink = '1';
  const body = page.querySelector('.page-body');
  if (!body) return;
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (!n.nodeValue.trim() || n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let i = 0;
  const words = [];
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of node.nodeValue.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      // tag própria: nenhum seletor antigo do tipo ".x span" a alcança
      const s = document.createElement('ink-w');
      s.className = 'w';
      s.textContent = part;
      words.push(s);
      frag.appendChild(s);
      i++;
    }
    // dentro de flex/grid cada filho vira item com "gap": agrupa as palavras num único elemento
    const disp = getComputedStyle(node.parentElement).display;
    if (/flex|grid/.test(disp)) {
      const g = document.createElement('ink-g');
      g.appendChild(frag);
      node.replaceWith(g);
    } else node.replaceWith(frag);
  }
  const step = Math.max(6, Math.min(26, 1700 / Math.max(1, i)));
  words.forEach((s, n) => s.style.setProperty('--w', `${Math.round(n * step)}ms`));
  page.classList.add('is-inked');
}
