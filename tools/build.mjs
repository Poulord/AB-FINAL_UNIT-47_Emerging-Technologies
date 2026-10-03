import { build } from 'esbuild';
import { readdir, mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
if (existsSync('.env')) loadEnvFile('.env');
await mkdir('dist/assets', { recursive: true });
for (const file of await readdir('.')) {
  if (/\.(html|css)$/.test(file) || file === 'script.js') await copyFile(file, `dist/${file}`);
}
await cp('img', 'dist/img', { recursive: true });
await copyFile('content-seed.json', 'dist/content-seed.json');
const config = { url: process.env.SUPABASE_URL || '', key: process.env.SUPABASE_PUBLISHABLE_KEY || '' };
if (config.key && !/^(sb_publishable_|eyJ)/.test(config.key)) throw new Error('Use only a publishable or legacy anon key.');
if (config.key.startsWith('eyJ')) {
  const claims = JSON.parse(Buffer.from(config.key.split('.')[1], 'base64url').toString());
  if (claims.role !== 'anon') throw new Error('Secret/service role keys must never enter the browser.');
}
await build({ entryPoints: ['src/admin.js', 'src/gallery.js'], bundle: true, minify: true, outdir: 'dist/assets', format: 'esm', splitting: true, define: { __SUPABASE_CONFIG__: JSON.stringify(config) } });
await copyFile('vercel.json', 'dist/vercel.json');
console.log(config.url ? 'Build configured for Supabase.' : 'Build ready. Supabase is pending; existing galleries remain visible.');
