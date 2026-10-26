'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  EyeOff,
  Trash2,
  XCircle,
  Clock,
  User,
  Check,
} from 'lucide-react';

interface AdminModerationViewProps {
  reports: any[];
  onResolveReport: (reportId: string, action: 'DISMISSED' | 'RESOLVED_HIDE' | 'RESOLVED_DELETE' | 'PUBLISH') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function AdminModerationView({
  reports,
  onResolveReport,
  onRefresh,
  isRefreshing = false,
}: AdminModerationViewProps) {
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'ALL'>('PENDING');

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'PENDING') return r.status === 'PENDING';
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const dismissedCount = reports.filter((r) => r.status === 'DISMISSED').length;

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'doxxing':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'kebencian':
      case 'kekerasan':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'spam':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Menunggu Tindakan</span>
            <div className="text-2xl font-black text-rose-600 font-sans mt-0.5">{pendingCount}</div>
            <span className="text-[11px] text-slate-400">Prioritas moderasi</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Telah Ditindak</span>
            <div className="text-2xl font-black text-emerald-600 font-sans mt-0.5">{resolvedCount}</div>
            <span className="text-[11px] text-slate-400">Konten disembunyikan / dihapus</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Laporan Diabaikan</span>
            <div className="text-2xl font-black text-slate-700 font-sans mt-0.5">{dismissedCount}</div>
            <span className="text-[11px] text-slate-400">Tidak melanggar etika</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Antrean Menunggu ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Kasus ({reports.length})
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-bold text-base text-slate-900">
            {filterStatus === 'PENDING' ? 'Tidak ada kasus menunggu' : 'Belum ada kasus moderasi'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {filterStatus === 'PENDING'
              ? 'Tidak ada kasus yang menunggu keputusan pengelola saat ini.'
              : 'Kasus otomatis dan laporan komunitas akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`bg-white rounded-xl border p-5 shadow-xs space-y-4 transition-all ${
                report.status === 'PENDING'
                  ? 'border-rose-200 ring-1 ring-rose-100'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${getReasonColor(
                      report.reason
                    )}`}
                  >
                    Alasan: {report.reason}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {report.kind === 'case' ? 'Kasus otomatis' : 'Laporan'}: {report.id}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {report.kind === 'case' ? `Sumber: ${report.source} / ${report.category}` : 'Laporan komunitas'}
                  </span>
                  {report.kind === 'case' && <span className="text-[11px] text-slate-600">{report.moderationState === 'removed' ? 'Tidak tampil di publik' : report.moderationState === 'held_for_review' ? 'Ditahan sementara' : 'Tampil di publik'}</span>}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      report.status === 'PENDING'
                        ? 'bg-rose-100 text-rose-800'
                        : report.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {report.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(report.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Target Content Display */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500">
                  <span>Target: {report.targetType?.toUpperCase() || 'POST'} (Penulis: {report.authorAlias || 'Tanpa Nama'})</span>
                  <span className="text-slate-400">Target ID: {report.targetId}</span>
                </div>
                <p className="text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-line">
                  {report.targetContent}
                </p>
                {report.notes && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 font-sans italic">
                    Catatan Pelapor: &quot;{report.notes}&quot;
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {report.status === 'PENDING' ? (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onResolveReport(report.id, report.kind === 'case' ? 'PUBLISH' : 'DISMISSED')}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    {report.kind === 'case' ? 'Terbitkan' : 'Abaikan laporan'}
                  </button>
                  {report.kind === 'report' && report.moderationState !== 'published' && <button
                    onClick={() => onResolveReport(report.id, 'PUBLISH')}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Terbitkan lagi
                  </button>}
                  <button
                    onClick={() => onResolveReport(report.id, 'RESOLVED_HIDE')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Tetap sembunyikan</span>
                  </button>
                  <button
                    onClick={() => onResolveReport(report.id, 'RESOLVED_DELETE')}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus permanen</span>
                  </button>
                </div>
              ) : (
                <div className="text-right text-[11px] font-mono text-slate-400 italic">
                  ✓ Laporan telah diselesaikan
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
