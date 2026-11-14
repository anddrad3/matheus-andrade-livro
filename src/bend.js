/**
 * Folha maleável: enquanto vira, a folha rígida dá lugar a uma tira de N faixas
 * encadeadas (cada uma filha da anterior e girada um pouco mais), formando uma
 * curva como a de papel de verdade. O eixo das dobras inclina conforme o ponto
 * de onde a página foi levantada — por baixo ou por cima —, então o canto puxado
 * vai à frente, como no livro real.
 *
 * Cada faixa mostra a sua fatia da frente e do verso (clones das páginas),
 * existe só durante a virada e é removida em seguida.
 */
export class Bend {
  /**
   * @param {HTMLElement} leaf folha que vai virar
   * @param {{ dir: 1|-1, tilt?: number, pw: number, strips?: number }} o
   *   dir 1 = avançando (direita → esquerda); tilt ∈ [−1, 1]: −1 levantada por cima, 1 por baixo
   */
  constructor(leaf, { dir, tilt = 0.45, pw, strips = 8 }) {
    this.leaf = leaf;
    this.dir = dir;
    this.n = strips;
    this.tilt = Math.max(-1, Math.min(1, tilt));
    const front = leaf.querySelector('.face.front > .page');
    const back = leaf.querySelector('.face.back > .page');
    const W = pw;
    const w = W / strips;

    // pesos crescentes: perto da lombada o papel quase não curva, na borda curva mais
    const raw = Array.from({ length: strips }, (_, i) => (i === 0 ? 0 : Math.pow(i / (strips - 1), 1.4)));
    const sum = raw.reduce((a, b) => a + b, 0);
    this.weights = raw.map((x) => x / sum);

    const root = document.createElement('div');
    root.className = 'bend';
    let parent = root;
    this.strips = [];
    for (let i = 0; i < strips; i++) {
      const s = document.createElement('div');
      s.className = 'bstrip';
      s.style.width = `${w + (i < strips - 1 ? 0.6 : 0)}px`; // sobreposição mínima: sem fresta entre faixas
      s.style.left = i === 0 ? '0px' : `${w}px`;
      const f = document.createElement('div');
      f.className = 'bface bfront';
      const fc = front.cloneNode(true);
      fc.style.cssText += `;left:${-i * w}px;width:${W}px;right:auto`;
      f.appendChild(fc);
      f.appendChild(Object.assign(document.createElement('i'), { className: 'bshade' }));
      const b = document.createElement('div');
      b.className = 'bface bback';
      const bc = back.cloneNode(true);
      bc.style.cssText += `;left:${-(W - (i + 1) * w)}px;width:${W}px;right:auto`;
      b.appendChild(bc);
      b.appendChild(Object.assign(document.createElement('i'), { className: 'bshade' }));
      s.append(f, b);
      parent.appendChild(s);
      parent = s;
      this.strips.push(s);
    }
    // clones não devem receber foco nem ser lidos
    root.setAttribute('aria-hidden', 'true');
    root.inert = true;
    leaf.appendChild(root);
    leaf.classList.add('is-bending');
    this.root = root;
    this.set(0);
  }

  /** p ∈ [0, 1]: progresso da virada. A curva nasce, atinge o máximo no meio e se desfaz. */
  set(p) {
    const k = Math.sin(Math.max(0, Math.min(1, p)) * Math.PI);
    const total = 62 * k * -this.dir; // graus somados ao longo da folha (borda vai à frente)
    // canto levantado: cisalhamento progressivo (skewY preserva a borda presa à faixa anterior)
    const skewTotal = 9 * this.tilt * k * this.dir;
    let acc = 0;
    for (let i = 0; i < this.n; i++) {
      const deg = total * this.weights[i];
      const sk = skewTotal * this.weights[i];
      acc += Math.abs(deg);
      const s = this.strips[i];
      s.style.transform = i === 0 ? '' : `rotateY(${deg.toFixed(2)}deg) skewY(${sk.toFixed(2)}deg)`;
      s.style.setProperty('--sh', (Math.min(1, acc / 70) * 0.5).toFixed(3));
    }
  }

  destroy() {
    this.root.remove();
    this.leaf.classList.remove('is-bending');
  }
}
