export type AliasType = 'tanpa_nama' | 'pseudonim';

export type ResponseMode = 'boleh_dibalas' | 'cukup_didengar';

export type ReactionType = 'dengerin' | 'relate' | 'senyum' | 'peluk';

export interface ReactionCounts {
  dengerin: number;
  relate: number;
  senyum: number;
  peluk: number;
}

export interface Reply {
  id: string;
  postId: string;
  authorAlias: string;
  authorType: AliasType;
  content: string;
  createdAt: string;
  isAiGenerated?: boolean;
  isOwner?: boolean;
}

export interface Post {
  id: string;
  authorAlias: string;
  authorType: AliasType;
  content: string;
  imageUrl?: string;
  topic: string;
  responseMode: ResponseMode;
  reactions: ReactionCounts;
  userReactions?: string[]; // IDs of reactions clicked by current session
  replies: Reply[];
  reportCount: number;
  createdAt: string;
  isAiGenerated?: boolean;
  aiPrompt?: string;
  paperColor?: 'cream' | 'kraft' | 'lavender' | 'charcoal';
  rotation?: number; // subtle angle for analog scrapbook feel
  isOwner?: boolean;
  isPinned?: boolean;
  moderationState?: 'published' | 'held_for_review' | 'removed';
  searchConsent?: boolean;
  isHidden?: boolean;
}

export type FeedFilter = 'terbaru' | 'acak' | 'belum_dibalas' | 'populer' | 'topik';

export interface ReportPayload {
  postId: string;
  targetType?: 'post' | 'reply';
  reason: 'spam' | 'doxxing' | 'kebencian' | 'kekerasan' | 'lainnya';
  notes?: string;
}

export interface AIGeneratedContent {
  text: string;
  topic: string;
  tone: 'puitis' | 'santai' | 'lucu' | 'reflektif';
  suggestedPrompt?: string;
}

export interface DonationConfig {
  enabled: boolean;
  qrisImageUrl: string;
  externalLinkUrl?: string;
  customMessage?: string;
}

export interface AdminAnalyticsSummary {
  totalPosts: number;
  totalReplies: number;
  totalReactions: number;
  totalReportsPending: number;
  supportedCoretanRate24h: number; // percentage of eligible posts with >= 1 reply in 24h
  activeSessionsCount: number;
}
