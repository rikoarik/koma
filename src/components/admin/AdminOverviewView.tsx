'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  FileText,
  MessageSquare,
  Heart,
  Sparkles,
  Server,
  Pin,
  EyeOff,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { AdminAnalyticsSummary } from '@/types';
import { AdminAuditEntry } from '@/lib/storage';

interface AdminOverviewViewProps {
  analytics: AdminAnalyticsSummary | null;
  reports: any[];
  recentPosts: any[];
  auditLogs: AdminAuditEntry[];
  aiHealth: any;
  onNavigate: (tab: string) => void;
  onResolveReport: (reportId: string, action: 'DISMISSED' | 'RESOLVED_HIDE' | 'RESOLVED_DELETE') => void;
  onToggleHide: (postId: string, currentVal: boolean) => void;
  onTogglePin: (postId: string, currentVal: boolean) => void;
}

export default function AdminOverviewView({
  analytics,
  reports,
  recentPosts,
  auditLogs,
  aiHealth,
  onNavigate,
  onResolveReport,
  onToggleHide,
  onTogglePin,
}: AdminOverviewViewProps) {
  const pendingReports = reports.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Actionable Urgent Alert if Reports Pending */}
      {pendingReports.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500 text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm text-rose-950">
                Terdapat {pendingReports.length} Laporan Komunitas Membutuhkan Tindakan
              </h3>
              <p className="text-xs text-rose-800">
                Sesuai SLA Permenkominfo, laporan yang menyangkut keamanan pengguna wajib ditinjau dalam waktu maksimal 24 jam.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('moderation')}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-sans text-xs font-bold transition-all shadow-xs"
          >
            Buka Antrean Laporan →
          </button>
        </div>
      )}

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coretan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Coretan
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-sans">
              {analytics?.totalPosts || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Tersimpan di pangkalan data</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Balasan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Respons Balasan
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-sans">
              {analytics?.totalReplies || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Pertukaran manusiawi</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Empat Reaksi Emosional */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Reaksi Riil
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-sans">
              {analytics?.totalReactions || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Reaksi manusiawi riil</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* Supported Coretan Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              SCR 24h
            </span>
            <div className="text-2xl font-black text-indigo-700 mt-1 font-sans">
              {analytics?.supportedCoretanRate24h || 100}%
            </div>
            <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">Target: ≥ 70%</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Content Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900">Arus Konten Terbaru</h3>
              <p className="text-xs text-slate-600">Coretan terkini yang dipublikasikan oleh pengguna</p>
            </div>
            <button
              onClick={() => onNavigate('content')}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              <span>Kelola Semua ({analytics?.totalPosts || 0})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada kiriman coretan.
              </div>
            ) : (
              recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans font-bold text-xs text-slate-900">
                        {post.authorAlias}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600">
                        #{post.topic}
                      </span>
                      {post.isPinned && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> Disematkan
                        </span>
                      )}
                      {post.isHidden && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5" /> Disembunyikan
                        </span>
                      )}
                      {post.isAiGenerated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          ✨ AI
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(post.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-sans line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>💬 {post.replyCount || 0} balasan</span>
                      <span>❤️ {post.reactionCount || 0} reaksi</span>
                      {post.reportCount > 0 && (
                        <span className="text-rose-600 font-bold">⚠️ {post.reportCount} laporan</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onTogglePin(post.id, post.isPinned)}
                      title={post.isPinned ? 'Lepas sematan' : 'Sematkan ke atas feed'}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        post.isPinned
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleHide(post.id, post.isHidden)}
                      title={post.isHidden ? 'Tampilkan kembali di publik' : 'Sembunyikan dari publik'}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        post.isHidden
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {post.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Operational Status & Recent Activity */}
        <div className="space-y-6">
          {/* AI Engine Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-sans font-bold text-sm text-slate-900">Status Studio AI</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mode Penyedia:</span>
                <span className="font-semibold text-slate-900 font-mono text-[11px]">
                  {aiHealth?.aiEngine?.provider || 'Curated Bank (Zero Downtime)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kunci API Terkonfigurasi:</span>
                <span className={`font-mono text-[11px] font-bold ${aiHealth?.aiEngine?.apiKeySet ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {aiHealth?.aiEngine?.apiKeySet ? 'Tersedia' : 'Mode Offline Siap'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Konten Ditandai AI:</span>
                <span className="font-mono text-[11px] font-bold text-slate-900">
                  {aiHealth?.aiEngine?.totalAiGeneratedPosts || 0} coretan
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ai')}
              className="w-full mt-2 py-2 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-all text-center block"
            >
              Uji & Periksa AI Studio →
            </button>
          </div>

          {/* Pending Reports Quick Resolution Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="font-sans font-bold text-sm text-slate-900">Antrean Laporan</h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-600">
                {pendingReports.length} pending
              </span>
            </div>

            {pendingReports.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 font-sans">
                ✓ Tidak ada laporan yang membutuhkan moderasi saat ini.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingReports.slice(0, 2).map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded">
                        {r.reason}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(r.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-slate-700 font-sans italic text-[11px]">
                      &quot;{r.targetContent}&quot;
                    </p>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => onResolveReport(r.id, 'DISMISSED')}
                        className="px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded"
                      >
                        Abaikan
                      </button>
                      <button
                        onClick={() => onResolveReport(r.id, 'RESOLVED_HIDE')}
                        className="px-2 py-1 text-[10px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded"
                      >
                        Sembunyikan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onNavigate('moderation')}
              className="w-full mt-2 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all text-center block"
            >
              Buka Semua Laporan ({reports.length}) →
            </button>
          </div>

          {/* Recent Audit Log Snippet */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-600" />
                <h3 className="font-sans font-bold text-sm text-slate-900">Aktivitas Terakhir Pengelola</h3>
              </div>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-2">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 border-b border-slate-50 pb-2 last:border-0">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="font-bold text-indigo-700">{log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 truncate">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
