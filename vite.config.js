import { createHash } from 'node:crypto';
import { defineConfig } from 'vite';

/**
 * O CSS principal (≈25 KB) deixa de bloquear a primeira pintura: um
 * <link rel="preload"> começa o download na hora e um script insere a folha
 * (que não bloqueia) avisando o livro quando ela chega. Enquanto isso, o estilo
 * mínimo da tela de entrada (monograma) já vem embutido no index.html, então a
 * página pinta na hora; o resto do site só aparece depois que o CSS chega
 * (o JS espera window.__cssReady).
 *
 * Por fim, gera a Content-Security-Policy: só rodam os scripts do próprio site
 * e os scripts embutidos cujo hash SHA-256 está na política (nada injetado).
 */
const asyncCss = () => ({
  name: 'livro-async-css',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler: (html, ctx) => {
      // o texto do idioma em uso começa a baixar junto com o JS principal (sem esperar por ele)
      const files = Object.keys(ctx.bundle || {});
      const pt = files.find((f) => /content\.pt-.*\.js$/.test(f));
      const en = files.find((f) => /content\.en-.*\.js$/.test(f));
      const hint = pt && en
        ? `<script>(function(){var k=document.createElement('link');k.rel='modulepreload';k.crossOrigin='';k.href='./'+(document.documentElement.dataset.lang==='en'?'${en}':'${pt}');document.head.appendChild(k);})();</script>\n    `
        : '';
      html = html
        .replace('<script type="module"', `${hint}<script type="module"`)
        .replace(/<link rel="stylesheet" crossorigin href="([^"]+\.css)">/, (_, href) =>
          `<link rel="preload" as="style" crossorigin href="${href}">\n    ` +
          `<script>(function(){var l=document.createElement('link');l.rel='stylesheet';l.crossOrigin='';l.href='${href}';l.onload=function(){window.__css&&window.__css()};document.head.appendChild(l);})();</script>\n    ` +
          `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`,
        );
      return withCsp(html);
    },
  },
});

/** insere a CSP (meta) com o hash de cada <script> embutido da página final */
function withCsp(html) {
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, code]) => `'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`,
  );
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "connect-src 'self' https://api.github.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return html.replace(/(<meta charset="UTF-8" \/>)/, `$1\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`);
}

export default defineConfig({
  // caminhos relativos: funciona no GitHub Pages em qualquer nome de repositório
  base: './',
  plugins: [asyncCss()],
  build: {
    // es2022: permite carregar só o idioma usado (await no topo do módulo)
    target: 'es2022',
    cssMinify: true,
  },
});
