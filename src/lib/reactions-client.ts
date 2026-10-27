import type { ReactionCounts, ReactionType } from '@/types';

export interface ReactionUpdate {
  reactions: ReactionCounts;
  userReactions: ReactionType[];
}

/** The response, not the previous card state, is authoritative after a toggle. */
export async function submitReaction(postId: string, reaction: ReactionType): Promise<ReactionUpdate | null> {
  try {
    const response = await fetch(`/api/posts/${encodeURIComponent(postId)}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction }),
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.reactions || !Array.isArray(data.userReactions)) return null;
    return { reactions: data.reactions, userReactions: data.userReactions };
  } catch {
    return null;
  }
}
