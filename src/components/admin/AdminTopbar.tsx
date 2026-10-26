'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ExternalLink, RefreshCw, Shield, User } from 'lucide-react';

interface AdminTopbarProps {
  activeTab: string;
  onOpenMobile: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dasbor Operasional',
    subtitle: 'Ikhtisar aktivitas publik, metrik kesehatan komunitas, dan status antrean',
  },
  analytics: {
    title: 'Analitik Riil & Tren Interaksi',
    subtitle: 'Pengukuran Supported Coretan Rate (SCR 24h) dan tren interaksi tanpa rekayasa bot',
  },
  content: {
    title: 'Manajemen Arsip Konten',
    subtitle: 'Penyaringan, kurasi sematan, pengawasan status privasi, dan moderasi coretan',
  },
  messages: {
    title: 'Pesan Pengunjung',
    subtitle: 'Kotak masuk privat untuk masukan dan kendala dari pengunjung',
  },
  moderation: {
    title: 'Antrean Laporan Komunitas',
    subtitle: 'Tindak lanjut laporan dugaan pelanggaran etika, doxxing, dan konten berbahaya',
  },
  rules: {
    title: 'Aturan Etika & Kata Terlarang',
    subtitle: 'Konfigurasi pelindung anti-doxxing, normalisasi leetspeak, dan daftar kata terlarang',
  },
  ai: {
    title: 'Pengawasan Studio AI',
    subtitle: 'Status konektivitas model bahasa, transparansi prompt, dan mitigasi fallback offline',
  },
  donations: {
    title: 'Traktir Kopi & QRIS',
    subtitle: 'Konfigurasi saluran dukungan mandiri bebas iklan untuk operasional independen',
  },
  system: {
    title: 'Status Sistem & Audit Log',
    subtitle: 'Integritas pangkalan data, kepatuhan privasi UU PDP, dan rekam jejak pengelola',
  },
};

export default function AdminTopbar({
  activeTab,
  onOpenMobile,
  onRefresh,
  isRefreshing = false,
}: AdminTopbarProps) {
  const current = TAB_TITLES[activeTab] || {
    title: 'Panel Pengelola',
    subtitle: 'Area administratif Koma',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile trigger & view title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              {current.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-600 truncate max-w-md">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions and Admin Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Segarkan data terbaru"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Segarkan</span>
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-all"
        >
          <span>Situs Publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-none">Pengelola</div>
            <div className="text-[10px] font-medium text-slate-600 leading-tight">Superadmin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
