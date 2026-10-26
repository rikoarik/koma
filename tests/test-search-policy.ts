import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eligiblePosts, searchExclusion, postUrl } from '../src/lib/search-policy';
import type { Post } from '../src/types';

const base: Post = { id: 'a', content: 'Di halte tadi sore aku melihat seorang bapak membacakan puisi kecil untuk anaknya. Kami menunggu bus cukup lama, tetapi suasana jadi lebih ringan. Aku pulang sambil mengingat bahwa perhatian sederhana ternyata bisa mengubah hari yang berat menjadi sedikit lebih hangat.', authorAlias: 'Tanpa Nama', authorType: 'tanpa_nama', topic: 'cerita-kecil', responseMode: 'boleh_dibalas', reactions: { dengerin: 0, relate: 0, senyum: 0, peluk: 0 }, replies: [], reportCount: 0, createdAt: '2026-10-01T00:00:00.000Z', moderationState: 'published', searchConsent: true, isHidden: false };

test('search permission defaults fail closed and is independent of publication', () => {
  assert.equal(searchExclusion({ ...base, searchConsent: undefined }), 'tanpa izin pencarian');
  assert.equal(searchExclusion({ ...base, moderationState: 'removed' }), 'moderasi');
  assert.equal(searchExclusion({ ...base, isHidden: true }), 'moderasi');
  assert.equal(searchExclusion(base), null);
});

test('PII, links, reports, AI-assisted, thin and duplicates stay out of search', () => {
  assert.ok(searchExclusion({ ...base, content: base.content + ' https://example.com' }));
  assert.ok(searchExclusion({ ...base, content: base.content + ' user@example.com' }));
  assert.ok(searchExclusion({ ...base, reportCount: 1 }));
  assert.ok(searchExclusion({ ...base, isAiGenerated: true }));
  assert.ok(searchExclusion({ ...base, content: 'Pendek' }));
  assert.equal(eligiblePosts([{ ...base, id: 'b' }, base]).length, 1);
});

test('casual Indonesian profanity is not treated as spam by itself', () => {
  assert.equal(searchExclusion({ ...base, content: base.content + ' Anjing, gue capek banget hari ini.' }), null);
  assert.equal(postUrl('post-1'), 'https://ruangkoma.web.id/coretan/post-1');
});
