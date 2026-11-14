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
    // reaproveita o áudio que já começou a baixar no <head>
    const early = window.__bgm?.theme === theme ? window.__bgm.el : null;
    const el = early || new Audio(SRC[theme]);
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

  /** pergunta ao navegador se pode tocar COM som, sem tocar na faixa que já corre muda */
  function canAutoplay() {
    // WAV silencioso de 10 ms: o navegador decide pelo "muted", não pelo conteúdo
    const n = 441;
    const buf = new ArrayBuffer(44 + n * 2);
    const v = new DataView(buf);
    const str = (o, t) => [...t].forEach((c, k) => v.setUint8(o + k, c.charCodeAt(0)));
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVEfmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    const probe = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
    return probe.play().then(() => (probe.pause(), true)).catch(() => false);
  }

  /** liga o som da faixa atual (só quando permitido) com entrada suave */
  function audible() {
    if (muted || !current) return;
    const t = current;
    blocked = false;
    t.level = 0;
    render();
    t.el.muted = false;
    t.el.play().then(() => {
      playing = true;
      fade(t, 1, 250);
      emit();
    }).catch(() => {
      blocked = true;
      t.el.muted = true;
      t.el.play().catch(() => {});
      waitForGesture();
    });
  }

  /**
   * Toca a faixa do tema. Contra o bloqueio de som automático: a faixa corre
   * MUDA desde o primeiro instante (sempre permitido); se o navegador permitir
   * som, ele entra na hora; senão, entra no primeiro toque/clique/tecla.
   */
  function play(theme = getTheme()) {
    if (muted) return;
    const next = track(theme);
    if (current && current !== next) {
      const prev = current;
      fade(prev, 0, 1400, () => prev.el.pause());
    }
    current = next;
    if (blocked) {
      next.el.muted = true;
      next.level = 1;
      render();
      next.el.play().then(() => (playing = true)).catch(() => {});
    } else {
      audible();
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
      if (blocked) audible();
    };
    ['pointerdown', 'keydown', 'touchend', 'click'].forEach((ev) => window.addEventListener(ev, go, true));
  }

  // começa mudo (já tocando desde o <head>) e descobre se pode ligar o som
  blocked = true;
  play();
  if (volumeWorks && !muted) {
    canAutoplay().then((ok) => {
      if (ok) audible();
      else waitForGesture();
    });
  } else {
    waitForGesture(); // iOS: o Web Audio exige um gesto
  }

  window.addEventListener('themechange', (e) => {
    if (!muted) play(e.detail);
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
