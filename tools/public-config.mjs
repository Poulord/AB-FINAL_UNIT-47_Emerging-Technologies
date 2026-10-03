export function publicConfig(env, defaults = {}) {
  let url = env.SUPABASE_URL || '', key = env.SUPABASE_PUBLISHABLE_KEY || '';
  if (!url && !key) { url = defaults.url || ''; key = defaults.key || ''; }
  if (!url && !key) {
    if (env.VERCEL === '1') throw new Error('Supabase configuration is required for deployment.');
    return { url: '', key: '' };
  }
  if (!url || !key) throw new Error('Configure both Supabase URL and publishable key.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error('Supabase URL must be an HTTPS origin.');
  if (key.startsWith('sb_publishable_') && /^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return { url: parsed.origin, key };
  if (key.startsWith('eyJ')) {
    const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    if (claims.role === 'anon') return { url: parsed.origin, key };
  }
  throw new Error('Only publishable or legacy anon keys can be sent to the browser.');
}
