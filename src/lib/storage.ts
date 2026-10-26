import { Post, Reply, ReactionType, ReactionCounts, FeedFilter, ReportPayload, DonationConfig, AdminAnalyticsSummary } from '@/types';
import { db, isPostgresConfigured, ensurePostgresTables } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import type { AdminMessageInput } from './admin-message-input';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BASELINE_RULES, ModerationRuleItem } from './moderation';
import { moderateText, type ModerationDecision } from './ai-moderation';
import { hashSecret } from './session';
import { isAllowedImage } from './image-upload';
import { configuredQrisUrl, donationUrl } from './donation-defaults';
import { eligiblePosts } from './search-policy';

const LOCAL_DB_PATH = path.join(process.cwd(), '.local-koma-db.json');

// Memory store for offline/local development when PostgreSQL is not connected
interface LocalDBStore {
  posts: Array<typeof schema.posts.$inferSelect>;
  replies: Array<typeof schema.replies.$inferSelect>;
  reactions: Array<typeof schema.reactions.$inferSelect>;
  reports: Array<typeof schema.reports.$inferSelect>;
  moderationRules: Array<typeof schema.moderationRules.$inferSelect>;
  analyticsEvents: Array<typeof schema.analyticsEvents.$inferSelect>;
  siteSettings: Record<string, string>;
  moderationCases?: Array<typeof schema.moderationCases.$inferSelect>;
  adminMessages?: Array<typeof schema.adminMessages.$inferSelect>;
}

function getLocalStore(): LocalDBStore {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database PostgreSQL belum dikonfigurasi');
  }
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const store = JSON.parse(data) as LocalDBStore;
      if (!Array.isArray(store.posts) || !Array.isArray(store.replies) || !Array.isArray(store.reports)) throw new Error('Invalid local store');
      for (const post of store.posts) post.moderationState ||= post.isHidden ? 'removed' : 'published';
      for (const reply of store.replies) reply.moderationState ||= reply.isHidden ? 'removed' : 'published';
      return store;
    } catch {
      throw new Error('Penyimpanan lokal tidak dapat dibaca');
    }
  }

  // Seed with initial authentic Indonesian Koma reflections
  const initialStore: LocalDBStore = {
    posts: [
      {
        id: 'post-1',
        authorAlias: 'Tanpa Nama',
        authorType: 'tanpa_nama',
        sessionId: 'sess_seed_1',
        deleteSecretHash: null,
        content: 'Kadang jam 2 pagi itu bukan soal ngantuk atau enggak. Cuma heran aja kenapa semua kenangan yang harusnya udah selesai, malah antre minta dibahas ulang waktu lampu kamar mati.',
        imageUrl: null,
        topic: 'tengah-malam',
        responseMode: 'boleh_dibalas',
        isAiGenerated: false,
        aiPrompt: null,
        paperColor: 'cream',
        rotation: -1.2,
        moderationState: 'published',
        reportCount: 0,
        isHidden: false,
        isPinned: false,
        searchConsent: false,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        id: 'post-2',
        authorAlias: 'Penikmat Angin Sore',
        authorType: 'pseudonim',
        sessionId: 'sess_seed_2',
        deleteSecretHash: null,
        content: 'Tadi sore di halte busway Senayan, ada bapak-bapak jas rapi tapi sepatunya udah robek tipis di jempol. Dia lagi teleponan sama anaknya sambil ketawa renyah banget, bilang "Tenang dek, oleh-olehnya udah bapak simpen". Tiba-tiba kopi sachet gue rasanya hangat banget.',
        imageUrl: null,
        topic: 'cerita-kecil',
        responseMode: 'cukup_didengar',
        isAiGenerated: false,
        aiPrompt: null,
        paperColor: 'kraft',
        rotation: 1.5,
        moderationState: 'published',
        reportCount: 0,
        isHidden: false,
        isPinned: false,
        searchConsent: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        id: 'post-3',
        authorAlias: 'Burung Kertas',
        authorType: 'pseudonim',
        sessionId: 'sess_seed_3',
        deleteSecretHash: null,
        content: 'Edisi pertama zine kecil ini akhirnya selesai dicetak mandiri di fotokopi pojokan jalan. 16 halaman tentang rasa sepi orang rantau yang pura-pura kenyang di akhir bulan.',
        imageUrl: '/assets/section-writing.webp',
        topic: 'visual-zine',
        responseMode: 'boleh_dibalas',
        isAiGenerated: false,
        aiPrompt: null,
        paperColor: 'lavender',
        rotation: -0.8,
        moderationState: 'published',
        reportCount: 0,
        isHidden: false,
        isPinned: false,
        searchConsent: false,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ],
    replies: [
      {
        id: 'rep-1-1',
        postId: 'post-1',
        sessionId: 'sess_seed_4',
        authorAlias: 'Kopi Dingin Jam Tiga',
        authorType: 'pseudonim',
        content: 'Otak kita kalau malam emang suka jadi kurator museum rasa bersalah.',
        isAiGenerated: false,
        moderationState: 'published',
        isHidden: false,
        createdAt: new Date(Date.now() - 2.5 * 3600 * 1000),
      },
      {
        id: 'rep-1-2',
        postId: 'post-1',
        sessionId: 'sess_seed_5',
        authorAlias: 'Tanpa Nama',
        authorType: 'tanpa_nama',
        content: 'Tarik napas panjang kawan. Yang udah lewat ga punya kunci buat masuk rumah kamu lagi.',
        isAiGenerated: false,
        moderationState: 'published',
        isHidden: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
    ],
    reactions: [
      { id: 'rx-1', postId: 'post-1', reactionType: 'dengerin', sessionId: 'sess_user_1', createdAt: new Date() },
      { id: 'rx-2', postId: 'post-1', reactionType: 'relate', sessionId: 'sess_user_2', createdAt: new Date() },
      { id: 'rx-3', postId: 'post-2', reactionType: 'dengerin', sessionId: 'sess_user_3', createdAt: new Date() },
      { id: 'rx-4', postId: 'post-2', reactionType: 'senyum', sessionId: 'sess_user_4', createdAt: new Date() },
    ],
    reports: [],
    moderationRules: [],
    moderationCases: [],
    adminMessages: [],
    analyticsEvents: [],
    siteSettings: {
      qris_enabled: 'true',
      qris_image_url: '',
      donation_message: 'Dukung operasional Koma agar tetap mandiri, bebas iklan, dan bebas pelacak.',
      donation_external_url: donationUrl(),
    },
  };

  saveLocalStore(initialStore);
  return initialStore;
}

async function setTargetVisibility(targetType: 'post' | 'reply', targetId: string, state: ModerationDecision['state']) {
  if (isPostgresConfigured && db) {
    if (targetType === 'post') await db.update(schema.posts).set({ moderationState: state, isHidden: state === 'removed' }).where(eq(schema.posts.id, targetId));
    else await db.update(schema.replies).set({ moderationState: state, isHidden: state === 'removed' }).where(eq(schema.replies.id, targetId));
  } else {
    const store = getLocalStore();
    const target = targetType === 'post' ? store.posts.find((p) => p.id === targetId) : store.replies.find((r) => r.id === targetId);
    if (!target) return;
    target.moderationState = state;
    target.isHidden = state === 'removed';
    saveLocalStore(store);
  }
}

async function closePendingCases(targetType: 'post' | 'reply', targetId: string) {
  if (isPostgresConfigured && db) {
    await db.update(schema.moderationCases).set({ status: 'superseded', reviewedAt: new Date() })
      .where(and(eq(schema.moderationCases.targetType, targetType), eq(schema.moderationCases.targetId, targetId), eq(schema.moderationCases.status, 'pending')));
  } else {
    const store = getLocalStore();
    for (const c of store.moderationCases || []) {
      if (c.targetType === targetType && c.targetId === targetId && c.status === 'pending') {
        c.status = 'superseded'; c.reviewedAt = new Date();
      }
    }
    saveLocalStore(store);
  }
}

async function closePendingReports(targetType: 'post' | 'reply', targetId: string) {
  if (isPostgresConfigured && db) {
    await db.update(schema.reports).set({ status: 'SUPERSEDED' })
      .where(and(eq(schema.reports.targetType, targetType), eq(schema.reports.targetId, targetId), eq(schema.reports.status, 'PENDING')));
  } else {
    const store = getLocalStore();
    for (const report of store.reports) {
      if (report.targetType === targetType && report.targetId === targetId && report.status === 'PENDING') report.status = 'SUPERSEDED';
    }
    saveLocalStore(store);
  }
}

async function recordModerationCase(targetType: 'post' | 'reply', targetId: string, decision: ModerationDecision) {
  if (decision.state === 'published') return;
  const record: typeof schema.moderationCases.$inferInsert = {
    id: `mod-${crypto.randomUUID()}`,
    targetType,
    targetId,
    status: 'pending',
    source: decision.source,
    category: decision.category,
    reason: decision.reason,
  };
  if (isPostgresConfigured && db) {
    await db.insert(schema.moderationCases).values(record);
  } else {
    const store = getLocalStore();
    store.moderationCases ||= [];
    store.moderationCases.push({
      ...record,
      status: record.status || 'pending',
      createdAt: new Date(),
      reviewedAt: null,
    });
    saveLocalStore(store);
  }
}

export type AdminMessage = Omit<typeof schema.adminMessages.$inferSelect, 'sessionId'>;

function requirePersistentMessageStore() {
  if (process.env.NODE_ENV === 'production' && !isPostgresConfigured) {
    throw new Error('Penyimpanan pesan belum dikonfigurasi');
  }
}

function publicAdminMessage(message: typeof schema.adminMessages.$inferSelect): AdminMessage {
  const { sessionId: _sessionId, ...publicMessage } = message;
  return publicMessage;
}

export async function createAdminMessage(input: AdminMessageInput, sessionId: string): Promise<'created' | 'limited'> {
  requirePersistentMessageStore();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const record: typeof schema.adminMessages.$inferInsert = {
    id: `msg-${crypto.randomUUID()}`,
    sessionId,
    category: input.category,
    content: input.content,
  };
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const result = await db.execute(sql`
      INSERT INTO admin_messages (id, session_id, category, content)
      SELECT ${record.id}, ${sessionId}, ${input.category}, ${input.content}
      WHERE (SELECT count(*) FROM admin_messages WHERE session_id = ${sessionId} AND created_at > ${cutoff}) < 3
      RETURNING id
    `);
    return result.rowCount ? 'created' : 'limited';
  }
  const store = getLocalStore();
  store.adminMessages ||= [];
  if (store.adminMessages.filter((message) => message.sessionId === sessionId && new Date(message.createdAt) > cutoff).length >= 3) return 'limited';
  store.adminMessages.push({ ...record, readAt: null, createdAt: new Date() });
  saveLocalStore(store);
  return 'created';
}

export async function getAdminMessages(): Promise<AdminMessage[]> {
  requirePersistentMessageStore();
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const messages = await db.select().from(schema.adminMessages).orderBy(desc(schema.adminMessages.createdAt)).limit(100);
    return messages.map(publicAdminMessage);
  }
  return (getLocalStore().adminMessages || [])
    .slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 100).map(publicAdminMessage);
}

export async function markAdminMessageRead(id: string): Promise<boolean> {
  requirePersistentMessageStore();
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const updated = await db.update(schema.adminMessages).set({ readAt: new Date() })
      .where(and(eq(schema.adminMessages.id, id), sql`${schema.adminMessages.readAt} IS NULL`))
      .returning({ id: schema.adminMessages.id });
    if (updated.length) return true;
    const existing = await db.select({ id: schema.adminMessages.id }).from(schema.adminMessages).where(eq(schema.adminMessages.id, id)).limit(1);
    return existing.length > 0;
  }
  const store = getLocalStore();
  const message = (store.adminMessages || []).find((item) => item.id === id);
  if (!message) return false;
  if (!message.readAt) {
    message.readAt = new Date();
    saveLocalStore(store);
  }
  return true;
}

function saveLocalStore(store: LocalDBStore) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    console.error('[LocalDB] Failed to save store');
    throw new Error('Penyimpanan lokal tidak tersedia');
  }
}

/**
 * Calculate popular posts using actual engagement with time-decay formula
 * score = (reactions * 1.5 + replies * 3.0) / (hours_old + 2)^1.4
 */
function calculateEngagementScore(
  reactionCount: number,
  replyCount: number,
  createdAt: Date
): number {
  const ageInHours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
  const rawEngagement = reactionCount * 1.5 + replyCount * 3.0;
  return rawEngagement / Math.pow(ageInHours + 2, 1.4);
}

/**
 * Fetch filtered posts with real replies and reactions
 */
export async function getFilteredPosts(
  filter: FeedFilter = 'terbaru',
  topic?: string,
  searchQuery?: string,
  currentSessionId?: string
): Promise<Post[]> {
  if (isPostgresConfigured && db) {
    try {
      await ensurePostgresTables();

      const allPosts = await db.select().from(schema.posts).where(and(eq(schema.posts.isHidden, false), eq(schema.posts.moderationState, 'published')));

      // Fetch all replies and reactions for visible posts
      const allReplies = await db.select().from(schema.replies).where(eq(schema.replies.isHidden, false));
      const allReactions = await db.select().from(schema.reactions);

      let mapped: Post[] = allPosts.map((p) => {
        const postReplies = allReplies
          .filter((r) => r.postId === p.id && r.moderationState === 'published')
          .map((r) => ({
            id: r.id,
            postId: r.postId,
            authorAlias: r.authorAlias,
            authorType: r.authorType as any,
            content: r.content,
            createdAt: r.createdAt.toISOString(),
            isAiGenerated: r.isAiGenerated,
            isOwner: Boolean(currentSessionId && r.sessionId === currentSessionId),
          }));

        const postReactions = allReactions.filter((rx) => rx.postId === p.id);
        const reactionCounts: ReactionCounts = {
          dengerin: postReactions.filter((rx) => rx.reactionType === 'dengerin').length,
          relate: postReactions.filter((rx) => rx.reactionType === 'relate').length,
          senyum: postReactions.filter((rx) => rx.reactionType === 'senyum').length,
          peluk: postReactions.filter((rx) => rx.reactionType === 'peluk').length,
        };

        const userReactions = currentSessionId
          ? postReactions.filter((rx) => rx.sessionId === currentSessionId).map((rx) => rx.reactionType)
          : [];

        return {
          id: p.id,
          authorAlias: p.authorAlias,
          authorType: p.authorType as any,
          content: p.content,
          imageUrl: p.imageUrl || undefined,
          topic: p.topic,
          responseMode: p.responseMode as any,
          reactions: reactionCounts,
          userReactions,
          replies: postReplies,
          reportCount: p.reportCount,
          createdAt: p.createdAt.toISOString(),
          isAiGenerated: p.isAiGenerated,
          aiPrompt: p.aiPrompt || undefined,
          paperColor: (p.paperColor as any) || 'cream',
          rotation: p.rotation || 0,
          isOwner: Boolean(currentSessionId && p.sessionId === currentSessionId),
          isPinned: p.isPinned,
          moderationState: p.moderationState as any,
          searchConsent: p.searchConsent === true,
          isHidden: p.isHidden,
        };
      });

      return applyFiltersAndSorting(mapped, filter, topic, searchQuery);
    } catch (err) {
      console.warn('[DB] PostgreSQL query failed');
      throw err;
    }
  }

  // Local file store is used only when PostgreSQL is not configured.
  const store = getLocalStore();
  const visiblePosts = store.posts.filter((p) => !p.isHidden && p.moderationState === 'published');

  let mapped: Post[] = visiblePosts.map((p) => {
    const postReplies = store.replies
      .filter((r) => r.postId === p.id && !r.isHidden && r.moderationState === 'published')
      .map((r) => ({
        id: r.id,
        postId: r.postId,
        authorAlias: r.authorAlias,
        authorType: r.authorType as any,
        content: r.content,
        createdAt: new Date(r.createdAt).toISOString(),
        isAiGenerated: r.isAiGenerated,
        isOwner: Boolean(currentSessionId && r.sessionId === currentSessionId),
      }));

    const postReactions = store.reactions.filter((rx) => rx.postId === p.id);
    const reactionCounts: ReactionCounts = {
      dengerin: postReactions.filter((rx) => rx.reactionType === 'dengerin').length,
      relate: postReactions.filter((rx) => rx.reactionType === 'relate').length,
      senyum: postReactions.filter((rx) => rx.reactionType === 'senyum').length,
      peluk: postReactions.filter((rx) => rx.reactionType === 'peluk').length,
    };

    const userReactions = currentSessionId
      ? postReactions.filter((rx) => rx.sessionId === currentSessionId).map((rx) => rx.reactionType)
      : [];

    return {
      id: p.id,
      authorAlias: p.authorAlias,
      authorType: p.authorType as any,
      content: p.content,
      imageUrl: p.imageUrl || undefined,
      topic: p.topic,
      responseMode: p.responseMode as any,
      reactions: reactionCounts,
      userReactions,
      replies: postReplies,
      reportCount: p.reportCount,
      createdAt: new Date(p.createdAt).toISOString(),
      isAiGenerated: p.isAiGenerated,
      aiPrompt: p.aiPrompt || undefined,
      paperColor: (p.paperColor as any) || 'cream',
      rotation: p.rotation || 0,
      isOwner: Boolean(currentSessionId && p.sessionId === currentSessionId),
      isPinned: p.isPinned,
      moderationState: p.moderationState as any,
      searchConsent: p.searchConsent === true,
      isHidden: p.isHidden,
    };
  });

  return applyFiltersAndSorting(mapped, filter, topic, searchQuery);
}

function applyFiltersAndSorting(
  posts: Post[],
  filter: FeedFilter,
  topic?: string,
  searchQuery?: string
): Post[] {
  let result = [...posts];

  // 1. Search Query Filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.authorAlias.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q)
    );
  }

  // 2. Topic Filter
  if (topic && topic !== 'semua') {
    result = result.filter((p) => p.topic.toLowerCase() === topic.toLowerCase());
  }

  // 3. Feed Mode Sorting & Filtering
  if (filter === 'belum_dibalas') {
    result = result.filter((p) => p.replies.length === 0 && p.responseMode === 'boleh_dibalas');
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (filter === 'populer') {
    // Calculated with time decay: engagement score
    result.sort((a, b) => {
      const totalReactionsA = a.reactions.dengerin + a.reactions.relate + a.reactions.senyum + a.reactions.peluk;
      const totalReactionsB = b.reactions.dengerin + b.reactions.relate + b.reactions.senyum + b.reactions.peluk;
      const scoreA = calculateEngagementScore(totalReactionsA, a.replies.length, new Date(a.createdAt));
      const scoreB = calculateEngagementScore(totalReactionsB, b.replies.length, new Date(b.createdAt));
      return scoreB - scoreA;
    });
  } else if (filter === 'acak') {
    result.sort(() => Math.random() - 0.5);
  } else {
    // Default: 'terbaru' (with pinned posts prioritized)
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return result;
}

/**
 * Retrieve a single post by ID including replies and reactions
 */
export async function getSearchEligiblePosts(): Promise<Post[]> {
  // Reuse the public visibility filter, then apply a distinct search-consent gate.
  return eligiblePosts(await getFilteredPosts('terbaru'));
}

export async function getSearchVisibilitySummary() {
  const all = isPostgresConfigured && db
    ? (await ensurePostgresTables(), await db.select().from(schema.posts))
    : getLocalStore().posts;
  const eligible = await getSearchEligiblePosts();
  const publicCount = all.filter((post) => !post.isHidden && post.moderationState === 'published').length;
  return { eligible: eligible.length, noindex: publicCount - eligible.length, excluded: all.length - publicCount,
    sitemapUrl: 'https://ruangkoma.web.id/sitemap.xml',
    note: 'Angka ini adalah kelayakan internal, bukan jumlah halaman yang sudah diindeks mesin pencari.' };
}

export async function getPostById(
  postId: string,
  currentSessionId?: string
): Promise<Post | null> {
  const posts = await getFilteredPosts('terbaru', undefined, undefined, currentSessionId);
  const found = posts.find((p) => p.id === postId);
  return found || null;
}

/**
 * Create a new Post with Server-Side Moderation & Anonymous Session Ownership
 */
export async function createPost(
  newPostData: Partial<Post>,
  sessionId: string,
  authorSecret?: string,
  uploadToken?: string
): Promise<{ post?: Post; moderation?: ModerationDecision; error?: string; status?: number }> {
  const content = newPostData.content?.trim() || '';

  if (content.length < 3 || content.length > 2000) return { error: 'Coretan harus 3–2000 karakter.', status: 400 };
  if (!isAllowedImage(newPostData.imageUrl, uploadToken, sessionId)) {
    return { error: 'Gambar belum diverifikasi atau izin unggahan sudah kedaluwarsa.', status: 400 };
  }
  const alias = newPostData.authorType === 'pseudonim' ? newPostData.authorAlias?.trim() || 'Tanpa Nama' : 'Tanpa Nama';
  if (alias.length > 30 || !/^[\p{L}\p{N} .'-]+$/u.test(alias) || /\d{7,}/.test(alias)) {
    return { error: 'Nama samaran tidak valid.', status: 400 };
  }
  const moderation = await moderateText(content, 'post', (await getModerationRules()).custom);

  const postId = `post-${crypto.randomUUID()}`;
  const deleteSecretHash = authorSecret ? hashSecret(authorSecret) : null;
  const moderationState = moderation.state;

  const newPostRecord: typeof schema.posts.$inferInsert = {
    id: postId,
    authorAlias: alias,
    authorType: newPostData.authorType || 'tanpa_nama',
    sessionId,
    deleteSecretHash,
    content,
    imageUrl: newPostData.imageUrl || null,
    topic: newPostData.topic || 'isi-kepala',
    responseMode: newPostData.responseMode || 'boleh_dibalas',
    isAiGenerated: !!newPostData.isAiGenerated,
    aiPrompt: null,
    paperColor: newPostData.paperColor || 'cream',
    rotation: Number(((Math.random() * 3.6) - 1.8).toFixed(1)),
    moderationState,
    reportCount: 0,
    isHidden: moderationState === 'removed',
    isPinned: false,
    searchConsent: newPostData.searchConsent === true,
  };

  // PostgreSQL insertion
  if (isPostgresConfigured && db) {
    try {
      await ensurePostgresTables();
      await db.insert(schema.posts).values(newPostRecord);
    } catch (e) {
      console.warn('[DB] Failed to insert post into Postgres');
      throw e;
    }
  } else {
    const store = getLocalStore();
    store.posts.unshift({ ...newPostRecord, createdAt: new Date(), updatedAt: new Date() } as typeof schema.posts.$inferSelect);
    saveLocalStore(store);
  }
  await recordModerationCase('post', postId, moderation);

  const formattedPost: Post = {
    id: postId,
    authorAlias: newPostRecord.authorAlias || 'Tanpa Nama',
    authorType: newPostRecord.authorType as any,
    content: newPostRecord.content,
    imageUrl: newPostRecord.imageUrl || undefined,
    topic: newPostRecord.topic || 'isi-kepala',
    responseMode: newPostRecord.responseMode as any,
    reactions: { dengerin: 0, relate: 0, senyum: 0, peluk: 0 },
    userReactions: [],
    replies: [],
    reportCount: 0,
    createdAt: new Date().toISOString(),
    isAiGenerated: newPostRecord.isAiGenerated,
    aiPrompt: newPostRecord.aiPrompt || undefined,
    paperColor: newPostRecord.paperColor as any,
    rotation: newPostRecord.rotation || 0,
    isOwner: true,
    isPinned: false,
    moderationState: moderationState as any,
    searchConsent: newPostRecord.searchConsent,
  };

  return { post: formattedPost, moderation };
}

/**
 * Edit an existing post (Restricted to post owner)
 */
export async function updatePost(
  postId: string,
  newContent: string,
  sessionId: string,
  providedSecret?: string
): Promise<{ success: boolean; error?: string; moderation?: ModerationDecision }> {
  const content = newContent.trim();
  if (content.length < 3) {
    return { success: false, error: 'Coretan terlalu pendek (minimal 3 karakter).' };
  }

  if (content.length > 2000) return { success: false, error: 'Coretan terlalu panjang.' };

  if (isPostgresConfigured && db) {
    try {
      const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
      if (!existing) return { success: false, error: 'Coretan tidak ditemukan.' };

      const isOwner = existing.sessionId === sessionId || (providedSecret && existing.deleteSecretHash === hashSecret(providedSecret));
      if (!isOwner) return { success: false, error: 'Kamu tidak memiliki izin untuk mengedit coretan ini.' };

      const classified = await moderateText(content, 'post', (await getModerationRules()).custom);
      const moderation: ModerationDecision = (existing.moderationState !== 'published' || existing.isHidden) && classified.state === 'published'
        ? { ...classified, state: 'held_for_review', reason: 'Perubahan konten tersembunyi menunggu pengelola.' }
        : classified;
      await db.update(schema.posts)
        .set({ content, searchConsent: false, moderationState: moderation.state, isHidden: moderation.state === 'removed', updatedAt: new Date() })
        .where(eq(schema.posts.id, postId));
      await closePendingCases('post', postId);
      await closePendingReports('post', postId);
      await recordModerationCase('post', postId, moderation);
      return { success: true, moderation };
    } catch (e) {
      console.warn('[DB] Failed to update post in Postgres');
      throw e;
    }
  }

  // Local store update
  const store = getLocalStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) return { success: false, error: 'Coretan tidak ditemukan.' };

  const isOwner = post.sessionId === sessionId || (providedSecret && post.deleteSecretHash === hashSecret(providedSecret));
  if (!isOwner) return { success: false, error: 'Kamu tidak memiliki izin untuk mengedit coretan ini.' };

  const classified = await moderateText(content, 'post', (await getModerationRules()).custom);
  const moderation: ModerationDecision = (post.moderationState !== 'published' || post.isHidden) && classified.state === 'published'
    ? { ...classified, state: 'held_for_review', reason: 'Perubahan konten tersembunyi menunggu pengelola.' }
    : classified;
  post.content = content;
  post.searchConsent = false;
  post.moderationState = moderation.state;
  post.isHidden = moderation.state === 'removed';
  post.updatedAt = new Date();
  saveLocalStore(store);
  await closePendingCases('post', postId);
  await closePendingReports('post', postId);
  await recordModerationCase('post', postId, moderation);

  return { success: true, moderation };
}

/**
 * Delete a post (Restricted to post owner or admin)
 */
export async function deletePost(
  postId: string,
  sessionId: string,
  providedSecret?: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (isPostgresConfigured && db) {
    try {
      const [existing] = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
      if (!existing) return { success: false, error: 'Coretan tidak ditemukan.' };

      const isOwner = isAdmin || existing.sessionId === sessionId || (providedSecret && existing.deleteSecretHash === hashSecret(providedSecret));
      if (!isOwner) return { success: false, error: 'Kamu tidak memiliki izin untuk menghapus coretan ini.' };

      const children = await db.select({ id: schema.replies.id }).from(schema.replies).where(eq(schema.replies.postId, postId));
      await db.delete(schema.posts).where(eq(schema.posts.id, postId));
      for (const child of children) { await closePendingCases('reply', child.id); await closePendingReports('reply', child.id); }
      await closePendingCases('post', postId);
      await closePendingReports('post', postId);
      return { success: true };
    } catch (e) {
      console.warn('[DB] Failed to delete post from Postgres');
      throw e;
    }
  }

  const store = getLocalStore();
  const index = store.posts.findIndex((p) => p.id === postId);
  if (index === -1) return { success: false, error: 'Coretan tidak ditemukan.' };

  const post = store.posts[index];
  const isOwner = isAdmin || post.sessionId === sessionId || (providedSecret && post.deleteSecretHash === hashSecret(providedSecret));
  if (!isOwner) return { success: false, error: 'Kamu tidak memiliki izin untuk menghapus coretan ini.' };

  store.posts.splice(index, 1);
  // Delete related replies & reactions
  const children = store.replies.filter((r) => r.postId === postId).map((r) => r.id);
  store.replies = store.replies.filter((r) => r.postId !== postId);
  store.reactions = store.reactions.filter((rx) => rx.postId !== postId);
  saveLocalStore(store);
  for (const childId of children) { await closePendingCases('reply', childId); await closePendingReports('reply', childId); }
  await closePendingCases('post', postId);
  await closePendingReports('post', postId);

  return { success: true };
}

/**
 * Add reply with permission check ('boleh_dibalas')
 */
export async function addReply(
  postId: string,
  replyData: Partial<Reply>,
  sessionId: string
): Promise<{ reply?: Reply; moderation?: ModerationDecision; error?: string }> {
  const content = replyData.content?.trim() || '';

  if (content.length < 2 || content.length > 1000) return { error: 'Balasan harus 2–1000 karakter.' };

  // Permission check: Does post allow replies?
  let targetPost: typeof schema.posts.$inferSelect | undefined;
  if (isPostgresConfigured && db) {
    const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, postId));
    targetPost = post;
  }

  if (!isPostgresConfigured) {
    const store = getLocalStore();
    targetPost = store.posts.find((p) => p.id === postId);
  }

  if (!targetPost) {
    return { error: 'Coretan tidak ditemukan.' };
  }

  if (targetPost.isHidden || targetPost.moderationState !== 'published') return { error: 'Coretan tidak tersedia.' };

  if (targetPost.responseMode !== 'boleh_dibalas') {
    return { error: 'Penulis memilih opsi "Cukup Didengar". Coretan ini tidak menerima tanggapan balasan.' };
  }

  const alias = replyData.authorType === 'pseudonim' ? replyData.authorAlias?.trim() || 'Tanpa Nama' : 'Tanpa Nama';
  if (alias.length > 30 || !/^[\p{L}\p{N} .'-]+$/u.test(alias) || /\d{7,}/.test(alias)) return { error: 'Nama samaran tidak valid.' };
  const moderation = await moderateText(content, 'reply', (await getModerationRules()).custom);
  const replyId = `rep-${crypto.randomUUID()}`;
  const moderationState = moderation.state;

  const newReplyRecord: typeof schema.replies.$inferInsert = {
    id: replyId,
    postId,
    sessionId,
    authorAlias: alias,
    authorType: replyData.authorType || 'tanpa_nama',
    content,
    isAiGenerated: !!replyData.isAiGenerated,
    moderationState,
    isHidden: moderationState === 'removed',
  };

  if (isPostgresConfigured && db) {
    try {
      await db.insert(schema.replies).values(newReplyRecord);
    } catch (e) {
      console.warn('[DB] Failed to insert reply into Postgres');
      throw e;
    }
  } else {
    const store = getLocalStore();
    store.replies.push({ ...newReplyRecord, createdAt: new Date() } as typeof schema.replies.$inferSelect);
    saveLocalStore(store);
  }
  await recordModerationCase('reply', replyId, moderation);

  const formattedReply: Reply = {
    id: replyId,
    postId,
    authorAlias: newReplyRecord.authorAlias || 'Tanpa Nama',
    authorType: newReplyRecord.authorType as any,
    content: newReplyRecord.content,
    createdAt: new Date().toISOString(),
    isAiGenerated: newReplyRecord.isAiGenerated,
    isOwner: true,
  };

  return { reply: formattedReply, moderation };
}

/**
 * Add or toggle Reaction (Real counts from database)
 */
export async function addReaction(
  postId: string,
  reaction: ReactionType,
  sessionId: string
): Promise<{ reactions: ReactionCounts; userReactions: string[] }> {
  if (isPostgresConfigured && db) {
    try {
      // Check if user already clicked this reaction
      const existing = await db
        .select()
        .from(schema.reactions)
        .where(
          and(
            eq(schema.reactions.postId, postId),
            eq(schema.reactions.reactionType, reaction),
            eq(schema.reactions.sessionId, sessionId)
          )
        );

      if (existing.length > 0) {
        // Toggle: remove reaction if clicked again
        await db
          .delete(schema.reactions)
          .where(
            and(
              eq(schema.reactions.postId, postId),
              eq(schema.reactions.reactionType, reaction),
              eq(schema.reactions.sessionId, sessionId)
            )
          );
      } else {
        await db.insert(schema.reactions).values({
          id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          postId,
          reactionType: reaction,
          sessionId,
        });
      }

      // Compute fresh counts
      const allForPost = await db.select().from(schema.reactions).where(eq(schema.reactions.postId, postId));
      const counts: ReactionCounts = {
        dengerin: allForPost.filter((r) => r.reactionType === 'dengerin').length,
        relate: allForPost.filter((r) => r.reactionType === 'relate').length,
        senyum: allForPost.filter((r) => r.reactionType === 'senyum').length,
        peluk: allForPost.filter((r) => r.reactionType === 'peluk').length,
      };

      const userReactions = allForPost
        .filter((r) => r.sessionId === sessionId)
        .map((r) => r.reactionType);

      return { reactions: counts, userReactions };
    } catch (e) {
      console.warn('[DB] Failed to process reaction in Postgres');
      throw e;
    }
  }

  // Local store update
  const store = getLocalStore();
  const existingIdx = store.reactions.findIndex(
    (rx) => rx.postId === postId && rx.reactionType === reaction && rx.sessionId === sessionId
  );

  if (existingIdx !== -1) {
    store.reactions.splice(existingIdx, 1);
  } else {
    store.reactions.push({
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      postId,
      reactionType: reaction,
      sessionId,
      createdAt: new Date(),
    });
  }
  saveLocalStore(store);

  const allForPost = store.reactions.filter((r) => r.postId === postId);
  const counts: ReactionCounts = {
    dengerin: allForPost.filter((r) => r.reactionType === 'dengerin').length,
    relate: allForPost.filter((r) => r.reactionType === 'relate').length,
    senyum: allForPost.filter((r) => r.reactionType === 'senyum').length,
    peluk: allForPost.filter((r) => r.reactionType === 'peluk').length,
  };

  const userReactions = allForPost
    .filter((r) => r.sessionId === sessionId)
    .map((r) => r.reactionType);

  return { reactions: counts, userReactions };
}

/**
 * Report a post or reply
 */
export async function reportTarget(payload: ReportPayload, reporterSession: string): Promise<{ success: boolean }> {
  const reportId = `report-${crypto.randomUUID()}`;
  const record: typeof schema.reports.$inferInsert = {
    id: reportId,
    targetType: payload.targetType || 'post',
    targetId: payload.postId,
    reason: payload.reason || 'lainnya',
    notes: payload.notes || null,
    status: 'PENDING',
    reporterSession,
  };

  let content: string;
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const target = record.targetType === 'post'
      ? (await db.select().from(schema.posts).where(eq(schema.posts.id, record.targetId)))[0]
      : (await db.select().from(schema.replies).where(eq(schema.replies.id, record.targetId)))[0];
    if (!target) return { success: false };
    content = target.content;
    await db.insert(schema.reports).values(record);
    if (record.targetType === 'post') {
      await db.update(schema.posts).set({ reportCount: sql`${schema.posts.reportCount} + 1` }).where(eq(schema.posts.id, record.targetId));
    }
  } else {
    const store = getLocalStore();
    const target = record.targetType === 'post'
      ? store.posts.find((p) => p.id === record.targetId)
      : store.replies.find((r) => r.id === record.targetId);
    if (!target) return { success: false };
    content = target.content;
    store.reports.push({ ...record, createdAt: new Date() } as typeof schema.reports.$inferSelect);
    if (record.targetType === 'post' && 'reportCount' in target) {
      target.reportCount += 1;
    }
    saveLocalStore(store);
  }
  const decision = await moderateText(content, record.targetType as 'post' | 'reply', (await getModerationRules()).custom);
  const type = record.targetType as 'post' | 'reply';
  const existing = isPostgresConfigured && db
    ? type === 'post' ? (await db.select().from(schema.posts).where(eq(schema.posts.id, record.targetId)))[0]
      : (await db.select().from(schema.replies).where(eq(schema.replies.id, record.targetId)))[0]
    : type === 'post' ? getLocalStore().posts.find((p) => p.id === record.targetId)
      : getLocalStore().replies.find((r) => r.id === record.targetId);
  if (!existing || existing.content !== content) {
    // The author edited or deleted the target while classification was in flight.
    await closePendingReports(type, record.targetId);
    return { success: true };
  }
  if (decision.state !== 'published') {
    // A later report must not undo a prior takedown.
    if (existing.moderationState !== 'removed' && !existing.isHidden) await setTargetVisibility(type, record.targetId, decision.state);
    await recordModerationCase(type, record.targetId, decision);
  } else {
    // A report still needs a human decision, even when AI considers the content safe.
    await recordModerationCase(type, record.targetId, { ...decision, state: 'held_for_review', reason: 'Laporan komunitas perlu ditinjau pengelola.' });
  }
  return { success: true };
}

/**
 * Donation Settings API
 */
export async function getDonationConfig(): Promise<DonationConfig> {
  if (isPostgresConfigured && db) await ensurePostgresTables();
  const settings = isPostgresConfigured && db
    ? Object.fromEntries((await db.select().from(schema.siteSettings)).map((row) => [row.key, row.value]))
    : getLocalStore().siteSettings;
  return {
    enabled: settings.qris_enabled !== 'false',
    qrisImageUrl: configuredQrisUrl(settings.qris_image_url),
    externalLinkUrl: donationUrl(settings.donation_external_url),
    customMessage: settings.donation_message || 'Dukung operasional Koma agar tetap mandiri, bebas iklan, dan bebas pelacak.',
  };
}

export async function saveDonationConfig(config: Partial<DonationConfig>): Promise<void> {
  const changes: Record<string, string> = {};
  if (config.enabled !== undefined) changes.qris_enabled = String(config.enabled);
  if (config.qrisImageUrl !== undefined) changes.qris_image_url = config.qrisImageUrl;
  if (config.externalLinkUrl !== undefined) changes.donation_external_url = config.externalLinkUrl;
  if (config.customMessage !== undefined) changes.donation_message = config.customMessage;
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    for (const [key, value] of Object.entries(changes)) {
      await db.insert(schema.siteSettings).values({ key, value }).onConflictDoUpdate({ target: schema.siteSettings.key, set: { value, updatedAt: new Date() } });
    }
    return;
  }
  const store = getLocalStore();
  Object.assign(store.siteSettings, changes);
  saveLocalStore(store);
}

/**
 * Admin Analytics Summary
 */
export async function getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  if (isPostgresConfigured && db) await ensurePostgresTables();
  const store = isPostgresConfigured ? null : getLocalStore();
  const posts = isPostgresConfigured && db ? await db.select().from(schema.posts) : store!.posts;
  const replies = isPostgresConfigured && db ? await db.select().from(schema.replies) : store!.replies;
  const reactions = isPostgresConfigured && db ? await db.select().from(schema.reactions) : store!.reactions;
  const reports = isPostgresConfigured && db ? await db.select().from(schema.reports) : store!.reports;
  const cases = isPostgresConfigured && db ? await db.select().from(schema.moderationCases) : store!.moderationCases || [];
  const totalPosts = posts.length;
  const totalReplies = replies.length;
  const totalReactions = reactions.length;
  const pendingTargets = new Set([
    ...reports.filter((r) => r.status === 'PENDING').map((r) => `${r.targetType}:${r.targetId}`),
    ...cases.filter((c) => c.status === 'pending').map((c) => `${c.targetType}:${c.targetId}`),
  ]);
  const totalReportsPending = pendingTargets.size;

  // Supported Coretan Rate (SCR 24h):
  // Posts created in past 24h with >= 1 reply / eligible posts in past 24h
  const oneDayAgo = Date.now() - 24 * 3600 * 1000;
  const recentEligible = posts.filter(
    (p) => new Date(p.createdAt).getTime() > oneDayAgo && p.responseMode === 'boleh_dibalas' && p.moderationState === 'published' && !p.isHidden
  );

  let supportedCount = 0;
  for (const post of recentEligible) {
    const hasReply = replies.some((r) => r.postId === post.id && !r.isHidden && r.moderationState === 'published');
    if (hasReply) supportedCount++;
  }

  const scr = recentEligible.length > 0 ? (supportedCount / recentEligible.length) * 100 : 0;

  // Unique active sessions
  const sessions = new Set([
    ...posts.map((p) => p.sessionId),
    ...replies.map((r) => r.sessionId),
    ...reactions.map((rx) => rx.sessionId),
  ]);

  return {
    totalPosts,
    totalReplies,
    totalReactions,
    totalReportsPending,
    supportedCoretanRate24h: Math.round(scr),
    activeSessionsCount: sessions.size,
  };
}

/**
 * Admin Moderation Queue
 */
export async function getAdminModerationQueue() {
  const store = isPostgresConfigured ? null : getLocalStore();
  if (isPostgresConfigured && db) await ensurePostgresTables();
  const cases = isPostgresConfigured && db ? await db.select().from(schema.moderationCases) : store?.moderationCases || [];
  const reports = isPostgresConfigured && db ? await db.select().from(schema.reports) : store!.reports;
  const posts = isPostgresConfigured && db ? await db.select().from(schema.posts) : store!.posts;
  const replies = isPostgresConfigured && db ? await db.select().from(schema.replies) : store!.replies;
  const targetInfo = (type: string, id: string) => {
    const target = type === 'reply' ? replies.find((r) => r.id === id) : posts.find((p) => p.id === id);
    return { targetContent: target?.content || '(Konten telah dihapus)', authorAlias: target?.authorAlias || 'Tanpa Nama', moderationState: target?.moderationState };
  };
  return [
    ...cases.map((c) => ({ id: c.id, targetType: c.targetType, targetId: c.targetId, kind: 'case' as const, status: c.status === 'pending' ? 'PENDING' : 'RESOLVED', reason: c.reason, category: c.category, source: c.source, createdAt: new Date(c.createdAt).toISOString(), ...targetInfo(c.targetType, c.targetId) })),
    ...reports.map((r) => ({ id: r.id, targetType: r.targetType, targetId: r.targetId, kind: 'report' as const, status: r.status, reason: r.reason, notes: r.notes, createdAt: new Date(r.createdAt).toISOString(), ...targetInfo(r.targetType, r.targetId) })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function resolveAdminReport(reportId: string, action: 'DISMISSED' | 'RESOLVED_HIDE' | 'RESOLVED_DELETE' | 'PUBLISH') {
  if (!['DISMISSED', 'RESOLVED_HIDE', 'RESOLVED_DELETE', 'PUBLISH'].includes(action)) return false;
  const isCase = reportId.startsWith('mod-');
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const item = isCase
      ? (await db.select().from(schema.moderationCases).where(eq(schema.moderationCases.id, reportId)))[0]
      : (await db.select().from(schema.reports).where(eq(schema.reports.id, reportId)))[0];
    if (!item || (isCase ? item.status !== 'pending' : item.status !== 'PENDING')) return false;
    if (item.targetType !== 'post' && item.targetType !== 'reply') return false;
    const target = item.targetType === 'post'
      ? (await db.select().from(schema.posts).where(eq(schema.posts.id, item.targetId)))[0]
      : (await db.select().from(schema.replies).where(eq(schema.replies.id, item.targetId)))[0];
    if (!target) return false;
    if (!isCase && action === 'DISMISSED' && (target.moderationState !== 'published' || target.isHidden)) return false;
    if (action === 'RESOLVED_DELETE') {
      if (item.targetType === 'post') {
        const children = await db.select({ id: schema.replies.id }).from(schema.replies).where(eq(schema.replies.postId, item.targetId));
        await db.delete(schema.posts).where(eq(schema.posts.id, item.targetId));
        for (const child of children) { await closePendingCases('reply', child.id); await closePendingReports('reply', child.id); }
      } else {
        await db.delete(schema.replies).where(eq(schema.replies.id, item.targetId));
      }
    } else if (action === 'RESOLVED_HIDE') {
      await setTargetVisibility(item.targetType as 'post' | 'reply', item.targetId, 'removed');
    } else if (action === 'PUBLISH' || (isCase && action === 'DISMISSED')) {
      await setTargetVisibility(item.targetType as 'post' | 'reply', item.targetId, 'published');
    }
    if (isCase) await db.update(schema.moderationCases).set({ status: action, reviewedAt: new Date() }).where(eq(schema.moderationCases.id, reportId));
    else await db.update(schema.reports).set({ status: action === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED' }).where(eq(schema.reports.id, reportId));
    if (action === 'RESOLVED_DELETE' || action === 'RESOLVED_HIDE' || action === 'PUBLISH' || isCase) {
      await db.update(schema.moderationCases).set({ status: action, reviewedAt: new Date() })
        .where(and(eq(schema.moderationCases.targetType, item.targetType), eq(schema.moderationCases.targetId, item.targetId), eq(schema.moderationCases.status, 'pending')));
      await db.update(schema.reports).set({ status: 'RESOLVED' })
        .where(and(eq(schema.reports.targetType, item.targetType), eq(schema.reports.targetId, item.targetId), eq(schema.reports.status, 'PENDING')));
    }
    await logAdminAudit('RESOLVE_MODERATION', reportId, `Tindakan pengelola: ${action}`);
    return true;
  }
  const store = getLocalStore();
  const item = isCase ? store.moderationCases?.find((c) => c.id === reportId) : store.reports.find((r) => r.id === reportId);
  if (!item || (isCase ? item.status !== 'pending' : item.status !== 'PENDING')) return false;
  if (item.targetType !== 'post' && item.targetType !== 'reply') return false;
  const target = item.targetType === 'post' ? store.posts.find((p) => p.id === item.targetId) : store.replies.find((r) => r.id === item.targetId);
  if (!target || (!isCase && action === 'DISMISSED' && (target.moderationState !== 'published' || target.isHidden))) return false;
  if (action === 'RESOLVED_DELETE') {
    if (item.targetType === 'post') {
      store.posts = store.posts.filter((p) => p.id !== item.targetId);
      const childIds = store.replies.filter((r) => r.postId === item.targetId).map((r) => r.id);
      store.replies = store.replies.filter((r) => r.postId !== item.targetId);
      for (const c of store.moderationCases || []) {
        if (childIds.includes(c.targetId) && c.status === 'pending') { c.status = 'superseded'; c.reviewedAt = new Date(); }
      }
      store.reactions = store.reactions.filter((r) => r.postId !== item.targetId);
    } else {
      store.replies = store.replies.filter((r) => r.id !== item.targetId);
    }
  } else if (action !== 'DISMISSED' || isCase) {
    target.moderationState = action === 'RESOLVED_HIDE' ? 'removed' : 'published';
    target.isHidden = action === 'RESOLVED_HIDE';
  }
  if (isCase) { item.status = action; (item as typeof schema.moderationCases.$inferSelect).reviewedAt = new Date(); }
  else item.status = action === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED';
  if (action === 'RESOLVED_DELETE' || action === 'RESOLVED_HIDE' || action === 'PUBLISH' || isCase) {
    for (const c of store.moderationCases || []) {
      if (c.targetType === item.targetType && c.targetId === item.targetId && c.status === 'pending') {
        c.status = action;
        c.reviewedAt = new Date();
      }
    }
    for (const report of store.reports) {
      if (report.targetType === item.targetType && report.targetId === item.targetId && report.status === 'PENDING') report.status = 'RESOLVED';
    }
  }
  saveLocalStore(store);
  await logAdminAudit('RESOLVE_MODERATION', reportId, `Tindakan pengelola: ${action}`);
  return true;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export async function logAdminAudit(action: string, target: string, details: string): Promise<void> {
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    await db.insert(schema.adminAuditLogs).values({ id: crypto.randomUUID(), action, target, details });
    return;
  }
  try {
    const store = getLocalStore();
    let logs: AdminAuditEntry[] = [];
    if (store.siteSettings.admin_audit_logs) {
      try {
        logs = JSON.parse(store.siteSettings.admin_audit_logs);
      } catch {
        logs = [];
      }
    }

    const newEntry: AdminAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newEntry);
    if (logs.length > 50) logs = logs.slice(0, 50);
    store.siteSettings.admin_audit_logs = JSON.stringify(logs);
    saveLocalStore(store);
  } catch (e) {
    console.error('Failed to write audit log');
    throw e;
  }
}

export async function getAdminAuditLogs(): Promise<AdminAuditEntry[]> {
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const rows = await db.select().from(schema.adminAuditLogs).orderBy(sql`${schema.adminAuditLogs.createdAt} DESC`).limit(50);
    return rows.map((row) => ({ id: row.id, action: row.action, target: row.target, details: row.details, timestamp: row.createdAt.toISOString() }));
  }
  const store = getLocalStore();
  if (store.siteSettings.admin_audit_logs) {
    try {
      return JSON.parse(store.siteSettings.admin_audit_logs);
    } catch {
      return [];
    }
  }
  return [];
}

export interface AdminContentFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
  status?: 'all' | 'published' | 'held_for_review' | 'hidden' | 'pinned';
  sortBy?: 'createdAt' | 'replies' | 'reactions' | 'reports';
  sortOrder?: 'asc' | 'desc';
}

export async function getAllPostsForAdmin(options: AdminContentFilterOptions = {}) {
  if (isPostgresConfigured && db) await ensurePostgresTables();
  const store = isPostgresConfigured ? null : getLocalStore();
  const posts = isPostgresConfigured && db ? await db.select().from(schema.posts) : store!.posts;
  const replies = isPostgresConfigured && db ? await db.select().from(schema.replies) : store!.replies;
  const reactions = isPostgresConfigured && db ? await db.select().from(schema.reactions) : store!.reactions;
  const reports = isPostgresConfigured && db ? await db.select().from(schema.reports) : store!.reports;
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(50, options.limit || 10));

  let items = posts.map((p) => {
    const postReplies = replies.filter((r) => r.postId === p.id && r.moderationState === 'published' && !r.isHidden);
    const postReactions = reactions.filter((rx) => rx.postId === p.id);
    const reportsForPost = reports.filter((rep) => rep.targetType === 'post' && rep.targetId === p.id);

    const { sessionId: _sessionId, deleteSecretHash: _deleteSecretHash, ...publicFields } = p;
    return {
      ...publicFields,
      createdAt: new Date(p.createdAt).toISOString(),
      updatedAt: new Date(p.updatedAt).toISOString(),
      replyCount: postReplies.length,
      reactionCount: postReactions.length,
      reportCount: Math.max(p.reportCount || 0, reportsForPost.length),
      reactionsSummary: {
        dengerin: postReactions.filter((rx) => rx.reactionType === 'dengerin').length,
        relate: postReactions.filter((rx) => rx.reactionType === 'relate').length,
        senyum: postReactions.filter((rx) => rx.reactionType === 'senyum').length,
        peluk: postReactions.filter((rx) => rx.reactionType === 'peluk').length,
      },
    };
  });

  // Filter: Search
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    items = items.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.authorAlias.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }

  // Filter: Topic
  if (options.topic && options.topic !== 'all') {
    items = items.filter((p) => p.topic.toLowerCase() === options.topic?.toLowerCase());
  }

  // Filter: Status
  if (options.status && options.status !== 'all') {
    if (options.status === 'hidden') {
      items = items.filter((p) => p.isHidden);
    } else if (options.status === 'pinned') {
      items = items.filter((p) => p.isPinned);
    } else if (options.status === 'held_for_review') {
      items = items.filter((p) => p.moderationState === 'held_for_review');
    } else if (options.status === 'published') {
      items = items.filter((p) => !p.isHidden && p.moderationState === 'published');
    }
  }

  // Sorting
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  items.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'replies') {
      comparison = b.replyCount - a.replyCount;
    } else if (sortBy === 'reactions') {
      comparison = b.reactionCount - a.reactionCount;
    } else if (sortBy === 'reports') {
      comparison = b.reportCount - a.reportCount;
    } else {
      comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
    },
  };
}

export async function adminUpdatePost(
  postId: string,
  updates: { isHidden?: boolean; isPinned?: boolean; moderationState?: string }
): Promise<boolean> {
  if (updates.moderationState === 'published') updates.isHidden = false;
  if (updates.moderationState === 'removed') updates.isHidden = true;
  if (updates.moderationState === 'held_for_review') updates.isHidden = false;
  if (updates.isHidden === false && !updates.moderationState) updates.moderationState = 'published';
  if (updates.isHidden === true && !updates.moderationState) updates.moderationState = 'removed';
  if (isPostgresConfigured && db) {
    const [existing] = await db.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.id, postId));
    if (!existing) return false;
    await db.update(schema.posts).set({ ...updates, updatedAt: new Date() }).where(eq(schema.posts.id, postId));
    if (updates.moderationState || updates.isHidden !== undefined) {
      await closePendingCases('post', postId);
      await closePendingReports('post', postId);
    }
    await logAdminAudit('UPDATE_POST', postId, `Tindakan pengelola pada coretan #${postId}`);
    return true;
  }

  const store = getLocalStore();
  const post = store.posts.find((p) => p.id === postId);
  if (!post) return false;

  if (updates.isHidden !== undefined) post.isHidden = updates.isHidden;
  if (updates.isPinned !== undefined) post.isPinned = updates.isPinned;
  if (updates.moderationState !== undefined) post.moderationState = updates.moderationState;
  post.updatedAt = new Date();

  const changeDetails = Object.entries(updates)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  saveLocalStore(store);
  await logAdminAudit('UPDATE_POST', postId, `Perubahan status coretan #${postId}: ${changeDetails}`);
  if (updates.moderationState || updates.isHidden !== undefined) {
    await closePendingCases('post', postId);
    await closePendingReports('post', postId);
  }
  return true;
}

export async function adminDeletePost(postId: string): Promise<boolean> {
  if (isPostgresConfigured && db) {
    const [existing] = await db.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.id, postId));
    if (!existing) return false;
    const children = await db.select({ id: schema.replies.id }).from(schema.replies).where(eq(schema.replies.postId, postId));
    await db.delete(schema.posts).where(eq(schema.posts.id, postId));
    await closePendingCases('post', postId);
    await closePendingReports('post', postId);
    for (const child of children) { await closePendingCases('reply', child.id); await closePendingReports('reply', child.id); }
    await logAdminAudit('DELETE_POST', postId, `Coretan #${postId} dihapus pengelola.`);
    return true;
  }

  const store = getLocalStore();
  const index = store.posts.findIndex((p) => p.id === postId);
  if (index === -1) return false;

  const children = store.replies.filter((r) => r.postId === postId).map((r) => r.id);
  store.posts.splice(index, 1);
  store.replies = store.replies.filter((r) => r.postId !== postId);
  store.reactions = store.reactions.filter((rx) => rx.postId !== postId);

  saveLocalStore(store);
  await logAdminAudit('DELETE_POST', postId, `Coretan #${postId} dihapus secara permanen oleh pengelola.`);
  await closePendingCases('post', postId);
  await closePendingReports('post', postId);
  for (const child of children) { await closePendingCases('reply', child); await closePendingReports('reply', child); }
  return true;
}

export async function getModerationRules(): Promise<{ baseline: ModerationRuleItem[]; custom: ModerationRuleItem[] }> {
  if (isPostgresConfigured && db) await ensurePostgresTables();
  const rows = isPostgresConfigured && db ? await db.select().from(schema.moderationRules) : getLocalStore().moderationRules || [];
  const custom: ModerationRuleItem[] = rows.map((r) => ({
    id: r.id,
    wordOrPattern: r.wordOrPattern,
    ruleType: r.ruleType as ModerationRuleItem['ruleType'],
    action: r.action as ModerationRuleItem['action'],
    severity: r.severity as ModerationRuleItem['severity'],
    description: r.description || undefined,
  }));
  return { baseline: BASELINE_RULES, custom };
}

export async function addModerationRule(ruleData: {
  wordOrPattern: string;
  ruleType: 'banned_word' | 'allowlist' | 'regex';
  action: 'allow' | 'warn' | 'review' | 'reject';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}): Promise<ModerationRuleItem> {
  const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const record: typeof schema.moderationRules.$inferInsert = {
    id: ruleId,
    wordOrPattern: ruleData.wordOrPattern.trim(),
    ruleType: ruleData.ruleType,
    action: ruleData.action,
    severity: ruleData.severity,
    description: ruleData.description || null,
  };

  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    await db.insert(schema.moderationRules).values(record);
  } else {
    const store = getLocalStore();
    if (!store.moderationRules) store.moderationRules = [];
    store.moderationRules.push({ ...record, ruleType: ruleData.ruleType, action: ruleData.action, severity: ruleData.severity, description: record.description ?? null, createdAt: new Date() });
    saveLocalStore(store);
  }
  await logAdminAudit('ADD_RULE', ruleId, `Aturan baru ditambahkan (${ruleData.ruleType}, ${ruleData.action}, ${ruleData.severity})`);

  return {
    id: ruleId,
    wordOrPattern: record.wordOrPattern,
    ruleType: ruleData.ruleType,
    action: ruleData.action,
    severity: ruleData.severity,
    description: record.description || undefined,
  };
}

export async function deleteModerationRule(ruleId: string): Promise<boolean> {
  if (isPostgresConfigured && db) {
    await ensurePostgresTables();
    const deleted = await db.delete(schema.moderationRules).where(eq(schema.moderationRules.id, ruleId)).returning({ id: schema.moderationRules.id });
    if (!deleted.length) return false;
  } else {
    const store = getLocalStore();
    if (!store.moderationRules) return false;
    const idx = store.moderationRules.findIndex((r) => r.id === ruleId);
    if (idx === -1) return false;
    store.moderationRules.splice(idx, 1);
    saveLocalStore(store);
  }
  await logAdminAudit('DELETE_RULE', ruleId, 'Aturan moderasi kustom dihapus.');
  return true;
}

export interface DetailedAnalyticsResult {
  period: '24h' | '7d' | '30d' | 'all';
  dateRange: { start: string; end: string; prevStart: string; prevEnd: string };
  kpis: {
    totalPosts: { current: number; previous: number; delta: number; percentChange: number };
    totalReplies: { current: number; previous: number; delta: number; percentChange: number };
    totalReactions: { current: number; previous: number; delta: number; percentChange: number };
    uniqueVisitors: { current: number; previous: number; delta: number; percentChange: number };
    supportedCoretanRate: { current: number; previous: number; delta: number };
  };
  timeSeries: Array<{
    label: string;
    timestamp: string;
    posts: number;
    replies: number;
    reactions: number;
    visitors: number;
  }>;
  topicBreakdown: Array<{
    topic: string;
    count: number;
    percentage: number;
    reactions: number;
    replies: number;
  }>;
  responseModeStats: {
    bolehDibalas: number;
    cukupDidengar: number;
  };
  retention: {
    totalUniqueSessions: number;
    multiDaySessions: number;
    retentionRate: number;
    note: string;
  };
  deviceAndSource: {
    tracked: boolean;
    message: string;
  };
  topContent: Array<{
    id: string;
    content: string;
    authorAlias: string;
    topic: string;
    replyCount: number;
    reactionCount: number;
    engagementScore: number;
    createdAt: string;
  }>;
}

export async function getAdminDetailedAnalytics(
  period: '24h' | '7d' | '30d' | 'all' = '7d'
): Promise<DetailedAnalyticsResult> {
  if (isPostgresConfigured && db) await ensurePostgresTables();
  const local = isPostgresConfigured ? null : getLocalStore();
  const store = {
    posts: isPostgresConfigured && db ? await db.select().from(schema.posts) : local!.posts,
    replies: isPostgresConfigured && db ? await db.select().from(schema.replies) : local!.replies,
    reactions: isPostgresConfigured && db ? await db.select().from(schema.reactions) : local!.reactions,
  };
  const now = Date.now();

  let durationMs = 7 * 24 * 3600 * 1000;
  if (period === '24h') durationMs = 24 * 3600 * 1000;
  else if (period === '30d') durationMs = 30 * 24 * 3600 * 1000;
  else if (period === 'all') durationMs = 90 * 24 * 3600 * 1000;

  const currentStart = now - durationMs;
  const currentEnd = now;
  const prevStart = currentStart - durationMs;
  const prevEnd = currentStart;

  // Filter items by periods using real timestamps
  const postsCurrent = store.posts.filter((p) => {
    const t = new Date(p.createdAt).getTime();
    return t >= currentStart && t <= currentEnd;
  });
  const postsPrev = store.posts.filter((p) => {
    const t = new Date(p.createdAt).getTime();
    return t >= prevStart && t < prevEnd;
  });

  const repliesCurrent = store.replies.filter((r) => {
    const t = new Date(r.createdAt).getTime();
    return t >= currentStart && t <= currentEnd;
  });
  const repliesPrev = store.replies.filter((r) => {
    const t = new Date(r.createdAt).getTime();
    return t >= prevStart && t < prevEnd;
  });

  const reactionsCurrent = store.reactions.filter((rx) => {
    const t = new Date(rx.createdAt).getTime();
    return t >= currentStart && t <= currentEnd;
  });
  const reactionsPrev = store.reactions.filter((rx) => {
    const t = new Date(rx.createdAt).getTime();
    return t >= prevStart && t < prevEnd;
  });

  // Unique Sessions in current & previous
  const sessionsCurrent = new Set([
    ...postsCurrent.map((p) => p.sessionId),
    ...repliesCurrent.map((r) => r.sessionId),
    ...reactionsCurrent.map((rx) => rx.sessionId),
  ]);
  const sessionsPrev = new Set([
    ...postsPrev.map((p) => p.sessionId),
    ...repliesPrev.map((r) => r.sessionId),
    ...reactionsPrev.map((rx) => rx.sessionId),
  ]);

  // Calculate SCR 24h for current period eligible posts
  const eligibleCurrent = postsCurrent.filter((p) => p.responseMode === 'boleh_dibalas' && p.moderationState === 'published' && !p.isHidden);
  let supportedCurrent = 0;
  for (const post of eligibleCurrent) {
    if (store.replies.some((r) => r.postId === post.id && !r.isHidden && r.moderationState === 'published')) {
      supportedCurrent++;
    }
  }
  const scrCurrent = eligibleCurrent.length > 0 ? Math.round((supportedCurrent / eligibleCurrent.length) * 100) : 0;

  const eligiblePrev = postsPrev.filter((p) => p.responseMode === 'boleh_dibalas' && p.moderationState === 'published' && !p.isHidden);
  let supportedPrev = 0;
  for (const post of eligiblePrev) {
    if (store.replies.some((r) => r.postId === post.id && !r.isHidden && r.moderationState === 'published')) {
      supportedPrev++;
    }
  }
  const scrPrev = eligiblePrev.length > 0 ? Math.round((supportedPrev / eligiblePrev.length) * 100) : 0;

  const calcChange = (curr: number, prev: number) => {
    const delta = curr - prev;
    const percentChange = prev === 0 ? (curr > 0 ? 100 : 0) : Math.round((delta / prev) * 100);
    return { current: curr, previous: prev, delta, percentChange };
  };

  // Generate Time Series Buckets based on real data
  const numBuckets = period === '24h' ? 12 : period === '7d' ? 7 : period === '30d' ? 15 : 12;
  const bucketDuration = durationMs / numBuckets;
  const timeSeries = [];

  for (let i = 0; i < numBuckets; i++) {
    const bStart = currentStart + i * bucketDuration;
    const bEnd = bStart + bucketDuration;
    const bDate = new Date(bStart);

    let label = '';
    if (period === '24h') {
      label = bDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else {
      label = bDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }

    const bPosts = store.posts.filter((p) => {
      const t = new Date(p.createdAt).getTime();
      return t >= bStart && t < bEnd;
    });
    const bReplies = store.replies.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= bStart && t < bEnd;
    });
    const bReactions = store.reactions.filter((rx) => {
      const t = new Date(rx.createdAt).getTime();
      return t >= bStart && t < bEnd;
    });

    const bSessions = new Set([
      ...bPosts.map((p) => p.sessionId),
      ...bReplies.map((r) => r.sessionId),
      ...bReactions.map((rx) => rx.sessionId),
    ]);

    timeSeries.push({
      label,
      timestamp: new Date(bStart).toISOString(),
      posts: bPosts.length,
      replies: bReplies.length,
      reactions: bReactions.length,
      visitors: bSessions.size,
    });
  }

  // Topic breakdown
  const topicMap: Record<string, { count: number; reactions: number; replies: number }> = {};
  for (const post of postsCurrent) {
    const t = post.topic || 'isi-kepala';
    if (!topicMap[t]) topicMap[t] = { count: 0, reactions: 0, replies: 0 };
    topicMap[t].count++;
    topicMap[t].reactions += store.reactions.filter((rx) => rx.postId === post.id).length;
    topicMap[t].replies += store.replies.filter((r) => r.postId === post.id).length;
  }

  const totalTopicPosts = postsCurrent.length || 1;
  const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    count: data.count,
    percentage: Math.round((data.count / totalTopicPosts) * 100),
    reactions: data.reactions,
    replies: data.replies,
  }));
  topicBreakdown.sort((a, b) => b.count - a.count);

  // Response mode stats
  const bolehDibalas = postsCurrent.filter((p) => p.responseMode === 'boleh_dibalas').length;
  const cukupDidengar = postsCurrent.filter((p) => p.responseMode === 'cukup_didengar').length;

  // Returning sessions calculation (sessions with interactions on >1 distinct days)
  const sessionDayMap = new Map<string, Set<string>>();
  for (const p of store.posts) {
    const day = new Date(p.createdAt).toISOString().split('T')[0];
    if (!sessionDayMap.has(p.sessionId)) sessionDayMap.set(p.sessionId, new Set());
    sessionDayMap.get(p.sessionId)!.add(day);
  }
  for (const r of store.replies) {
    const day = new Date(r.createdAt).toISOString().split('T')[0];
    if (!sessionDayMap.has(r.sessionId)) sessionDayMap.set(r.sessionId, new Set());
    sessionDayMap.get(r.sessionId)!.add(day);
  }
  for (const rx of store.reactions) {
    const day = new Date(rx.createdAt).toISOString().split('T')[0];
    if (!sessionDayMap.has(rx.sessionId)) sessionDayMap.set(rx.sessionId, new Set());
    sessionDayMap.get(rx.sessionId)!.add(day);
  }

  let multiDayCount = 0;
  for (const [, days] of sessionDayMap.entries()) {
    if (days.size > 1) multiDayCount++;
  }
  const totalSessions = sessionDayMap.size;
  const retentionRate = totalSessions > 0 ? Math.round((multiDayCount / totalSessions) * 100) : 0;

  // Top content ranked by engagement
  const topContent = store.posts.filter((p) => p.moderationState === 'published' && !p.isHidden)
    .map((p) => {
      const pReactions = store.reactions.filter((rx) => rx.postId === p.id).length;
      const pReplies = store.replies.filter((r) => r.postId === p.id).length;
      const score = calculateEngagementScore(pReactions, pReplies, new Date(p.createdAt));
      return {
        id: p.id,
        content: p.content,
        authorAlias: p.authorAlias,
        topic: p.topic,
        replyCount: pReplies,
        reactionCount: pReactions,
        engagementScore: Math.round(score * 10) / 10,
        createdAt: new Date(p.createdAt).toISOString(),
      };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);

  return {
    period,
    dateRange: {
      start: new Date(currentStart).toISOString(),
      end: new Date(currentEnd).toISOString(),
      prevStart: new Date(prevStart).toISOString(),
      prevEnd: new Date(prevEnd).toISOString(),
    },
    kpis: {
      totalPosts: calcChange(postsCurrent.length, postsPrev.length),
      totalReplies: calcChange(repliesCurrent.length, repliesPrev.length),
      totalReactions: calcChange(reactionsCurrent.length, reactionsPrev.length),
      uniqueVisitors: calcChange(sessionsCurrent.size, sessionsPrev.size),
      supportedCoretanRate: {
        current: scrCurrent,
        previous: scrPrev,
        delta: scrCurrent - scrPrev,
      },
    },
    timeSeries,
    topicBreakdown,
    responseModeStats: {
      bolehDibalas,
      cukupDidengar,
    },
    retention: {
      totalUniqueSessions: totalSessions,
      multiDaySessions: multiDayCount,
      retentionRate,
      note: 'Dihitung dari sesi yang memiliki jejak interaksi pada lebih dari satu hari kalender terpisah.',
    },
    deviceAndSource: {
      tracked: false,
      message: 'Pelacakan fingerprint peramban dan referrer dinonaktifkan secara ketat untuk kepatuhan etika privasi anonim (UU PDP). Sistem hanya mengagregasi sesi internal tanpa merekam IP publik mentah.',
    },
    topContent,
  };
}

export async function getSystemHealth() {
  const isPostgres = isPostgresConfigured && Boolean(db);
  if (isPostgres) await ensurePostgresTables();
  const store = isPostgres ? null : getLocalStore();
  const counts = isPostgres && db ? {
    posts: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.posts))[0].count),
    replies: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.replies))[0].count),
    reactions: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.reactions))[0].count),
    reports: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.reports))[0].count),
    moderationRules: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.moderationRules))[0].count),
    analyticsEvents: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.analyticsEvents))[0].count),
    aiPosts: Number((await db.select({ count: sql<number>`count(*)` }).from(schema.posts).where(eq(schema.posts.isAiGenerated, true)))[0].count),
  } : {
    posts: store!.posts.length,
    replies: store!.replies.length,
    reactions: store!.reactions.length,
    reports: store!.reports.length,
    moderationRules: (store!.moderationRules || []).length,
    analyticsEvents: (store!.analyticsEvents || []).length,
    aiPosts: store!.posts.filter((p) => p.isAiGenerated).length,
  };

  let localFileSizeKb = 0;
  if (!isPostgres && fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const stats = fs.statSync(LOCAL_DB_PATH);
      localFileSizeKb = Math.round(stats.size / 1024);
    } catch {}
  }

  const aiApiKeyConfigured = Boolean((process.env.AI_MODERATION_API_KEY || process.env.AI_API_KEY)?.trim());
  const aiModelConfigured = Boolean((process.env.AI_MODERATION_MODEL || process.env.AI_MODEL)?.trim());
  const aiBaseUrl = process.env.AI_MODERATION_BASE_URL || 'https://api.openai.com/v1';
  const aiStatus = aiApiKeyConfigured && aiModelConfigured ? 'configured_unverified' : 'unavailable_review_required';

  // Audit logs
  const auditLogs = await getAdminAuditLogs();

  return {
    database: {
      engine: isPostgres ? 'PostgreSQL (Vercel / Supabase)' : 'Local JSON Store (.local-koma-db.json)',
      connected: true,
      fileSizeKb: isPostgres ? null : localFileSizeKb,
      tables: {
        posts: counts.posts,
        replies: counts.replies,
        reactions: counts.reactions,
        reports: counts.reports,
        moderationRules: counts.moderationRules,
        analyticsEvents: counts.analyticsEvents,
      },
    },
    aiEngine: {
      status: aiStatus,
      provider: aiApiKeyConfigured && aiModelConfigured ? 'Model moderasi terkonfigurasi (belum diuji)' : 'Moderasi AI tidak tersedia',
      apiKeySet: aiApiKeyConfigured && aiModelConfigured,
      baseUrl: aiBaseUrl,
      fallbackModeActive: false,
      totalAiGeneratedPosts: counts.aiPosts,
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    auditLogs: auditLogs.slice(0, 20),
  };
}
