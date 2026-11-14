/**
 * Texturas procedurais em SVG (filtros de turbulência), em duas paletas:
 *  - light: edição clássica (couro castanho, papel creme, madeira quente, mármore verde e ouro)
 *  - dark:  Edição Sombria (ébano, papel osso, mármore preto, sangue e prata)
 * Cada uma é renderizada uma vez num canvas e vira PNG (blob): o navegador
 * só copia pixels, em vez de recalcular o filtro a cada quadro 3D.
 */

const P = {
  light: {
    paper: '0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 -.75 .44',
    mottle: '0 0 0 0 .5  0 0 0 0 .36  0 0 0 0 .18  0 0 0 -.55 .27',
    wood: '.34 0 0 0 .05  .21 0 0 0 .032  .12 0 0 0 .02  0 0 0 0 1',
    grain: '0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 0 0 .55 0',
    marble: [
      [0.07, 0.13, 0.11], [0.09, 0.17, 0.14], [0.35, 0.11, 0.08], [0.72, 0.58, 0.34],
      [0.74, 0.66, 0.5], [0.06, 0.1, 0.09], [0.12, 0.22, 0.18], [0.66, 0.52, 0.3],
      [0.42, 0.13, 0.09], [0.07, 0.12, 0.1], [0.66, 0.56, 0.38], [0.1, 0.19, 0.16],
      [0.05, 0.09, 0.08], [0.6, 0.47, 0.27], [0.11, 0.2, 0.17],
    ],
  },
  dark: {
    paper: '0 0 0 0 .2  0 0 0 0 .19  0 0 0 0 .18  0 0 0 -.75 .44',
    mottle: '0 0 0 0 .32  0 0 0 0 .3  0 0 0 0 .28  0 0 0 -.55 .3',
    wood: '.045 0 0 0 .005  .044 0 0 0 .005  .05 0 0 0 .008  0 0 0 0 1',
    grain: '0 0 0 0 .92  0 0 0 0 .93  0 0 0 0 .96  0 0 0 .55 0',
    marble: [
      [0.02, 0.02, 0.025], [0.05, 0.05, 0.06], [0.42, 0.03, 0.05], [0.62, 0.64, 0.68],
      [0.16, 0.16, 0.18], [0.01, 0.01, 0.012], [0.09, 0.09, 0.1], [0.55, 0.04, 0.06],
      [0.3, 0.02, 0.04], [0.03, 0.03, 0.035], [0.75, 0.77, 0.8], [0.07, 0.07, 0.08],
      [0.02, 0.02, 0.02], [0.38, 0.39, 0.42], [0.12, 0.12, 0.13],
    ],
  },
};

/** fontes SVG das texturas (usadas pelo gerador scripts/build-textures.mjs) */
export function textureSVGs(theme) {
  return svgs(P[theme]);
}

function svgs(p) {
  const ch = (i) => p.marble.map((c) => c[i]).join(' ');
  return {
    // grão de papel: fibras finas e irregulares
    '--tex-paper': [`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <filter id="p" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" stitchTiles="stitch"/>
        <feColorMatrix values="${p.paper}"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#p)"/>
    </svg>`, 300, 300],
    // fibras longas de papel (manchas suaves)
    '--tex-mottle': [`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <filter id="m" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="11" stitchTiles="stitch"/>
        <feColorMatrix values="${p.mottle}"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#m)"/>
    </svg>`, 600, 600],
    // grão de couro em relevo (iluminação difusa sobre ruído) — igual nos dois temas
    '--tex-leather': [`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <filter id="l" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="4" seed="2" stitchTiles="stitch" result="n"/>
        <feDiffuseLighting in="n" surfaceScale="2.4" lighting-color="#fff" diffuseConstant="1.1">
          <feDistantLight azimuth="225" elevation="48"/>
        </feDiffuseLighting>
        <feColorMatrix values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 0 1"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#l)"/>
    </svg>`, 400, 400],
    // papel marmorizado das guardas
    '--tex-marble': [`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900">
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
    </svg>`, 700, 900],
    // grão de filme para a tela inteira
    '--tex-grain': [`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
      <filter id="g" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix values="${p.grain}"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#g)"/>
    </svg>`, 220, 220],
    // tampo de madeira (veios esticados na horizontal)
    '--tex-wood': [`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">
      <filter id="w" x="0" y="0">
        <feTurbulence type="fractalNoise" baseFrequency=".0025 .09" numOctaves="4" seed="8" stitchTiles="stitch" result="t"/>
        <feColorMatrix in="t" values="${p.wood}" result="c"/>
        <feTurbulence type="fractalNoise" baseFrequency=".9 .02" numOctaves="2" seed="3" stitchTiles="stitch" result="f"/>
        <feColorMatrix in="f" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 .62" result="fa"/>
        <feComposite in="fa" in2="c" operator="over"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#w)"/>
    </svg>`, 1200, 600],
  };
}

const NAMES = ['paper', 'mottle', 'leather', 'marble', 'grain', 'wood'];
const cache = {};

/**
 * Carrega as texturas prontas do tema (public/tex/*.webp, geradas por
 * scripts/build-textures.mjs). A decodificação acontece fora da thread
 * principal; resolve quando todas estão prontas para pintar.
 */
function prepare(theme) {
  if (!cache[theme]) {
    cache[theme] = Promise.all(
      NAMES.map(async (n) => {
        // endereço absoluto: url() relativa dentro de variável CSS seria resolvida
        // a partir da pasta do CSS (assets/), não da página
        const url = new URL(`tex/${theme}-${n}.webp`, document.baseURI).href;
        const img = new Image();
        img.src = url;
        try {
          await img.decode();
        } catch {}
        return [`--tex-${n}`, `url("${url}")`];
      }),
    ).then(Object.fromEntries);
  }
  return cache[theme];
}

/** aplica as texturas do tema; resolve quando já estão prontas */
export async function applyTextures(theme) {
  const set = await prepare(theme);
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(set)) root.setProperty(k, v);
}

/** instala o tema atual */
export function installTextures(theme) {
  return applyTextures(theme);
}

/** baixa e decodifica as texturas de um tema sem aplicar (troca de tema instantânea) */
export function preloadTextures(theme) {
  return prepare(theme);
}
