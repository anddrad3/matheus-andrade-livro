/**
 * Gera as texturas do livro como WebP (public/tex/<tema>-<nome>.webp).
 * As fontes são os filtros SVG de src/textures.js; renderizar aqui, uma vez,
 * poupa o celular de quem visita (antes eram ~600 ms de processador ao abrir).
 *
 * Uso:  npx -y playwright-core@1 ... (requer Edge ou Chrome instalado)
 *       node scripts/build-textures.mjs
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const server = createServer(async (req, res) => {
  try {
    const body = await readFile(join(root, decodeURIComponent(req.url.split('?')[0])));
    res.writeHead(200, { 'content-type': extname(req.url) === '.js' ? 'text/javascript' : 'text/html' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(4199);

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:4199/index.html');
const out = await page.evaluate(async () => {
  const { textureSVGs } = await import('/src/textures.js');
  const result = {};
  for (const theme of ['light', 'dark']) {
    for (const [name, [svg, w, h]] of Object.entries(textureSVGs(theme))) {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
      await img.decode();
      const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      result[`${theme}-${name.replace('--tex-', '')}`] = c.toDataURL('image/webp', 0.86);
    }
  }
  return result;
});
await mkdir(join(root, 'public/tex'), { recursive: true });
for (const [k, url] of Object.entries(out)) {
  await writeFile(join(root, 'public/tex', `${k}.webp`), Buffer.from(url.split(',')[1], 'base64'));
  console.log('✓', k);
}
await browser.close();
server.close();
