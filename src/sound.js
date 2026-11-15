/**
 * Som de papel sintetizado com Web Audio — nenhum arquivo de áudio.
 * Um "swoosh" de ruído filtrado + um leve toque quando a folha assenta.
 */

const KEY = 'livro.sound';

export function createSound() {
  let ctx = null;
  let noise = null;
  let enabled = true;
  try {
    enabled = localStorage.getItem(KEY) !== 'off';
  } catch {}

  // um segundo de ruído rosa reaproveitável — calculado no tempo ocioso logo ao
  // carregar (antes era no toque que abre o livro: ~50 ms de travada no celular)
  let samples = null;
  function pinkNoise() {
    if (samples) return samples;
    samples = new Float32Array(48000);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < samples.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029591;
      b1 = 0.985 * b1 + w * 0.032534;
      b2 = 0.95 * b2 + w * 0.048056;
      samples[i] = (b0 + b1 + b2 + w * 0.1848) * 0.6;
    }
    return samples;
  }
  (window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(pinkNoise);

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const data = pinkNoise();
    noise = ctx.createBuffer(1, data.length, ctx.sampleRate);
    noise.getChannelData(0).set(data);
    return ctx;
  }

  function rustle(at, dur, gainPeak, freq) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(freq * 0.6, at);
    bp.frequency.exponentialRampToValueAtTime(freq * 1.6, at + dur * 0.55);
    bp.frequency.exponentialRampToValueAtTime(freq * 0.5, at + dur);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 380;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gainPeak, at + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(gainPeak * 0.4, at + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp).connect(hp).connect(g).connect(ctx.destination);
    src.start(at, Math.random() * 0.5, dur + 0.05);
  }

  function thump(at, gainPeak) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, at);
    o.frequency.exponentialRampToValueAtTime(60, at + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gainPeak, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
    o.connect(g).connect(ctx.destination);
    o.start(at);
    o.stop(at + 0.16);
  }

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem(KEY, enabled ? 'on' : 'off');
      } catch {}
      if (enabled) this.flip(1);
      return enabled;
    },
    /** chamado no primeiro gesto do usuário (política de autoplay) */
    unlock() {
      if (!enabled) return;
      const c = ensure();
      if (c?.state === 'suspended') c.resume();
    },
    flip(count = 1) {
      if (!enabled) return;
      const c = ensure();
      if (!c) return;
      if (c.state === 'suspended') c.resume();
      const now = c.currentTime + 0.02;
      if (count <= 1) {
        rustle(now, 0.55, 0.22, 2400);
        thump(now + 0.62, 0.05);
      } else {
        // folhear: vários sopros curtos em sequência
        const n = Math.min(count, 10);
        for (let i = 0; i < n; i++) rustle(now + i * 0.075, 0.28, 0.12, 2800 + Math.random() * 900);
        thump(now + n * 0.075 + 0.35, 0.04);
      }
    },
    open() {
      if (!enabled) return;
      const c = ensure();
      if (!c) return;
      const now = c.currentTime + 0.5;
      rustle(now, 1.4, 0.16, 1400);
      thump(now + 1.5, 0.08);
    },
  };
}
