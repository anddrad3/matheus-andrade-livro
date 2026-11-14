/**
 * Ornamentos vetoriais gerados por código.
 * Tudo usa `currentColor`, então a cor vem do CSS.
 */

const TAU = Math.PI * 2;
const f = (n) => Math.round(n * 10) / 10;

function pathFrom(points) {
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 1; i < points.length; i++) d += `L${f(points[i][0])} ${f(points[i][1])}`;
  return d + 'Z';
}

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/**
 * Roseta guilloché — o padrão gravado de cédulas e relógios.
 * Combina hipotrocoides internas com uma faixa de ondas entrelaçadas.
 */
const rosetteCache = new Map();
export function guilloche(seed = {}, opts = {}) {
  const key = JSON.stringify([seed, opts]);
  if (!rosetteCache.has(key)) rosetteCache.set(key, buildGuilloche(seed, opts));
  return rosetteCache.get(key);
}

// resolução calibrada para o tamanho em que as rosetas aparecem (~80–220 px):
// lisa a olho nu, com ~1/3 dos pontos de antes (menos SVG para montar e pintar)
function buildGuilloche({ a = 5, b = 3, loops = 30, r = 0.6 } = {}, opts = {}) {
  const size = 400;
  const c = size / 2;
  const { band = true, rings = true, cls = '' } = opts;
  const paths = [];

  // Hipotrocoides em camadas
  const g = gcd(a, b);
  const p = a / g;
  const q = b / g;
  const k = q / p;
  const turns = q;
  const steps = 120 * turns;
  for (let layer = 0; layer < 6; layer++) {
    const l = 0.42 + layer * 0.09;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * TAU * turns;
      const x = (1 - k) * Math.cos(t) + l * k * Math.cos(((1 - k) / k) * t);
      const y = (1 - k) * Math.sin(t) - l * k * Math.sin(((1 - k) / k) * t);
      const norm = 1 - k + l * k;
      pts.push([c + (x / norm) * c * r, c + (y / norm) * c * r]);
    }
    paths.push(`<path d="${pathFrom(pts)}" pathLength="1" style="--d:${layer}"/>`);
  }

  // Faixa de ondas entrelaçadas
  if (band) {
    const strands = 8;
    for (let s = 0; s < strands; s++) {
      const phase = (s / strands) * (TAU / loops) * 2;
      const pts = [];
      const n = loops * 7;
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * TAU;
        const rad = c * (0.835 + 0.07 * Math.sin(loops * t + phase * loops * 0.5));
        pts.push([c + Math.cos(t) * rad, c + Math.sin(t) * rad]);
      }
      paths.push(`<path d="${pathFrom(pts)}" pathLength="1" style="--d:${6 + s * 0.5}"/>`);
    }
  }

  // Anéis finos de moldura
  if (rings) {
    for (const rr of [0.735, 0.755, 0.925, 0.94]) {
      paths.push(`<circle cx="${c}" cy="${c}" r="${f(c * rr)}" pathLength="1" style="--d:3"/>`);
    }
  }

  return `<svg class="guilloche ${cls}" viewBox="0 0 ${size} ${size}" aria-hidden="true" fill="none" stroke="currentColor">${paths.join('')}</svg>`;
}

/** Medalhão com monograma ao centro de uma roseta */
export function medallion(monogram, seed = { a: 8, b: 3, loops: 36, r: 0.52 }, cls = '') {
  return `<div class="medallion ${cls}">
    ${guilloche(seed, { cls: 'medallion-rose' })}
    <span class="medallion-mono">${monogram}</span>
  </div>`;
}

/** Cantoneira filigranada (canto superior esquerdo; gire via CSS) */
export function corner(cls = '') {
  return `<svg class="corner ${cls}" viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
    <path d="M4 116V4h112" stroke-width="1.6"/>
    <path d="M12 116V12h104" stroke-width=".7"/>
    <path d="M12 60c10 0 18-6 18-16S22 30 14 34" stroke-width="1"/>
    <path d="M60 12c0 10-6 18-16 18S30 22 34 14" stroke-width="1"/>
    <path d="M22 22c14 2 26 14 28 28" stroke-width=".8"/>
    <path d="M22 22c8 8 18 10 26 6M22 22c8 8 10 18 6 26" stroke-width=".7"/>
    <circle cx="22" cy="22" r="3.2" fill="currentColor" stroke="none"/>
    <path d="M30 44c-6 4-8 10-4 14M44 30c4-6 10-8 14-4" stroke-width=".7"/>
    <circle cx="27" cy="58" r="1.4" fill="currentColor" stroke="none"/>
    <circle cx="58" cy="27" r="1.4" fill="currentColor" stroke="none"/>
    <path d="M4 4l8 8" stroke-width=".7"/>
  </svg>`;
}

/** Divisor horizontal com losango central */
export function rule(cls = '') {
  return `<svg class="rule ${cls}" viewBox="0 0 240 16" aria-hidden="true" fill="none" stroke="currentColor" preserveAspectRatio="xMidYMid meet">
    <path d="M4 8h92M144 8h92" stroke-width=".8"/>
    <path d="M30 8h66M144 8h66" stroke-width=".8" transform="translate(0 3)" opacity=".5"/>
    <path d="M120 1l7 7-7 7-7-7z" stroke-width="1"/>
    <path d="M120 4.5l3.5 3.5-3.5 3.5-3.5-3.5z" fill="currentColor" stroke="none"/>
    <circle cx="104" cy="8" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="136" cy="8" r="1.6" fill="currentColor" stroke="none"/>
  </svg>`;
}

/** Florão (vinheta tipográfica) */
export function fleuron(cls = '') {
  return `<svg class="fleuron ${cls}" viewBox="0 0 120 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
    <path d="M60 20c-8-12-22-14-30-6s-2 18 8 14 6-12-1-10" stroke-width="1.1"/>
    <path d="M60 20c8-12 22-14 30-6s2 18-8 14-6-12 1-10" stroke-width="1.1"/>
    <path d="M60 20c-14 6-30 8-46 2M60 20c14 6 30 8 46 2" stroke-width=".7"/>
    <path d="M60 8l4 12-4 12-4-12z" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="22" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="110" cy="22" r="1.6" fill="currentColor" stroke="none"/>
  </svg>`;
}

/** Selo de cera com monograma */
export function waxSeal(monogram) {
  const pts = [];
  const n = 64;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const wob = 1 + 0.045 * Math.sin(t * 7 + 1.3) + 0.03 * Math.sin(t * 13 + 0.4) + 0.02 * Math.cos(t * 5);
    pts.push([100 + Math.cos(t) * 88 * wob, 100 + Math.sin(t) * 88 * wob]);
  }
  return `<svg class="seal" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient id="wax" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="#b23a2a"/>
        <stop offset=".55" stop-color="#7d1d14"/>
        <stop offset="1" stop-color="#4a0e09"/>
      </radialGradient>
      <radialGradient id="waxIn" cx="60%" cy="65%" r="70%">
        <stop offset="0" stop-color="#5c120c"/>
        <stop offset="1" stop-color="#8e2619"/>
      </radialGradient>
      <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#2a0703" flood-opacity=".45"/>
      </filter>
    </defs>
    <path d="${pathFrom(pts)}" fill="url(#wax)" filter="url(#sealShadow)"/>
    <circle cx="100" cy="100" r="62" fill="url(#waxIn)"/>
    <circle cx="100" cy="100" r="62" fill="none" stroke="#c24a35" stroke-opacity=".5" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="54" fill="none" stroke="#3b0905" stroke-opacity=".6" stroke-width="1" stroke-dasharray="2 3"/>
    <text x="100" y="104" text-anchor="middle" dominant-baseline="middle" class="seal-mono">${monogram}</text>
    <ellipse cx="72" cy="62" rx="22" ry="10" fill="#fff" opacity=".12" transform="rotate(-30 72 62)"/>
  </svg>`;
}

/** Código de barras decorativo */
export function barcode(code = '9780202620260') {
  let x = 0;
  const bars = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 58; i++) {
    const w = rnd() > 0.6 ? 2.4 : 1.1;
    if (i % 2 === 0) bars.push(`<rect x="${f(x)}" y="0" width="${w}" height="${i < 3 || i > 54 || (i > 27 && i < 31) ? 46 : 40}"/>`);
    x += w + (rnd() > 0.5 ? 1.4 : 0.8);
  }
  return `<div class="barcode"><svg viewBox="0 0 ${f(x)} 46" preserveAspectRatio="none" aria-hidden="true" fill="currentColor">${bars.join('')}</svg><span>ISBN ${code.replace(/(\d{3})(\d)(\d{4})(\d{4})(\d)/, '$1-$2-$3-$4-$5')}</span></div>`;
}

/** Seta delicada para links */
export const arrow = `<svg class="arrow" viewBox="0 0 28 10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h26M21 1l5 4-5 4"/></svg>`;

/** Algarismos romanos */
export function roman(n) {
  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

/* ───────────── traços à mão (marginália) ───────────── */

/** Seta rabiscada à mão; `dir` controla para onde aponta */
export function handArrow(dir = 'left', cls = '') {
  const paths = {
    left: '<path d="M96 10c-18 2-44 8-62 20S8 52 6 54"/><path d="M6 54c6-1 13 0 18 2M6 54c1-6 4-12 7-16"/>',
    right: '<path d="M4 10c18 2 44 8 62 20s26 22 28 24"/><path d="M94 54c-6-1-13 0-18 2M94 54c-1-6-4-12-7-16"/>',
    down: '<path d="M10 4c6 14 10 30 30 44"/><path d="M40 48c-7 0-13-1-18-4M40 48c-2-6-2-12 0-17"/>',
    up: '<path d="M10 56c6-14 14-30 34-44"/><path d="M44 12c-7 1-13 3-17 6M44 12c-1 6-1 12 1 17"/>',
  };
  return `<svg class="hand-arrow ${cls}" viewBox="0 0 100 60" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths[dir]}</svg>`;
}

/** Círculo rabiscado (para envolver algo) */
export const handCircle = `<svg class="hand-circle" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path pathLength="1" d="M150 8C110 0 40 4 16 22S12 70 70 74s120-4 124-34S150 4 96 6"/></svg>`;

/** Sublinhado rabiscado */
export const handUnderline = `<svg class="hand-underline" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path pathLength="1" d="M3 9c40-6 90-7 130-4s50 3 64-1"/></svg>`;

/** Ilustração em traço: celular com o aviso de Shorts bloqueado */
export function phonePlate() {
  return `<svg class="phone-plate" viewBox="0 0 320 200" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <g class="ph-hatch" stroke-width=".6" opacity=".35">
      ${Array.from({ length: 26 }, (_, i) => `<path d="M${10 + i * 12} 196l40-40"/>`).join('')}
    </g>
    <rect x="112" y="14" width="96" height="176" rx="16" fill="var(--paper)" stroke-width="1.6"/>
    <rect x="119" y="30" width="82" height="146" rx="5" stroke-width="1"/>
    <path d="M150 22h20" stroke-width="1.6"/>
    <g class="ph-feed" stroke-width=".9" opacity=".55">
      <rect x="125" y="38" width="70" height="40" rx="3"/>
      <path d="M125 86h52M125 92h38"/>
      <rect x="125" y="102" width="70" height="40" rx="3"/>
      <path d="M125 150h46M125 156h30"/>
    </g>
    <g class="ph-play" stroke-width="1.4">
      <rect x="146" y="50" width="28" height="18" rx="5"/>
      <path d="M157 55v8l7-4z" fill="currentColor"/>
      <path d="M140 44l40 30" class="ph-strike" stroke-width="2.2"/>
    </g>
    <g class="ph-toast">
      <rect x="124" y="150" width="72" height="18" rx="9" fill="var(--ink)" stroke="none"/>
      <text x="160" y="162.5" text-anchor="middle" class="ph-toast-text">Shorts bloqueado</text>
    </g>
    <g stroke-width="1.1" opacity=".8">
      <path d="M60 60c10-8 24-10 34-4"/><path d="M94 56l-6-4M94 56l-5 6"/>
      <text x="22" y="54" class="ph-label">voltar ↩</text>
      <path d="M232 120c14 6 30 4 42-6"/><circle cx="282" cy="104" r="12"/><path d="M276 104l4 4 8-9"/>
      <text x="240" y="150" class="ph-label">banco ok</text>
    </g>
  </svg>`;
}

/** Fita adesiva (washi) */
export const tape = (cls = '') => `<span class="tape ${cls}" aria-hidden="true"></span>`;

/**
 * Caveira alada (desenho original): crânio com asas de penas em leque.
 * Usa currentColor — herda a prata da capa.
 */
export function wingedSkull(cls = '') {
  const cx = 120;
  const f = (n) => n.toFixed(1);
  // duas fileiras de penas: primárias longas e cobertas curtas por cima
  const row = (count, a0, a1, len0, len1, w0, base) =>
    Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const ang = (a0 + (a1 - a0) * t) * (Math.PI / 180);
      const len = len0 + (len1 - len0) * t;
      const w = w0 * (1 - t * 0.35);
      const [bx, by] = [base[0] - t * 6, base[1] - t * 8];
      const tx = bx - Math.cos(ang) * len;
      const ty = by - Math.sin(ang) * len;
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      const k1 = 0.35;
      const k2 = 0.8;
      const p1 = [bx + (tx - bx) * k1, by + (ty - by) * k1];
      const p2 = [bx + (tx - bx) * k2, by + (ty - by) * k2];
      return `<path d="M${f(bx)} ${f(by)} C${f(p1[0] + nx * w)} ${f(p1[1] + ny * w)} ${f(p2[0] + nx * w * 0.9)} ${f(p2[1] + ny * w * 0.9)} ${f(tx)} ${f(ty)} C${f(p2[0] - nx * w * 0.35)} ${f(p2[1] - ny * w * 0.35)} ${f(p1[0] - nx * w * 0.4)} ${f(p1[1] - ny * w * 0.4)} ${f(bx)} ${f(by)}Z"/>`;
    }).reverse().join('');
  const wing =
    row(8, -12, 62, 112, 60, 13, [98, 84]) +
    `<g class="ws-cov">${row(6, 0, 70, 58, 34, 11, [100, 78])}</g>`;
  return `<svg class="winged-skull ${cls}" viewBox="0 0 240 140" aria-hidden="true">
    <g class="ws-wing">${wing}</g>
    <g class="ws-wing" transform="translate(${cx * 2} 0) scale(-1 1)">${wing}</g>
    <g transform="translate(120 74) scale(1.32) translate(-120 -72)">
      <path class="ws-skull" fill-rule="evenodd" d="M120 38C139 38 151 51 151 68c0 11-5 18-9 22l-2 9c0 4-4 6-8 6h-24c-4 0-8-2-8-6l-2-9c-4-4-9-11-9-22 0-17 12-30 31-30Z
        M101 70c0-7 6-10 13-7 4 3 3 13-4 15-5 1-9-3-9-8Z
        M139 70c0-7-6-10-13-7-4 3-3 13 4 15 5 1 9-3 9-8Z
        M120 80l-4 8h8Z"/>
      <path class="ws-teeth" d="M107 96h26M111 91.5v12M115.5 91.5v13M120 91.5v13M124.5 91.5v13M129 91.5v12"/>
      <path class="ws-crack" d="M129 40l-3 8 4 5-2 6"/>
    </g>
  </svg>`;
}
