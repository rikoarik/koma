'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Post, FeedFilter, ReactionType } from '@/types';
import PostCard from './PostCard';
import { submitReaction } from '@/lib/reactions-client';
import EmptyFeed from './EmptyFeed';
import { Clock, Shuffle, MessageCircleHeart, Tag, Search, Flame } from 'lucide-react';

interface FeedContainerProps {
  onOpenComposer: () => void;
}

const TOPICS = [
  { id: 'semua', label: 'Semua Topik' },
  { id: 'isi-kepala', label: '#isi-kepala' },
  { id: 'tengah-malam', label: '#tengah-malam' },
  { id: 'cerita-kecil', label: '#cerita-kecil' },
  { id: 'tanya-tanpa-nama', label: '#tanya-tanpa-nama' },
  { id: 'visual-zine', label: '#visual-zine' },
];

export default function FeedContainer({ onOpenComposer }: FeedContainerProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FeedFilter>('terbaru');
  const [activeTopic, setActiveTopic] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const topicParam = activeTopic !== 'semua' ? `&topic=${activeTopic}` : '';
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
      const res = await fetch(`/api/posts?filter=${filter}${topicParam}${searchParam}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
        setTotalCount(data.totalCount ?? data.posts.length);
      }
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 200);
    return () => clearTimeout(timer);
  }, [filter, activeTopic, searchQuery]);

  const handleReact = async (postId: string, reaction: ReactionType): Promise<boolean> => {
    const updated = await submitReaction(postId, reaction);
    if (!updated) return false;
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...updated } : p));
    return true;
  };

  const handleReply = async (postId: string, content: string, alias: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorAlias: alias,
          authorType: alias === 'Tanpa Nama' ? 'tanpa_nama' : 'pseudonim',
        }),
      });

      const json = await res.json();
      if (json.success && json.reply) {
        if (json.moderation?.state !== 'published') {
          window.alert('Balasan disimpan dan menunggu pemeriksaan pengelola sebelum tampil.');
          return true;
        }
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                replies: [...p.replies, json.reply],
              };
            }
            return p;
          })
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to reply:', err);
      return false;
    }
  };

  const handleReport = async (postId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Failed to report:', err);
      return false;
    }
  };

  const handleEditPost = async (postId: string, content: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.moderation?.state !== 'published') {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          window.alert('Perubahan disimpan dan menunggu pemeriksaan pengelola sebelum tampil.');
          return true;
        }
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content } : p))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeletePost = async (postId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <section id="komunitas" className="py-16 px-4 max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-ink/15">
        <div>
          <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-black uppercase tracking-widest mb-1.5">
            <span>Papan Coretan Hidup</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
            Ruang Suara Sesama Manusia.
          </h2>
          <p className="font-sans text-sm text-ink-muted mt-1.5">
            Bukan beranda algoritma yang mengejar viralitas. Cuma papan buletin hangat.
          </p>
        </div>

        {/* Search bar with high contrast text */}
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Cari kata di coretan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium text-ink placeholder:text-ink-muted bg-[#FAF8F5] border-2 border-ink/20 rounded-sm focus:outline-none focus:border-koma-purple"
          />
        </div>
      </div>

      {/* Filter Tabs Bar (Terbaru, Populer, Acak, Belum Dibalas, Topik) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#FAF8F5] p-1.5 rounded-sm border-2 border-ink/15 shadow-paper-sm">
          {/* Terbaru */}
          <button
            onClick={() => setFilter('terbaru')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-all ${
              filter === 'terbaru'
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink hover:bg-black/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Terbaru</span>
          </button>

          {/* Populer (Calculated from engagement with time decay) */}
          <button
            onClick={() => setFilter('populer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-all ${
              filter === 'populer'
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink hover:bg-black/5'
            }`}
            title="Coretan hangat paling banyak resonansi"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Populer</span>
          </button>

          {/* Acak */}
          <button
            onClick={() => setFilter('acak')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-all ${
              filter === 'acak'
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink hover:bg-black/5'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Acak</span>
          </button>

          {/* Belum Dibalas (SCR Priority) */}
          <button
            onClick={() => setFilter('belum_dibalas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-all ${
              filter === 'belum_dibalas'
                ? 'bg-koma-purple text-white shadow-sm'
                : 'text-koma-purpleDark hover:bg-koma-purpleLight'
            }`}
            title="Bantu coretan yang belum mendapatkan balasan hangat"
          >
            <MessageCircleHeart className="w-3.5 h-3.5" />
            <span>Belum Dibalas</span>
          </button>

          {/* Topik Toggle */}
          <button
            onClick={() => setFilter('topik')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-all ${
              filter === 'topik'
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink hover:bg-black/5'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Topik</span>
          </button>
        </div>

        {/* Counter Info */}
        <div className="font-mono text-xs text-ink font-semibold">
          Menampilkan <strong className="text-koma-purpleDark">{posts.length}</strong> dari {totalCount} coretan
        </div>
      </div>

      {/* Sub-topic pill row (Visible if filter is 'topik') */}
      {filter === 'topik' && (
        <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-[#FAF8F5] border-2 border-ink/15 rounded-sm">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-sm border transition-all ${
                activeTopic === t.id
                  ? 'bg-koma-purple text-white border-koma-purple'
                  : 'bg-paper border-ink/20 text-ink hover:border-ink/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Post Stream */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-8 bg-[#FAF8F5] border-2 border-ink/10 rounded-sm animate-pulse space-y-3"
            >
              <div className="h-4 bg-ink/10 rounded w-1/4" />
              <div className="h-5 bg-ink/10 rounded w-3/4" />
              <div className="h-4 bg-ink/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReact={handleReact}
              onReply={handleReply}
              onReport={handleReport}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      ) : (
        <EmptyFeed onOpenComposer={onOpenComposer} />
      )}
    </section>
  );
}
