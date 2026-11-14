import gsap from 'gsap';
import { Bend } from './bend.js';
import { inkify } from './ink.js';

/**
 * Motor do livro.
 *
 *  - N folhas, cada uma com frente (página par, à direita) e verso (página ímpar, à esquerda).
 *  - Espelho `s` = quantas folhas já foram viradas. Mostra páginas 2s−1 | 2s.
 *  - Desktop: o espelho inteiro fica visível.
 *  - Mobile: uma página por vez; o livro desliza para mostrar o lado ativo.
 */
export class Book {
  constructor({ el, pages, tabs = [], onChange, onFlip, reduced }) {
    this.el = el;
    this.onChange = onChange;
    this.onFlip = onFlip;
    this.reduced = reduced;
    this.N = pages.length / 2;
    this.s = 0;
    this.side = 'right';
    this.d = 2.4; // espaçamento em Z entre folhas (livro fechado = espesso)
    this.dOpen = 0.35;
    this.dThick = 3.2; // no modo 360° o miolo ganha corpo
    this.thick = false;
    this.tl = null;

    // Constrói as folhas
    const frag = document.createDocumentFragment();
    this.leaves = [];
    for (let k = 0; k < this.N; k++) {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      if (k === 0 || k === this.N - 1) leaf.classList.add('is-board');
      leaf.dataset.leaf = k;
      if (k > 0) leaf.classList.add('is-culled'); // fora de vista desde o início: o navegador pula o conteúdo
      const tabHtml = tabs
        .filter((t) => t.leaf === k)
        .map((t) => `<button class="tab" type="button" data-goto="${t.page}" style="--pos:${t.pos};--tab-l:${t.color};--tab-d:${t.colorDark || t.color}" tabindex="-1" aria-label="Ir para ${t.label}"><span>${t.tab}</span></button>`)
        .join('');
      leaf.innerHTML = `<div class="face front">${pages[2 * k]}${tabHtml}</div><div class="face back">${pages[2 * k + 1]}${tabHtml}</div>`;
      frag.appendChild(leaf);
      this.leaves.push(leaf);
    }
    // medidas (variáveis CSS) antes de inserir as folhas: um único cálculo de estilo
    this.layout();
    el.querySelector('.leaves').appendChild(frag);
    this.pageEls = [...el.querySelectorAll('.page')].sort((a, b) => a.dataset.page - b.dataset.page);
    this.shadow = el.querySelector('.book-shadow');
    this.cast = el.querySelector('.cast');
    this.edges = el.querySelector('.edges');
    this.blocks = el.querySelector('.blocks');
    this.applyStatic();
  }

  /* ─────────── dimensões ─────────── */

  layout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const desktop = vw >= 820 && vw / vh > 1.05;
    this.mode = desktop ? 'desktop' : 'mobile';
    let pw;
    let ph;
    if (desktop) {
      const aspect = 0.7;
      pw = Math.min((vw * 0.84) / 2, vh * 0.76 * aspect);
      ph = pw / aspect;
    } else {
      const aspect = 0.62;
      pw = Math.min(vw * 0.88, vh * 0.76 * aspect);
      ph = pw / aspect;
    }
    this.pw = Math.round(pw);
    this.ph = Math.round(ph);
    const root = document.documentElement.style;
    root.setProperty('--pw', `${this.pw}px`);
    root.setProperty('--ph', `${this.ph}px`);
    root.setProperty('--fs', `${(this.pw / (desktop ? 30 : 27.5)).toFixed(3)}px`);
    root.setProperty('--T', `${((this.N - 1) * 2.4).toFixed(1)}px`);
    document.documentElement.dataset.mode = this.mode;
    // No mobile, nunca fique num lado que não existe
    if (this.s === 0) this.side = 'right';
    if (this.s === this.N) this.side = 'left';
  }

  relayout() {
    if (this.tl) this.tl.progress(1);
    const prevMode = this.mode;
    this.layout();
    if (prevMode !== this.mode && this.mode === 'mobile' && this.s > 0 && this.s < this.N) this.side = 'right';
    this.applyStatic();
  }

  /* ─────────── geometria ─────────── */

  zFor(k, flipped, d = this.d) {
    return flipped ? k * d : (this.N - 1 - k) * d;
  }

  xFor(s = this.s, side = this.side) {
    const half = this.pw / 2;
    if (s === 0) return -half;
    if (s === this.N) return half;
    if (this.mode === 'desktop') return 0;
    return side === 'left' ? half : -half;
  }

  shadowFor(s) {
    if (s === 0) return { scaleX: 0.5, xPercent: 25 };
    if (s === this.N) return { scaleX: 0.5, xPercent: -25 };
    return { scaleX: 1, xPercent: 0 };
  }

  applyStatic() {
    this.leaves.forEach((leaf, k) => {
      const flipped = k < this.s;
      gsap.set(leaf, { rotationY: flipped ? -180 : 0, z: this.zFor(k, flipped), transformOrigin: '0% 50%' });
      leaf.style.setProperty('--lift', 0);
    });
    gsap.set(this.el, { x: this.xFor() });
    gsap.set(this.shadow, this.shadowFor(this.s));
    this.updateVisibility();
  }

  /* ─────────── estado ─────────── */

  get page() {
    if (this.s === 0) return 0;
    if (this.s === this.N) return 2 * this.N - 1;
    if (this.mode === 'desktop') return 2 * this.s;
    return this.side === 'left' ? 2 * this.s - 1 : 2 * this.s;
  }

  visiblePages(s = this.s, side = this.side) {
    if (s === 0) return [0];
    if (s === this.N) return [2 * this.N - 1];
    if (this.mode === 'desktop') return [2 * s - 1, 2 * s];
    return [side === 'left' ? 2 * s - 1 : 2 * s];
  }

  /**
   * Só as folhas à vista (as duas do espelho) e as que estão em movimento
   * são desenhadas; as outras ficam ocultas — exceto as abas, que aparecem
   * na lateral do miolo.
   */
  cull(extra = []) {
    // folhas com páginas à vista nunca são puladas (senão a revelação não anima)
    const shown = this.pageEls.filter((el) => el.classList.contains('is-visible')).map((el) => Math.floor(el.dataset.page / 2));
    const keep = new Set([this.s - 1, this.s, ...shown, ...extra]);
    this.leaves.forEach((leaf, k) => leaf.classList.toggle('is-culled', !keep.has(k)));
  }

  updateVisibility(pages = this.visiblePages()) {
    const set = new Set(pages);
    // páginas que vão aparecer agora: tira do modo "pulado", prepara a escrita
    // e calcula o estado inicial ANTES de marcar como visível — assim a
    // transição de escrita/desenho acontece de verdade
    const incoming = pages.map((p) => this.pageEls[p]).filter((el) => el && !el.classList.contains('is-visible'));
    if (incoming.length) {
      const lead = this.inkLead;
      incoming.forEach((el) => {
        this.leaves[Math.floor(el.dataset.page / 2)].classList.remove('is-culled');
        if (!this.reduced) inkify(el);
        // a escrita começa quando a página fica de fato à mostra
        const side = el.classList.contains('left') ? 'left' : 'right';
        el.style.setProperty('--ink0', `${lead ? lead[side] : 160}ms`);
      });
      void this.el.offsetWidth;
    }
    this.pageEls.forEach((el, p) => {
      const on = set.has(p);
      el.classList.toggle('is-visible', on);
      el.inert = !on;
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    this.cull();
    this.updateBlocks();
  }

  /**
   * Sombra que a folha em movimento projeta sobre a página de baixo.
   * `deg` = ângulo da folha (0 = deitada à direita, 180 = deitada à esquerda).
   */
  castShadow(deg) {
    if (!this.cast) return;
    if (deg == null) {
      this.cast.style.opacity = 0;
      return;
    }
    const rad = (deg * Math.PI) / 180;
    const right = deg < 90;
    // borda projetada da folha, em % de meia-página medida a partir da lombada
    const edge = Math.abs(Math.cos(rad)) * 100;
    const strength = Math.sin(rad);
    this.cast.style.opacity = 1;
    this.cast.style.setProperty('--edge', `${edge.toFixed(2)}%`);
    this.cast.style.setProperty('--k', (strength * 0.55).toFixed(3));
    this.cast.dataset.side = right ? 'right' : 'left';
  }

  /* ─────────── folha maleável ─────────── */

  /** cria a curva de papel para a folha k (capas são rígidas e não curvam) */
  makeBend(leaf, dir, tilt) {
    if (this.reduced || leaf.classList.contains('is-board')) return null;
    try {
      return new Bend(leaf, { dir, tilt, pw: this.pw, strips: this.mode === 'mobile' || (navigator.hardwareConcurrency || 8) <= 4 ? 4 : 7 });
    } catch {
      return null;
    }
  }

  /* ─────────── espessura (modo 360°) ─────────── */

  setThick(on) {
    if (this.thick === on) return;
    this.thick = on;
    if (this.tl) this.tl.progress(1);
    this.d = on ? this.dThick : this.dOpen;
    this.leaves.forEach((leaf, k) => {
      gsap.to(leaf, { z: this.zFor(k, k < this.s), duration: 0.7, ease: 'power2.inOut' });
    });
    this.el.classList.toggle('is-thick', on);
    this.updateBlocks();
  }

  /** espessura dos dois blocos de páginas (esquerdo e direito) */
  updateBlocks() {
    if (!this.blocks) return;
    // no próprio bloco (e não no :root): a transição não recalcula a página inteira
    const st = this.blocks.style;
    const t = (n) => (this.thick ? `${(Math.max(0, n) * this.d).toFixed(1)}px` : '0px');
    st.setProperty('--tl', t(this.s - 1));
    st.setProperty('--tr', t(this.N - 1 - this.s));
    this.blocks.classList.toggle('is-closed', this.s === 0 || this.s === this.N);
  }

  /* ─────────── virar com a mão (estilo iPad) ─────────── */

  /**
   * Plano do gesto: qual folha gira (ou nenhuma, só deslizar no celular),
   * de que ângulo a que ângulo e qual espelho/lado é o destino.
   * dir = 1 → avançar; −1 → voltar.
   */
  planFor(dir) {
    const { s, N } = this;
    if (this.mode === 'desktop' || s === 0 || s === N) {
      if (dir > 0) return s >= N ? null : { dir, k: s, th0: 0, th1: 180, t: s + 1, side: 'left' };
      return s <= 0 ? null : { dir, k: s - 1, th0: 180, th1: 0, t: s - 1, side: 'right' };
    }
    // celular, no meio do livro: lado esquerdo ↔ direito do mesmo espelho é só deslizar
    if (dir > 0) return this.side === 'left' ? { dir, k: null, t: s, side: 'right' } : { dir, k: s, th0: 0, th1: 180, t: s + 1, side: 'left' };
    return this.side === 'right' ? { dir, k: null, t: s, side: 'left' } : { dir, k: s - 1, th0: 180, th1: 0, t: s - 1, side: 'right' };
  }

  dragStart(dir, tilt = 0.45) {
    if (this.reduced || this.drag) return null;
    if (this.tl) this.tl.progress(1);
    const g = this.planFor(dir);
    if (!g) return null;
    if (g.t === this.N) g.side = 'left';
    if (g.t === 0) g.side = 'right';
    this.inkLead = null;
    this.updateVisibility([...new Set([...this.visiblePages(), ...this.visiblePages(g.t, g.side)])]);
    if (g.k != null) {
      g.leaf = this.leaves[g.k];
      g.bend = this.makeBend(g.leaf, dir, tilt);
      this.cull([g.k - 1, g.k, g.k + 1, this.s - 1, this.s]);
      gsap.killTweensOf(g.leaf);
      gsap.to(g.leaf, { z: this.N * this.d + 6, duration: 0.25, ease: 'power1.out' });
    }
    gsap.killTweensOf(this.el);
    g.x0 = gsap.getProperty(this.el, 'x');
    g.x1 = this.xFor(g.t, g.side);
    g.p = 0;
    this.drag = g;
    return g;
  }

  /** p ∈ [0, 1]: quanto do gesto já foi feito */
  dragMove(p) {
    const g = this.drag;
    if (!g) return;
    g.p = Math.max(0, Math.min(1, p));
    this.applyDrag(g, g.p);
  }

  applyDrag(g, p) {
    if (g.leaf) {
      const theta = g.th0 + (g.th1 - g.th0) * p;
      gsap.set(g.leaf, { rotationY: -theta });
      g.leaf.style.setProperty('--lift', Math.sin((theta / 180) * Math.PI).toFixed(3));
      this.castShadow(theta);
      g.bend?.set(p);
    }
    gsap.set(this.el, { x: g.x0 + (g.x1 - g.x0) * p });
  }

  /** ângulo da folha (0 = deitada à direita) → progresso do gesto */
  progressFromTheta(theta) {
    const g = this.drag;
    if (!g || !g.leaf) return 0;
    return (theta - g.th0) / (g.th1 - g.th0);
  }

  /** solta: completa se passou da metade (ou se foi um gesto rápido); v = progresso por quadro */
  dragEnd(v = 0) {
    const g = this.drag;
    if (!g) return Promise.resolve();
    const commit = g.p + Math.max(-0.35, Math.min(0.35, v * 6)) > (g.commitAt ?? 0.5);
    const target = commit ? 1 : 0;
    const D = 0.22 + Math.abs(target - g.p) * (g.leaf ? 0.6 : 0.4);
    if (commit) {
      this.s = g.t;
      this.side = g.side;
      this.onChange?.(this);
      if (g.leaf) this.onFlip?.(1, g.dir);
      gsap.to(this.shadow, { ...this.shadowFor(this.s), duration: D + 0.2, ease: 'power2.out' });
    }
    return new Promise((resolve) => {
      const st = { p: g.p };
      gsap.to(st, {
        p: target,
        duration: D,
        ease: 'power2.out',
        onUpdate: () => this.applyDrag(g, st.p),
        onComplete: () => {
          this.drag = null;
          g.bend?.destroy();
          if (g.leaf) {
            this.castShadow(null);
            g.leaf.style.setProperty('--lift', 0);
            const flipped = g.k < this.s;
            gsap.to(g.leaf, { z: this.zFor(g.k, flipped), duration: 0.2, ease: 'power1.in' });
          }
          this.updateVisibility();
          resolve(commit);
        },
      });
    });
  }

  /* ─────────── navegação ─────────── */

  canNext() {
    if (this.s >= this.N) return false;
    return true;
  }

  canPrev() {
    return this.s > 0;
  }

  next() {
    if (this.mode === 'desktop' || this.s === 0) return this.goTo(this.s + 1, 'left');
    if (this.side === 'left' && this.s < this.N) return this.goTo(this.s, 'right');
    if (this.s < this.N) return this.goTo(this.s + 1, 'left');
  }

  prev() {
    if (this.s === 0) return;
    if (this.mode === 'desktop' || this.s === this.N) return this.goTo(this.s - 1, 'right');
    if (this.side === 'right' && this.s > 0) return this.goTo(this.s, 'left');
    return this.goTo(this.s - 1, 'right');
  }

  goToPage(p) {
    const s = p % 2 === 0 ? p / 2 : (p + 1) / 2;
    const side = p % 2 === 0 ? 'right' : 'left';
    return this.goTo(s, side);
  }

  goTo(t, side = this.side) {
    if (this.drag) return Promise.resolve();
    t = Math.max(0, Math.min(this.N, t));
    if (t === 0) side = 'right';
    if (t === this.N) side = 'left';
    if (this.tl) this.tl.progress(1);
    if (t === this.s && side === this.side) return Promise.resolve();

    const from = this.s;
    const count = Math.abs(t - from);
    const dest = this.visiblePages(t, side);
    // atraso da escrita: direita aparece quando a folha a descobre; esquerda quando a folha assenta
    const nFlip = Math.abs(t - this.s);
    const span = nFlip <= 1 ? 1150 : (nFlip - 1) * Math.min(110, 600 / nFlip) + Math.max(550, 850 - nFlip * 30);
    this.inkLead = nFlip ? { right: Math.round(span * 0.45), left: Math.round(span * 0.85) } : null;
    // Revela os destinos já no início, para a página surgir enquanto vira
    this.updateVisibility([...new Set([...this.visiblePages(), ...dest])]);
    this.inkLead = null;
    const lo = Math.min(from, t) - 1;
    const hi = Math.max(from, t);
    const range = [];
    for (let k = lo; k <= hi; k++) range.push(k);

    this.s = t;
    this.side = side;
    this.onChange?.(this);
    if (count) this.onFlip?.(count, t > from ? 1 : -1);
    this.cull(range);

    if (this.reduced) {
      this.applyStatic();
      return Promise.resolve();
    }

    const single = count <= 1;
    const tilt = this.nextTilt ?? 0.45;
    this.nextTilt = null;
    const D = single ? 1.15 : Math.max(0.55, 0.85 - count * 0.03);
    const stagger = single ? 0 : Math.min(0.11, 0.6 / count);
    const ease = single ? 'power2.inOut' : 'power1.inOut';
    const zTop = this.N * this.d + 6;

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          this.tl = null;
          this.updateVisibility();
          resolve();
        },
      });
      this.tl = tl;

      const moving = [];
      if (t > from) for (let k = from; k < t; k++) moving.push({ k, flip: true });
      else for (let k = from - 1; k >= t; k--) moving.push({ k, flip: false });

      moving.forEach(({ k, flip }, j) => {
        const leaf = this.leaves[k];
        const at = j * stagger;
        const rot = flip ? -180 : 0;
        const bend = single ? this.makeBend(leaf, flip ? 1 : -1, tilt) : null;
        tl.to(
          leaf,
          {
            rotationY: rot,
            duration: D,
            ease,
            onUpdate: () => {
              const r = gsap.getProperty(leaf, 'rotationY');
              leaf.style.setProperty('--lift', Math.sin((-r / 180) * Math.PI).toFixed(3));
              if (j === 0) this.castShadow(-r);
              bend?.set(flip ? -r / 180 : 1 + r / 180);
            },
            onComplete: () => {
              bend?.destroy();
              if (j === moving.length - 1) this.castShadow(null);
            },
          },
          at,
        );
        tl.to(leaf, { z: zTop + j * 0.4, duration: D * 0.45, ease: 'power1.out' }, at);
        tl.to(leaf, { z: this.zFor(k, flip), duration: D * 0.55, ease: 'power1.in' }, at + D * 0.45);
      });

      const total = (moving.length ? (moving.length - 1) * stagger + D : 0.8);
      tl.to(this.el, { x: this.xFor(t, side), duration: moving.length ? total : 0.8, ease: 'power3.inOut' }, 0);
      tl.to(this.shadow, { ...this.shadowFor(t), duration: Math.max(total, 0.8), ease: 'power3.inOut' }, 0);
    });
  }
}
