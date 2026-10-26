'use client';

import React from 'react';
import Image from 'next/image';
import { QrCode, Check, Heart, Save } from 'lucide-react';
import { DonationConfig } from '@/types';
import { DEFAULT_DONATION_URL } from '@/lib/donation-defaults';

interface AdminDonationsViewProps {
  donationConfig: DonationConfig;
  setDonationConfig: (config: DonationConfig) => void;
  onSave: () => Promise<boolean>;
  isSaving?: boolean;
  saveSuccessMsg?: string;
}

export default function AdminDonationsView({
  donationConfig,
  setDonationConfig,
  onSave,
  isSaving = false,
  saveSuccessMsg,
}: AdminDonationsViewProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="font-sans font-bold text-base text-slate-900">
          Konfigurasi Donasi & QRIS
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Kelola kanal apresiasi sukarela untuk mendukung operasional mandiri Koma agar tetap bebas iklan dan pelacak komersial.
        </p>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form settings */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5 text-xs"
        >
          {/* Active Switch */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block font-sans">
                Status Fitur di Antarmuka Publik
              </span>
              <span className="text-[11px] text-slate-500">
                Tampilkan kanal dukungan sukarela di antarmuka publik.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                aria-label="Aktifkan kanal donasi publik"
                checked={donationConfig.enabled}
                onChange={(e) =>
                  setDonationConfig({ ...donationConfig, enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {/* QRIS Image URL */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 font-sans">
              URL / Path Gambar QRIS (opsional)
            </label>
            <input
              type="text"
              value={donationConfig.qrisImageUrl}
              onChange={(e) =>
                setDonationConfig({ ...donationConfig, qrisImageUrl: e.target.value })
              }
              placeholder="/assets/qris-koma.png"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Kosongkan jika belum punya QRIS. Jangan gunakan gambar stiker sebagai QR pembayaran.
            </span>
          </div>

          {/* Custom Message */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 font-sans">
              Pesan Apresiasi untuk Komunitas
            </label>
            <textarea
              rows={3}
              value={donationConfig.customMessage || ''}
              onChange={(e) =>
                setDonationConfig({ ...donationConfig, customMessage: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Pesan hangat yang ditampilkan di halaman dan modal dukungan kepada pembaca.
            </span>
          </div>

          {/* External Link */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 font-sans">
              Tautan Donasi Saweria / Platform Lain
            </label>
            <input
              type="text"
              value={donationConfig.externalLinkUrl || ''}
              onChange={(e) =>
                setDonationConfig({ ...donationConfig, externalLinkUrl: e.target.value })
              }
              placeholder={DEFAULT_DONATION_URL}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi Donasi'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500">
            Pratinjau Tampilan Publik
          </h3>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5" />
            </div>

            <div className="font-sans font-bold text-sm text-slate-900">
              Traktir Kopi untuk Koma
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              {donationConfig.customMessage || 'Dukung operasional Koma agar tetap mandiri.'}
            </p>

            <div className="p-3 bg-white rounded-lg border border-slate-200 inline-block shadow-xs">
              <div className="w-36 h-36 relative mx-auto flex items-center justify-center bg-slate-100 rounded">
                {donationConfig.qrisImageUrl ? (
                  <Image
                    src={donationConfig.qrisImageUrl}
                    alt="QRIS Preview"
                    width={140}
                    height={140}
                    className="object-contain"
                  />
                ) : (
                  <QrCode className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-1.5 font-bold">
                {donationConfig.qrisImageUrl ? 'Gambar QRIS terpasang' : 'QRIS belum dikonfigurasi'}
              </span>
            </div>

            {donationConfig.externalLinkUrl && (
              <div className="pt-1">
                <span className="text-[10px] font-mono text-indigo-700 underline block truncate">
                  {donationConfig.externalLinkUrl} ↗
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
