'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Post, ReactionType } from '@/types';
import PostCard from '@/components/feed/PostCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PostPageClient({ params, initialPost }: { params: { id: string }; initialPost: Post }) {
  const [post, setPost] = useState<Post | null>(initialPost);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        const data = await res.json();
        if (data.success && data.post) {
          setPost(data.post);
        } else {
          setErrorMessage(data.error || 'Coretan tidak ditemukan atau telah dihapus.');
        }
      } catch (err: any) {
        setErrorMessage('Gagal memuat coretan. Harap periksa koneksi internet.');
      } finally {
        setIsLoading(false);
      }
    }

    // Refresh ownership/reactions after hydration; the server has already rendered public content.
    if (params.id) loadPost();
  }, [params.id]);

  const handleReact = async (postId: string, reactionType: ReactionType) => {
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType }),
      });
      const data = await res.json();
      if (data.success) {
        setPost((prev) => {
          if (!prev) return null;
          const userAlready = (prev.userReactions || []).includes(reactionType);
          const updatedReactions = { ...prev.reactions };
          let updatedUserReactions = [...(prev.userReactions || [])];

          if (userAlready) {
            updatedReactions[reactionType] = Math.max(0, updatedReactions[reactionType] - 1);
            updatedUserReactions = updatedUserReactions.filter((r) => r !== reactionType);
          } else {
            updatedReactions[reactionType] += 1;
            updatedUserReactions.push(reactionType);
          }

          return {
            ...prev,
            reactions: updatedReactions,
            userReactions: updatedUserReactions,
          };
        });
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
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
        setPost((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            replies: [...prev.replies, data.reply],
          };
        });
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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between selection:bg-koma-purple selection:text-paper">
      {/* Navbar Minimal */}
      <header className="py-4 border-b border-ink/10 bg-[#FAF8F5]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-ink hover:text-koma-purple transition-colors font-mono text-xs font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-serif font-black text-xl tracking-tight text-ink">
              koma<span className="text-koma-purple">,</span>
            </span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper border border-ink/20 hover:border-koma-purple text-ink font-mono text-xs font-semibold rounded-sm shadow-xs transition-all active:scale-95"
            title="Salin tautan permanen coretan ini"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-700 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-koma-purple" />
                <span>Bagikan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Single Card Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full">
        {isLoading ? (
          <div className="p-8 bg-[#FAF8F5] border-2 border-ink/10 rounded-sm animate-pulse space-y-4">
            <div className="h-4 bg-ink/10 rounded w-1/4" />
            <div className="h-6 bg-ink/10 rounded w-5/6" />
            <div className="h-4 bg-ink/10 rounded w-2/3" />
          </div>
        ) : errorMessage || !post ? (
          <div className="p-8 text-center bg-[#FAF8F5] border-2 border-dashed border-ink/20 rounded-sm space-y-4">
            <AlertCircle className="w-8 h-8 text-koma-purple mx-auto opacity-70" />
            <h2 className="font-serif text-2xl font-bold text-ink">Coretan Tidak Ditemukan</h2>
            <p className="font-sans text-sm text-ink-muted max-w-md mx-auto">
              {errorMessage || 'Coretan ini mungkin sudah dihapus oleh penulisnya atau tautan tidak valid.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper text-xs font-sans font-bold rounded-sm hover:bg-koma-purple transition-all shadow-paper"
            >
              Lihat Coretan Lainnya
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-ink-muted px-1">
              <span>Tautan Permanen &bull; Mode Publik</span>
              <span>#{post.topic}</span>
            </div>

            <PostCard
              post={post}
              onReact={handleReact}
              onReply={handleReply}
              onReport={handleReport}
              onDelete={async (id: string, secret?: string) => {
                const query = secret ? `?secret=${encodeURIComponent(secret)}` : '';
                const res = await fetch(`/api/posts/${id}${query}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                  window.location.href = '/';
                  return true;
                }
                return false;
              }}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
