import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

async function main() {
  const originalCwd = process.cwd();
  const directory = mkdtempSync(path.join(tmpdir(), 'koma-moderation-'));
  const originalKey = process.env.AI_API_KEY;
  const originalModel = process.env.AI_MODEL;
  const originalBaseUrl = process.env.AI_MODERATION_BASE_URL;
  const originalSharedBaseUrl = process.env.AI_BASE_URL;
  const originalModerationKey = process.env.AI_MODERATION_API_KEY;
  const originalModerationModel = process.env.AI_MODERATION_MODEL;
  let verdict: { category: string; decision: string } = { category: 'safe', decision: 'allow' };
  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ id: 'test', object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content: JSON.stringify({ ...verdict, reason: '' }) }, finish_reason: 'stop' }] }));
  });
  try {
    process.chdir(directory);
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODERATION_API_KEY;
    delete process.env.AI_MODEL;
    delete process.env.AI_MODERATION_MODEL;
    const { moderateText } = await import('../src/lib/ai-moderation');
    const { createPost, updatePost, addReply, reportTarget, getFilteredPosts, getAdminModerationQueue, resolveAdminReport, deletePost, getModerationRules, addModerationRule, deleteModerationRule, getDonationConfig, saveDonationConfig, getAdminAuditLogs, getSystemHealth } = await import('../src/lib/storage');
    const { moderationRuleInput } = await import('../src/lib/moderation-rule-input');
    const { donationInput } = await import('../src/lib/donation-input');
    const { configuredQrisUrl, donationUrl } = await import('../src/lib/donation-defaults');
    assert.equal(donationInput.safeParse({ enabled: true, qrisImageUrl: '', externalLinkUrl: 'https://saweria.co/arkids' }).success, true);
    assert.equal(donationUrl('https://trakteer.id'), 'https://saweria.co/arkids');
    assert.equal(donationUrl('https://trakteer.id/'), 'https://saweria.co/arkids');
    assert.equal(donationUrl('https://example.org/donate'), 'https://example.org/donate');
    assert.equal(configuredQrisUrl('/assets/sticker-relate.svg'), '');
    assert.equal(moderationRuleInput.safeParse({ wordOrPattern: '(a+)+', ruleType: 'regex', action: 'reject', severity: 'high' }).success, false);
    assert.equal(moderationRuleInput.safeParse({ wordOrPattern: '[', ruleType: 'regex', action: 'reject', severity: 'high' }).success, false);
    assert.equal(moderationRuleInput.safeParse({ wordOrPattern: 'aman', ruleType: 'banned_word', action: 'review', severity: 'low' }).success, true);
    const customRule = await addModerationRule({ wordOrPattern: 'kata uji khusus', ruleType: 'banned_word', action: 'review', severity: 'medium' });
    assert.ok((await getModerationRules()).custom.some((r) => r.id === customRule.id));
    const customPost = await createPost({ content: 'Ada kata uji khusus di sini' }, 'rule-owner');
    assert.equal(customPost.moderation?.source, 'unavailable');
    assert.equal((await moderateText('Ada kata uji khusus di sini', 'post', (await getModerationRules()).custom)).state, 'held_for_review');
    assert.equal(await deleteModerationRule(customRule.id!), true);
    assert.equal((await getModerationRules()).custom.length, 0);
    await saveDonationConfig({ enabled: false, customMessage: 'Pesan uji' });
    assert.equal((await getDonationConfig()).enabled, false);
    assert.equal((await getDonationConfig()).customMessage, 'Pesan uji');
    assert.equal((await getDonationConfig()).externalLinkUrl, 'https://saweria.co/arkids');
    assert.equal((await getDonationConfig()).qrisImageUrl, '');
    await saveDonationConfig({ externalLinkUrl: 'https://example.org/donate' });
    assert.equal((await getDonationConfig()).externalLinkUrl, 'https://example.org/donate');
    assert.ok((await getAdminAuditLogs()).some((entry) => entry.action === 'ADD_RULE'));
    assert.equal((await getSystemHealth()).database.tables.moderationRules, 0);

    assert.equal((await moderateText('Hubungi 081234567890 ya', 'post')).state, 'removed');
    assert.equal((await moderateText('Hari ini saya berjalan pulang dengan tenang', 'post')).state, 'held_for_review');
    assert.equal((await moderateText('Aku kepikiran bunuh diri dan butuh bantuan', 'post')).state, 'held_for_review');

    const privacyPost = await createPost({ content: 'Hubungi 081234567890 ya' }, 'private-owner');
    assert.equal(privacyPost.moderation?.state, 'removed');
    assert.equal((await getFilteredPosts()).some((p) => p.id === privacyPost.post!.id), false);
    assert.ok((await getAdminModerationQueue()).some((c) => c.kind === 'case' && c.targetId === privacyPost.post!.id && c.status === 'PENDING'));
    await deletePost(privacyPost.post!.id, 'private-owner');

    const created = await createPost({ content: 'Tulisan pengujian moderasi yang aman', responseMode: 'boleh_dibalas' }, 'owner');
    const postId = created.post!.id;
    assert.equal(created.moderation?.state, 'held_for_review');
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), false);
    const firstCase = (await getAdminModerationQueue()).find((c) => c.kind === 'case' && c.targetId === postId && c.status === 'PENDING');
    assert.ok(firstCase);
    assert.equal(await resolveAdminReport(firstCase.id, 'PUBLISH'), true);
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), true);

    const reply = await addReply(postId, { content: 'Balasan uji untuk coretan ini' }, 'replier');
    assert.equal(reply.moderation?.state, 'held_for_review');
    assert.equal((await getFilteredPosts()).find((p) => p.id === postId)?.replies.length, 0);
    const replyCase = (await getAdminModerationQueue()).find((c) => c.kind === 'case' && c.targetId === reply.reply!.id);
    assert.ok(replyCase);
    assert.equal(await resolveAdminReport(replyCase.id, 'PUBLISH'), true);
    assert.equal((await getFilteredPosts()).find((p) => p.id === postId)?.replies.length, 1);
    const removedReply = await addReply(postId, { content: 'Hubungi 081234567890 ya' }, 'another-replier');
    assert.equal(removedReply.moderation?.state, 'removed');
    assert.equal((await getFilteredPosts()).find((p) => p.id === postId)?.replies.length, 1);
    const replyReport = await reportTarget({ postId: reply.reply!.id, targetType: 'reply', reason: 'lainnya' }, 'reporter');
    assert.equal(replyReport.success, true);
    assert.equal((await getFilteredPosts()).find((p) => p.id === postId)?.replies.length, 0);
    assert.equal((await getAdminModerationQueue()).some((c) => c.targetId === reply.reply!.id && c.kind === 'report' && c.status === 'PENDING'), true);

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    process.env.AI_API_KEY = 'local-test-only';
    process.env.AI_MODEL = 'local-test-model';
    delete process.env.AI_MODERATION_BASE_URL;
    process.env.AI_BASE_URL = `http://127.0.0.1:${address.port}/v1`;
    // The shared provider URL must be used when no moderation-specific URL exists.
    assert.equal((await moderateText('Saya merasa sedih hari ini', 'post')).state, 'published');
    assert.equal((await createPost({ content: 'Tulisan aman langsung terbit' }, 'safe-owner')).moderation?.state, 'published');
    assert.equal((await moderateText('Bangsat, hari ini berat sekali', 'post')).state, 'published');
    process.env.AI_MODERATION_BASE_URL = `http://127.0.0.1:${address.port}/v1`;
    process.env.AI_BASE_URL = 'http://127.0.0.1:1/v1';
    assert.equal((await moderateText('Saya menulis lagi', 'post')).state, 'published'); // Dedicated URL takes priority.
    process.env.AI_BASE_URL = `http://127.0.0.1:${address.port}/v1`;
    const colloquialPost = await createPost({ content: 'Bangsat, hari ini berat sekali' }, 'colloquial-owner');
    assert.equal(colloquialPost.moderation?.state, 'published');
    assert.equal((await getFilteredPosts()).some((p) => p.id === colloquialPost.post!.id), true);
    assert.equal((await moderateText('Bangsat, hari ini berat sekali', 'post', [{ wordOrPattern: 'berat sekali', ruleType: 'banned_word', action: 'review', severity: 'medium' }])).state, 'held_for_review');
    assert.equal((await moderateText('Kepikiran bunuh diri dan butuh bantuan', 'post', [{ wordOrPattern: 'butuh bantuan', ruleType: 'banned_word', action: 'review', severity: 'medium' }])).state, 'held_for_review');
    assert.equal((await moderateText('Bangsat, hari ini berat sekali', 'reply')).state, 'published');
    verdict = { category: 'uncertain', decision: 'review' };
    assert.equal((await moderateText('Bangsat, hari ini berat sekali', 'post')).state, 'held_for_review');
    verdict = { category: 'harassment', decision: 'takedown' };
    assert.equal((await moderateText('Bangsat, hari ini berat sekali', 'post')).state, 'removed');
    verdict = { category: 'safe', decision: 'allow' };
    const activeRule = await addModerationRule({ wordOrPattern: 'frasa khusus admin', ruleType: 'banned_word', action: 'review', severity: 'medium' });
    assert.equal((await createPost({ content: 'Ini frasa khusus admin' }, 'another-owner')).moderation?.state, 'held_for_review');
    assert.equal((await moderateText('Ini frasa khusus admin', 'post', (await getModerationRules()).custom)).source, 'rule');
    assert.equal(await deleteModerationRule(activeRule.id!), true);
    assert.equal((await moderateText('Hubungi 081234567890 ya', 'post', [{ wordOrPattern: 'Hubungi', ruleType: 'allowlist', action: 'allow', severity: 'low' }])).state, 'removed');
    assert.equal((await moderateText('Saya menulis catatan baru', 'post', [{ wordOrPattern: 'catatan', ruleType: 'banned_word', action: 'reject', severity: 'critical' }])).state, 'held_for_review');
    assert.equal((await moderateText('Bangsat, gue bunuh lo besok', 'post')).state, 'removed');
    verdict = { category: 'distress', decision: 'allow' };
    assert.equal((await moderateText('Saya butuh bantuan, rasanya berat', 'post')).state, 'published');
    assert.equal((await moderateText('Aku kepikiran bunuh diri dan butuh bantuan', 'post')).state, 'published');
    assert.equal((await moderateText('Bangsat, rasanya berat hari ini', 'post')).state, 'held_for_review');
    verdict = { category: 'distress', decision: 'takedown' };
    assert.equal((await moderateText('Saya butuh bantuan, rasanya berat', 'post')).state, 'held_for_review');
    verdict = { category: 'threat', decision: 'takedown' };
    assert.equal((await moderateText('Aku akan menyerangmu besok', 'post')).state, 'removed');
    assert.equal((await moderateText('Bangsat, gue bunuh lo besok', 'post')).state, 'removed');
    verdict = { category: 'safe', decision: 'allow' };

    const report = await reportTarget({ postId, reason: 'lainnya' }, 'reporter');
    assert.equal(report.success, true);
    // A report is retained for human review even when the classifier allows the text.
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), true);
    const reportedCase = (await getAdminModerationQueue()).find((c) => c.kind === 'case' && c.targetId === postId && c.status === 'PENDING');
    assert.ok(reportedCase);
    assert.equal(await resolveAdminReport(reportedCase.id, 'RESOLVED_HIDE'), true);
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), false);

    const edit = await updatePost(postId, 'Hubungi 081234567890 sekarang ya', 'owner');
    assert.equal(edit.moderation?.state, 'removed');
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), false);
    assert.equal((await getAdminModerationQueue()).some((c) => c.kind === 'case' && c.targetId === postId && c.status === 'PENDING'), true);
    const safeEdit = await updatePost(postId, 'Isi revisi aman yang tetap butuh peninjauan', 'owner');
    assert.equal(safeEdit.moderation?.state, 'held_for_review');
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), false);
    assert.equal(await resolveAdminReport(reportedCase.id, 'PUBLISH'), false);
    const revisedCase = (await getAdminModerationQueue()).find((c) => c.kind === 'case' && c.targetId === postId && c.status === 'PENDING');
    assert.ok(revisedCase);
    assert.equal(await resolveAdminReport(revisedCase.id, 'PUBLISH'), true);
    assert.equal((await getFilteredPosts()).some((p) => p.id === postId), true);
    assert.equal((await deletePost(postId, 'owner')).success, true);
    assert.equal((await getAdminModerationQueue()).some((c) => c.kind === 'case' && c.targetId === postId && c.status === 'PENDING'), false);
    assert.equal((await getAdminModerationQueue()).some((c) => c.targetId === reply.reply!.id && c.status === 'PENDING'), false);
    console.log('Moderation flow passed');
  } finally {
    server.close();
    process.chdir(originalCwd);
    rmSync(directory, { recursive: true, force: true });
    for (const [key, value] of Object.entries({ AI_API_KEY: originalKey, AI_MODEL: originalModel, AI_MODERATION_BASE_URL: originalBaseUrl, AI_BASE_URL: originalSharedBaseUrl, AI_MODERATION_API_KEY: originalModerationKey, AI_MODERATION_MODEL: originalModerationModel })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
