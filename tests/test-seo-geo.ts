import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { eligiblePosts, searchExclusion } from '../src/lib/search-policy';

const content = 'Hari ini aku bercerita tentang perjalanan pulang yang pelan dan suasana di jalan yang mulai tenang setelah hujan. Aku menyadari ada banyak hal kecil yang patut disyukuri walau minggu ini terasa panjang dan melelahkan bagi kami semua.';
const base = { content, moderationState: 'published' as const, isHidden: false, searchConsent: true, reportCount: 0, isAiGenerated: false };

test('indeks terpisah dari publikasi, laporan, duplikat, dan data sensitif', () => {
  assert.equal(searchExclusion(base), null);
  assert.ok(searchExclusion({ ...base, searchConsent: false }));
  assert.ok(searchExclusion({ ...base, moderationState: 'held_for_review' }));
  assert.ok(searchExclusion({ ...base, reportCount: 1 }));
  assert.ok(searchExclusion({ ...base, content: `${content} 081234567890` }));
  assert.ok(searchExclusion({ ...base, imageUrl: 'https://images.example.org/photo.jpg' }));
  const post = { ...base, id: 'a', authorAlias: 'Tanpa Nama', authorType: 'tanpa_nama' as const, topic: 'isi-kepala', responseMode: 'boleh_dibalas' as const, reactions: { dengerin: 0, relate: 0, senyum: 0, peluk: 0 }, replies: [], createdAt: new Date().toISOString() };
  assert.equal(eligiblePosts([post, { ...post, id: 'b' }]).length, 1);
});

test('pemilik dapat mencabut izin indeks tanpa menghapus coretan publik', async () => {
  const original = process.cwd();
  const dir = mkdtempSync(path.join(tmpdir(), 'koma-seo-'));
  const originalKey = process.env.AI_MODERATION_API_KEY;
  const originalFallback = process.env.AI_API_KEY;
  try {
    process.chdir(dir);
    delete process.env.AI_MODERATION_API_KEY;
    delete process.env.AI_API_KEY;
    const { createPost, withdrawSearchConsent, getSearchEligiblePosts, getFilteredPosts, deletePost } = await import('../src/lib/storage');
    const created = await createPost({ content, searchConsent: true }, 'seo-owner');
    assert.equal(created.post?.searchConsent, true);
    assert.equal(await withdrawSearchConsent(created.post!.id, 'other-owner'), false);
    assert.equal(await withdrawSearchConsent(created.post!.id, 'seo-owner'), true);
    assert.equal((await getSearchEligiblePosts()).some((post) => post.id === created.post!.id), false);
    assert.equal((await getFilteredPosts()).some((post) => post.id === created.post!.id), false); // moderation unavailable: never public
    assert.equal(await deletePost(created.post!.id, 'seo-owner').then((result) => result.success), true);
  } finally {
    process.chdir(original);
    if (originalKey === undefined) delete process.env.AI_MODERATION_API_KEY; else process.env.AI_MODERATION_API_KEY = originalKey;
    if (originalFallback === undefined) delete process.env.AI_API_KEY; else process.env.AI_API_KEY = originalFallback;
    rmSync(dir, { recursive: true, force: true });
  }
});
