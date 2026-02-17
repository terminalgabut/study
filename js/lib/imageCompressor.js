// root/js/lib/imageCompressor.js

export async function compressImage(
  file,
  {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.8,
    mimeType = 'image/webp'
  } = {}
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('File bukan gambar');
  }

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = objectUrl;
  });

  const canvas = document.createElement('canvas');
  let { width, height } = img;

  // resize dengan rasio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, mimeType, quality)
  );

  URL.revokeObjectURL(objectUrl);

  return new File([blob], 'avatar.webp', { type: mimeType });
}
