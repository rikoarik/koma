'use client';

import React from 'react';
import {
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Clock,
  HardDrive,
  FileText,
  Lock,
  Layers,
} from 'lucide-react';
import { AdminAuditEntry } from '@/lib/storage';

interface AdminSystemViewProps {
  systemHealth: any;
  auditLogs: AdminAuditEntry[];
}

export default function AdminSystemView({
  systemHealth,
  auditLogs,
}: AdminSystemViewProps) {
  const db = systemHealth?.database || {};
  const server = systemHealth?.server || {};

  const formatUptime = (sec: number) => {
    if (!sec) return '0 menit';
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours} jam ${mins} menit`;
    return `${mins} menit`;
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* DB Engine */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-bold uppercase">Pangkalan Data</span>
            <Database className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-base font-bold text-slate-900 font-sans tracking-tight truncate">
            {db.engine || 'Local JSON Store'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{db.connected ? `Terhubung${db.fileSizeKb == null ? '' : ` (${db.fileSizeKb} KB lokal)`}` : 'Status tidak tersedia'}</span>
          </div>
        </div>

        {/* Server Runtime */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-bold uppercase">Lingkungan Server</span>
            <Cpu className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-base font-bold text-slate-900 font-sans tracking-tight">
            Node.js {server.nodeVersion || '—'} • {server.platform || '—'}
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Memori: {server.memoryUsageMb || 0} MB • Uptime: {formatUptime(server.uptimeSeconds)}
          </div>
        </div>

        {/* Privacy & Compliance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-bold uppercase">Kepatuhan Privasi</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 font-sans tracking-tight">
            UU PDP No. 27/2022
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Identitas publik anonim; pengumpulan data perangkat dan sumber kunjungan tidak diaktifkan.
          </p>
        </div>
      </div>

      {/* Database Tables Record Counts */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-sans font-bold text-base text-slate-900">
          Ringkasan Rekor Entitas Pangkalan Data
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Posts</span>
            <span className="text-lg font-black text-slate-900">{db.tables?.posts || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Replies</span>
            <span className="text-lg font-black text-slate-900">{db.tables?.replies || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Reactions</span>
            <span className="text-lg font-black text-slate-900">{db.tables?.reactions || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Reports</span>
            <span className="text-lg font-black text-rose-600">{db.tables?.reports || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Rules</span>
            <span className="text-lg font-black text-slate-900">{db.tables?.moderationRules || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Events</span>
            <span className="text-lg font-black text-slate-900">{db.tables?.analyticsEvents || 0}</span>
          </div>
        </div>
      </div>

      {/* Admin Audit Trail History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">Rekam Jejak Tindakan Pengelola (Audit Log)</h3>
            <p className="text-xs text-slate-600">Catatan riwayat tindakan moderasi, penghapusan, dan pembaruan aturan</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{auditLogs.length} Entri</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-sans">
            Belum ada rekam audit yang dicatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Waktu</th>
                  <th className="py-3 px-4 font-bold">Tindakan</th>
                  <th className="py-3 px-4 font-bold">Sasaran / Target</th>
                  <th className="py-3 px-6 font-bold">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-800 whitespace-nowrap">
                      {log.target}
                    </td>
                    <td className="py-2.5 px-6 text-slate-700 leading-relaxed font-sans">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security & Regulatory Notes */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <h4 className="font-sans font-bold text-slate-900 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Etika Privasi Anonim & Penegakan Regulasi</span>
        </h4>
        <p className="text-slate-600 leading-relaxed font-sans">
          Minimalkan data pribadi dalam laporan dan audit. Tinjau kebijakan penyimpanan serta kepatuhan UU PDP No. 27/2022 secara berkala; panel ini bukan sertifikasi kepatuhan hukum.
        </p>
      </div>
    </div>
  );
}
