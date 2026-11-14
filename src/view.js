/**
 * Tela "virtual" do livro.
 *
 * No celular em pé, tocar na página deita o livro (gira 90° o palco) para as
 * duas páginas caberem — a pessoa só vira o aparelho. Nesse modo a largura
 * do livro corre ao longo da altura da tela, então toques e medidas precisam
 * ser convertidos para as coordenadas do palco girado.
 *
 * Palco girado +90° (horário), com origem no canto superior direito:
 *   ponto do palco (u, v)  →  tela (x, y) = (larguraTela − v, u)
 *   tela (x, y)            →  palco (u, v) = (y, larguraTela − x)
 */
export const view = { lying: false, double: false };

/** largura e altura que o livro "enxerga" */
export const vw = () => (view.lying ? window.innerHeight : window.innerWidth);
export const vh = () => (view.lying ? window.innerWidth : window.innerHeight);

/** ponto da tela → ponto do palco */
export function vpt(x, y) {
  return view.lying ? { x: y, y: window.innerWidth - x } : { x, y };
}

/** retângulo na tela → retângulo no palco */
export function vrect(el) {
  const r = el.getBoundingClientRect();
  if (!view.lying) return r;
  const left = r.top;
  const top = window.innerWidth - r.right;
  return { left, top, width: r.height, height: r.width, right: left + r.height, bottom: top + r.width };
}

/** celular (toque, tela pequena) — independe de estar em pé ou deitado */
export function isPhone() {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return coarse && Math.min(window.innerWidth, window.innerHeight) < 640;
}
