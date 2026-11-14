/**
 * Trilha sonora (piano), uma por tema:
 *  - claro:  Ária da Suíte nº 3 (BWV 1068), J. S. Bach — partitura Bach-Gesellschaft (Mutopia,
 *            CC BY-SA 3.0) tocada num piano de cauda amostrado (Salamander Grand Piano, CC BY 3.0)
 *  - escuro: Lacrimosa do Réquiem, W. A. Mozart — transcrição de S. Thalberg, interpretada por
 *            Lệ Xuân (Wikimedia Commons, CC BY-SA 4.0)
 * O volume passa por um GainNode (no iOS, audio.volume é somente leitura).
 * Só começa depois de um gesto do usuário (política de autoplay dos navegadores).
 */

const KEY = 'livro.music';
const SRC = {
  light: 'music/aria-bach-piano.mp3',
  dark: 'music/lacrimosa-piano.mp3',
};
const LEVEL = 0.38;

export function createMusic({ getTheme }) {
  let enabled = true;
  try {
    enabled = localStorage.getItem(KEY) !== 'off';
  } catch {}

  let ctx = null;
  let master = null;
  const tracks = {}; // theme -> { el, gain }
  let current = null;
  let started = false;

  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    return true;
  }

  function track(theme) {
    if (tracks[theme]) return tracks[theme];
    const el = new Audio();
    el.src = SRC[theme];
    el.loop = true;
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain).connect(master);
    tracks[theme] = { el, gain };
    return tracks[theme];
  }

  function fade(gain, to, secs) {
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(to, t + secs);
  }

  /** toca a faixa do tema atual (com fade cruzado se outra estiver tocando) */
  function play(theme = getTheme()) {
    if (!enabled || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    const next = track(theme);
    if (current && current !== next) {
      const prev = current;
      fade(prev.gain, 0, 1.6);
      setTimeout(() => prev.gain.gain.value < 0.01 && prev.el.pause(), 1800);
    }
    current = next;
    next.el.play().catch(() => {});
    fade(next.gain, LEVEL, current === next && started ? 2.2 : 3);
    started = true;
  }

  function stop() {
    if (!ctx) return;
    Object.values(tracks).forEach((t) => {
      fade(t.gain, 0, 0.8);
      setTimeout(() => t.el.pause(), 900);
    });
    current = null;
  }

  // começa no primeiro gesto
  const firstGesture = () => {
    window.removeEventListener('pointerdown', firstGesture, true);
    window.removeEventListener('keydown', firstGesture, true);
    if (enabled) play();
  };
  window.addEventListener('pointerdown', firstGesture, true);
  window.addEventListener('keydown', firstGesture, true);

  // troca de tema = troca de faixa
  window.addEventListener('themechange', (e) => {
    if (enabled && started) play(e.detail);
  });

  // aba escondida: pausa; volta: retoma
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !current) return;
    if (document.hidden) current.el.pause();
    else if (enabled) current.el.play().catch(() => {});
  });

  return {
    /** silencia aos poucos (ex.: ao sair para outro site) */
    duck(secs = 1.2) {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + secs);
    },
    /** volta ao volume normal */
    unduck(secs = 1.5) {
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(1, t + secs);
    },
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem(KEY, enabled ? 'on' : 'off');
      } catch {}
      if (enabled) play();
      else stop();
      return enabled;
    },
  };
}
