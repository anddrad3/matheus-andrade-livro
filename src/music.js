/**
 * Trilha sonora (piano), uma por tema:
 *  - claro:  Ária da Suíte nº 3 (BWV 1068), J. S. Bach — partitura Bach-Gesellschaft (Mutopia,
 *            CC BY-SA 3.0) tocada num piano de cauda amostrado (Salamander Grand Piano, CC BY 3.0)
 *  - escuro: Lacrimosa do Réquiem, W. A. Mozart — transcrição de S. Thalberg, interpretada por
 *            Lệ Xuân (Wikimedia Commons, CC BY-SA 4.0)
 *
 * Começa a baixar e tocar no instante em que a página abre. Se o navegador
 * bloquear som automático (política de autoplay), começa no primeiro gesto.
 * Volume 0–100 e mudo, lembrados entre visitas. No iOS, onde audio.volume é
 * somente leitura, o volume passa por um GainNode (Web Audio).
 */

const SRC = {
  light: 'music/aria-bach-piano.mp3',
  dark: 'music/lacrimosa-piano.mp3',
};
const K_VOL = 'livro.volume';
const K_MUTE = 'livro.music';

const read = (k, d) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

export function createMusic({ getTheme, onChange }) {
  let volume = Math.min(1, Math.max(0, Number(read(K_VOL, '0.55'))));
  let muted = read(K_MUTE, 'on') === 'off';
  let duckF = 1;
  let playing = false;
  let blocked = false;

  // iOS ignora audio.volume: nesse caso usamos Web Audio (criado num gesto)
  const probe = new Audio();
  probe.volume = 0.5;
  const volumeWorks = Math.abs(probe.volume - 0.5) < 0.01;
  let ctx = null;

  const tracks = {}; // tema -> { el, level, gain }
  let current = null;

  function track(theme) {
    if (tracks[theme]) return tracks[theme];
    const el = new Audio(SRC[theme]);
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    const t = { el, level: 0, gain: null, theme };
    tracks[theme] = t;
    if (ctx) attach(t);
    return t;
  }

  function attach(t) {
    if (t.gain || !ctx) return;
    t.gain = ctx.createGain();
    t.gain.gain.value = 0;
    ctx.createMediaElementSource(t.el).connect(t.gain).connect(ctx.destination);
    t.el.volume = 1;
  }

  /** aplica o volume efetivo de cada faixa */
  function render() {
    const master = muted ? 0 : volume * volume * duckF; // curva perceptual
    for (const t of Object.values(tracks)) {
      const v = Math.max(0, Math.min(1, t.level * master));
      if (t.gain) t.gain.gain.value = v;
      else t.el.volume = v;
    }
  }

  const fades = new Map();
  function fade(t, to, ms, done) {
    cancelAnimationFrame(fades.get(t));
    const from = t.level;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      t.level = from + (to - from) * (1 - Math.pow(1 - k, 2));
      render();
      if (k < 1) fades.set(t, requestAnimationFrame(step));
      else done?.();
    };
    fades.set(t, requestAnimationFrame(step));
  }

  function emit() {
    onChange?.({ volume, muted, playing, blocked });
  }

  /** toca a faixa do tema (com fade cruzado se outra estiver tocando) */
  function play(theme = getTheme()) {
    if (muted) return;
    const next = track(theme);
    if (current && current !== next) {
      const prev = current;
      fade(prev, 0, 1400, () => prev.el.pause());
    }
    current = next;
    const p = next.el.play();
    if (p?.then) {
      p.then(() => {
        playing = true;
        blocked = false;
        fade(next, 1, 900);
        emit();
      }).catch(() => {
        blocked = true;
        emit();
        waitForGesture();
      });
    }
  }

  let waiting = false;
  function waitForGesture() {
    if (waiting) return;
    waiting = true;
    const go = () => {
      waiting = false;
      ['pointerdown', 'keydown', 'touchend', 'click'].forEach((ev) => window.removeEventListener(ev, go, true));
      if (!volumeWorks && !ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          ctx = new AC();
          Object.values(tracks).forEach(attach);
        }
      }
      ctx?.resume?.();
      play();
    };
    ['pointerdown', 'keydown', 'touchend', 'click'].forEach((ev) => window.addEventListener(ev, go, true));
  }

  // no iOS o Web Audio também precisa de um gesto; a música espera por ele
  if (!volumeWorks) {
    track(getTheme());
    blocked = true;
    waitForGesture();
  } else {
    play();
  }

  window.addEventListener('themechange', (e) => {
    if (!muted && !blocked) play(e.detail);
    else track(e.detail); // só pré-carrega
  });

  document.addEventListener('visibilitychange', () => {
    if (!current || muted || !playing) return;
    if (document.hidden) current.el.pause();
    else current.el.play().catch(() => {});
  });

  return {
    get volume() {
      return volume;
    },
    get muted() {
      return muted;
    },
    get enabled() {
      return !muted && volume > 0;
    },
    get blocked() {
      return blocked;
    },
    setVolume(v) {
      volume = Math.min(1, Math.max(0, v));
      write(K_VOL, volume.toFixed(2));
      if (volume > 0 && muted) {
        muted = false;
        write(K_MUTE, 'on');
        play();
      }
      render();
      emit();
    },
    toggle() {
      muted = !muted;
      write(K_MUTE, muted ? 'off' : 'on');
      if (muted) {
        render();
        Object.values(tracks).forEach((t) => t.el.pause());
        playing = false;
      } else {
        if (volume < 0.05) volume = 0.4;
        play();
      }
      emit();
      return !muted;
    },
    /** silencia aos poucos (ex.: ao sair para outro site) */
    duck(secs = 1.2) {
      const from = duckF;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / (secs * 1000));
        duckF = from * (1 - k);
        render();
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    unduck() {
      duckF = 1;
      render();
    },
  };
}
