import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { MAX_QRIS_BYTES, prepareQrisImage } from '../src/lib/qris-image';

test('QRIS PNG is processed without lossy compression and metadata', async () => {
  const source = await sharp({ create: { width: 500, height: 500, channels: 3, background: '#ffffff' } })
    .png().withMetadata({ density: 300 }).toBuffer();
  const output = await prepareQrisImage(new File([source], 'qris.png', { type: 'image/png' }));
  const info = await sharp(output).metadata();
  assert.equal(info.format, 'png');
  assert.equal(info.width, 500);
  assert.equal(info.height, 500);
  assert.equal(info.exif, undefined);
});

test('QRIS image rejects invalid, spoofed and oversized files', async () => {
  await assert.rejects(prepareQrisImage(new File(['not an image'], 'qris.png', { type: 'image/png' })));
  await assert.rejects(prepareQrisImage(new File(['x'], 'qris.svg', { type: 'image/svg+xml' })));
  await assert.rejects(prepareQrisImage(new File([new Uint8Array(MAX_QRIS_BYTES + 1)], 'large.png', { type: 'image/png' })));
});
