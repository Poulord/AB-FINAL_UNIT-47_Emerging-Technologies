import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
const tracked = execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbidden = /(^|\/)(node_modules|dist|output|qa|\.vercel|\.playwright-cli|coverage)(\/|$)|(^|\/)\.env($|\.)|\.(pem|key|log)$/;
for(const file of tracked) {
  if(file !== '.env.example' && forbidden.test(file)) throw new Error(`Private/generated file tracked: ${file}`);
  if(!/\.(js|mjs|ts|json|html|css|md|MD)$/.test(file)) continue;
  const content = await readFile(file,'utf8');
  if(/sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{30,}/.test(content)) throw new Error(`Potential secret in ${file}`);
  for(const [token] of content.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
    try { const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url')); if(claims.role==='service_role') throw new Error(`Privileged JWT in ${file}`); } catch(error) { if(error.message.startsWith('Privileged JWT')) throw error; }
  }
}
async function inspect(directory) {
  for(const name of await readdir(directory)) {
    const file=directory+'/'+name; if((await stat(file)).isDirectory()) { await inspect(file); continue; }
    const rel=file.slice(5);
    if(!/^(assets\/[^/]+\.js|img\/.+\.(jpg|jpeg|png|webp|mp4)|(?:index|gallery|weddings|lifestyle|personal-brands|wellness-retreats|content-creation|contact|admin)\.html|(?:styles|admin)\.css|script\.js|content-seed\.json)$/i.test(rel)) throw new Error(`Unexpected deployment file: ${rel}`);
    if(/\.js$/.test(file) && /sb_secret_[A-Za-z0-9_-]{20,}/.test(await readFile(file,'utf8'))) throw new Error('Secret in browser bundle');
  }
}
await inspect('dist');
console.log('PASS: Git files and deployment allowlist; no detected credentials or privileged keys.');
