/**
 * Texturas procedurais em SVG (filtros de turbulência),
 * injetadas como variáveis CSS. Zero imagens externas.
 */

const uri = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}")`;

// Grão de papel: fibras finas e irregulares
const paper = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <filter id="p" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 -.75 .44"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#p)"/>
</svg>`;

// Fibras longas de papel (manchas suaves)
const mottle = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
  <filter id="m" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="11" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .36  0 0 0 0 .18  0 0 0 -.55 .27"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#m)"/>
</svg>`;

// Grão de couro em relevo (iluminação difusa sobre ruído)
const leather = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <filter id="l" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="4" seed="2" stitchTiles="stitch" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="2.4" lighting-color="#fff" diffuseConstant="1.1">
      <feDistantLight azimuth="225" elevation="48"/>
    </feDiffuseLighting>
    <feColorMatrix values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#l)"/>
</svg>`;

// Papel marmorizado das guardas
const palette = [
  [0.07, 0.13, 0.11], [0.09, 0.17, 0.14], [0.35, 0.11, 0.08], [0.72, 0.58, 0.34],
  [0.74, 0.66, 0.5], [0.06, 0.1, 0.09], [0.12, 0.22, 0.18], [0.66, 0.52, 0.3],
  [0.42, 0.13, 0.09], [0.07, 0.12, 0.1], [0.66, 0.56, 0.38], [0.1, 0.19, 0.16],
  [0.05, 0.09, 0.08], [0.6, 0.47, 0.27], [0.11, 0.2, 0.17],
];
const ch = (i) => palette.map((c) => c[i]).join(' ');
const marble = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900">
  <filter id="mb" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".0045 .011" numOctaves="5" seed="23" result="t"/>
    <feDisplacementMap in="t" in2="t" scale="120" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feColorMatrix in="d" values="1.3 0 0 0 -.15  1.3 0 0 0 -.15  1.3 0 0 0 -.15  0 0 0 0 1"/>
    <feComponentTransfer>
      <feFuncR type="discrete" tableValues="${ch(0)}"/>
      <feFuncG type="discrete" tableValues="${ch(1)}"/>
      <feFuncB type="discrete" tableValues="${ch(2)}"/>
    </feComponentTransfer>
    <feGaussianBlur stdDeviation="1.1"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#mb)"/>
</svg>`;

// Tampo de madeira escura (veios esticados na horizontal)
const wood = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">
  <filter id="w" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".0025 .09" numOctaves="4" seed="8" stitchTiles="stitch" result="t"/>
    <feColorMatrix in="t" values=".34 0 0 0 .05  .21 0 0 0 .032  .12 0 0 0 .02  0 0 0 0 1" result="c"/>
    <feTurbulence type="fractalNoise" baseFrequency=".9 .02" numOctaves="2" seed="3" stitchTiles="stitch" result="f"/>
    <feColorMatrix in="f" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 .62" result="fa"/>
    <feComposite in="fa" in2="c" operator="over"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#w)"/>
</svg>`;

// Grão de filme para a tela inteira
const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
  <filter id="g" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 0 0 .55 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#g)"/>
</svg>`;

const TEXTURES = {
  '--tex-paper': [paper, 300, 300],
  '--tex-mottle': [mottle, 600, 600],
  '--tex-leather': [leather, 400, 400],
  '--tex-marble': [marble, 700, 900],
  '--tex-grain': [grain, 220, 220],
  '--tex-wood': [wood, 1200, 600],
};

/**
 * Os filtros SVG são lindos, mas caros: o navegador os recalcula sempre que
 * a cena 3D muda de escala. Aqui cada textura é renderizada UMA vez num
 * canvas e vira um PNG (blob) — o navegador passa a só copiar pixels.
 * Se algo falhar (ex.: canvas bloqueado), fica o SVG original.
 */
function rasterize(svg, w, h) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob((blob) => resolve(blob ? `url("${URL.createObjectURL(blob)}")` : null), 'image/png');
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
  });
}

/** instala as texturas; a promessa resolve quando todas viraram bitmap */
export function installTextures() {
  const root = document.documentElement.style;
  return Promise.all(
    Object.entries(TEXTURES).map(async ([name, [svg, w, h]]) => {
      const bitmap = await rasterize(svg, w, h);
      root.setProperty(name, bitmap ?? uri(svg));
    }),
  );
}
