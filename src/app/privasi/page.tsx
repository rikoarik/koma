import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Key, EyeOff, ShieldCheck } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Kebijakan Privasi Koma — Perlindungan Anonimitas & Data',
  description: 'Bagaimana Koma melindungi privasi dan anonimitas pengunjung sesuai UU Pelindungan Data Pribadi (UU PDP).',
  alternates: { canonical: '/privasi' },
  openGraph: { url: '/privasi', title: 'Kebijakan Privasi Koma' },
};

export default function PrivasiPage() {
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
      <main className="max-w-3xl mx-auto px-4 py-14 flex-1 w-full space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-ink/15 font-mono text-xs font-bold text-koma-purpleDark uppercase tracking-wider">
            <span>Privasi & Keamanan Data</span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-ink tracking-tight">
            Identitasmu adalah milikmu seutuhnya.
          </h1>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed">
            Koma dirancang sejak baris kode pertama dengan arsitektur <em>Anonymous-First</em>. Kami tidak melacak Anda di internet dan tidak menjual data apa pun kepada pihak ketiga.
          </p>
        </div>

        {/* 4 Privacy Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-6 bg-paper-card border border-ink/15 shadow-paper-sm rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-bold">
              <EyeOff className="w-4 h-4 text-koma-purple" />
              <span>Nir-Pelacak & Bebas Iklan</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ink">Tanpa Ad-Tracker</h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              Kami tidak menanamkan Google Analytics pelacak identitas lintas web, Facebook Pixel, atau skrip iklan komersial apa pun.
            </p>
          </div>

          <div className="p-6 bg-paper-card border border-ink/15 shadow-paper-sm rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-bold">
              <Key className="w-4 h-4 text-koma-purple" />
              <span>Kunci Rahasia Penulis</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ink">Author Delete Secret</h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              Setiap kali Anda menulis coretan, browser Anda memegang token rahasia lokal. Anda dapat menghapus tulisan Anda sendiri sewaktu-waktu tanpa harus mendaftar akun.
            </p>
          </div>

          <div className="p-6 bg-paper-card border border-ink/15 shadow-paper-sm rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-bold">
              <Lock className="w-4 h-4 text-koma-purple" />
              <span>Sesi Kriptografis Acak</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ink">Ephemeral Session</h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              Sistem backend hanya mengenal pengenal sesi anonim acak (opaque uuid) untuk membedakan reaksi dan mencegah bot spam. Tidak ada nama asli atau profil yang tersimpan.
            </p>
          </div>

          <div className="p-6 bg-paper-card border border-ink/15 shadow-paper-sm rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-koma-purple" />
              <span>Kepatuhan Regulasi</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-ink">Kepatuhan UU PDP</h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              Tunduk pada ketentuan UU No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP). Isi curhatan sensitif tidak pernah diekspor ke telemetry log publik.
            </p>
          </div>
        </div>

        {/* Hak Pengguna */}
        <div className="p-6 bg-[#FAF8F5] border border-ink/15 rounded-sm space-y-3 font-sans text-sm text-ink leading-relaxed">
          <h3 className="font-serif font-bold text-xl text-ink">Hak Penghapusan & Pertanyaan Privasi</h3>
          <p>
            Jika Anda ingin menghapus coretan yang tidak sengaja terbit dan tidak lagi memegang kunci sesi di peramban, gunakan tombol <strong>Laporkan Coretan</strong> dengan alasan privasi atau <Link href="/pesan" className="font-bold underline underline-offset-2 hover:text-koma-purpleDark">kirim pesan ke pengelola</Link>. Pesan hanya dibaca pengelola, bukan ditampilkan di feed. Kami menyimpan isi pesan, kategori, waktu, dan penanda sesi anonim untuk membatasi spam; tanpa alamat kontak, kami tidak bisa membalas langsung.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
