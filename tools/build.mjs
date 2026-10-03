import { build } from 'esbuild';
import { mkdir, copyFile, readFile, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { publicConfig } from './public-config.mjs';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
if (existsSync('.env')) loadEnvFile('.env');
// These defaults contain only the browser-safe project URL and publishable key.
const defaults = JSON.parse(await readFile(new URL('./public-supabase.json', import.meta.url), 'utf8'));
const config = publicConfig(process.env, defaults);
const root = resolve('.'); const output = resolve('dist');
if (output !== resolve(root, 'dist') || !output.startsWith(root + sep)) throw new Error('Unsafe build output path.');
await rm(output, { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
const pages = ['index.html','gallery.html','weddings.html','lifestyle.html','personal-brands.html','wellness-retreats.html','content-creation.html','contact.html','admin.html'];
const images = new Set(JSON.parse(await readFile('content-seed.json', 'utf8')).map(photo => photo.source));
for (const file of [...pages, 'styles.css', 'admin.css', 'script.js']) {
  await copyFile(file, `dist/${file}`);
  if (pages.includes(file)) {
    for (const match of (await readFile(file, 'utf8')).matchAll(/\bsrc="(img\/[^"]+)"/g)) images.add(match[1]);
  }
}
for (const src of images) {
  const image = decodeURIComponent(src); const source = resolve(image);
  if (!source.startsWith(resolve('img') + sep)) throw new Error('Invalid image path.');
  await mkdir(dirname(resolve('dist', image)), { recursive: true });
  await copyFile(source, resolve('dist', image));
}
await copyFile('content-seed.json', 'dist/content-seed.json');
await build({ entryPoints: ['src/admin.js', 'src/gallery.js'], bundle: true, minify: true, outdir: 'dist/assets', format: 'esm', splitting: true, define: { __SUPABASE_CONFIG__: JSON.stringify(config) } });
console.log(config.url ? 'Build configured for Supabase.' : 'Build ready. Supabase is pending; existing galleries remain visible.');
