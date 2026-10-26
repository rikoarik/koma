'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Coffee, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { DonationConfig } from '@/types';
import { DEFAULT_DONATION_URL } from '@/lib/donation-defaults';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [config, setConfig] = useState<DonationConfig>({
    enabled: true,
    qrisImageUrl: '',
    externalLinkUrl: DEFAULT_DONATION_URL,
    customMessage: 'Dukung operasional Koma agar tetap mandiri, bebas iklan, dan bebas pelacak.',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/donations')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.config) {
            setConfig(data.config);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !config.enabled) return null;

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(config.qrisImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qris-donasi-koma.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      // Fallback
      window.open(config.qrisImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="donation-title" className="relative w-full max-w-md my-8 p-6 sm:p-8 bg-[#FAF8F5] border-2 border-ink/20 shadow-paper-float rounded-sm text-ink animate-in fade-in zoom-in-95 duration-200">
        {/* Top Washi Tape */}
        <div className="absolute -top-3.5 left-12 z-10 w-28 pointer-events-none">
          <Image src="/assets/tape-purple.svg" alt="Tape" width={110} height={26} className="opacity-95" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-black/10 text-ink hover:text-black transition-colors"
          title="Tutup (Esc)"
          aria-label="Tutup dialog donasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-koma-purpleLight text-koma-purpleDark font-mono text-xs font-bold mb-2 border border-koma-purple/30">
            <Coffee className="w-3.5 h-3.5 text-koma-purple" />
            <span>Koma • Traktir Secangkir Kopi</span>
          </div>
          <h2 id="donation-title" className="font-serif font-black text-2xl text-ink">
            Jaga Ruang Ini Tetap Mandiri.
          </h2>
          <p className="font-sans text-xs text-ink-muted mt-1 leading-relaxed">
            {config.customMessage}
          </p>
        </div>

        {config.qrisImageUrl && (
          <div className="p-4 bg-white border-2 border-ink/20 rounded-sm shadow-inner flex flex-col items-center gap-3">
            <div className="relative w-52 h-52 bg-paper-card border border-ink/20 rounded-sm overflow-hidden">
              <Image src={config.qrisImageUrl} alt="QRIS Koma" fill sizes="220px" className="object-contain p-2" />
            </div>
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
              Pindai QRIS untuk memberi dukungan
            </span>
            <button
              onClick={handleDownloadQR}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-paper border border-ink/30 hover:border-koma-purple text-ink hover:text-koma-purple font-mono text-xs font-bold rounded-sm transition-colors shadow-paper-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Gambar QR</span>
            </button>
          </div>
        )}

        {/* Optional External Link */}
        {config.externalLinkUrl && (
          <div className="mt-3 text-center">
            <a
              href={config.externalLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-koma-purpleDark hover:underline"
            >
              <span>Beri dukungan lewat halaman donasi</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Honest Non-Commercial Verification Notice */}
        <div className="mt-4 p-3 bg-paper border border-ink/15 rounded-sm flex items-start gap-2 text-[10px] font-mono text-ink-muted leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" />
          <span>
            <strong>Catatan Transparansi:</strong> Koma tidak melakukan klaim pembayaran otomatis tanpa verifikasi bank.
            Seluruh dukungan bersifat sukarela tanpa kompensasi perlakuan istimewa di feed.
          </span>
        </div>
      </div>
    </div>
  );
}
