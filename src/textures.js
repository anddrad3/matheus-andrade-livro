/**
 * Texturas procedurais em SVG (filtros de turbulência),
 * injetadas como variáveis CSS. Zero imagens externas.
 */

const uri = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}")`;

// Grão de papel: fibras finas e irregulares
const paper = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
  <filter id="p" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 .2  0 0 0 0 .19  0 0 0 0 .18  0 0 0 -.75 .44"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#p)"/>
</svg>`;

// Fibras longas de papel (manchas suaves)
const mottle = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
  <filter id="m" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="11" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 .32  0 0 0 0 .3  0 0 0 0 .28  0 0 0 -.55 .3"/>
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
  [0.02, 0.02, 0.025], [0.05, 0.05, 0.06], [0.42, 0.03, 0.05], [0.62, 0.64, 0.68],
  [0.16, 0.16, 0.18], [0.01, 0.01, 0.012], [0.09, 0.09, 0.1], [0.55, 0.04, 0.06],
  [0.3, 0.02, 0.04], [0.03, 0.03, 0.035], [0.75, 0.77, 0.8], [0.07, 0.07, 0.08],
  [0.02, 0.02, 0.02], [0.38, 0.39, 0.42], [0.12, 0.12, 0.13],
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
    <feColorMatrix in="t" values=".045 0 0 0 .005  .044 0 0 0 .005  .05 0 0 0 .008  0 0 0 0 1" result="c"/>
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
    <feColorMatrix values="0 0 0 0 .92  0 0 0 0 .93  0 0 0 0 .96  0 0 0 .55 0"/>
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
