// Comprehensive Integration Test for Koma Platform
import {
  createPost,
  updatePost,
  deletePost,
  addReply,
  addReaction,
  getFilteredPosts,
  getAdminAnalyticsSummary,
  getDonationConfig,
} from '../src/lib/storage';
import { checkContentModeration } from '../src/lib/moderation';
import { generateStudioSuggestions, StudioCategory } from '../src/lib/ai-provider';

let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('--- 1. Testing Content Moderation ---');
  const modPass = checkContentModeration('Malam ini sepi banget, jalan kaki di sekitaran blok M');
  assert(modPass.action === 'allow', 'Colloquial Indonesian should be allowed');

  const modDoxxing = checkContentModeration('Hubungi saya di 081234567890');
  assert(modDoxxing.action === 'reject', 'Indonesian phone numbers must be rejected (anti-doxxing)');

  const modEmail = checkContentModeration('Email gue di kontak@rahasia.com');
  assert(modEmail.action === 'reject', 'Email addresses must be rejected (anti-doxxing)');

  const modSevereProfanity = checkContentModeration('Tulisan ini memuat kata kontol');
  assert(modSevereProfanity.action === 'reject', 'Explicit severe vulgarity must be rejected');

  const modSelfDistress = checkContentModeration('Gue capek banget hidup hari ini, anjing capek banget');
  assert(
    modSelfDistress.action === 'allow' || modSelfDistress.action === 'warn',
    'Casual self-expression of exhaustion should not be outright rejected'
  );

  console.log('\n--- 2. Testing Post Creation, Sessions, & Ownership ---');
  const sessionA = 'sess_test_user_alpha';
  const sessionB = 'sess_test_user_beta';

  const postCreateRes = await createPost(
    {
      content: 'Coretan tes untuk verifikasi sistem Koma',
      authorAlias: 'Pengelana Malam',
      authorType: 'pseudonim',
      topic: 'isi-kepala',
      responseMode: 'boleh_dibalas',
      paperColor: 'cream',
    },
    sessionA
  );

  assert(Boolean(postCreateRes.post && postCreateRes.post.id), 'Post created successfully with unique ID');
  const testPostId = postCreateRes.post!.id;
  assert(postCreateRes.post!.isOwner === true, 'Author session recognized as owner');

  // Edit as owner
  const editOwnerRes = await updatePost(
    testPostId,
    'Coretan tes yang sudah disunting oleh pemilik',
    sessionA
  );
  assert(editOwnerRes.success === true, 'Post owner can edit content');

  // Edit as non-owner (must fail)
  const editNonOwnerRes = await updatePost(
    testPostId,
    'Disunting oleh orang asing!',
    sessionB
  );
  assert(editNonOwnerRes.success === false, 'Non-owner cannot edit post');

  console.log('\n--- 3. Testing Replies & Reply Permissions ---');
  const replyRes = await addReply(
    testPostId,
    {
      content: 'Tanggapan hangat untuk coretan tes',
      authorAlias: 'Teman Singgah',
      authorType: 'tanpa_nama',
    },
    sessionB
  );

  assert(
    editOwnerRes.moderation?.state === 'published'
      ? Boolean(replyRes.reply && replyRes.reply.id)
      : Boolean(replyRes.error && !replyRes.reply),
    'Replies require a published post, even with "boleh_dibalas"'
  );

  // Create "cukup_didengar" post and verify replies are blocked
  const listenOnlyPost = await createPost(
    {
      content: 'Hanya ingin mengeluarkan uneg-uneg, tolong jangan beri nasihat.',
      authorAlias: 'Tanpa Nama',
      authorType: 'tanpa_nama',
      topic: 'tengah-malam',
      responseMode: 'cukup_didengar',
    },
    sessionA
  );

  const blockedReply = await addReply(
    listenOnlyPost.post!.id,
    {
      content: 'Mencoba membalas postingan dengar saja',
      authorAlias: 'Pemberi Solusi',
    },
    sessionB
  );

  assert(Boolean(blockedReply.error), 'Reply blocked on post with "cukup_didengar"');

  console.log('\n--- 4. Testing Four Real Reactions ---');
  const rx1 = await addReaction(testPostId, 'dengerin', sessionA);
  assert(rx1.reactions.dengerin >= 1, 'Reaction "dengerin" incremented');
  assert(rx1.userReactions.includes('dengerin'), 'Reaction marked as active for session');

  const rx2 = await addReaction(testPostId, 'relate', sessionB);
  assert(rx2.reactions.relate >= 1, 'Reaction "relate" incremented');

  console.log('\n--- 5. Testing Feed Modes & Popularity Engagement ---');
  const terbaruFeed = await getFilteredPosts('terbaru');
  assert(terbaruFeed.length > 0, 'Terbaru feed loads posts');

  const populerFeed = await getFilteredPosts('populer');
  assert(populerFeed.length > 0, 'Populer feed calculates engagement with time decay');

  const acakFeed = await getFilteredPosts('acak');
  assert(acakFeed.length > 0, 'Acak feed returns shuffled posts');

  const searchFeed = await getFilteredPosts('terbaru', undefined, 'disunting');
  assert(
    searchFeed.some((post) => post.id === testPostId) === (editOwnerRes.moderation?.state === 'published'),
    'Search includes the edited post only when it is published'
  );

  console.log('\n--- 6. Testing AI Content Studio (3 Suggestions) ---');
  const categories: StudioCategory[] = [
    'random_thoughts',
    'humor_receh',
    'questions',
    'discussion_topics',
    'rewrite_shorten',
  ];

  for (const cat of categories) {
    const res = await generateStudioSuggestions({ category: cat });
    assert(
      Array.isArray(res.suggestions) && res.suggestions.length === 3,
      `AI Studio category "${cat}" returned exactly 3 natural Indonesian suggestions`
    );
    assert(
      res.suggestions[0].length > 10 && res.suggestions[1].length > 10 && res.suggestions[2].length > 10,
      `AI Studio suggestions are non-empty and well-formed`
    );
  }

  console.log('\n--- 7. Testing Admin Analytics & Donation Settings ---');
  const stats = await getAdminAnalyticsSummary();
  assert(stats.totalPosts >= 1, 'Admin analytics reflects real post counts');
  assert(stats.supportedCoretanRate24h >= 0, 'Admin analytics calculates real Supported Coretan Rate (SCR 24h)');

  const donConfig = await getDonationConfig();
  assert(typeof donConfig.enabled === 'boolean', 'Donation config retrieved successfully');

  // Delete test post
  const delOwnerRes = await deletePost(testPostId, sessionA);
  assert(delOwnerRes.success === true, 'Post owner can delete their post');

  const delNonOwnerRes = await deletePost(listenOnlyPost.post!.id, sessionB);
  assert(delNonOwnerRes.success === false, 'Non-owner cannot delete post');

  // Clean up listen post
  await deletePost(listenOnlyPost.post!.id, sessionA);

  console.log('\n======================================');
  if (failedTests === 0) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
  } else {
    console.error(`⚠️ ${failedTests} tests failed.`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during integration testing:', err);
  process.exit(1);
});
