import { createClient } from '@supabase/supabase-js';
const config = __SUPABASE_CONFIG__;
export const db = config.url && config.key ? createClient(config.url, config.key) : null;
export const bucket = 'portfolio';
export function assert(result) { if (result.error) throw result.error; return result.data; }
export async function imageUrls(photos) {
  const paths = [...new Set(photos.map(p => p.storage_path))];
  if (!paths.length) return new Map();
  const data = assert(await db.storage.from(bucket).createSignedUrls(paths, 3600));
  const urls = new Map(data.filter(x => x.signedUrl).map(x => [x.path, x.signedUrl]));
  if (urls.size !== paths.length) throw new Error('No se pudieron cargar todas las fotografías. Inténtalo de nuevo.');
  return urls;
}
