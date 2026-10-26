'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  LineChart,
  FileText,
  ShieldAlert,
  Sliders,
  Sparkles,
  QrCode,
  Server,
  ExternalLink,
  LogOut,
  X,
  ShieldCheck,
  Mail,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportCount: number;
  unreadMessageCount?: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  dbEngine?: string;
  onLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  reportCount,
  unreadMessageCount = 0,
  isMobileOpen,
  setIsMobileOpen,
  dbEngine = 'Database Terhubung',
  onLogout,
}: AdminSidebarProps) {
  const navSections = [
    {
      title: 'OPERASIONAL',
      items: [
        { id: 'overview', label: 'Dasbor Operasional', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analitik Riil & Tren', icon: LineChart },
      ],
    },
    {
      title: 'MANAJEMEN KONTEN',
      items: [
        { id: 'content', label: 'Arsip & Kelola Coretan', icon: FileText },
        { id: 'messages', label: 'Pesan Pengunjung', icon: Mail, badge: unreadMessageCount, badgeColor: unreadMessageCount > 0 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400' },
        {
          id: 'moderation',
          label: 'Antrean Laporan',
          icon: ShieldAlert,
          badge: reportCount,
          badgeColor: reportCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400',
        },
        { id: 'rules', label: 'Aturan & Kata Terlarang', icon: Sliders },
      ],
    },
    {
      title: 'INTEGRASI & SISTEM',
      items: [
        { id: 'ai', label: 'Status & Penggunaan AI', icon: Sparkles },
        { id: 'donations', label: 'Traktir Kopi & QRIS', icon: QrCode },
        { id: 'system', label: 'Sistem & Audit Log', icon: Server },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-base text-white tracking-tight">Koma Admin</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-semibold border border-slate-700">
                  v1.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Pusat Kendali & Integritas</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom footer status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-slate-300 truncate max-w-[150px]">
                {dbEngine}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              title="Buka situs publik di tab baru"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
