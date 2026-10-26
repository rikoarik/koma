import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import MessageForm from '@/components/MessageForm';

export const metadata = {
  title: 'Kirim pesan ke pengelola — koma',
  description: 'Sampaikan masukan atau kendala secara privat kepada pengelola koma.',
};

export default function PesanPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="border-b border-ink/15 bg-paper-card py-4">
        <div className="mx-auto max-w-5xl px-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 font-mono text-xs font-bold hover:text-koma-purpleDark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purpleDark"><ArrowLeft size={16} aria-hidden="true" /> Beranda</Link>
          <Link href="/" aria-label="koma, beranda"><Image src="/brand/svg/koma-logo-horizontal-color.svg" alt="koma," width={96} height={36} className="w-24 h-auto" /></Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-12 sm:py-20">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-koma-purpleDark">Surat untuk pengelola</p>
            <h1 className="mt-5 font-serif font-black text-4xl sm:text-5xl leading-tight">Ada yang perlu kami dengar?</h1>
            <p className="mt-6 max-w-md leading-relaxed">Masukan, kendala, atau hal lain tentang koma bisa kamu kirim lewat sini. Pesan ini hanya tersedia di kotak masuk pengelola, bukan di feed publik.</p>
            <p className="mt-5 max-w-md text-sm text-ink-muted leading-relaxed">Tidak perlu nama atau alamat email. Karena tidak ada kontak balik, pengelola tidak bisa membalas lewat formulir ini. Jangan sertakan kata sandi atau data pribadi yang tidak perlu.</p>
          </div>
          <div className="border border-ink/25 bg-paper-card p-6 sm:p-9 shadow-paper"><MessageForm /></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
