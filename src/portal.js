import gsap from 'gsap';

/**
 * "Visitar a obra": a câmera mergulha na prancha do site até ela ocupar a tela,
 * e então o site real abre na mesma aba.
 *
 *  1. pré-conecta e pré-busca o destino assim que o gesto começa;
 *  2. a imagem da prancha "descola" da página (FLIP): um clone fixo nasce
 *     exatamente sobre ela e cresce até cobrir a viewport, mantendo o
 *     enquadramento (background cover + mesma object-position);
 *  3. ao mesmo tempo o livro avança em direção à imagem (zoom de câmera)
 *     e um véu escurece o resto da cena;
 *  4. com a imagem em tela cheia, navega. O clone continua visível até o
 *     navegador trocar de página — sem flash branco do nosso lado.
 *  Voltar pelo histórico (bfcache) desfaz tudo; recarregar volta direto à obra.
 */
export function createPortal({ rig, reduced, beforeLeave, onReturn }) {
  const root = document.createElement('div');
  root.id = 'portal';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="portal-veil"></div><div class="portal-img"><div class="portal-inner"></div></div><p class="portal-label"><span></span><i></i><i></i><i></i></p>';
  document.body.appendChild(root);
  const veil = root.querySelector('.portal-veil');
  const img = root.querySelector('.portal-img');
  const inner = root.querySelector('.portal-inner');
  const label = root.querySelector('.portal-label');
  let busy = false;
  let hidden = null;
  let tl = null; // animação em curso (ida ou volta)
  let offering = false; // bloqueador de pop-ups: esperando o clique no link

  function warm(url) {
    try {
      const { origin } = new URL(url, location.href);
      if (!document.querySelector(`link[data-warm="${origin}"]`)) {
        const pc = Object.assign(document.createElement('link'), { rel: 'preconnect', href: origin });
        pc.dataset.warm = origin;
        document.head.appendChild(pc);
      }
      if (!document.querySelector(`link[data-prefetch="${url}"]`)) {
        const pf = Object.assign(document.createElement('link'), { rel: 'prefetch', href: url, as: 'document' });
        pf.dataset.prefetch = url;
        document.head.appendChild(pf);
      }
    } catch {}
  }

  function reset() {
    busy = false;
    offering = false;
    tl?.kill();
    tl = null;
    gsap.killTweensOf([img, veil, label, rig]);
    root.classList.remove('is-on');
    gsap.set(rig, { clearProps: 'scale,transformOrigin' });
    if (hidden) hidden.style.visibility = '';
    label.innerHTML = '<span></span><i></i><i></i><i></i>';
    label.style.pointerEvents = '';
    hidden = null;
  }

  // voltou pelo botão "voltar" e a página saiu do bfcache: desfaz o mergulho
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && busy) {
      reset();
      onReturn?.();
    }
  });

  /**
   * @param {string} url destino
   * @param {HTMLElement} frame elemento da prancha (foto ou desenho)
   * @param {string} title nome da obra (para o rótulo de carregamento)
   */
  function go(url, frame, title) {
    if (busy) return;
    busy = true;
    warm(url);
    beforeLeave?.();
    if (reduced || !frame) {
      location.assign(url);
      return;
    }

    const r = frame.getBoundingClientRect();
    const photo = frame.querySelector('img');
    inner.innerHTML = '';
    img.style.backgroundImage = '';
    if (photo) {
      img.style.backgroundImage = `url("${photo.currentSrc || photo.src}")`;
      img.style.backgroundPosition = getComputedStyle(photo).objectPosition || '50% 50%';
      img.classList.remove('is-drawn');
    } else {
      // prancha desenhada: o desenho cresce junto, sobre o papel
      inner.innerHTML = frame.innerHTML;
      img.classList.add('is-drawn');
    }
    label.querySelector('span').textContent = `abrindo ${title}`;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    gsap.set(img, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 3 });
    gsap.set(veil, { opacity: 0 });
    gsap.set(label, { opacity: 0, y: 8 });
    root.classList.add('is-on');
    hidden = frame;
    frame.style.visibility = 'hidden'; // a imagem "descola" da página

    // a câmera avança em direção ao centro da prancha
    const rr = rig.getBoundingClientRect();
    const ox = ((r.left + r.width / 2 - rr.left) / rr.width) * 100;
    const oy = ((r.top + r.height / 2 - rr.top) / rr.height) * 100;
    gsap.set(rig, { transformOrigin: `${ox}% ${oy}%` });

    tl = gsap.timeline({
      onComplete: () => {
        // abre numa NOVA aba (ainda dentro da janela de "gesto do usuário",
        // por isso a animação dura ~1,2 s) e o livro volta ao lugar nesta
        const w = window.open(url, '_blank');
        if (w) {
          try {
            w.opener = null;
          } catch {}
          back(r);
        } else {
          // bloqueador de pop-ups: um clique direto sempre funciona
          offer(url, r);
        }
      },
    });
    tl.to(rig, { scale: 1.32, duration: 1.2, ease: 'power2.in' }, 0)
      .to(veil, { opacity: 1, duration: 0.9, ease: 'power1.inOut' }, 0.1)
      // pequena "respiração" antes do mergulho, depois acelera e assenta
      .to(img, { left: r.left - 4, top: r.top - 4, width: r.width + 8, height: r.height + 8, duration: 0.28, ease: 'power2.out' }, 0)
      .to(img, { left: 0, top: 0, width: vw, height: vh, borderRadius: 0, duration: 1.0, ease: 'expo.inOut' }, 0.2)
      .to(label, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.85);
  }

  /** desfaz o mergulho: a imagem volta para a prancha e o livro recua */
  function back(r) {
    offering = false;
    tl?.kill();
    tl = gsap.timeline({ data: 'back', delay: 0.25, onComplete: () => (reset(), onReturn?.()) });
    tl.to(label, { opacity: 0, duration: 0.25 }, 0)
      .to(img, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 3, duration: 0.9, ease: 'expo.inOut' }, 0)
      .to(veil, { opacity: 0, duration: 0.7, ease: 'power1.inOut' }, 0.2)
      .to(rig, { scale: 1, duration: 0.9, ease: 'power2.out' }, 0.1);
  }

  function offer(url, r) {
    offering = true;
    label.innerHTML = '';
    const a = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener', textContent: 'abrir em nova aba →' });
    a.className = 'portal-open';
    a.addEventListener('click', () => back(r));
    const x = Object.assign(document.createElement('button'), { type: 'button', textContent: 'voltar ao livro' });
    x.className = 'portal-cancel';
    x.addEventListener('click', () => back(r));
    label.append(a, x);
    label.style.pointerEvents = 'auto';
  }

  /**
   * Voltou para esta aba depois de abrir a obra na outra: encerra o mergulho na
   * hora (a pessoa não viu a volta mesmo) — nada fica preso cobrindo o livro.
   */
  function heal() {
    if (!busy || offering) return;
    // ainda mergulhando (a obra nem abriu): deixa terminar
    if (tl && tl.data !== 'back' && tl.progress() < 1) return;
    reset();
    onReturn?.();
  }

  return { go, warm, reset, heal };
}
