import { db, assert, imageUrls } from './client.js';
import { CATEGORY_SLUGS, selectPhotos, renderPhotos } from './portfolio.js';
async function refreshPortfolio() {
  if (!db) return;
  const categories = assert(await db.from('categories').select('*').order('position'));
  const current = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  const fields = 'id,category_slug,storage_path,alt,layout,section,position,published,is_cover';
  let query = db.from('photos').select(fields).eq('published', true).order('position').order('id');
  if (CATEGORY_SLUGS.includes(current)) query = query.or(`category_slug.eq.${current},is_cover.eq.true`);
  else if (current !== 'gallery') query = query.eq('is_cover', true);
  const photos = assert(await query);
  const urls = await imageUrls(photos);
  for (const category of categories) {
    const cover = photos.find(p => p.category_slug === category.slug && p.is_cover);
    document.querySelectorAll(`a[href="${category.slug}.html"]`).forEach(link => {
      const caption = link.querySelector('.photo-caption');
      if (caption) caption.textContent = category.name;
      const image = link.querySelector('img');
      if (image && cover) { image.src = urls.get(cover.storage_path); image.alt = cover.alt; }
      if (link.closest('.site-nav')) link.textContent = category.name;
    });
    if (current === category.slug) {
      const heading = document.querySelector('.hero-title'); if (heading) heading.textContent = category.name;
      const image = document.querySelector('.hero-media img'); if (image && cover) { image.src = urls.get(cover.storage_path); image.alt = cover.alt; }
    }
  }
  document.querySelectorAll('[data-portfolio]').forEach(container => {
    const category = container.dataset.portfolio;
    const section = Number(container.dataset.section || 0);
    renderPhotos(container, selectPhotos(photos, category, section), urls);
  });
}
refreshPortfolio().catch(error => {
  document.querySelectorAll('[data-portfolio]').forEach(container => {
    const message = document.createElement('p'); message.className = 'portfolio-message'; message.textContent = 'The gallery is temporarily unavailable. Please try again shortly.';
    container.replaceChildren(message);
  });
  console.warn('Portfolio unavailable.', error.message);
});
