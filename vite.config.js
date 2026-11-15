import { defineConfig } from 'vite';

/**
 * O CSS principal (≈25 KB) deixa de bloquear a primeira pintura: vira um
 * <link rel="preload"> que se aplica sozinho ao chegar. Enquanto isso, o estilo
 * mínimo da tela de entrada (monograma) já vem embutido no index.html, então a
 * página pinta na hora; o resto do site só aparece depois que o CSS chega
 * (o JS espera window.__cssReady).
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
      return html
        .replace('<script type="module"', `${hint}<script type="module"`)
        .replace(/<link rel="stylesheet" crossorigin href="([^"]+\.css)">/, (_, href) =>
          `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet';window.__css&&window.__css()">\n    <noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`,
        );
    },
  },
});

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
