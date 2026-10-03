import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const reply = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const token = req.headers.get('Authorization')?.replace(/^Bearer /i, '') || '';
  const { data: identity, error: authError } = await admin.auth.getUser(token);
  if (authError || !identity.user) return reply({ error: 'Inicia sesión para continuar.' }, 401);
  const { data: membership } = await admin.from('site_admins').select('user_id').eq('user_id', identity.user.id).maybeSingle();
  if (!membership) return reply({ error: 'Solo los administradores pueden crear cuentas.' }, 403);
  try {
    const { email, password } = await req.json();
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 12) return reply({ error: 'Indica un correo válido y una contraseña de al menos 12 caracteres.' }, 400);
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) return reply({ error: error?.message || 'No se pudo crear la cuenta.' }, 400);
    const { error: grantError } = await admin.from('site_admins').insert({ user_id: data.user.id });
    if (grantError) { await admin.auth.admin.deleteUser(data.user.id); return reply({ error: 'No se pudieron asignar los permisos.' }, 500); }
    return reply({ email: data.user.email });
  } catch { return reply({ error: 'Solicitud no válida.' }, 400); }
});
