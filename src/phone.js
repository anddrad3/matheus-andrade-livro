import gsap from 'gsap';
import { EN } from './lang.js';
import './styles/phone.css'; // só baixa quando o celular é preparado

/**
 * O celular da mesa: abre num app de música mostrando a faixa que está tocando
 * (uma por edição), com a gravura de Doré da Divina Comédia como capa — o Céu
 * na edição clássica, o Inferno na Sombria. Dá para pausar, voltar ao começo,
 * arrastar a faixa, mudar o volume, desligar o som das páginas e trocar de
 * edição (e de música) pelo próprio aparelho.
 */
const TRACKS_PT = {
  light: {
    app: 'Vitrola',
    title: 'Ária — Suíte nº 3, BWV 1068',
    artist: 'J. S. Bach · ao piano',
    art: 'engr/paraiso-31.webp',
    credit: 'Gustave Doré · Paraíso, Canto XXXI — a Rosa Celeste (1868)',
    blurb: 'Trilha da edição clássica. Bach escreveu esta ária por volta de 1730, e ela gira devagar como a Rosa Celeste de Doré: luz em círculos, sem pressa. Matheus recomenda com café e a página aberta.',
    next: 'ir para a Edição Sombria',
  },
  dark: {
    app: 'Réquiem',
    title: 'Lacrimosa — Réquiem, K. 626',
    artist: 'W. A. Mozart · ao piano (transcr. Thalberg)',
    art: 'engr/inferno-34.webp',
    credit: 'Gustave Doré · Inferno, Canto XXXIV — Lúcifer no gelo (1861)',
    blurb: 'Trilha da Edição Sombria. Mozart morreu escrevendo o Réquiem: da Lacrimosa, deixou só os oito primeiros compassos. Andrade ouve no nono círculo, com o gelo pela cintura — e o deploy ainda falhando.',
    next: 'voltar à edição clássica',
  },
};

const TRACKS_EN = {
  light: {
    app: 'Gramophone',
    title: 'Air — Suite No. 3, BWV 1068',
    artist: 'J. S. Bach · on piano',
    art: 'engr/paraiso-31.webp',
    credit: 'Gustave Doré · Paradiso, Canto XXXI — the Celestial Rose (1868)',
    blurb: 'Soundtrack of the classic edition. Bach wrote this air around 1730, and it turns slowly like Doré’s Celestial Rose: light in circles, unhurried. Matheus recommends it with coffee and the book open.',
    next: 'go to the Dark Edition',
  },
  dark: {
    app: 'Requiem',
    title: 'Lacrimosa — Requiem, K. 626',
    artist: 'W. A. Mozart · on piano (arr. Thalberg)',
    art: 'engr/inferno-34.webp',
    credit: 'Gustave Doré · Inferno, Canto XXXIV — Lucifer in the ice (1861)',
    blurb: 'Soundtrack of the Dark Edition. Mozart died writing the Requiem: of the Lacrimosa he left only the first eight bars. Andrade listens to it in the ninth circle, waist-deep in ice — with the deploy still failing.',
    next: 'back to the classic edition',
  },
};

const TRACKS = EN ? TRACKS_EN : TRACKS_PT;

const fmt = (s) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export function createPhone({ music, sound, getTheme, switchTheme, onSound }) {
  const root = document.getElementById('phone-modal');
  const dev = root.querySelector('.pm-device');
  const $ = (s) => root.querySelector(s);
  const el = {
    app: $('.pm-app-name'),
    art: $('.pm-art img'),
    credit: $('.pm-art figcaption'),
    title: $('.pm-title'),
    artist: $('.pm-artist'),
    blurb: $('.pm-blurb'),
    seek: $('.pm-seek input'),
    t0: $('.pm-t0'),
    t1: $('.pm-t1'),
    play: $('.pm-play'),
    restart: $('.pm-restart'),
    next: $('.pm-next'),
    vol: $('.pm-vol input'),
    volOut: $('.pm-vol output'),
    pages: $('.pm-pages'),
    clock: $('.pm-clock'),
  };
  let raf = 0;
  let lastFocus = null;
  let seeking = false;

  function fill() {
    const t = TRACKS[getTheme()];
    el.app.textContent = t.app;
    if (!el.art.src.endsWith(t.art)) el.art.src = t.art;
    el.art.alt = t.credit;
    el.credit.textContent = t.credit;
    el.title.textContent = t.title;
    el.artist.textContent = t.artist;
    el.blurb.textContent = t.blurb;
    el.next.setAttribute('aria-label', t.next);
    el.next.title = t.next;
    sync();
  }

  function sync() {
    const on = music.playing;
    el.play.classList.toggle('is-paused', !on);
    el.play.setAttribute('aria-label', on ? (EN ? 'Pause the soundtrack' : 'Pausar a trilha') : EN ? 'Play the soundtrack' : 'Tocar a trilha');
    root.classList.toggle('is-playing', on);
    const v = Math.round(music.volume * 100);
    if (document.activeElement !== el.vol) el.vol.value = String(v);
    el.vol.style.setProperty('--v', `${music.muted ? 0 : v}%`);
    el.volOut.textContent = music.muted ? (EN ? 'muted' : 'mudo') : String(v);
    el.pages.setAttribute('aria-checked', String(sound.enabled));
    const d = new Date();
    el.clock.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    const a = music.el;
    if (!a || seeking) return;
    const f = a.duration ? a.currentTime / a.duration : 0;
    el.seek.value = String(Math.round(f * 1000));
    el.seek.style.setProperty('--v', `${(f * 100).toFixed(2)}%`);
    el.t0.textContent = fmt(a.currentTime);
    el.t1.textContent = `−${fmt((a.duration || 0) - a.currentTime)}`;
  }

  function open() {
    if (!root.hidden) return;
    lastFocus = document.activeElement;
    fill();
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('is-open'));
    gsap.fromTo(dev, { rotationX: 18, rotationY: -24, y: 60, scale: 0.86 }, { rotationX: 0, rotationY: 0, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' });
    cancelAnimationFrame(raf);
    tick();
    el.play.focus({ preventScroll: true });
  }

  function close() {
    if (root.hidden) return;
    root.classList.remove('is-open');
    cancelAnimationFrame(raf);
    gsap.to(dev, { y: 40, scale: 0.94, rotationX: 10, duration: 0.3, ease: 'power2.in' });
    setTimeout(() => {
      if (!root.classList.contains('is-open')) root.hidden = true;
    }, 300);
    lastFocus?.focus?.({ preventScroll: true });
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-pm-close]')) close();
  });
  el.play.addEventListener('click', () => {
    music.toggle();
    sync();
  });
  el.restart.addEventListener('click', () => {
    if (music.muted) music.toggle();
    music.restart();
    sync();
  });
  el.next.addEventListener('click', () => switchTheme());
  el.vol.addEventListener('input', () => {
    music.setVolume(Number(el.vol.value) / 100);
    sync();
  });
  el.seek.addEventListener('input', () => {
    seeking = true;
    el.seek.style.setProperty('--v', `${Number(el.seek.value) / 10}%`);
  });
  el.seek.addEventListener('change', () => {
    music.seek(Number(el.seek.value) / 1000);
    seeking = false;
  });
  el.pages.addEventListener('click', () => {
    sound.toggle();
    onSound?.();
    sync();
  });
  document.addEventListener('keydown', (e) => {
    if (!root.hidden && e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  }, true);
  window.addEventListener('themechange', () => !root.hidden && fill());

  // o aparelho inclina de leve acompanhando o ponteiro
  const tx = gsap.quickTo(dev, 'rotationY', { duration: 0.8, ease: 'power3.out' });
  const ty = gsap.quickTo(dev, 'rotationX', { duration: 0.8, ease: 'power3.out' });
  root.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('input')) return;
    const r = dev.getBoundingClientRect();
    tx(((e.clientX - (r.left + r.width / 2)) / r.width) * 10);
    ty((-(e.clientY - (r.top + r.height / 2)) / r.height) * 8);
  });

  return {
    open,
    close,
    sync,
    get isOpen() {
      return !root.hidden;
    },
  };
}
