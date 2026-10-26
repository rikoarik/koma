import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldAlert, CheckCircle, XCircle, HeartHandshake } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Aturan Ruang Koma — Etika & Panduan Komunitas',
  description: 'Panduan etika berkomunitas di Koma: bebas jujur, bukan bebas menyakiti.',
  alternates: { canonical: '/aturan' },
  openGraph: { url: '/aturan', title: 'Aturan Ruang Koma' },
};

export default function AturanPage() {
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
            <span>Etika & Keamanan Ruang</span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-ink tracking-tight">
            Bebas jujur, bukan bebas menyakiti.
          </h1>
          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed">
            Anonimitas di Koma adalah tempat berlindung bagi kejujuran personal, bukan tameng untuk menyerang, merendahkan, atau melecehkan sesama.
          </p>
        </div>

        {/* 3 Core Rules */}
        <div className="space-y-6">
          <div className="p-6 bg-paper-card border-2 border-ink/15 shadow-paper rounded-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-koma-purple text-white flex items-center justify-center font-mono text-xs font-bold">1</span>
              <h3 className="font-serif font-bold text-xl text-ink">Bicara tentang hidupmu, bukan menyerang hidup orang lain</h3>
            </div>
            <p className="font-sans text-sm text-ink-muted pl-10 leading-relaxed">
              Tuangkan keluh kesah, keresahan, kesedihan, atau cerita kecilmu. Dilarang keras melakukan perundungan <em>(bullying)</em>, pelecehan terarah, ujaran kebencian SARA, atau intimidasi kepada siapa pun.
            </p>
          </div>

          <div className="p-6 bg-paper-card border-2 border-ink/15 shadow-paper rounded-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-koma-purple text-white flex items-center justify-center font-mono text-xs font-bold">2</span>
              <h3 className="font-serif font-bold text-xl text-ink">Jaga privasi ketat (Zero Tolerance Doxxing)</h3>
            </div>
            <p className="font-sans text-sm text-ink-muted pl-10 leading-relaxed">
              Dilarang menyebarkan nomor telepon, tautan media sosial pribadi, alamat rumah, foto identitas (KTP/SIM), atau data pribadi orang lain. Sistem otomatis memblokir nomor kontak untuk melindungi seluruh pihak.
            </p>
          </div>

          <div className="p-6 bg-paper-card border-2 border-ink/15 shadow-paper rounded-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-koma-purple text-white flex items-center justify-center font-mono text-xs font-bold">3</span>
              <h3 className="font-serif font-bold text-xl text-ink">Hormati batas penulis: Cukup Didengar vs Boleh Dibalas</h3>
            </div>
            <p className="font-sans text-sm text-ink-muted pl-10 leading-relaxed">
              Jika penulis memilih opsi <em>Cukup Didengar</em>, hargai ruang ventilasi mereka. Jika mereka memilih <em>Boleh Dibalas</em>, tanggapilah dengan empati sesama manusia, bukan dengan nada menghakimi atau menggurui.
            </p>
          </div>
        </div>

        {/* Apa yang Boleh & Tidak Boleh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-5 bg-emerald-50/60 border border-emerald-700/20 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" />
              <span>Sangat Dipersilakan</span>
            </div>
            <ul className="text-xs font-sans space-y-2 text-emerald-950">
              <li>• Curhat beban pekerjaan, perkuliahan, atau keluarga.</li>
              <li>• Cerita kebahagiaan kecil yang tak ada tempat untuk membagikannya.</li>
              <li>• Reaksi empati (Aku dengerin, Relate, Senyum, Peluk jauh).</li>
              <li>• Diskusi sehat dan saling menguatkan di kolom tanggapan.</li>
            </ul>
          </div>

          <div className="p-5 bg-rose-50/60 border border-rose-700/20 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-mono text-xs font-bold uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              <span>Dilarang Keras</span>
            </div>
            <ul className="text-xs font-sans space-y-2 text-rose-950">
              <li>• Promosi judi online, pinjaman ilegal, atau spam komersial.</li>
              <li>• Ajakan melukai diri sendiri, ancaman kekerasan, atau terorisme.</li>
              <li>• Konten pornografi, eksploitasi anak, atau materi asusila.</li>
              <li>• Menyebarkan aib spesifik atau informasi pribadi orang lain.</li>
            </ul>
          </div>
        </div>

        {/* Krisis Mental Health Hotline */}
        <div className="p-6 bg-koma-purpleLight border border-koma-purple/30 rounded-sm space-y-2">
          <h4 className="font-serif font-bold text-lg text-koma-purpleDark">Sedang dalam kondisi krisis atau butuh bantuan segera?</h4>
          <p className="font-sans text-xs sm:text-sm text-ink leading-relaxed">
            Jika kamu atau seseorang yang kamu kenal sedang mengalami krisis emosional berat atau dorongan melukai diri, hubungi layanan bantuan konseling psikologis darurat Kemenkes di hotline <strong>119 extension 8 (Healing 119)</strong> atau layanan konseling profesional terdekat. Kamu tidak sendirian.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
