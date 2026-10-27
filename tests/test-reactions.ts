import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { NextRequest } from 'next/server';

async function main() {
  const originalCwd = process.cwd();
  const directory = mkdtempSync(path.join(tmpdir(), 'koma-reactions-'));
  // This test must never connect to the production database or touch real posts.
  const databaseKeys = ['ruangkoma_POSTGRES_URL', 'ruangkoma_DATABASE_URL', 'DATABASE_URL', 'POSTGRES_URL'];
  const originalDatabase = databaseKeys.map((key) => [key, process.env[key]] as const);
  try {
    for (const key of databaseKeys) delete process.env[key];
    process.chdir(directory);
    const { POST } = await import('../src/app/api/posts/[id]/reactions/route');
    const { getPostById, getFilteredPosts } = await import('../src/lib/storage');
    const postId = 'post-1'; // Local seed, never a user post.
    const url = `http://localhost:3000/api/posts/${postId}/reactions`;
    const send = (body: object, cookie?: string) => POST(new NextRequest(url, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {}),
      }, body: JSON.stringify(body),
    }), { params: { id: postId } });

    const initial = await getPostById(postId);
    assert.ok(initial);
    const invalid = await send({ reactionType: 'dengerin' });
    assert.equal(invalid.status, 400);
    const added = await send({ reaction: 'dengerin' });
    assert.equal(added.status, 200);
    const cookie = added.headers.get('set-cookie');
    assert.match(cookie || '', /koma_session=sess_/);
    const first = await added.json();
    assert.equal(first.reactions.dengerin, initial.reactions.dengerin + 1);
    assert.deepEqual(first.userReactions, ['dengerin']);
    assert.equal((await getFilteredPosts('terbaru', undefined, undefined, cookie!.split(';')[0].split('=')[1]))
      .find((post) => post.id === postId)?.reactions.dengerin, first.reactions.dengerin);

    const removed = await send({ reaction: 'dengerin' }, cookie!.split(';')[0]);
    assert.equal(removed.status, 200);
    const second = await removed.json();
    assert.equal(second.reactions.dengerin, initial.reactions.dengerin);
    assert.deepEqual(second.userReactions, []);
    assert.equal((await getPostById(postId, cookie!.split(';')[0].split('=')[1]))?.reactions.dengerin, initial.reactions.dengerin);
    console.log('Reaction route, toggle, session and feed counts passed (isolated local store)');
  } finally {
    process.chdir(originalCwd);
    rmSync(directory, { recursive: true, force: true });
    for (const [key, value] of originalDatabase) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
