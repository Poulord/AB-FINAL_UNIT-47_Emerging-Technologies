import { db, bucket, assert, imageUrls } from './client.js';
import { prepareImage } from './images.js';
const $ = id => document.getElementById(id);
let categories = [], photos = [], pending = [], busy = false, recovery = false;
const previewUrls = [];
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : 'success'; }
function lock(value) {
  busy = value;
  document.querySelectorAll('#workspace button, #workspace input, #workspace select, #login-form button, #password-form button').forEach(el => { el.disabled = value; });
  $('upload').disabled = value || !pending.length;
}
async function action(fn) {
  if (busy) return;
  lock(true);
  try { await fn(); } catch (error) { status(error.message || 'No se pudo completar la operación.', true); }
  finally { lock(false); }
}
function node(tag, text, className) { const el = document.createElement(tag); if (text) el.textContent = text; if (className) el.className = className; return el; }
function field(label, input) { const el = node('label', label); el.append(input); return el; }
function input(value, type = 'text') { const el = node('input'); el.type = type; el.value = value; return el; }
function select(values, value) { const el = node('select'); values.forEach(([id, label]) => { const option = node('option', label); option.value = id; el.append(option); }); el.value = value; return el; }
async function loadPhotos() {
  const category = $('category').value;
  photos = assert(await db.from('photos').select('*').eq('category_slug', category).order('position').order('id'));
  const urls = await imageUrls(photos);
  $('category-name').value = categories.find(c => c.slug === category)?.name || '';
  $('photo-list').replaceChildren();
  if (!photos.length) $('photo-list').append(node('p', 'Todavía no hay fotografías en esta categoría.'));
  for (const photo of photos) {
    const card = node('article', '', 'photo-editor');
    const img = node('img'); img.src = urls.get(photo.storage_path); img.alt = photo.alt; img.loading = 'lazy'; card.append(img);
    card.append(node('span', photo.is_cover ? 'Publicada · Portada' : photo.published ? 'Publicada' : 'Borrador · Solo administradores', 'badge'));
    const alt = input(photo.alt); alt.maxLength = 500;
    const position = input(photo.position, 'number'); position.min = 0; position.step = 1;
    const categorySelect = select(categories.map(c => [c.slug, c.name]), photo.category_slug);
    const section = select([['0', 'Primera serie'], ['1', 'Segunda serie']], String(photo.section));
    const layout = select([['portrait span-3','Vertical pequeña'],['portrait span-4','Vertical mediana'],['portrait span-6','Vertical grande'],['landscape span-3','Horizontal pequeña'],['landscape span-4','Horizontal mediana'],['landscape span-6','Horizontal grande']], photo.layout);
    card.append(field('Descripción de la fotografía', alt), field('Orden (número menor primero)', position), field('Categoría', categorySelect), field('Serie', section), field('Composición', layout));
    const replacement = input('', 'file'); replacement.accept = 'image/jpeg,image/png,image/webp,.heic,.heif';
    card.append(field('Sustituir imagen (opcional)', replacement));
    const actions = node('div', '', 'actions');
    const addButton = (label, fn) => { const button = node('button', label, 'secondary'); button.type = 'button'; button.onclick = () => action(fn); actions.append(button); };
    addButton('Guardar cambios', async () => {
      let uploadedPath;
      const changes = { alt: alt.value.trim(), position: Number(position.value), category_slug: categorySelect.value, section: Number(section.value), layout: layout.value };
      if (!Number.isInteger(changes.position) || changes.position < 0) throw new Error('El orden debe ser un número entero positivo o cero.');
      if (categorySelect.value !== photo.category_slug) changes.is_cover = false;
      if (replacement.files[0]) {
        const prepared = await prepareImage(replacement.files[0]); uploadedPath = `uploads/${crypto.randomUUID()}.jpg`;
        assert(await db.storage.from(bucket).upload(uploadedPath, prepared.blob, { contentType: 'image/jpeg' }));
        Object.assign(changes, { storage_path: uploadedPath, width: prepared.width, height: prepared.height });
      }
      try { const result = assert(await db.from('photos').update(changes).eq('id', photo.id).select('id')); if (!result.length) throw new Error('No se guardó la fotografía. Comprueba tus permisos.'); }
      catch (error) { if (uploadedPath) await db.storage.from(bucket).remove([uploadedPath]); throw error; }
      if (uploadedPath) {
        const removed = await db.storage.from(bucket).remove([photo.storage_path]);
        if (removed.error) { status('Imagen sustituida. No se pudo limpiar el archivo anterior: ' + removed.error.message, true); await loadPhotos(); return; }
      }
      await loadPhotos(); status('Cambios guardados.');
    });
    addButton(photo.published ? 'Ocultar' : 'Publicar', async () => {
      if (!photo.published && !photo.alt.trim()) throw new Error('Guarda una descripción antes de publicar la fotografía.');
      const result = assert(await db.from('photos').update({ published: !photo.published, is_cover: false }).eq('id', photo.id).select('id'));
      if (!result.length) throw new Error('No se pudo cambiar la publicación.');
      await loadPhotos(); status(photo.published ? 'Fotografía oculta.' : 'Fotografía publicada. Ya aparece al abrir o recargar la web.');
    });
    if (photo.published && !photo.is_cover) addButton('Usar como portada', async () => { assert(await db.rpc('set_photo_cover', { photo_id: photo.id })); await loadPhotos(); status('Portada actualizada.'); });
    addButton('Eliminar', async () => {
      if (!confirm('¿Eliminar esta fotografía y su archivo? Esta acción no se puede deshacer.')) return;
      // Hide before removing the file; retain the row for retry if storage deletion fails.
      assert(await db.from('photos').update({ published: false, is_cover: false }).eq('id', photo.id));
      assert(await db.storage.from(bucket).remove([photo.storage_path]));
      assert(await db.from('photos').delete().eq('id', photo.id));
      await loadPhotos(); status('Fotografía eliminada.');
    });
    card.append(actions); $('photo-list').append(card);
  }
}
async function showSession(session) {
  $('login-panel').hidden = !!session;
  $('workspace').hidden = true; $('password-panel').hidden = !session || !recovery;
  if (!session || recovery) return false;
  const identity = assert(await db.auth.getUser());
  const membership = assert(await db.from('site_admins').select('user_id').eq('user_id', identity.user.id).maybeSingle());
  if (!membership) {
    await db.auth.signOut();
    $('photo-list').replaceChildren(); $('workspace').hidden = true; $('login-panel').hidden = false;
    status('Tu cuenta no tiene permisos para gestionar la web. Solicita acceso al propietario.', true); return false;
  }
  categories = assert(await db.from('categories').select('*').order('position'));
  $('category').replaceChildren(...categories.map(c => { const option = node('option', c.name); option.value = c.slug; return option; }));
  $('account').textContent = session.user.email;
  if (!$('own-password-form')) {
    const box = node('section', '', 'admin-box'); box.append(node('h2', 'Cambiar mi contraseña'));
    const form = node('form'); form.id = 'own-password-form';
    const password = input('', 'password'); password.minLength = 12; password.required = true; password.autocomplete = 'new-password';
    const button = node('button', 'Guardar contraseña');
    form.append(field('Nueva contraseña (mínimo 12 caracteres)', password), button);
    form.onsubmit = event => { event.preventDefault(); action(async () => { assert(await db.auth.updateUser({ password: password.value })); form.reset(); status('Contraseña actualizada.'); }); };
    box.append(form); $('workspace').append(box);
  }
  $('workspace').hidden = false;
  await loadPhotos();
  return true;
}
$('login-form').onsubmit = event => { event.preventDefault(); action(async () => {
  const form = new FormData(event.target);
  const data = assert(await db.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') }));
  event.target.reset(); if (await showSession(data.session)) status('Sesión iniciada.');
}); };
$('recover').onclick = () => action(async () => {
  const email = $('login-form').elements.email.value;
  if (!email) throw new Error('Escribe tu correo para recuperar la contraseña.');
  assert(await db.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin.html` }));
  status('Si el correo corresponde a una cuenta, recibirás instrucciones para recuperar el acceso.');
});
$('password-form').onsubmit = event => { event.preventDefault(); action(async () => {
  assert(await db.auth.updateUser({ password: new FormData(event.target).get('password') }));
  recovery = false; history.replaceState(null, '', location.pathname); location.reload();
}); };
$('logout').onclick = () => action(async () => { assert(await db.auth.signOut()); location.reload(); });
$('category').onchange = () => action(loadPhotos);
$('refresh').onclick = () => action(loadPhotos);
$('category-form').onsubmit = event => { event.preventDefault(); action(async () => {
  const name = $('category-name').value.trim(); if (!name) throw new Error('Escribe un nombre para la categoría.');
  const changed = assert(await db.from('categories').update({ name }).eq('slug', $('category').value).select('*'));
  if (!changed.length) throw new Error('No se pudo guardar la categoría.');
  const category = categories.find(c => c.slug === $('category').value); category.name = name;
  $('category').selectedOptions[0].textContent = name; status('Nombre de categoría actualizado.');
}); };
$('files').onchange = () => action(async () => {
  previewUrls.splice(0).forEach(URL.revokeObjectURL); pending = []; $('upload-previews').replaceChildren();
  for (const file of $('files').files) {
    try {
      const prepared = await prepareImage(file); const url = URL.createObjectURL(prepared.blob); previewUrls.push(url);
      const item = node('div'); const img = node('img'); img.src = url; img.alt = file.name;
      const description = input(file.name.replace(/\.[^.]+$/, '')); description.maxLength = 500;
      item.append(img, field('Descripción', description)); $('upload-previews').append(item);
      pending.push({ ...prepared, file, description });
    } catch (error) { status(`${file.name}: ${error.message}`, true); }
  }
});
$('upload').onclick = () => action(async () => {
  const category = $('category').value;
  let position = Math.max(-1, ...photos.map(p => p.position)) + 1;
  const failures = [];
  for (const [index, image] of [...pending].entries()) {
    $('upload-progress').textContent = `Subiendo ${index + 1} de ${pending.length}…`;
    const path = `uploads/${crypto.randomUUID()}.jpg`;
    try {
      if (!image.description.value.trim()) throw new Error('Añade una descripción.');
      assert(await db.storage.from(bucket).upload(path, image.blob, { contentType: 'image/jpeg', cacheControl: '3600' }));
      try { assert(await db.from('photos').insert({ category_slug: category, storage_path: path, alt: image.description.value.trim(), width: image.width, height: image.height, position: position++, layout: image.width > image.height ? 'landscape span-6' : 'portrait span-4' })); }
      catch (error) { await db.storage.from(bucket).remove([path]); throw error; }
      image.description.closest('div').remove();
    } catch (error) { failures.push(image); status(`${image.file.name}: ${error.message}`, true); }
  }
  pending = failures; $('upload-progress').textContent = failures.length ? `${failures.length} foto(s) pendientes. Puedes volver a intentarlo.` : 'Subida completada. Revisa las fotos y pulsa Publicar.';
  if (!failures.length) { $('files').value = ''; previewUrls.splice(0).forEach(URL.revokeObjectURL); status('Fotografías guardadas como borradores.'); }
  await loadPhotos();
});
$('import').onclick = () => action(async () => {
  if (!confirm('¿Importar y publicar las fotografías del portfolio actual? Las ya importadas se omitirán.')) return;
  const response = await fetch('content-seed.json'); if (!response.ok) throw new Error('No se pudo cargar el portfolio inicial.');
  const seed = await response.json();
  const existing = new Set(assert(await db.from('photos').select('storage_path')).map(p => p.storage_path));
  for (const [index, photo] of seed.entries()) {
    if (existing.has(photo.storage_path)) continue;
    $('upload-progress').textContent = `Importando ${index + 1} de ${seed.length}…`;
    const fetched = await fetch(photo.source); if (!fetched.ok) throw new Error(`No se encontró ${photo.source}`);
    const prepared = await prepareImage(new File([await fetched.blob()], 'portfolio.jpg', { type: 'image/jpeg' }));
    assert(await db.storage.from(bucket).upload(photo.storage_path, prepared.blob, { contentType: 'image/jpeg', upsert: true }));
    const { source, ...row } = photo;
    const result = await db.from('photos').insert({ ...row, width: prepared.width, height: prepared.height });
    if (result.error) { await db.storage.from(bucket).remove([photo.storage_path]); throw result.error; }
  }
  await loadPhotos(); $('upload-progress').textContent = ''; status('Portfolio importado.');
});
$('admin-form').onsubmit = event => { event.preventDefault(); action(async () => {
  const fields = new FormData(event.target);
  const result = await db.functions.invoke('manage-admin', { body: { email: fields.get('email'), password: fields.get('password') } });
  if (result.error) {
    let message = result.error.message;
    try { message = (await result.error.context.json()).error || message; } catch {}
    throw new Error(message);
  }
  if (result.data.error) throw new Error(result.data.error);
  event.target.reset(); status(`Cuenta administradora creada para ${result.data.email}.`);
}); };
if (!db) {
  status('El entorno todavía no tiene conexión con Supabase. Configura el proyecto antes de iniciar sesión.', true);
  $('login-form').querySelectorAll('input,button').forEach(el => { el.disabled = true; });
} else {
  recovery = /type=(recovery|invite)/.test(location.hash);
  db.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { recovery = true; $('workspace').hidden = true; $('login-panel').hidden = true; $('password-panel').hidden = false; }
    if (event === 'SIGNED_OUT') { $('workspace').hidden = true; $('login-panel').hidden = false; $('photo-list').replaceChildren(); }
  });
  action(async () => { const data = assert(await db.auth.getSession()); await showSession(data.session); });
}
