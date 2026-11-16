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
  // ...mas o iOS SILENCIA o Web Audio com o iPhone no modo silencioso (a chave lateral),
  // enquanto um <audio> tocado direto continua soando. No Safari 17+ a página se
  // declara "reprodução de mídia" e o Web Audio passa a tocar como música. Em iOS mais
  // antigo, a trilha toca direto pelo <audio> (volume pelos botões do aparelho).
  const useGain = !volumeWorks && 'audioSession' in navigator;
  try {
    // vale para a página toda: também os sons de papel (Web Audio) tocam no silencioso
    if ('audioSession' in navigator) navigator.audioSession.type = 'playback';
  } catch {}
  let ctx = null;

  const tracks = {}; // tema -> { el, level, gain }
  let current = null;

  function track(theme) {
    if (tracks[theme]) return tracks[theme];
    // reaproveita o áudio que já começou a baixar no <head>
    const early = window.__bgm?.theme === theme ? window.__bgm.el : null;
    const el = early || new Audio(SRC[theme]);
    el.loop = true;
    // só o cabeçalho até a hora de tocar; ao tocar, o navegador baixa em streaming
    el.preload = 'metadata';
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
      else {
        t.el.volume = v;
        // iOS antigo (sem Web Audio): o volume não muda, mas o "zero" ainda silencia
        if (!volumeWorks) t.el.muted = master === 0;
      }
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
  // várias tentativas podem correr juntas (pointerup, touchend e click do mesmo toque):
  // só a mais recente decide o resultado
  let attempt = 0;
  function audible() {
    if (muted || !current) return;
    const t = current;
    const my = ++attempt;
    blocked = false;
    if (t.el.paused) {
      t.level = 0;
      render();
    }
    t.el.muted = false;
    t.el.play().then(() => {
      // qualquer tentativa que der certo vale (uma segunda só refaz a entrada suave
      // a partir do nível atual — sem salto)
      if (current !== t) return;
      playing = true;
      stopWaiting();
      fade(t, 1, 250);
      emit();
    }).catch(() => {
      // recusada: só conta se for a última tentativa e nada estiver tocando
      if (my !== attempt || !t.el.paused) return;
      blocked = true;
      waitForGesture();
      emit();
    });
  }

  /** dentro de um toque/clique/tecla? (sem a API, tenta assim mesmo) */
  const inGesture = () => (navigator.userActivation ? navigator.userActivation.isActive : true);

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
    if (blocked && !inGesture()) {
      // som ainda bloqueado e ninguém tocou na tela: a faixa fica pronta (sem baixar o
      // arquivo inteiro para tocar muda) e entra, do começo, no primeiro toque
      next.level = 1;
      render();
    } else {
      // dentro de um toque/clique (ex.: o play do celular da mesa) toca na hora
      audible();
    }
  }

  // Só estes eventos liberam som num toque: no celular, "pointerdown"/"touchstart"
  // NÃO contam como gesto (Chrome do Android e Safari do iPhone) — tocar ali era
  // recusado e, no iPhone, o contexto de áudio nascia suspenso (mudo para sempre).
  const GESTURES = ['pointerup', 'touchend', 'click', 'keydown'];
  // Continua escutando TODOS esses eventos até o som realmente começar: cada navegador
  // libera o áudio num deles (alguns Android só no touchend ou no click). Antes, o
  // primeiro evento do toque desligava a escuta — se ali o som era recusado, os eventos
  // certos daquele mesmo toque já tinham passado, e assim a cada toque.
  let waiting = false;
  function onGesture(e) {
    if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Escape')) return; // não liberam som
    unlockCtx();
    // "ainda não tocando" (e não "bloqueado"): a tentativa do pointerup só é recusada
    // alguns ms depois — o touchend/click do mesmo toque precisa tentar também
    if (!playing) audible();
  }
  function waitForGesture() {
    if (waiting) return;
    waiting = true;
    GESTURES.forEach((ev) => window.addEventListener(ev, onGesture, true));
  }
  function stopWaiting() {
    if (!waiting) return;
    waiting = false;
    GESTURES.forEach((ev) => window.removeEventListener(ev, onGesture, true));
  }

  /** iOS: o volume passa pelo Web Audio, que precisa nascer/acordar dentro de um gesto */
  function unlockCtx() {
    if (useGain && !ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        Object.values(tracks).forEach(attach);
      }
    }
    if (ctx && ctx.state !== 'running') ctx.resume?.().catch?.(() => {});
  }
  // se o contexto ainda estiver suspenso (ou o iOS o suspender ao voltar do fundo),
  // qualquer toque seguinte o acorda
  GESTURES.forEach((ev) => window.addEventListener(ev, () => ctx && ctx.state !== 'running' && unlockCtx(), true));

  // começa mudo (já tocando desde o <head>) e descobre se pode ligar o som
  // a trilha começa depois do CSS principal (não disputa a rede com a primeira pintura)
  const cssReady = import.meta.env.DEV ? Promise.resolve() : window.__cssReady || Promise.resolve();
  blocked = true;
  // o navegador deixa tocar com som sem um toque? (a abertura espera por isso)
  const autoplayOk = cssReady.then(() => {
    play();
    if (volumeWorks && !muted) {
      return canAutoplay().then((ok) => {
        if (ok) audible();
        else waitForGesture();
        return ok;
      });
    }
    waitForGesture(); // iOS: o Web Audio exige um gesto
    return false;
  });

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
    /** promessa: true se o som pode entrar sem um toque */
    get autoplay() {
      return autoplayOk;
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
    /** a faixa do tema atual (o app de música do celular lê tempo e duração dela) */
    get el() {
      return (current ?? track(getTheme())).el;
    },
    get playing() {
      return playing && !muted;
    },
    /** volta a faixa ao começo (ex.: reiniciar a abertura), com entrada suave */
    restart() {
      const t = current ?? track(getTheme());
      try {
        t.el.currentTime = 0;
      } catch {}
      if (muted) return;
      if (blocked) {
        // ainda bloqueado: num toque (ex.: reiniciar a abertura) já entra com som
        current = t;
        if (inGesture()) audible();
        return;
      }
      t.level = 0;
      render();
      t.el.play().then(() => {
        playing = true;
        fade(t, 1, 1200);
        emit();
      }).catch(() => {});
    },
    /** f ∈ [0, 1]: posição da faixa */
    /**
     * "Play" de verdade: liga a trilha (desfaz o mudo guardado) e toca agora — feito
     * para ser chamado num clique. (O toggle desligava a música quando ela estava
     * ligada mas parada pelo bloqueio do navegador — e guardava "desligada".)
     */
    start() {
      if (muted) {
        muted = false;
        write(K_MUTE, 'on');
      }
      if (volume < 0.05) volume = 0.4;
      unlockCtx();
      play();
      emit();
    },
    seek(f) {
      const el = (current ?? track(getTheme())).el;
      if (el.duration) el.currentTime = Math.max(0, Math.min(0.999, f)) * el.duration;
    },
  };
}
