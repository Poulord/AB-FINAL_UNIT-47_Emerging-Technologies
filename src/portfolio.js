export const CATEGORY_SLUGS = ['weddings', 'lifestyle', 'personal-brands', 'wellness-retreats', 'content-creation'];
export const LAYOUTS = ['portrait span-3', 'portrait span-4', 'portrait span-6', 'landscape span-3', 'landscape span-4', 'landscape span-6'];
export const COLLECTION_TYPES = {
  weddings: { label: 'Boda', guidance: 'Crea un grupo por boda. Mantén juntas las fotos de la misma celebración.', zones: ['Zona principal · fondo claro', 'Zona secundaria · fondo oscuro'] },
  lifestyle: { label: 'Sesión', guidance: 'Puedes reunir todo en una selección o separar sesiones de familia, pareja o retrato cuando cuentan historias diferentes.', zones: ['Zona principal · fondo arcilla', 'Zona secundaria · fondo claro'] },
  'personal-brands': { label: 'Cliente / campaña', guidance: 'Agrupa por cliente o campaña para que no se mezclen identidades visuales distintas.', zones: ['Zona principal · fondo claro', 'Zona secundaria · fondo arcilla'] },
  'wellness-retreats': { label: 'Retiro', guidance: 'Un grupo por retiro o evento. Si todas las fotos pertenecen al mismo retiro, basta con un grupo.', zones: ['Zona principal · fondo claro', 'Zona secundaria · fondo arcilla'] },
  'content-creation': { label: 'Campaña', guidance: 'Usa un grupo por campaña o colaboración. En la zona principal las parejas se forman dentro de cada grupo; una foto suelta mantiene el mismo tamaño.', zones: ['Zona principal · parejas', 'Zona secundaria · bloque editorial granate'] }
};
export function collectionOptions(collections, category) {
  return collections.filter(g => g.category_slug === category)
    .sort((a,b) => a.section-b.section || a.position-b.position || a.id.localeCompare(b.id))
    .map(g => [g.id, `${g.name} · ${g.section === 0 ? 'Principal' : 'Secundaria'}`]);
}
export function collectionPhotos(photos, collections, category, section) {
  const selected = selectPhotos(photos, category, section);
  return collections.filter(g => g.category_slug === category && g.section === section)
    .sort((a,b) => a.position-b.position || a.id.localeCompare(b.id))
    .map(group => ({ group, photos: selected.filter(p => p.collection_id === group.id) }))
    .filter(group => group.photos.length);
}
export function selectPhotos(photos, category, section = 0) {
  return photos.filter(photo => photo.published && (category === 'all' || (photo.category_slug === category && photo.section === section)));
}
export function groupPairs(items) {
  const pairs = [];
  for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));
  return pairs;
}
export function renderPhotos(container, photos, urls) {
  const frames = photos.map(photo => {
    const frame = document.createElement('div');
    frame.className = `frame ${LAYOUTS.includes(photo.layout) ? photo.layout : 'portrait span-4'}`;
    const img = document.createElement('img'); img.src = urls.get(photo.storage_path); img.alt = photo.alt;
    img.loading = 'lazy'; img.decoding = 'async'; frame.append(img); return frame;
  });
  if (container.classList.contains('paired-stories')) {
    const pairs = groupPairs(frames).map(items => {
      const pair = document.createElement('div'); pair.className = items.length === 1 ? 'pair is-single' : 'pair';
      pair.append(...items); return pair;
    });
    container.replaceChildren(...pairs);
  } else container.replaceChildren(...frames);
  if (!frames.length && Number(container.dataset.section || 0) === 0) {
    const message = document.createElement('p'); message.className = 'portfolio-message'; message.textContent = 'New stories coming soon.'; container.append(message);
  }
}
export function renderCollections(container, photos, collections, urls) {
  const groups = collectionPhotos(photos, collections, container.dataset.portfolio, Number(container.dataset.section || 0));
  const gridClass = container.classList.contains('paired-stories') ? 'paired-stories' : 'series-grid';
  container.classList.add('grouped-gallery');
  const blocks = groups.map(({group, photos: items}) => {
    const block = document.createElement('div'); block.className = 'portfolio-group'; block.dataset.collection = group.id;
    if (group.title.trim()) { const heading = document.createElement('h3'); heading.className = 'collection-title'; heading.textContent = group.title; block.append(heading); }
    const grid = document.createElement('div'); grid.className = gridClass;
    renderPhotos(grid, items, urls); block.append(grid); return block;
  });
  container.replaceChildren(...blocks);
  if (!blocks.length && Number(container.dataset.section || 0) === 0) {
    const message = document.createElement('p'); message.className = 'portfolio-message'; message.textContent = 'New stories coming soon.'; container.append(message);
  }
  const zone = container.closest('section');
  // Large collections must not stay invisible when the reveal threshold cannot fit on screen.
  if (zone) { zone.classList.add('visible'); if (!zone.querySelector('h2, p')) zone.hidden = !blocks.length; }
}
