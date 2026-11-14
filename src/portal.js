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
    gsap.killTweensOf([img, veil, label, rig]);
    root.classList.remove('is-on');
    gsap.set(rig, { clearProps: 'scale,transformOrigin' });
    if (hidden) hidden.style.visibility = '';
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

    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem('livro.visit', '1');
        } catch {}
        location.assign(url);
      },
    });
    tl.to(rig, { scale: 1.32, duration: 1.5, ease: 'power2.in' }, 0)
      .to(veil, { opacity: 1, duration: 1.1, ease: 'power1.inOut' }, 0.15)
      // pequena "respiração" antes do mergulho, depois acelera e assenta
      .to(img, { left: r.left - 4, top: r.top - 4, width: r.width + 8, height: r.height + 8, duration: 0.28, ease: 'power2.out' }, 0)
      .to(img, { left: 0, top: 0, width: vw, height: vh, borderRadius: 0, duration: 1.35, ease: 'expo.inOut' }, 0.22)
      .to(label, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.25)
      .to({}, { duration: 0.25 });
  }

  return { go, warm, reset };
}
