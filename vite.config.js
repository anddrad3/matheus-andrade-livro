import { defineConfig } from 'vite';

export default defineConfig({
  // caminhos relativos: funciona no GitHub Pages em qualquer nome de repositório
  base: './',
  build: {
    target: 'es2020',
    cssMinify: true,
  },
});
