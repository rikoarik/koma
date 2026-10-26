'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post, ReactionType, Reply } from '@/types';
import { MessageSquare, AlertCircle, Send, Check, Edit2, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { IconDengerin, IconRelate, IconSenyum, IconPeluk } from '@/components/ui/BrandIcons';

interface PostCardProps {
  post: Post;
  onReact: (postId: string, reaction: ReactionType) => void;
  onReply: (postId: string, content: string, alias: string) => Promise<boolean>;
  onReport: (postId: string, reason: string) => Promise<boolean>;
  onEdit?: (postId: string, content: string) => Promise<boolean>;
  onDelete?: (postId: string, secret?: string) => Promise<boolean>;
}

export default function PostCard({
  post,
  onReact,
  onReply,
  onReport,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAlias, setReplyAlias] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format relative date in Indonesian
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      return `${diffDays} hari lalu`;
    } catch {
      return 'baru saja';
    }
  };

  const handleReactionClick = (type: ReactionType) => {
    onReact(post.id, type);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    const success = await onReply(post.id, replyText, replyAlias || 'Tanpa Nama');
    if (success) {
      setReplyText('');
    }
    setIsSubmittingReply(false);
  };

  const handleConfirmReport = async () => {
    const success = await onReport(post.id, reportReason);
    if (success) {
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
      }, 1500);
    }
  };

  const handleSaveEdit = async () => {
    if (!onEdit || !editedContent.trim()) return;
    setIsSavingEdit(true);
    const ok = await onEdit(post.id, editedContent);
    if (ok) {
      setIsEditing(false);
    }
    setIsSavingEdit(false);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    await onDelete(post.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const isDarkCard = post.paperColor === 'charcoal';
  const hasUserReacted = (type: ReactionType) => (post.userReactions || []).includes(type);

  // Paper color mapping with guaranteed high-contrast ink
  const colorClasses = {
    cream: 'bg-[#FAF8F5] border-ink/20 text-ink',
    kraft: 'bg-[#F2ECE1] border-ink/25 text-ink',
    lavender: 'bg-[#F4F1FD] border-koma-purple/30 text-ink',
    charcoal: 'bg-[#1E1C1A] border-[#38342E] text-[#F7F4EE]',
  };

  const currentBg = colorClasses[post.paperColor || 'cream'] || colorClasses.cream;

  return (
    <article
      className={`relative p-5 sm:p-7 rounded-sm border shadow-paper hover:shadow-paper-lift transition-all duration-300 ${currentBg}`}
      style={{
        transform: `rotate(${post.rotation || 0}deg)`,
      }}
    >
      {/* Tape decoration on card top */}
      <div className="absolute -top-3 left-8 z-10 w-24 pointer-events-none opacity-90">
        <Image
          src={post.paperColor === 'lavender' ? '/assets/tape-purple.svg' : '/assets/tape-kraft.svg'}
          alt="Tape"
          width={90}
          height={24}
        />
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b pb-3 border-current/15">
        <div className="flex items-center gap-2">
          {/* Author Badge */}
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded-sm border ${
              isDarkCard
                ? 'bg-white/10 text-[#F7F4EE] border-white/20'
                : post.authorType === 'pseudonim'
                ? 'bg-koma-purpleLight text-koma-purpleDark border-koma-purple/30'
                : 'bg-black/5 text-ink border-ink/15'
            }`}
          >
            {post.authorAlias}
          </span>

          {/* Timestamp */}
          <span className={`font-mono text-[11px] font-medium ${isDarkCard ? 'text-paper-dark' : 'text-ink-muted'}`}>
            {formatTime(post.createdAt)}
          </span>

          {/* Author Ownership Badge */}
          {post.isOwner && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
              Tulisanmu
            </span>
          )}
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-2">
          {/* Response Mode Badge */}
          <span
            className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
              post.responseMode === 'boleh_dibalas'
                ? isDarkCard
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-950/60'
                  : 'border-emerald-700 text-emerald-800 bg-emerald-50'
                : isDarkCard
                ? 'border-white/30 text-white/90 bg-white/5'
                : 'border-ink/25 text-ink-muted bg-black/5'
            }`}
          >
            {post.responseMode === 'boleh_dibalas' ? 'Boleh Dibalas' : 'Cukup Didengar'}
          </span>

          {/* Topic pill */}
          <span className={`font-mono text-[11px] font-bold ${isDarkCard ? 'text-purple-300' : 'text-koma-purpleDark'}`}>
            #{post.topic}
          </span>
        </div>
      </div>

      {/* Main Content Area (View vs Edit) */}
      <div className="space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              className="w-full p-3 font-serif text-base text-ink bg-white border-2 border-koma-purple rounded-sm focus:outline-none leading-relaxed"
            />
            <div className="flex justify-end gap-2 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 border border-ink/20 rounded-sm hover:bg-black/5"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editedContent.trim()}
                className="px-4 py-1 bg-koma-purple text-white rounded-sm hover:bg-koma-purpleHover disabled:opacity-50"
              >
                {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        ) : (
          <p className={`font-serif text-lg sm:text-xl leading-relaxed whitespace-pre-line tracking-tight ${isDarkCard ? 'text-[#F7F4EE]' : 'text-ink'}`}>
            {post.content}
          </p>
        )}

        {/* Attached Visual / Photo */}
        {post.imageUrl && (
          <div className="relative mt-3 p-1.5 bg-paper rounded-sm border border-ink/20 shadow-inner max-w-md">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[1px] bg-paper-dark">
              <Image
                src={post.imageUrl}
                alt="Lampiran visual coretan"
                fill
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer: Reactions Bar & Actions */}
      <div className="mt-6 pt-4 border-t border-current/15 flex flex-wrap items-center justify-between gap-3">
        {/* Reactions group with Real Active State */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Aku dengerin */}
          <button
            onClick={() => handleReactionClick('dengerin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all border ${
              hasUserReacted('dengerin')
                ? 'bg-amber-100 border-amber-500 text-amber-950 scale-105 shadow-xs'
                : isDarkCard
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-[#F7F4EE]'
                : 'bg-black/5 hover:bg-black/10 border-ink/10 text-ink'
            }`}
            title="Aku dengerin tulisanmu"
          >
            <IconDengerin className={`w-3.5 h-3.5 ${hasUserReacted('dengerin') ? 'text-amber-800' : 'text-amber-700'}`} />
            <span>{post.reactions?.dengerin || 0}</span>
          </button>

          {/* Relate */}
          <button
            onClick={() => handleReactionClick('relate')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all border ${
              hasUserReacted('relate')
                ? 'bg-purple-100 border-koma-purple text-koma-purpleDark scale-105 shadow-xs'
                : isDarkCard
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-[#F7F4EE]'
                : 'bg-black/5 hover:bg-black/10 border-ink/10 text-ink'
            }`}
            title="100% relate"
          >
            <IconRelate className={`w-3.5 h-3.5 ${hasUserReacted('relate') ? 'text-koma-purpleDark' : 'text-koma-purple'}`} />
            <span>{post.reactions?.relate || 0}</span>
          </button>

          {/* Senyum */}
          <button
            onClick={() => handleReactionClick('senyum')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all border ${
              hasUserReacted('senyum')
                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-105 shadow-xs'
                : isDarkCard
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-[#F7F4EE]'
                : 'bg-black/5 hover:bg-black/10 border-ink/10 text-ink'
            }`}
            title="Bikin tersenyum"
          >
            <IconSenyum className={`w-3.5 h-3.5 ${hasUserReacted('senyum') ? 'text-emerald-800' : 'text-emerald-700'}`} />
            <span>{post.reactions?.senyum || 0}</span>
          </button>

          {/* Peluk jauh */}
          <button
            onClick={() => handleReactionClick('peluk')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all border ${
              hasUserReacted('peluk')
                ? 'bg-rose-100 border-rose-500 text-rose-950 scale-105 shadow-xs'
                : isDarkCard
                ? 'bg-white/10 hover:bg-white/20 border-white/15 text-[#F7F4EE]'
                : 'bg-black/5 hover:bg-black/10 border-ink/10 text-ink'
            }`}
            title="Peluk jauh untukmu"
          >
            <IconPeluk className={`w-3.5 h-3.5 ${hasUserReacted('peluk') ? 'text-rose-800' : 'text-rose-700'}`} />
            <span>{post.reactions?.peluk || 0}</span>
          </button>
        </div>

        {/* Right Action buttons: Replies toggle, Edit, Delete, Report */}
        <div className="flex items-center gap-2.5">
          {post.responseMode === 'boleh_dibalas' && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`flex items-center gap-1.5 font-mono text-xs font-bold transition-colors ${
                isDarkCard ? 'text-[#F7F4EE] hover:text-purple-300' : 'text-ink hover:text-koma-purpleDark'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                {post.replies?.length > 0 ? `${post.replies.length} balasan` : 'Beri tanggapan'}
              </span>
            </button>
          )}

          {/* Owner controls: Edit & Delete */}
          {post.isOwner && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-1 transition-colors ${
                  isDarkCard ? 'text-white/60 hover:text-white' : 'text-ink-muted hover:text-ink'
                }`}
                title="Sunting tulisan ini"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`p-1 transition-colors ${
                  isDarkCard ? 'text-white/60 hover:text-red-400' : 'text-ink-muted hover:text-red-600'
                }`}
                title="Hapus tulisan ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Permalink button */}
          <Link
            href={`/coretan/${post.id}`}
            className={`p-1 transition-colors ${
              isDarkCard ? 'text-white/60 hover:text-purple-300' : 'text-ink-muted hover:text-koma-purple'
            }`}
            title="Buka tautan permanen coretan ini"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className={`p-1 transition-colors ${
              isDarkCard ? 'text-white/60 hover:text-red-400' : 'text-ink-muted hover:text-red-600'
            }`}
            title="Laporkan coretan ini"
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm p-5 bg-paper border-2 border-red-500 shadow-paper-float rounded-sm text-ink space-y-3">
            <h4 className="font-serif font-black text-lg text-red-700">Hapus Coretan Ini?</h4>
            <p className="font-sans text-xs text-ink leading-relaxed">
              Tindakan ini permanen dan tidak dapat dibatalkan. Seluruh tanggapan pada coretan ini juga akan terhapus.
            </p>
            <div className="flex justify-end gap-2 pt-2 font-mono text-xs font-bold">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 border border-ink/20 rounded-sm hover:bg-black/5"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 text-white rounded-sm hover:bg-red-700"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replies Accordion */}
      {post.responseMode === 'boleh_dibalas' && showReplies && (
        <div className="mt-5 pt-4 border-t border-current/15 space-y-3">
          {/* Replies list */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {post.replies && post.replies.length > 0 ? (
              post.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-3 rounded-sm border text-xs font-sans leading-relaxed ${
                    isDarkCard
                      ? 'bg-black/40 border-white/10 text-white/95'
                      : 'bg-black/5 border-ink/10 text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                    <span className={isDarkCard ? 'text-purple-300' : 'text-koma-purpleDark'}>
                      {reply.authorAlias} {reply.isOwner ? '(Kamu)' : ''}
                    </span>
                    <span className={isDarkCard ? 'text-white/60' : 'text-ink-muted'}>
                      {formatTime(reply.createdAt)}
                    </span>
                  </div>
                  <p>{reply.content}</p>
                </div>
              ))
            ) : (
              <p className={`text-xs font-mono italic py-1 ${isDarkCard ? 'text-white/70' : 'text-ink-muted'}`}>
                Belum ada balasan. Jadilah yang pertama menyapa.
              </p>
            )}
          </div>

          {/* Quick Reply Form */}
          <form onSubmit={handleSubmitReply} className="pt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama samaranmu (opsional)..."
                value={replyAlias}
                onChange={(e) => setReplyAlias(e.target.value)}
                className={`w-1/3 px-2.5 py-1.5 text-xs font-mono rounded-sm border focus:outline-none focus:border-koma-purple ${
                  isDarkCard
                    ? 'bg-black/40 border-white/20 text-white placeholder:text-white/50'
                    : 'bg-paper border-ink/20 text-ink placeholder:text-ink-muted'
                }`}
              />
              <input
                type="text"
                placeholder="Tulis tanggapan hangat..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className={`flex-1 px-3 py-1.5 text-xs font-sans rounded-sm border focus:outline-none focus:border-koma-purple ${
                  isDarkCard
                    ? 'bg-black/40 border-white/20 text-white placeholder:text-white/50'
                    : 'bg-paper border-ink/20 text-ink placeholder:text-ink-muted'
                }`}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingReply || !replyText.trim()}
                className="px-3 py-1.5 bg-koma-purple text-white text-xs font-mono font-bold rounded-sm hover:bg-koma-purpleHover disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-paper border-2 border-ink/20 shadow-paper-float rounded-sm text-ink space-y-4">
            <h3 className="font-serif font-black text-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Laporkan Coretan</span>
            </h3>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono rounded-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Terima kasih. Laporan telah kami terima untuk moderasi.</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-ink leading-relaxed font-sans">
                  Bantu jaga Koma tetap aman. Laporkan jika coretan ini melanggar etika
                  (doxxing data pribadi, ujaran kebencian, pelecehan, atau spam).
                </p>

                <div className="space-y-2 text-xs font-mono font-semibold">
                  {['spam', 'doxxing', 'kebencian', 'kekerasan', 'lainnya'].map((reason) => (
                    <label key={reason} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-koma-purple focus:ring-koma-purple"
                      />
                      <span className="capitalize">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 text-xs font-mono font-semibold border border-ink/20 rounded-sm hover:bg-black/5"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReport}
                    className="px-3 py-1.5 text-xs font-mono bg-red-600 text-white rounded-sm hover:bg-red-700 font-bold"
                  >
                    Kirim Laporan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
