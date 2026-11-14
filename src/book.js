import gsap from 'gsap';

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
      const tabHtml = tabs
        .filter((t) => t.leaf === k)
        .map((t) => `<button class="tab" type="button" data-goto="${t.page}" style="--pos:${t.pos};--tab-l:${t.color};--tab-d:${t.colorDark || t.color}" tabindex="-1" aria-label="Ir para ${t.label}"><span>${t.tab}</span></button>`)
        .join('');
      leaf.innerHTML = `<div class="face front">${pages[2 * k]}${tabHtml}</div><div class="face back">${pages[2 * k + 1]}${tabHtml}</div>`;
      frag.appendChild(leaf);
      this.leaves.push(leaf);
    }
    el.querySelector('.leaves').appendChild(frag);
    this.pageEls = [...el.querySelectorAll('.page')].sort((a, b) => a.dataset.page - b.dataset.page);
    this.shadow = el.querySelector('.book-shadow');
    this.cast = el.querySelector('.cast');
    this.edges = el.querySelector('.edges');

    this.layout();
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
    const keep = new Set([this.s - 1, this.s, ...extra]);
    this.leaves.forEach((leaf, k) => leaf.classList.toggle('is-culled', !keep.has(k)));
  }

  updateVisibility(pages = this.visiblePages()) {
    const set = new Set(pages);
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

  /* ─────────── espessura (modo 360°) ─────────── */

  setThick(on) {
    if (this.thick === on) return;
    this.thick = on;
    if (this.tl) this.tl.progress(1);
    this.d = on ? this.dThick : this.dOpen;
    this.leaves.forEach((leaf, k) => {
      gsap.to(leaf, { z: this.zFor(k, k < this.s), duration: 0.7, ease: 'power2.inOut' });
    });
    document.documentElement.classList.toggle('is-thick', on);
    this.updateBlocks();
  }

  /** espessura dos dois blocos de páginas (esquerdo e direito) */
  updateBlocks() {
    const root = document.documentElement.style;
    const t = (n) => (this.thick ? `${(Math.max(0, n) * this.d).toFixed(1)}px` : '0px');
    root.setProperty('--tl', t(this.s - 1));
    root.setProperty('--tr', t(this.N - 1 - this.s));
  }

  /* ─────────── virar com a mão (arrastar o canto) ─────────── */

  /**
   * Começa a virar a folha seguindo o ponteiro.
   * dir = 1 (canto direito → próxima) ou −1 (canto esquerdo → anterior).
   */
  dragStart(dir) {
    if (this.mode !== 'desktop' || this.reduced) return false;
    if (this.tl) this.tl.progress(1);
    const k = dir > 0 ? this.s : this.s - 1;
    if (k < 0 || k >= this.N) return false;
    const leaf = this.leaves[k];
    const t = this.s + dir;
    this.updateVisibility([...new Set([...this.visiblePages(), ...this.visiblePages(t, dir > 0 ? 'left' : 'right')])]);
    this.cull([k - 1, k, k + 1]);
    gsap.killTweensOf(leaf);
    gsap.to(leaf, { z: this.N * this.d + 6, duration: 0.25, ease: 'power1.out' });
    this.drag = { dir, k, leaf, theta: dir > 0 ? 0 : 180 };
    return true;
  }

  /** theta: ângulo da folha, 0 = deitada à direita, 180 = deitada à esquerda */
  dragMove(theta) {
    const g = this.drag;
    if (!g) return;
    g.theta = Math.max(0, Math.min(180, theta));
    gsap.set(g.leaf, { rotationY: -g.theta });
    g.leaf.style.setProperty('--lift', Math.sin((g.theta / 180) * Math.PI).toFixed(3));
    this.castShadow(g.theta);
  }

  /** solta: completa a virada se passou da metade (ou se foi um gesto rápido) */
  dragEnd(velocity = 0) {
    const g = this.drag;
    if (!g) return Promise.resolve();
    this.drag = null;
    const projected = g.theta + Math.max(-40, Math.min(40, velocity * 5));
    const commit = g.dir > 0 ? projected > 90 : projected < 90;
    const flipped = g.dir > 0 ? commit : !commit;
    const target = flipped ? 180 : 0;
    const D = 0.25 + (Math.abs(target - g.theta) / 180) * 0.55;
    if (commit) {
      const from = this.s;
      this.s += g.dir;
      this.side = g.dir > 0 ? 'left' : 'right';
      this.onChange?.(this);
      this.onFlip?.(1, g.dir);
      if (this.s === 0 || from === 0 || this.s === this.N || from === this.N) {
        gsap.to(this.el, { x: this.xFor(), duration: D + 0.2, ease: 'power2.out' });
        gsap.to(this.shadow, { ...this.shadowFor(this.s), duration: D + 0.2, ease: 'power2.out' });
      }
    }
    return new Promise((resolve) => {
      const state = { theta: g.theta };
      gsap.to(state, {
        theta: target,
        duration: D,
        ease: 'power2.out',
        onUpdate: () => {
          gsap.set(g.leaf, { rotationY: -state.theta });
          g.leaf.style.setProperty('--lift', Math.sin((state.theta / 180) * Math.PI).toFixed(3));
          this.castShadow(state.theta);
        },
        onComplete: () => {
          this.castShadow(null);
          g.leaf.style.setProperty('--lift', 0);
          gsap.to(g.leaf, { z: this.zFor(g.k, flipped), duration: 0.2, ease: 'power1.in' });
          this.updateVisibility();
          resolve();
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
    // Revela os destinos já no início, para a página surgir enquanto vira
    this.updateVisibility([...new Set([...this.visiblePages(), ...dest])]);
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
            },
            onComplete: j === moving.length - 1 ? () => this.castShadow(null) : undefined,
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
