import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/admin/donations/qris/route';

test('QRIS upload requires admin authentication and same-origin request', async () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalToken = process.env.KOMA_PUBLIC_READ_WRITE_TOKEN;
  try {
    process.env.ADMIN_PASSWORD = 'test-admin-password-only';
    process.env.KOMA_PUBLIC_READ_WRITE_TOKEN = 'test-blob-token-only';
    const unauthenticated = await POST(new NextRequest('http://localhost:3000/api/admin/donations/qris', {
      method: 'POST', headers: { origin: 'http://localhost:3000' },
    }));
    assert.equal(unauthenticated.status, 401);

    const wrongOrigin = await POST(new NextRequest('http://localhost:3000/api/admin/donations/qris', {
      method: 'POST', headers: { origin: 'https://example.com', authorization: 'Bearer test-admin-password-only' },
    }));
    assert.equal(wrongOrigin.status, 403);

    delete process.env.KOMA_PUBLIC_READ_WRITE_TOKEN;
    const noStorage = await POST(new NextRequest('http://localhost:3000/api/admin/donations/qris', {
      method: 'POST', headers: { origin: 'http://localhost:3000', authorization: 'Bearer test-admin-password-only' },
    }));
    assert.equal(noStorage.status, 503);
  } finally {
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
    if (originalToken === undefined) delete process.env.KOMA_PUBLIC_READ_WRITE_TOKEN;
    else process.env.KOMA_PUBLIC_READ_WRITE_TOKEN = originalToken;
  }
});
