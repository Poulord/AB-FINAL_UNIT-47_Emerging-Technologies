import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { publicConfig } from '../tools/public-config.mjs';
const url = 'https://test.supabase.co';
const jwt = role => `eyJ.${Buffer.from(JSON.stringify({role})).toString('base64url')}.signature`;
test('Only public configuration reaches the browser', () => {
  for(const key of ['sb_secret_private',jwt('service_role'),jwt('authenticated'),'unknown', 'sb_publishable_x\n<script>']) assert.throws(()=>publicConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:key}));
  assert.equal(publicConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_public'}).url,url);
  assert.equal(publicConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:jwt('anon')}).key,jwt('anon'));
  for(const invalid of ['http://test.supabase.co','https://user:password@test.supabase.co','https://test.supabase.co?secret=x']) assert.throws(()=>publicConfig({SUPABASE_URL:invalid,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_public'}));
  assert.throws(()=>publicConfig({SUPABASE_URL:url})); assert.throws(()=>publicConfig({VERCEL:'1'}));
});
