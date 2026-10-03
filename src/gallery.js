import { db, assert, imageUrls } from './client.js';
async function refreshPortfolio() {
  if (!db) return;
  const categories = assert(await db.from('categories').select('*').order('position'));
  const photos = assert(await db.from('photos').select('*').eq('published', true).order('position').order('id'));
  const urls = await imageUrls(photos);
  const current = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
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
    const selected = category === 'all' ? photos : photos.filter(p => p.category_slug === category && p.section === section);
    const frames = selected.map(photo => {
      const frame = document.createElement('div'); frame.className = `frame ${photo.layout}`;
      const img = document.createElement('img'); img.src = urls.get(photo.storage_path); img.alt = photo.alt; img.loading = 'lazy'; img.decoding = 'async';
      frame.append(img); return frame;
    });
    if (container.classList.contains('paired-stories')) {
      const pairs = [];
      for (let i = 0; i < frames.length; i += 2) {
        const pair = document.createElement('div'); pair.className = 'pair'; pair.append(...frames.slice(i, i + 2)); pairs.push(pair);
      }
      container.replaceChildren(...pairs);
    } else container.replaceChildren(...frames);
    if (!frames.length && section === 0) { const text = document.createElement('p'); text.textContent = 'New stories coming soon.'; container.append(text); }
  });
}
refreshPortfolio().catch(error => {
  document.querySelectorAll('[data-portfolio]').forEach(container => {
    const message = document.createElement('p'); message.textContent = 'The gallery is temporarily unavailable. Please try again shortly.';
    container.replaceChildren(message);
  });
  console.warn('Portfolio unavailable.', error.message);
});
