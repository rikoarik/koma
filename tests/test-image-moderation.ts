import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { after, before, test } from 'node:test';
import sharp from 'sharp';
import { moderateImage } from '../src/lib/image-moderation';
import { isAllowedImage, signImageUpload } from '../src/lib/image-upload';

const original = {
  AI_IMAGE_MODERATION_API_KEY: process.env.AI_IMAGE_MODERATION_API_KEY,
  AI_IMAGE_MODERATION_BASE_URL: process.env.AI_IMAGE_MODERATION_BASE_URL,
  AI_IMAGE_MODERATION_MODEL: process.env.AI_IMAGE_MODERATION_MODEL,
  IMAGE_UPLOAD_SIGNING_SECRET: process.env.IMAGE_UPLOAD_SIGNING_SECRET,
};

let server: Server;
let baseURL: string;
let visionDecision: 'safe' | 'unsafe' | 'uncertain' = 'safe';
let providerFails = false;
let visionGarbage = false;
let requestCount = 0;
let receivedWebp = false;

before(async () => {
  server = createServer(async (req, res) => {
    const parts: Buffer[] = [];
    for await (const part of req) parts.push(Buffer.from(part));
    const payload = JSON.parse(Buffer.concat(parts).toString()) as {
      input?: Array<{ image_url: { url: string } }>;
      messages?: Array<{ content: Array<{ image_url?: { url: string } }> }>;
    };
    requestCount += 1;
    receivedWebp = (payload.input?.[0]?.image_url.url || payload.messages?.[1]?.content?.[1]?.image_url?.url || '').startsWith('data:image/webp;base64,');
    res.setHeader('content-type', 'application/json');
    if (providerFails) { res.statusCode = 503; res.end('{}'); return; }
    if (req.url === '/chat/completions') res.end(JSON.stringify({ choices: [{ message: { content: visionGarbage ? 'I could not read that.' : JSON.stringify({ decision: visionDecision, category: visionDecision === 'safe' ? 'none' : 'personal_data' }) } }] }));
    else { res.statusCode = 404; res.end('{}'); }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseURL = `http://127.0.0.1:${address.port}`;
  process.env.AI_IMAGE_MODERATION_API_KEY = 'test-only';
  process.env.AI_IMAGE_MODERATION_BASE_URL = baseURL;
  process.env.AI_IMAGE_MODERATION_MODEL = 'vision-test';
  process.env.IMAGE_UPLOAD_SIGNING_SECRET = 'test-only-signing-key';
});

after(async () => {
  for (const [name, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function imageFile(): Promise<File> {
  const data = await sharp({ create: { width: 24, height: 24, channels: 3, background: '#f7f4ee' } }).png().toBuffer();
  return new File([data], 'image.png', { type: 'image/png' });
}

test('uploaded URL requires a matching session, unexpired signature and approved host', () => {
  const url = 'https://hmpot4xs7ppc9ux4.public.blob.vercel-storage.com/koma/uploads/safe.webp';
  const token = signImageUpload(url, 'sess_a');
  assert.equal(isAllowedImage(url, token, 'sess_a'), true);
  const foreignUrl = 'https://example.public.blob.vercel-storage.com/koma/uploads/safe.webp';
  assert.equal(isAllowedImage(foreignUrl, signImageUpload(foreignUrl, 'sess_a'), 'sess_a'), false);
  assert.equal(isAllowedImage(url, token, 'sess_b'), false);
  assert.equal(isAllowedImage(url.replace('safe.webp', 'other.webp'), token, 'sess_a'), false);
  assert.equal(isAllowedImage('https://evil.example/koma/uploads/safe.webp', token, 'sess_a'), false);
  assert.equal(isAllowedImage(url, `1000000000000.${token.split('.')[1]}`, 'sess_a'), false);
  assert.equal(isAllowedImage('/assets/hero-main.webp', undefined, 'sess_a'), true);
});

test('rejects invalid file before calling a provider', async () => {
  const beforeCount = requestCount;
  const result = await moderateImage(new File(['<svg/>'], 'evil.svg', { type: 'image/svg+xml' }));
  assert.equal(result.ok, false);
  assert.equal(requestCount, beforeCount);
});

test('fails closed without a configured vision model', async () => {
  delete process.env.AI_IMAGE_MODERATION_MODEL;
  const result = await moderateImage(await imageFile());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 503);
  process.env.AI_IMAGE_MODERATION_MODEL = 'vision-test';
});

test('checks re-encoded image with the vision model before accepting', async () => {
  visionDecision = 'safe';
  requestCount = 0;
  const result = await moderateImage(await imageFile());
  assert.equal(result.ok, true);
  assert.equal(requestCount, 1);
  assert.equal(receivedWebp, true);
  if (result.ok) assert.equal((await sharp(result.image).metadata()).format, 'webp');
});

test('provider failure never makes an image public', async () => {
  providerFails = true;
  const result = await moderateImage(await imageFile());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 503);
  providerFails = false;
});

test('unreadable vision reply is held instead of published', async () => {
  visionGarbage = true;
  const result = await moderateImage(await imageFile());
  visionGarbage = false;
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 503);
});

test('rejects unsafe and uncertain images', async () => {
  visionDecision = 'unsafe';
  let result = await moderateImage(await imageFile());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 422);
  visionDecision = 'uncertain';
  result = await moderateImage(await imageFile());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 422);
  visionDecision = 'safe';
});
