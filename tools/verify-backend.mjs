import { createClient } from '@supabase/supabase-js';
import { loadEnvFile } from 'node:process';
import { strict as check } from 'node:assert';
loadEnvFile('.env'); loadEnvFile('.env.testing');
const make = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = make(), reader = make(), anon = make();
const ok = result => { if (result.error) throw result.error; return result.data; };
ok(await admin.auth.signInWithPassword({ email:'lilly-admin-test@example.invalid', password:process.env.TEST_PASSWORD }));
ok(await reader.auth.signInWithPassword({ email:'lilly-reader-test@example.invalid', password:process.env.TEST_PASSWORD }));
const path = `tests/${crypto.randomUUID()}.png`;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
let id;
try {
  ok(await admin.storage.from('portfolio').upload(path,png,{contentType:'image/png'}));
  id=ok(await admin.from('photos').insert({category_slug:'weddings',storage_path:path,alt:'Backend test',width:1,height:1}).select().single()).id;
  check.equal(ok(await anon.from('photos').select('id').eq('id',id)).length,0);
  check.equal(ok(await reader.from('photos').select('id').eq('id',id)).length,0);
  check.ok((await anon.storage.from('portfolio').createSignedUrl(path,60)).error);
  check.ok((await reader.from('photos').insert({category_slug:'weddings',storage_path:'tests/forbidden.png',width:1,height:1})).error);
  check.equal(ok(await reader.from('photos').update({published:true}).eq('id',id).select()).length,0);
  check.ok((await reader.from('site_admins').insert({user_id:(await reader.auth.getUser()).data.user.id})).error);
  check.ok((await reader.storage.from('portfolio').upload('tests/forbidden.png',png,{contentType:'image/png'})).error);
  ok(await admin.from('photos').update({published:true}).eq('id',id));
  check.equal(ok(await anon.from('photos').select('id').eq('id',id)).length,1);
  check.ok(ok(await anon.storage.from('portfolio').createSignedUrl(path,60)).signedUrl);
  ok(await admin.rpc('set_photo_cover',{photo_id:id}));
  check.equal(ok(await admin.from('photos').select('is_cover').eq('id',id).single()).is_cover,true);
  check.ok((await reader.rpc('set_photo_cover',{photo_id:id})).error);
  const rejected=await reader.functions.invoke('manage-admin',{body:{email:'not-created@example.invalid',password:'never-created-123'}});
  check.ok(rejected.error);
  ok(await admin.from('photos').update({published:false,is_cover:false}).eq('id',id));
  check.equal(ok(await anon.from('photos').select('id').eq('id',id)).length,0);
  check.ok((await anon.storage.from('portfolio').createSignedUrl(path,60)).error);
  console.log('PASS: private drafts, public publication, hiding, cover RPC, storage permissions and privilege escalation.');
} finally {
  if(id)ok(await admin.from('photos').delete().eq('id',id));
  ok(await admin.storage.from('portfolio').remove([path]));
  await admin.auth.signOut(); await reader.auth.signOut();
}
