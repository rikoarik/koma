import {
  getAdminAnalyticsSummary,
  getAdminDetailedAnalytics,
  getAllPostsForAdmin,
  adminUpdatePost,
  adminDeletePost,
  getModerationRules,
  addModerationRule,
  deleteModerationRule,
  getSystemHealth,
  resolveAdminReport,
  getDonationConfig,
  saveDonationConfig,
} from '../src/lib/storage';
import { checkContentModeration } from '../src/lib/moderation';
import { verifyAdminAuth } from '../src/lib/admin-auth';
import { NextRequest } from 'next/server';

async function runTestSuite() {
  console.log('=== KOMA ADMIN DASHBOARD TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Analytics Summary & SCR 24h
    console.log('\n--- 1. Analytics Summary & SCR ---');
    const summary = await getAdminAnalyticsSummary();
    assert(summary !== null, 'getAdminAnalyticsSummary returns valid object');
    assert(typeof summary.totalPosts === 'number', 'totalPosts is a valid number', `got: ${summary.totalPosts}`);
    assert(typeof summary.supportedCoretanRate24h === 'number', 'SCR 24h is calculated', `got: ${summary.supportedCoretanRate24h}%`);
    assert(summary.supportedCoretanRate24h >= 0 && summary.supportedCoretanRate24h <= 100, 'SCR 24h is within 0-100%');

    // 2. Detailed Analytics for Periods (24h, 7d, 30d, all)
    console.log('\n--- 2. Period-over-Period Analytics & Real Calculations ---');
    for (const p of ['24h', '7d', '30d', 'all'] as const) {
      const detailed = await getAdminDetailedAnalytics(p);
      assert(detailed.period === p, `Detailed analytics period is ${p}`);
      assert(Array.isArray(detailed.timeSeries), `Time series data exists for ${p}`);
      assert(detailed.timeSeries.length > 0, `Time series has buckets for ${p} (${detailed.timeSeries.length} buckets)`);
      assert(detailed.kpis.totalPosts !== undefined, `KPI posts comparison exists for ${p}`);
      assert(typeof detailed.kpis.totalPosts.delta === 'number', `Delta calculated for posts in ${p}`);
      assert(Array.isArray(detailed.topicBreakdown), `Topic breakdown exists for ${p}`);
      assert(detailed.deviceAndSource.tracked === false, `Honest device empty state correctly set for ${p}`);
      assert(detailed.deviceAndSource.message.includes('UU PDP'), `PDP privacy note verified for ${p}`);
    }

    // 3. Content Management & Filtering
    console.log('\n--- 3. Content Table Management & Pagination ---');
    const contentAll = await getAllPostsForAdmin({ page: 1, limit: 10 });
    assert(Array.isArray(contentAll.items), 'getAllPostsForAdmin returns items array');
    assert(contentAll.pagination.totalItems >= 3, `Found ${contentAll.pagination.totalItems} posts`);
    assert(contentAll.items[0].reactionsSummary !== undefined, 'reactionsSummary included for dense view');

    // Search filter
    const contentSearch = await getAllPostsForAdmin({ search: 'Senayan' });
    assert(contentSearch.items.length >= 1, 'Search filter matches post content', `matched ${contentSearch.items.length}`);

    // Pin & Hide toggling
    if (contentAll.items.length > 0) {
      const testPostId = contentAll.items[0].id;
      const initialHidden = contentAll.items[0].isHidden;

      const okHide = await adminUpdatePost(testPostId, { isHidden: !initialHidden });
      assert(okHide === true, 'adminUpdatePost toggles isHidden');

      const okRevert = await adminUpdatePost(testPostId, { isHidden: initialHidden });
      assert(okRevert === true, 'adminUpdatePost reverts isHidden');
    }

    // 4. Moderation Rules Management
    console.log('\n--- 4. Moderation Rules & Sandbox Tester ---');
    const rules = await getModerationRules();
    assert(Array.isArray(rules.baseline) && rules.baseline.length >= 15, 'Baseline rules loaded (>=15 rules)');

    // Add custom rule
    const customRule = await addModerationRule({
      wordOrPattern: 'test_banned_keyword',
      ruleType: 'banned_word',
      action: 'reject',
      severity: 'high',
      description: 'Aturan uji coba',
    });
    assert(customRule.wordOrPattern === 'test_banned_keyword', 'addModerationRule adds new rule');

    // Test with content moderation sandbox
    const testMatch = checkContentModeration('ini ada test_banned_keyword di sini', [customRule]);
    assert(testMatch.action === 'reject', 'checkContentModeration catches custom rule in sandbox');

    // Delete custom rule
    if (customRule.id) {
      const okDel = await deleteModerationRule(customRule.id);
      assert(okDel === true, 'deleteModerationRule removes custom rule');
    }

    // 5. System Health & Diagnostics
    console.log('\n--- 5. System Health & Infrastructure ---');
    const health = await getSystemHealth();
    assert(health.database.connected === true, 'Database status is connected');
    assert(typeof health.database.tables.posts === 'number', 'Post count verified in health check');
    assert(health.aiEngine.status !== undefined, 'AI engine status reported');
    assert(Array.isArray(health.auditLogs), 'Audit log history array exists');

    // 6. QRIS & Donation Configuration
    console.log('\n--- 6. QRIS & Donation Settings ---');
    const donation = await getDonationConfig();
    assert(typeof donation.enabled === 'boolean', 'Donation enabled flag is boolean');
    assert(Boolean(donation.qrisImageUrl), 'QRIS image URL is configured');

    await saveDonationConfig({ customMessage: 'Pesan donasi diperbarui melalui pengujian' });
    const updatedDonation = await getDonationConfig();
    assert(updatedDonation.customMessage === 'Pesan donasi diperbarui melalui pengujian', 'saveDonationConfig updates successfully');

    // Revert message
    await saveDonationConfig({ customMessage: donation.customMessage });

    // 7. Zero-Fallback Admin Security Tests
    console.log('\n--- 7. Zero-Fallback Admin Security Policy ---');
    const originalAdminEnv = process.env.ADMIN_PASSWORD;

    // Test 7.1: When ADMIN_PASSWORD is completely undefined, reject everything (fail-closed)
    delete process.env.ADMIN_PASSWORD;
    const reqWithDefaultFallback = new NextRequest('http://localhost:3000/api/admin/content', {
      headers: { authorization: 'Bearer koma_admin_2026' },
    });
    assert(
      verifyAdminAuth(reqWithDefaultFallback) === false,
      'verifyAdminAuth strictly denies access when ADMIN_PASSWORD is unset (no hardcoded fallback backdoor)'
    );

    // Test 7.2: When ADMIN_PASSWORD is empty string or whitespace
    process.env.ADMIN_PASSWORD = '   ';
    assert(
      verifyAdminAuth(reqWithDefaultFallback) === false,
      'verifyAdminAuth strictly denies access when ADMIN_PASSWORD is whitespace'
    );

    // Test 7.3: When ADMIN_PASSWORD is set, only exact match is allowed
    process.env.ADMIN_PASSWORD = 'custom_strong_secret_key_987';
    const reqWrongPass = new NextRequest('http://localhost:3000/api/admin/content', {
      headers: { authorization: 'Bearer wrong_password' },
    });
    assert(
      verifyAdminAuth(reqWrongPass) === false,
      'verifyAdminAuth rejects incorrect password'
    );

    const reqValidBearer = new NextRequest('http://localhost:3000/api/admin/content', {
      headers: { authorization: 'Bearer custom_strong_secret_key_987' },
    });
    assert(
      verifyAdminAuth(reqValidBearer) === true,
      'verifyAdminAuth authorizes valid Bearer token matching environment'
    );

    const reqValidCookie = new NextRequest('http://localhost:3000/api/admin/content', {
      headers: { cookie: 'koma_admin_auth=custom_strong_secret_key_987' },
    });
    assert(
      verifyAdminAuth(reqValidCookie) === true,
      'verifyAdminAuth authorizes valid cookie matching environment'
    );

    // Restore original env
    if (originalAdminEnv !== undefined) {
      process.env.ADMIN_PASSWORD = originalAdminEnv;
    } else {
      delete process.env.ADMIN_PASSWORD;
    }

  } catch (err) {
    console.error('Unexpected error during test execution:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
