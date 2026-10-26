import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Tentang koma — Tempat buat bilang yang ada di kepala',
  description: 'Kenalan dengan koma: ruang untuk menulis tanpa nama, membaca cerita orang lain, dan saling menanggapi dengan hati-hati.',
  alternates: { canonical: '/tentang' },
  openGraph: { url: '/tentang', title: 'Tentang Koma' },
};

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col selection:bg-koma-purple selection:text-paper">
      <header className="py-4 border-b border-ink/15 bg-paper-card/95 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs font-bold hover:text-koma-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purple transition-colors">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Kembali ke beranda
          </Link>
          <Link href="/" aria-label="koma, beranda" className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purple">
            <Image src="/brand/svg/koma-logo-horizontal-color.svg" alt="koma," width={96} height={36} className="w-20 sm:w-24 h-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full">
        <article className="max-w-5xl mx-auto px-4 sm:px-6">
          <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 border-b-2 border-ink/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-2/3 h-full opacity-30 pointer-events-none" style={{ backgroundImage: "url('/assets/hero-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }} aria-hidden="true" />
            <div className="relative grid md:grid-cols-[minmax(0,1fr)_220px] gap-10 md:gap-16 items-center">
              <div className="max-w-2xl">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-koma-purpleDark mb-6">Tentang ruang ini</p>
                <h1 className="font-serif font-black tracking-tight leading-[1.06] text-5xl sm:text-6xl lg:text-7xl max-w-[11ch]">
                  Ada yang ingin kamu keluarkan?
                </h1>
                <p className="font-sans text-lg sm:text-xl leading-relaxed mt-7 max-w-[54ch] text-ink">
                  Kadang satu kalimat saja sudah cukup untuk mulai. Di koma, kamu bisa menulis apa yang ada di kepala tanpa harus menjelaskan siapa dirimu.
                </p>
              </div>
              <div className="relative hidden md:flex items-center justify-center min-h-72" aria-hidden="true">
                <div className="absolute inset-x-3 inset-y-6 border border-ink/25 rotate-[-7deg] bg-paper-card shadow-paper" />
                <div className="absolute inset-x-3 inset-y-6 border border-ink/20 rotate-[5deg] bg-paper-warm" />
                <Image src="/assets/paper-clip.svg" alt="" width={40} height={100} className="absolute -top-2 left-4 w-8 h-20 rotate-[-18deg] z-10" />
                <Image src="/assets/stamp-koma.svg" alt="" width={150} height={150} className="relative rotate-[-9deg] opacity-90" />
                <Image src="/assets/sticker-koma-zine.svg" alt="" width={86} height={86} className="absolute -bottom-3 right-0 rotate-[13deg] drop-shadow-sm" />
              </div>
            </div>
            <p className="relative mt-12 font-mono text-xs font-bold text-ink-faint">CATATAN 01 / RUANG SUARA SESAMA MANUSIA</p>
          </section>

          <section className="py-16 sm:py-24 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 md:gap-16 border-b border-ink/20">
            <h2 className="font-serif font-black text-3xl sm:text-4xl leading-tight max-w-sm">Kenapa ada koma?</h2>
            <div className="font-sans text-base sm:text-lg leading-relaxed space-y-5 max-w-[62ch]">
              <p>Di banyak tempat, berbagi cerita berarti ikut membawa nama, foto, dan angka-angka yang melekat padanya. Lama-lama, bahkan cerita kecil pun terasa perlu dipikirkan berkali-kali sebelum ditulis.</p>
              <p>Koma memberi jeda dari itu. Kamu bisa datang dengan cerita yang belum rapi: soal hari yang berat, kabar baik yang belum sempat dibagi, atau pikiran yang lewat begitu saja. Orang lain bisa membaca dan, kalau kamu mengizinkan, membalas.</p>
            </div>
          </section>

          <section className="py-16 sm:py-24 border-b border-ink/20">
            <h2 className="font-serif font-black text-3xl sm:text-4xl mb-9">Cara ruang ini bekerja</h2>
            <div className="grid md:grid-cols-2 gap-0 border-t border-ink/25">
              <div className="py-7 md:pr-10 border-b border-ink/20 md:border-r">
                <span className="font-mono text-xs font-bold text-koma-purpleDark">01 / TULIS</span>
                <h3 className="font-serif font-bold text-2xl mt-3 mb-2">Mulai tanpa profil publik.</h3>
                <p className="font-sans text-base leading-relaxed">Tulis coretan tanpa menampilkan nama asli. Kamu tidak perlu membangun persona agar ceritamu layak dibaca.</p>
              </div>
              <div className="py-7 md:pl-10 border-b border-ink/20">
                <span className="font-mono text-xs font-bold text-koma-purpleDark">02 / PILIH</span>
                <h3 className="font-serif font-bold text-2xl mt-3 mb-2">Tentukan batasmu sendiri.</h3>
                <p className="font-sans text-base leading-relaxed">Pilih <strong>Boleh Dibalas</strong> saat ingin diajak bicara, atau <strong>Cukup Didengar</strong> saat kamu hanya ingin mengeluarkan isi kepala.</p>
              </div>
              <div className="py-7 md:pr-10 border-b border-ink/20 md:border-b-0 md:border-r">
                <span className="font-mono text-xs font-bold text-koma-purpleDark">03 / DENGAR</span>
                <h3 className="font-serif font-bold text-2xl mt-3 mb-2">Baca tanpa papan skor.</h3>
                <p className="font-sans text-base leading-relaxed">Tidak ada jumlah pengikut atau angka suka publik yang menentukan cerita mana yang penting. Setiap coretan punya ruang untuk didengar.</p>
              </div>
              <div className="py-7 md:pl-10">
                <span className="font-mono text-xs font-bold text-koma-purpleDark">04 / JAGA</span>
                <h3 className="font-serif font-bold text-2xl mt-3 mb-2">Jujur, tetap bertanggung jawab.</h3>
                <p className="font-sans text-base leading-relaxed">Anonim di hadapan pembaca bukan berarti bebas menyakiti. Kami membatasi spam, serangan personal, dan penyebaran data pribadi.</p>
              </div>
            </div>
          </section>

          <section className="py-16 sm:py-24 grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-8 md:gap-20 items-start">
            <div className="max-w-[62ch]">
              <h2 className="font-serif font-black text-3xl sm:text-4xl mb-5">Tanpa nama di depan, bukan tanpa tanggung jawab.</h2>
              <p className="font-sans text-base sm:text-lg leading-relaxed mb-5">Nama penulis tidak ditampilkan kepada orang lain. Namun, sistem tetap menggunakan penanda internal untuk menjaga kepemilikan coretan, membatasi penyalahgunaan, dan memproses laporan.</p>
              <p className="font-sans text-base leading-relaxed">Kami ingin kamu tahu batasnya sebelum menulis, bukan menyembunyikannya di balik kata “anonim”.</p>
              <div className="flex flex-wrap gap-x-7 gap-y-3 mt-7 font-mono text-sm font-bold">
                <Link href="/privasi" className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-koma-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purple">Baca soal privasi <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
                <Link href="/aturan" className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-koma-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purple">Lihat aturan ruang <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
              </div>
            </div>
            <aside className="relative bg-paper-card border border-ink/25 shadow-paper p-7 sm:p-9 rotate-[1deg]">
              <Image src="/assets/tape-purple.svg" alt="" width={112} height={28} className="absolute -top-3 left-8" aria-hidden="true" />
              <p className="font-mono text-xs font-bold text-koma-purpleDark mb-5">DI TEPI HALAMAN</p>
              <p className="font-serif text-2xl sm:text-3xl leading-snug">“Bebas jujur, bukan bebas menyakiti.”</p>
              <p className="font-sans text-sm leading-relaxed mt-5">Koma adalah ruang berbagi, bukan layanan bantuan darurat atau pengganti tenaga profesional.</p>
            </aside>
          </section>

          <section className="mb-16 sm:mb-24 bg-ink text-paper p-8 sm:p-12 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div className="max-w-xl">
              <p className="font-mono text-xs font-bold text-[#C4BBFF] mb-4">GILIRANMU</p>
              <h2 className="font-serif font-black text-3xl sm:text-4xl leading-tight">Tidak perlu mencari kalimat yang sempurna.</h2>
              <p className="font-sans text-base leading-relaxed mt-4">Di beranda, mulai dari yang ingin kamu bilang hari ini.</p>
            </div>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-6 py-3 font-sans font-bold text-sm shrink-0 hover:bg-[#E8E3FF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper transition-colors">
              Ke beranda <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
