import sharp from 'sharp';

export const MAX_QRIS_BYTES = 5 * 1024 * 1024;
const MAX_QRIS_PIXELS = 20_000_000;

export async function prepareQrisImage(file: File): Promise<Buffer> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size === 0 || file.size > MAX_QRIS_BYTES) {
    throw new Error('Pilih gambar PNG, JPG, atau WebP maksimal 5 MB.');
  }

  const input = Buffer.from(await file.arrayBuffer());
  try {
    const image = sharp(input, { limitInputPixels: MAX_QRIS_PIXELS, failOn: 'error' });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height ||
      metadata.width * metadata.height > MAX_QRIS_PIXELS ||
      !['png', 'jpeg', 'webp'].includes(metadata.format)) {
      throw new Error('Format gambar QRIS tidak didukung.');
    }
    // Strip metadata and avoid lossy recompression so small QR modules remain scannable.
    return await image.rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  } catch {
    throw new Error('Gambar tidak valid atau terlalu besar untuk diproses.');
  }
}
