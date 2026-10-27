'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  Search,
  X,
  Flame,
  Clock,
  MessageCircleHeart,
  Shuffle,
  Tag,
  PenTool,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Post, FeedFilter, ReactionType } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/feed/PostCard';
import EmptyFeed from '@/components/feed/EmptyFeed';
import ComposerModal from '@/components/feed/ComposerModal';
import AIStudioModal from '@/components/studio/AIStudioModal';
import { submitReaction } from '@/lib/reactions-client';

const PRESET_TOPICS = [
  { id: 'semua', label: 'Semua Topik' },
  { id: 'isi-kepala', label: '#isi-kepala' },
  { id: 'tengah-malam', label: '#tengah-malam' },
  { id: 'cerita-kecil', label: '#cerita-kecil' },
  { id: 'tanya-tanpa-nama', label: '#tanya-tanpa-nama' },
  { id: 'visual-zine', label: '#visual-zine' },
];

export default function JelajahClient({ initialPosts, initialQuery = '' }: { initialPosts: Post[]; initialQuery?: string }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filter, setFilter] = useState<FeedFilter>('populer');
  const [activeTopic, setActiveTopic] = useState('semua');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Modals
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialText, setComposerInitialText] = useState('');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioDraft, setStudioDraft] = useState<{ text: string; prompt: string; imageUrl?: string } | null>(null);

  const handleApplyStudio = (text: string, prompt: string, imageUrl?: string) => {
    setStudioDraft({ text, prompt, imageUrl });
    setComposerInitialText(text);
    setIsStudioOpen(false);
    setIsComposerOpen(true);
  };

  const initialLoad = React.useRef(true);
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const topicParam = activeTopic !== 'semua' ? `&topic=${encodeURIComponent(activeTopic)}` : '';
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
    if (initialLoad.current) { initialLoad.current = false; return; }
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

  const handleReply = async (
    postId: string,
    content: string,
    authorAlias?: string,
    authorType?: any,
    isAiGenerated?: boolean
  ) => {
    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorAlias, authorType, isAiGenerated }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        if (data.moderation?.state !== 'published') {
          window.alert('Balasan disimpan dan menunggu pemeriksaan pengelola sebelum tampil.');
          return true;
        }
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, data.reply] } : p))
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleReport = async (postId: string, reason: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  };

  const handleEditPost = async (postId: string, newContent: string) => {
    try {
      const authorSecret = localStorage.getItem(`author_secret_${postId}`) || '';
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, authorSecret }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.moderation?.state !== 'published') {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
          window.alert('Perubahan disimpan dan menunggu pemeriksaan pengelola sebelum tampil.');
          return true;
        }
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, content: newContent } : p)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const authorSecret = localStorage.getItem(`author_secret_${postId}`) || '';
      const res = await fetch(`/api/posts/${postId}?secret=${encodeURIComponent(authorSecret)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        localStorage.removeItem(`author_secret_${postId}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handlePostCreated = async (postData: any): Promise<{ success: boolean; state?: 'published' | 'held_for_review' | 'removed'; error?: string }> => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const json = await res.json();
      if (json.success) {
        if (json.moderation?.state === 'published') {
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
              particleCount: 25,
              spread: 40,
              origin: { y: 0.8 },
              colors: ['#5A46D6', '#1D1B18', '#DCCDBB'],
            });
          }).catch(() => {});
        }

        if (json.authorSecret && json.post?.id) {
          localStorage.setItem(`author_secret_${json.post.id}`, json.authorSecret);
        }

        setComposerInitialText('');
        setStudioDraft(null);
        fetchPosts();
        return { success: true, state: json.moderation?.state };
      }
      return { success: false, error: json.error };
    } catch {
      return { success: false, error: 'Koneksi gagal. Coba lagi.' };
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between selection:bg-koma-purple selection:text-paper pt-20">
      <Navbar
        onOpenComposer={() => setIsComposerOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Discovery Header Banner */}
        <div className="relative p-6 sm:p-8 bg-[#FAF8F5] border-2 border-ink/15 shadow-paper-sm rounded-sm space-y-3">
          <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-black uppercase tracking-widest">
            <Compass className="w-4 h-4 text-koma-purple" />
            <span>Pusat Eksplorasi & Jelajah</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
            Temukan Suara & Resonansi
          </h1>
          <p className="font-sans text-xs sm:text-sm text-ink-muted max-w-2xl leading-relaxed">
            Cari pemikiran spesifik, telusuri tag topik hangat, atau bantu beri tanggapan bagi mereka yang coretannya belum sempat didengar siapa pun.
          </p>

          {/* Search Box */}
          <form
            action="/jelajah"
            method="get"
            toolname="search_public_coretan"
            tooldescription="Cari coretan yang sudah tampil publik di Koma berdasarkan kata, topik, atau nama samaran. Hasil dapat memuat coretan yang tidak diizinkan untuk indeks mesin pencari; jangan salin atau sebarkan di luar Koma. Hanya membaca, tidak menerbitkan atau mengubah coretan."
            className="relative pt-2"
            role="search"
          >
            <Search className="absolute left-3.5 top-5 w-4 h-4 text-ink-muted" />
            <input
              type="search"
              name="q"
              aria-label="Cari coretan publik"
              toolparamdescription="Kata atau topik dalam coretan publik Koma, maksimal 100 karakter."
              maxLength={100}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci, topik (#tengah-malam), atau nama samaran..."
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm font-mono font-medium text-ink placeholder:text-ink-muted bg-white border-2 border-ink/20 rounded-sm focus:outline-none focus:border-koma-purple shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-5 p-0.5 text-ink-muted hover:text-ink rounded-full"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button type="submit" className="sr-only">Cari coretan</button>
          </form>
        </div>

        {/* Filter & Topic Bar */}
        <div className="space-y-4">
          {/* Main Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-ink/15">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Paling Hangat / Populer */}
              <button
                onClick={() => setFilter('populer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-all ${
                  filter === 'populer'
                    ? 'bg-koma-purple text-white shadow-sm'
                    : 'text-koma-purpleDark hover:bg-koma-purpleLight'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Paling Hangat</span>
              </button>

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

              {/* Belum Dibalas */}
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
            </div>

            <div className="font-mono text-xs text-ink font-semibold">
              Menampilkan <strong className="text-koma-purpleDark">{posts.length}</strong> coretan
            </div>
          </div>

          {/* Topic Pills Row */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FAF8F5] border border-ink/15 rounded-sm">
            <span className="font-mono text-[11px] font-bold text-ink-muted uppercase tracking-wider mr-1">
              Topik:
            </span>
            {PRESET_TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-sm border transition-all ${
                  activeTopic === t.id
                    ? 'bg-koma-purple text-white border-koma-purple shadow-xs'
                    : 'bg-paper border-ink/20 text-ink hover:border-koma-purple'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post Stream */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-8 bg-[#FAF8F5] border-2 border-ink/10 rounded-sm animate-pulse space-y-3"
              >
                <div className="h-4 bg-ink/10 rounded w-1/4" />
                <div className="h-6 bg-ink/10 rounded w-3/4" />
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
          <div className="p-10 text-center bg-[#FAF8F5] border-2 border-dashed border-ink/20 rounded-sm space-y-4">
            <Search className="w-8 h-8 text-koma-purple mx-auto opacity-70" />
            <h3 className="font-serif font-bold text-xl text-ink">Tidak Ada Coretan Ditemukan</h3>
            <p className="font-sans text-xs text-ink-muted max-w-sm mx-auto">
              Tidak ada coretan yang cocok dengan pencarian "{searchQuery}" atau filter topik yang dipilih.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-paper border border-ink/25 text-xs font-mono font-bold rounded-sm hover:border-koma-purple"
                >
                  Bersihkan Pencarian
                </button>
              )}
              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-4 py-2 bg-ink text-paper text-xs font-sans font-bold rounded-sm hover:bg-koma-purple transition-all"
              >
                Jadilah yang Pertama Menulis
              </button>
            </div>
          </div>
        )}
        <nav aria-label="Arsip coretan yang diizinkan ditemukan" className="border-t border-ink/15 pt-4 font-mono text-xs text-ink-muted">
          <Link href="/jelajah/arsip">Arsip coretan yang boleh ditemukan lewat pencarian →</Link>
        </nav>
      </main>

      <Footer />

      {/* Composer Modal */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmitPost={handlePostCreated}
        onOpenStudio={(draft) => { setComposerInitialText(draft); setIsComposerOpen(false); setIsStudioOpen(true); }}
        initialContent={composerInitialText}
        isAiAssisted={Boolean(studioDraft)}
        aiPrompt={studioDraft?.prompt}
        initialImageUrl={studioDraft?.imageUrl}
      />
      <AIStudioModal
        isOpen={isStudioOpen}
        onClose={() => { setIsStudioOpen(false); setIsComposerOpen(true); }}
        onApplyToComposer={handleApplyStudio}
        initialDraft={composerInitialText}
      />
    </div>
  );
}
