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
  [0.9, 0.85, 0.74], [0.06, 0.1, 0.09], [0.12, 0.22, 0.18], [0.66, 0.52, 0.3],
  [0.42, 0.13, 0.09], [0.07, 0.12, 0.1], [0.86, 0.8, 0.68], [0.1, 0.19, 0.16],
  [0.05, 0.09, 0.08], [0.6, 0.47, 0.27], [0.11, 0.2, 0.17],
];
const ch = (i) => palette.map((c) => c[i]).join(' ');
const marble = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900">
  <filter id="mb" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".0045 .011" numOctaves="5" seed="23" result="t"/>
    <feDisplacementMap in="t" in2="t" scale="160" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feColorMatrix in="d" values="1.6 0 0 0 -.3  1.6 0 0 0 -.3  1.6 0 0 0 -.3  0 0 0 0 1"/>
    <feComponentTransfer>
      <feFuncR type="discrete" tableValues="${ch(0)}"/>
      <feFuncG type="discrete" tableValues="${ch(1)}"/>
      <feFuncB type="discrete" tableValues="${ch(2)}"/>
    </feComponentTransfer>
    <feGaussianBlur stdDeviation=".6"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#mb)"/>
</svg>`;

// Grão de filme para a tela inteira
const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
  <filter id="g" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 0 0 .55 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#g)"/>
</svg>`;

export function installTextures() {
  const root = document.documentElement.style;
  root.setProperty('--tex-paper', uri(paper));
  root.setProperty('--tex-mottle', uri(mottle));
  root.setProperty('--tex-leather', uri(leather));
  root.setProperty('--tex-marble', uri(marble));
  root.setProperty('--tex-grain', uri(grain));
}
