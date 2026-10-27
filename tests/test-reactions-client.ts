import assert from 'node:assert/strict';
import { submitReaction } from '../src/lib/reactions-client';

async function main() {
  const originalFetch = globalThis.fetch;
  try {
    let requested = false;
    globalThis.fetch = async (url, init) => {
      requested = true;
      assert.equal(url, '/api/posts/local-test-post/reactions');
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(String(init?.body)), { reaction: 'peluk' });
      return Response.json({ success: true, reactions: { dengerin: 0, relate: 0, senyum: 0, peluk: 1 }, userReactions: ['peluk'] });
    };
    assert.deepEqual(await submitReaction('local-test-post', 'peluk'), {
      reactions: { dengerin: 0, relate: 0, senyum: 0, peluk: 1 }, userReactions: ['peluk'],
    });
    assert.ok(requested);
    globalThis.fetch = async () => Response.json({ success: false, error: 'Terlalu banyak reaksi.' }, { status: 429 });
    assert.equal(await submitReaction('local-test-post', 'peluk'), null);
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.equal(await submitReaction('local-test-post', 'peluk'), null);
    console.log('Shared reaction client request and error handling passed (mocked fetch)');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
