'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Heart,
  MessageSquare,
  Users,
  Compass,
  Lock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import AdminChart from './AdminChart';
import { DetailedAnalyticsResult } from '@/lib/storage';

interface AdminAnalyticsViewProps {
  data: DetailedAnalyticsResult | null;
  period: '24h' | '7d' | '30d' | 'all';
  onPeriodChange: (p: '24h' | '7d' | '30d' | 'all') => void;
  isLoading?: boolean;
}

export default function AdminAnalyticsView({
  data,
  period,
  onPeriodChange,
  isLoading = false,
}: AdminAnalyticsViewProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const { kpis, timeSeries, topicBreakdown, responseModeStats, retention, deviceAndSource, topContent, dateRange } = data;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Rentang Waktu Evaluasi:</span>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            {formatDate(dateRange.start)} – {formatDate(dateRange.end)}
          </span>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          {[
            { id: '24h', label: '24 Jam' },
            { id: '7d', label: '7 Hari' },
            { id: '30d', label: '30 Hari' },
            { id: 'all', label: 'Semua Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPeriodChange(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-all font-sans font-semibold ${
                period === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid with Period-over-Period Delta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Coretan Baru */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold font-mono uppercase tracking-wider">Coretan Terbit</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.totalPosts.current}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {kpis.totalPosts.delta >= 0 ? (
                <span className="inline-flex items-center text-emerald-700 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{kpis.totalPosts.delta} ({kpis.totalPosts.percentChange}%)
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 font-bold font-mono">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{kpis.totalPosts.delta} ({kpis.totalPosts.percentChange}%)
                </span>
              )}
              <span className="text-slate-500 text-[10px]">vs periode lalu</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Tanggapan Balasan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold font-mono uppercase tracking-wider">Respons Balasan</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.totalReplies.current}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {kpis.totalReplies.delta >= 0 ? (
                <span className="inline-flex items-center text-emerald-700 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{kpis.totalReplies.delta} ({kpis.totalReplies.percentChange}%)
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 font-bold font-mono">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{kpis.totalReplies.delta} ({kpis.totalReplies.percentChange}%)
                </span>
              )}
              <span className="text-slate-500 text-[10px]">vs periode lalu</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Reaksi Emosional */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold font-mono uppercase tracking-wider">Reaksi Manusia</span>
            <Heart className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.totalReactions.current}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {kpis.totalReactions.delta >= 0 ? (
                <span className="inline-flex items-center text-emerald-700 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{kpis.totalReactions.delta} ({kpis.totalReactions.percentChange}%)
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 font-bold font-mono">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{kpis.totalReactions.delta} ({kpis.totalReactions.percentChange}%)
                </span>
              )}
              <span className="text-slate-500 text-[10px]">Empat Reaksi</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Supported Coretan Rate (North Star) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold font-mono uppercase tracking-wider">SCR 24h</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'scr' ? null : 'scr')}
                className="text-slate-400 hover:text-slate-600"
                title="Lihat definisi metrik"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.supportedCoretanRate.current}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                Target ≥ 70%
              </span>
              <span className="text-slate-500 text-[10px]">
                {kpis.supportedCoretanRate.delta >= 0 ? `+${kpis.supportedCoretanRate.delta}%` : `${kpis.supportedCoretanRate.delta}%`}
              </span>
            </div>
          </div>

          {/* Metric explanation tooltip */}
          {activeTooltip === 'scr' && (
            <div className="absolute top-full left-0 right-0 z-20 mt-2 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl font-sans leading-relaxed">
              <strong>Supported Coretan Rate (SCR 24h)</strong> adalah persentase coretan baru yang menerima setidaknya 1 balasan manusiawi yang hangat dalam waktu 24 jam pertama. Ini adalah metrik utama Koma untuk menjamin listener-supply.
            </div>
          )}
        </div>

        {/* KPI 5: Sesi Pengunjung Unik */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-bold font-mono uppercase tracking-wider">Sesi Unik</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.uniqueVisitors.current}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {kpis.uniqueVisitors.delta >= 0 ? (
                <span className="inline-flex items-center text-emerald-700 font-bold font-mono">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{kpis.uniqueVisitors.delta}
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-600 font-bold font-mono">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{kpis.uniqueVisitors.delta}
                </span>
              )}
              <span className="text-slate-500 text-[10px]">Aktor anonim</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <AdminChart
        data={timeSeries}
        title="Dinamika Aktivitas Berdasarkan Waktu"
        subtitle={`Visualisasi laju coretan, balasan percakapan, dan reaksi emosional pada periode ${period.toUpperCase()}`}
      />

      {/* Secondary Grid: Topic Distribution & OP Response Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Topic Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900">Distribusi Topik Coretan</h3>
              <p className="text-xs text-slate-600">Persebaran topik berdasarkan volume dan resonansi publik</p>
            </div>
            <Compass className="w-4 h-4 text-slate-400" />
          </div>

          {topicBreakdown.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-sans">
              Belum ada topik yang aktif pada periode ini.
            </div>
          ) : (
            <div className="space-y-4">
              {topicBreakdown.map((t) => (
                <div key={t.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-700">#{t.topic}</span>
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                      <span>{t.count} coretan ({t.percentage}%)</span>
                      <span>•</span>
                      <span>💬 {t.replies} balasan</span>
                      <span>•</span>
                      <span>❤️ {t.reactions} reaksi</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.max(4, t.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1 col): OP Response Modes & Empathy Control */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-sans font-bold text-base text-slate-900">Mode Resonansi Penulis</h3>
              <p className="text-xs text-slate-600">Pilihan kontrol interaksi oleh penulis coretan</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950 font-sans">
                  <span>Boleh Dibalas (Open Discussion)</span>
                  <span className="font-mono text-indigo-700">{responseModeStats.bolehDibalas}</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                  Penulis secara terbuka menyambut balasan dan sudut pandang dari pembaca asing.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950 font-sans">
                  <span>Cukup Didengar (Listen Only)</span>
                  <span className="font-mono text-amber-700">{responseModeStats.cukupDidengar}</span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Ruang ventilasi murni tanpa unsolicited advice; input balasan dinonaktifkan sistem.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
            💡 Rasio yang sehat adalah &gt; 60% &quot;Boleh Dibalas&quot; untuk mempertahankan dinamika percakapan organik.
          </div>
        </div>
      </div>

      {/* Third Grid: Retention & Honest PDP Traffic Privacy Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention / Returning Visitors */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900">Retensi Sesi & Pengunjung Kembali</h3>
              <p className="text-xs text-slate-600">Frekuensi kembalinya aktor anonim antar hari kalender</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Sesi Multi-Hari</span>
              <div className="text-2xl font-black text-slate-900 font-mono">{retention.multiDaySessions}</div>
              <span className="text-[10px] text-slate-500 block">Aktif di &gt; 1 hari kalender</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Tingkat Retensi Riil</span>
              <div className="text-2xl font-black text-indigo-700 font-mono">{retention.retentionRate}%</div>
              <span className="text-[10px] text-slate-500 block">Dari total {retention.totalUniqueSessions} sesi terekam</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            {retention.note}
          </p>
        </div>

        {/* Device & Traffic Source - Honest Privacy-First Empty State */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-900">Sumber Trafik & Pelacakan Perangkat</h3>
              <p className="text-xs text-slate-600">Audit kepatuhan privasi anonim UU PDP No. 27/2022</p>
            </div>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="p-5 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <div className="inline-flex p-2 rounded-full bg-slate-200/70 text-slate-600 mb-1">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-sans font-bold text-xs text-slate-800">
              Pelacakan Sidik Jari Perangkat Dinonaktifkan Secara Etis
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              {deviceAndSource.message}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Standar: <strong>Zero PII Telemetry</strong></span>
            <span className="text-emerald-700 font-semibold">✓ Patuh UU PDP 2022</span>
          </div>
        </div>
      </div>

      {/* Top Engaging Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">Konten Paling Resonan</h3>
            <p className="text-xs text-slate-600">
              Peringkat engagement berdasarkan respons manusiawi aktual dengan kurva peluruhan waktu (time-decay)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Top 5 Coretan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 font-bold">Penulis & Waktu</th>
                <th className="py-3 px-4 font-bold">Topik</th>
                <th className="py-3 px-6 font-bold">Cuplikan Coretan</th>
                <th className="py-3 px-4 font-bold text-center">Balasan</th>
                <th className="py-3 px-4 font-bold text-center">Reaksi</th>
                <th className="py-3 px-4 font-bold text-right">Skor Resonansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topContent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data konten yang dievaluasi.
                  </td>
                </tr>
              ) : (
                topContent.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{post.authorAlias}</div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        #{post.topic}
                      </span>
                    </td>
                    <td className="py-3 px-6 max-w-md">
                      <p className="truncate text-slate-800 leading-relaxed font-sans">{post.content}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {post.replyCount}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {post.reactionCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                      {post.engagementScore.toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
