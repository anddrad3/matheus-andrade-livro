/**
 * Recomprime as texturas de public/tex (depois de scripts/build-textures.mjs).
 *
 * O canvas do navegador só sabe gravar WebP com o canal alfa sem perdas — e o
 * grão, o papel e as manchas são justamente só alfa (a cor é lisa). Aqui o alfa
 * passa a ser comprimido com perdas e as texturas opacas perdem o canal alfa
 * inútil. Diferença média por pixel < 3/255 (invisível num ruído), arquivos
 * 40–55% menores.
 *
 * Uso:  node scripts/compress-textures.mjs   (requer a devDependency "sharp")
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = join(process.cwd(), 'public/tex');

// nome (sem tema) → como gravar
const RULES = {
  grain: { alpha: true, quality: 50, alphaQuality: 40 },
  paper: { alpha: true, quality: 50, alphaQuality: 40 },
  mottle: { alpha: true, quality: 50, alphaQuality: 40 },
  marble: { alpha: true, quality: 65, alphaQuality: 60 },
  leather: { alpha: false, quality: 75 },
  wood: { alpha: false, quality: 72 },
};

for (const file of await readdir(dir)) {
  const m = /^(light|dark)-(\w+)\.webp$/.exec(file);
  const rule = m && RULES[m[2]];
  if (!rule) continue;
  const path = join(dir, file);
  const input = await readFile(path);
  let img = sharp(input);
  if (!rule.alpha) img = img.removeAlpha();
  const out = await img.webp({ quality: rule.quality, alphaQuality: rule.alphaQuality ?? 100, effort: 6 }).toBuffer();
  if (out.length >= input.length) {
    console.log(`= ${file} (já está menor: ${input.length} B)`);
    continue;
  }
  await writeFile(path, out);
  console.log(`✓ ${file}: ${input.length} → ${out.length} B`);
}
