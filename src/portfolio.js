export const CATEGORY_SLUGS = ['weddings', 'lifestyle', 'personal-brands', 'wellness-retreats', 'content-creation'];
export const LAYOUTS = ['portrait span-3', 'portrait span-4', 'portrait span-6', 'landscape span-3', 'landscape span-4', 'landscape span-6'];
export function selectPhotos(photos, category, section = 0) {
  return photos.filter(photo => photo.published && (category === 'all' || (photo.category_slug === category && photo.section === section)));
}
export function renderPhotos(container, photos, urls) {
  const frames = photos.map(photo => {
    const frame = document.createElement('div');
    frame.className = `frame ${LAYOUTS.includes(photo.layout) ? photo.layout : 'portrait span-4'}`;
    const img = document.createElement('img'); img.src = urls.get(photo.storage_path); img.alt = photo.alt;
    img.loading = 'lazy'; img.decoding = 'async'; frame.append(img); return frame;
  });
  container.replaceChildren(...frames);
  if (!frames.length && Number(container.dataset.section || 0) === 0) {
    const message = document.createElement('p'); message.className = 'portfolio-message'; message.textContent = 'New stories coming soon.'; container.append(message);
  }
}
