'use client';

import React from 'react';
import Image from 'next/image';
import { Feather, Compass, HeartHandshake } from 'lucide-react';
import { IconDengerin, IconRelate, IconSenyum, IconPeluk } from '@/components/ui/BrandIcons';

export default function StoryActs({ onOpenComposer }: { onOpenComposer?: () => void } = {}) {
  return (
    <section className="relative py-20 px-4 max-w-6xl mx-auto space-y-32">
      {/* Torn Edge Transition Divider */}
      <div className="w-full relative h-10 -mt-10 overflow-hidden pointer-events-none opacity-90">
        <Image
          src="/assets/torn-edge.svg"
          alt="Batas Kertas Robek"
          fill
          className="object-cover"
        />
      </div>

      {/* =========================================================================
          ACT 1: MENUANG (Writing / Pouring)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Visual Artwork Collage */}
        <div className="md:col-span-7 relative group">
          <div className="relative p-2 bg-[#FAF8F5] border-2 border-ink/20 shadow-paper-lift rounded-sm rotate-[-1.5deg] group-hover:rotate-0 transition-transform duration-500">
            {/* Washi Tape Accent */}
            <div className="absolute -top-3.5 left-12 z-20 w-32">
              <Image
                src="/assets/tape-purple.svg"
                alt="Washi Tape"
                width={130}
                height={32}
                className="opacity-95"
              />
            </div>
            
            {/* Artwork */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-dark">
              <Image
                src="/assets/section-writing.webp"
                alt="Ilustrasi Menulis & Menuang"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            {/* Paper Clip Accent */}
            <div className="absolute -bottom-5 right-8 z-20 w-8 h-16">
              <Image
                src="/assets/paper-clip.svg"
                alt="Klip Kertas"
                width={32}
                height={64}
              />
            </div>
          </div>
        </div>

        {/* Narrative Copy */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-black uppercase tracking-widest">
            <Feather className="w-4 h-4 text-koma-purple" />
            <span>Babak 01 • Menuang Rasa</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
            Kepala terlalu penuh untuk disimpan sendiri.
          </h2>

          <p className="font-sans text-ink text-base leading-relaxed">
            Kadang kita cuma butuh selembar kertas kosong di jam dua pagi. Di Koma, kamu
            bisa memilih apakah coretanmu ingin ditanggapi (<strong>Boleh Dibalas</strong>) atau
            hanya sekadar ingin didengar tanpa ada yang sok menasihati (<strong>Cukup Didengar</strong>).
          </p>

          <div className="p-3.5 bg-[#FAF8F5] border-l-4 border-koma-purple border-t border-r border-b border-ink/15 font-mono text-xs text-ink font-semibold rounded-r-sm">
            "Kata-kata yang dituliskan kehilangan setengah taringnya untuk melukaimu."
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACT 2: MENYELAMI (Discovering / Reading)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Narrative Copy (Left on desktop) */}
        <div className="md:col-span-5 order-2 md:order-1 space-y-4">
          <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-black uppercase tracking-widest">
            <Compass className="w-4 h-4 text-koma-purple" />
            <span>Babak 02 • Menyelami Sudut Lain</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
            Membaca rahasia kecil dari orang yang tak kau kenal.
          </h2>

          <p className="font-sans text-ink text-base leading-relaxed">
            Jelajahi pikiran orang asing tanpa bias foto profil atau jabatan LinkedIn.
            Temukan cerita lucu dari halte sepi, pengakuan canggung di kantor, atau
            harapan sederhana yang terselip di jeda rutinitas.
          </p>

          <div className="inline-block pt-1">
            <Image
              src="/assets/stamp-dengar.svg"
              alt="Cap Pos Didengar"
              width={160}
              height={50}
              className="opacity-90"
            />
          </div>
        </div>

        {/* Visual Artwork Collage (Right on desktop) */}
        <div className="md:col-span-7 order-1 md:order-2 relative group">
          <div className="relative p-2 bg-[#FAF8F5] border-2 border-ink/20 shadow-paper-lift rounded-sm rotate-[1.8deg] group-hover:rotate-0 transition-transform duration-500">
            {/* Kraft Tape Accent */}
            <div className="absolute -top-3.5 right-12 z-20 w-36">
              <Image
                src="/assets/tape-kraft.svg"
                alt="Lakban Kraft"
                width={140}
                height={35}
                className="opacity-95"
              />
            </div>

            {/* Artwork */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-dark">
              <Image
                src="/assets/section-discovering.webp"
                alt="Ilustrasi Menemukan & Membaca"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            {/* Sticker Badge */}
            <div className="absolute -bottom-6 left-6 z-20">
              <Image
                src="/assets/sticker-relate.svg"
                alt="Stiker 100% Relate"
                width={100}
                height={55}
                className="drop-shadow-sm rotate-[-8deg]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACT 3: TERHUBUNG (Connecting / Resonating)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Visual Artwork Collage */}
        <div className="md:col-span-7 relative group">
          <div className="relative p-2 bg-[#FAF8F5] border-2 border-ink/20 shadow-paper-lift rounded-sm rotate-[-1deg] group-hover:rotate-0 transition-transform duration-500">
            {/* Washi Purple Tape */}
            <div className="absolute -top-3 left-16 z-20 w-32">
              <Image
                src="/assets/tape-purple.svg"
                alt="Plester Washi"
                width={130}
                height={32}
                className="opacity-95"
              />
            </div>

            {/* Artwork */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-dark">
              <Image
                src="/assets/section-connecting.webp"
                alt="Ilustrasi Terhubung & Beresonansi"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>

            {/* Rubber Stamp Koma */}
            <div className="absolute -bottom-8 right-6 z-20">
              <Image
                src="/assets/stamp-koma.svg"
                alt="Cap Pos Koma"
                width={90}
                height={90}
                className="opacity-90 rotate-[15deg]"
              />
            </div>
          </div>
        </div>

        {/* Narrative Copy */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-koma-purpleDark font-mono text-xs font-black uppercase tracking-widest">
            <HeartHandshake className="w-4 h-4 text-koma-purple" />
            <span>Babak 03 • Terhubung Tanpa Topeng</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
            Resonansi manusia yang sesungguhnya.
          </h2>

          <p className="font-sans text-ink text-base leading-relaxed">
            Tidak ada perlombaan algoritma untuk menjadi yang paling viral. Respon
            dengan empat reaksi yang berarti: <strong>"Aku dengerin"</strong>,{' '}
            <strong>"Relate"</strong>, <strong>"Senyum"</strong>, atau{' '}
            <strong>"Peluk jauh"</strong>. Karena yang terpenting adalah tahu bahwa kamu
            didengar.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] text-ink font-mono text-xs font-bold rounded-sm border border-ink/20 shadow-sm">
              <IconDengerin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Aku dengerin</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] text-ink font-mono text-xs font-bold rounded-sm border border-ink/20 shadow-sm">
              <IconRelate className="w-3.5 h-3.5 text-koma-purple shrink-0" />
              <span>Relate</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] text-ink font-mono text-xs font-bold rounded-sm border border-ink/20 shadow-sm">
              <IconSenyum className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Senyum</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] text-ink font-mono text-xs font-bold rounded-sm border border-ink/20 shadow-sm">
              <IconPeluk className="w-3.5 h-3.5 text-rose-700 shrink-0" />
              <span>Peluk jauh</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
