export const MAX_FILE_BYTES = 30 * 1024 * 1024;
export function validateFile(file) {
  if (file.size > MAX_FILE_BYTES) throw new Error('Cada foto debe ocupar menos de 30 MB.');
  if (!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) throw new Error('Usa JPG, PNG, WebP o HEIC.');
}
export async function prepareImage(file) {
  validateFile(file);
  let input = file;
  if (/\.(heic|heif)$/i.test(file.name)) {
    const { default: convert } = await import('heic2any');
    try { input = await convert({ blob: file, toType: 'image/jpeg', quality: 0.92 }); }
    catch { throw new Error('No se pudo convertir esta foto HEIC. Expórtala como JPG y vuelve a subirla.'); }
    if (Array.isArray(input)) input = input[0];
  }
  const url = URL.createObjectURL(input);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const ratio = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * ratio); canvas.height = Math.round(img.naturalHeight * ratio);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
    if (!blob) throw new Error('No se pudo procesar la imagen.');
    return { blob, width: canvas.width, height: canvas.height };
  } finally { URL.revokeObjectURL(url); }
}
