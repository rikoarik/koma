'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Pin,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Heart,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { IconDengerin, IconRelate, IconSenyum, IconPeluk } from '@/components/ui/BrandIcons';

interface AdminContentViewProps {
  posts: any[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  search: string;
  setSearch: (s: string) => void;
  topic: string;
  setTopic: (t: string) => void;
  status: string;
  setStatus: (st: string) => void;
  sortBy: string;
  setSortBy: (sb: string) => void;
  onPageChange: (p: number) => void;
  onToggleHide: (postId: string, currentVal: boolean) => void;
  onTogglePin: (postId: string, currentVal: boolean) => void;
  onDeletePost: (postId: string) => void;
  isLoading?: boolean;
}

export default function AdminContentView({
  posts,
  pagination,
  search,
  setSearch,
  topic,
  setTopic,
  status,
  setStatus,
  sortBy,
  setSortBy,
  onPageChange,
  onToggleHide,
  onTogglePin,
  onDeletePost,
  isLoading = false,
}: AdminContentViewProps) {
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const topicsList = ['all', 'isi-kepala', 'tengah-malam', 'cerita-kecil', 'tanya-tanpa-nama', 'visual-zine'];

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari teks coretan, alias penulis, atau ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Topic */}
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Topik</option>
            {topicsList.filter((t) => t !== 'all').map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="published">Terbit (Published)</option>
            <option value="pinned">Disematkan (Pinned)</option>
            <option value="hidden">Disembunyikan (Hidden)</option>
            <option value="held_for_review">Tertahan Review</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="createdAt">Waktu Terbaru</option>
            <option value="replies">Paling Banyak Balasan</option>
            <option value="reactions">Paling Banyak Reaksi</option>
            <option value="reports">Paling Banyak Dilaporkan</option>
          </select>
        </div>
      </div>

      {/* Dense Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Status</th>
                <th className="py-3 px-4 font-bold">Penulis & ID</th>
                <th className="py-3 px-6 font-bold">Isi Coretan</th>
                <th className="py-3 px-3 font-bold">Topik & Mode</th>
                <th className="py-3 px-4 font-bold text-center">Balasan / Reaksi</th>
                <th className="py-3 px-3 font-bold text-center">Laporan</th>
                <th className="py-3 px-4 font-bold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat data coretan...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada coretan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {post.isPinned ? (
                        <span title="Disematkan di atas" className="inline-flex p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          <Pin className="w-3.5 h-3.5" />
                        </span>
                      ) : post.isHidden ? (
                        <span title="Disembunyikan dari publik" className="inline-flex p-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          <EyeOff className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span title="Terbit aktif" className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </td>

                    {/* Author & ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{post.authorAlias}</span>
                        {post.isAiGenerated && (
                          <span title="Dibuat dengan AI Studio" className="text-purple-600 font-bold text-[10px]">
                            ✨ AI
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {post.id} • {new Date(post.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>

                    {/* Content Snippet */}
                    <td className="py-3 px-6 max-w-md">
                      <p
                        onClick={() => setSelectedPost(post)}
                        className="line-clamp-2 text-slate-800 leading-relaxed cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        {post.content}
                      </p>
                    </td>

                    {/* Topic & Mode */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700">
                          #{post.topic}
                        </span>
                        <div className="text-[10px] text-slate-600 font-sans">
                          {post.responseMode === 'boleh_dibalas' ? 'Boleh Dibalas' : 'Cukup Didengar'}
                        </div>
                      </div>
                    </td>

                    {/* Replies & Reactions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 font-mono text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <MessageSquare className="w-3 h-3" /> {post.replyCount || 0}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1 text-amber-700 font-bold">
                          <Heart className="w-3 h-3" /> {post.reactionCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Report count */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {post.reportCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {post.reportCount}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-[11px]">0</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPost(post)}
                          title="Lihat rincian lengkap"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onTogglePin(post.id, post.isPinned)}
                          title={post.isPinned ? 'Lepas sematan' : 'Sematkan coretan'}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            post.isPinned
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleHide(post.id, post.isHidden)}
                          title={post.isHidden ? 'Tampilkan di publik' : 'Sembunyikan dari publik'}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            post.isHidden
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {post.isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-700" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(post.id)}
                          title="Hapus permanen dari database"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <span className="font-bold font-mono text-slate-900">
              {posts.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            –{' '}
            <span className="font-bold font-mono text-slate-900">
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}
            </span>{' '}
            dari{' '}
            <span className="font-bold font-mono text-slate-900">{pagination.totalItems}</span> coretan
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-semibold px-2">
              Halaman {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-base text-slate-900">Rincian Coretan</h3>
                <span className="font-mono text-xs text-slate-400">ID: {selectedPost.id}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">Penulis</span>
                  <span className="font-bold text-slate-800">{selectedPost.authorAlias}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Topik</span>
                  <span className="font-bold text-indigo-700">#{selectedPost.topic}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mode Respon</span>
                  <span className="font-bold text-slate-800">{selectedPost.responseMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-bold text-slate-800">
                    {selectedPost.isHidden ? 'Disembunyikan' : selectedPost.moderationState}
                  </span>
                </div>
              </div>

              {/* Full Content */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                  Isi Coretan Lengkap
                </label>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>

              {/* AI Prompt if AI Generated */}
              {selectedPost.isAiGenerated && selectedPost.aiPrompt && (
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-purple-700 block mb-1.5">
                    ✨ Prompt AI Studio yang Digunakan
                  </label>
                  <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 text-purple-950 font-mono text-xs leading-relaxed">
                    {selectedPost.aiPrompt}
                  </div>
                </div>
              )}

              {/* Reactions Breakdown */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                  Distribusi Empat Reaksi Manusiawi
                </label>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <IconDengerin className="w-4 h-4 text-amber-700 mb-1" />
                    <span className="text-[10px] text-slate-500">Dengerin</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedPost.reactionsSummary?.dengerin || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <IconRelate className="w-4 h-4 text-koma-purple mb-1" />
                    <span className="text-[10px] text-slate-500">Relate</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedPost.reactionsSummary?.relate || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <IconSenyum className="w-4 h-4 text-emerald-700 mb-1" />
                    <span className="text-[10px] text-slate-500">Senyum</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedPost.reactionsSummary?.senyum || 0}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
                    <IconPeluk className="w-4 h-4 text-rose-700 mb-1" />
                    <span className="text-[10px] text-slate-500">Peluk</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedPost.reactionsSummary?.peluk || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/coretan/${selectedPost.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
              >
                <span>Buka Tampilan Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-base text-slate-900">
                Konfirmasi Hapus Permanen
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus coretan{' '}
              <strong className="font-mono text-slate-900">#{deleteConfirmId}</strong> secara permanen?
              Tindakan ini juga akan menghapus seluruh balasan dan reaksi yang terkait dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batalkan
              </button>
              <button
                onClick={() => {
                  onDeletePost(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
