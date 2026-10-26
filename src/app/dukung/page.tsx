'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Coffee, ExternalLink } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { DonationConfig } from '@/types';
import { DEFAULT_DONATION_URL } from '@/lib/donation-defaults';

export default function DukungPage() {
  const [config, setConfig] = useState<DonationConfig>({
    enabled: true,
    qrisImageUrl: '',
    customMessage: 'Dukung operasional Koma agar tetap mandiri, bebas iklan komersial, dan bebas pelacak.',
    externalLinkUrl: DEFAULT_DONATION_URL,
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/donations');
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(data.config);
        }
      } catch (err) {
        console.warn('Could not load donation config:', err);
      }
    }
    loadConfig();
  }, []);

  if (!config.enabled) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col">
        <main className="flex-1 mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-serif text-3xl font-bold">Dukungan sedang tidak tersedia.</h1>
          <p className="mt-4 font-sans text-ink-muted">Terima kasih sudah ingin mendukung Koma. Kanal donasi saat ini ditutup sementara.</p>
          <Link href="/" className="mt-8 inline-block font-sans font-bold underline underline-offset-4">Kembali ke beranda</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col justify-between selection:bg-koma-purple selection:text-paper">
      {/* Header */}
      <header className="py-4 border-b border-ink/10 bg-[#FAF8F5]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-ink hover:text-koma-purple transition-colors font-mono text-xs font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link href="/" className="font-serif font-black text-xl tracking-tight text-ink">
            koma<span className="text-koma-purple">,</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-14 flex-1 w-full space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-ink/15 font-mono text-xs font-bold text-koma-purpleDark uppercase tracking-wider">
            <Coffee className="w-3.5 h-3.5 text-koma-purple" />
            <span>Kopi Larut Malam</span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-ink tracking-tight">
            Traktir Kopi untuk Koma.
          </h1>
          <p className="font-sans text-sm sm:text-base text-ink-muted leading-relaxed">
            {config.customMessage}
          </p>
        </div>

        {/* Donation Card */}
        <div className="relative p-6 sm:p-10 bg-paper-card border-2 border-ink/15 shadow-paper-lift rounded-sm space-y-8">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 pointer-events-none">
            <Image src="/assets/tape-kraft.svg" alt="Plester Kraft" width={128} height={28} className="opacity-90" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-ink">Sedikit bantuan, banyak artinya.</h2>
            <p className="max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
              Tombol di bawah akan membawamu ke platform donasi eksternal. Pilih sendiri nominal dukungan di sana; halaman ini tidak memproses pembayaran.
            </p>
          </div>

          {/* External Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-ink/10">
            <div className="text-xs font-sans text-ink-muted text-center sm:text-left">
              Pembayaran dan nominal diatur di halaman donasi eksternal.
            </div>
            <a
              href={config.externalLinkUrl || DEFAULT_DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-paper font-sans font-bold text-sm rounded-sm hover:bg-koma-purple transition-all shadow-paper hover:-translate-y-0.5 active:translate-y-0 shrink-0"
            >
              <span>Buka Halaman Donasi</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className="text-center font-sans text-xs text-ink-muted">
          Dukungan bersifat sukarela dan tidak memengaruhi visibilitas coretan di Koma.
        </p>
      </main>

      <Footer />
    </div>
  );
}
