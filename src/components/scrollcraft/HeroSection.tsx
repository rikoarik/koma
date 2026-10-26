'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowDown, Sparkles } from 'lucide-react';
import { IconCheck } from '@/components/ui/BrandIcons';

interface HeroSectionProps {
  onExploreFeed: () => void;
  onOpenComposer: () => void;
  onOpenStudio?: () => void;
}

export default function HeroSection({
  onExploreFeed,
  onOpenComposer,
  onOpenStudio,
}: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax calculations (controlled depth without motion sickness)
  const bgTranslate = Math.min(scrollY * 0.12, 100);
  const midTranslate = Math.min(scrollY * 0.28, 200);
  const midRotate = Math.min(scrollY * 0.015, 4);
  const textTranslate = Math.min(scrollY * 0.18, 140);
  const foreTranslate = Math.min(scrollY * 0.42, 280);

  return (
    <section className="relative min-h-[96vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4">
      {/* =========================================================================
          LAYER 0: BACKGROUND PAPER TEXTURE (Slow Parallax)
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform z-0"
        style={{
          transform: `translate3d(0, ${bgTranslate}px, 0)`,
        }}
      >
        <Image
          src="/assets/hero-bg.webp"
          alt="Latar Kertas Tekstur Analog"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/30 via-transparent to-paper" />
      </div>

      {/* =========================================================================
          LAYER 1: MIDGROUND FLOATING ZINE COLLAGE (Framing Flanks with Parallax)
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform z-10 flex items-center justify-center"
        style={{
          transform: `translate3d(0, ${midTranslate}px, 0) rotate(${midRotate}deg)`,
        }}
      >
        <div className="relative w-full max-w-6xl h-[600px] sm:h-[700px] opacity-75 sm:opacity-85 scale-95 sm:scale-105">
          <Image
            src="/assets/hero-midground.webp"
            alt="Kolase Kertas Mengambang Koma"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-contain"
          />
        </div>
      </div>

      {/* =========================================================================
          LAYER 2: SCATTERED STAMPS, STICKERS, AND TAPE
          ========================================================================= */}
      {/* Top Left: Vintage Koma Rubber Stamp */}
      <div
        className="absolute top-24 left-4 sm:left-12 sm:top-28 z-25 pointer-events-none transition-transform will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.16}px, 0) rotate(-10deg)`,
        }}
      >
        <Image
          src="/assets/stamp-koma.svg"
          alt="Cap Pos Koma"
          width={110}
          height={110}
          className="w-20 h-20 sm:w-28 sm:h-28 opacity-95 drop-shadow-sm"
        />
      </div>

      {/* Top Right: Zine Sticker with Purple Washi Tape */}
      <div
        className="absolute top-20 right-4 sm:right-16 sm:top-24 z-25 pointer-events-none transition-transform will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.22}px, 0) rotate(7deg)`,
        }}
      >
        <div className="relative">
          <Image
            src="/assets/tape-purple.svg"
            alt="Plester Washi Ungu"
            width={110}
            height={28}
            className="absolute -top-3 left-2 z-10 opacity-90"
          />
          <Image
            src="/assets/sticker-koma-zine.svg"
            alt="Stiker Koma Zine"
            width={90}
            height={90}
            className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-md"
          />
        </div>
      </div>

      {/* Bottom Left: 100% Relate Sticker */}
      <div
        className="hidden sm:block absolute bottom-20 left-8 sm:left-20 z-25 pointer-events-none transition-transform will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.28}px, 0) rotate(-5deg)`,
        }}
      >
        <div className="relative">
          <Image
            src="/assets/tape-kraft.svg"
            alt="Lakban Kertas Kraft"
            width={120}
            height={30}
            className="absolute -top-3 -left-4 z-10 opacity-90"
          />
          <Image
            src="/assets/sticker-relate.svg"
            alt="Stiker 100% Relate"
            width={110}
            height={60}
            className="drop-shadow-sm"
          />
        </div>
      </div>

      {/* Bottom Right: Telah Didengar Stamp */}
      <div
        className="hidden md:block absolute bottom-24 right-12 sm:right-24 z-25 pointer-events-none transition-transform will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.32}px, 0) rotate(3deg)`,
        }}
      >
        <Image
          src="/assets/stamp-dengar.svg"
          alt="Cap Telah Didengar"
          width={150}
          height={50}
          className="opacity-90 drop-shadow-sm"
        />
      </div>

      {/* =========================================================================
          LAYER 3: FROSTED GLASSBLUR EDITORIAL PLACARD (Crystal Clear Legibility)
          ========================================================================= */}
      <div
        className="relative z-30 max-w-2xl mx-auto will-change-transform"
        style={{
          transform: `translate3d(0, ${textTranslate}px, 0)`,
        }}
      >
        {/* Frosted Glassblur Container */}
        <div className="relative p-7 sm:p-12 bg-white/85 sm:bg-[#FAF8F5]/90 backdrop-blur-xl sm:backdrop-blur-2xl border-2 border-white/90 ring-1 ring-ink/15 shadow-[0_16px_48px_rgba(29,27,24,0.14)] rounded-sm text-center">
          {/* Top Center Washi Tape */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 w-36 pointer-events-none">
            <Image
              src="/assets/tape-kraft.svg"
              alt="Tape"
              width={140}
              height={32}
              className="opacity-95"
            />
          </div>

          {/* Editorial Tag */}
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-paper border border-ink/20 shadow-paper-sm mb-5 rotate-[-0.5deg]">
            <span className="font-mono text-xs uppercase tracking-widest text-ink font-bold">
              Sudut Singgah Suara Tanpa Nama
            </span>
          </div>

          {/* Grand Headline with crisp ink contrast */}
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-ink tracking-tight leading-[1.12] mb-5">
            Bagi yang riuh di kepala,{' '}
            <span className="relative inline-block text-koma-purpleDark italic">
              tapi sunyi
              <Image
                src="/assets/doodle-star.svg"
                alt="Star doodle"
                width={30}
                height={30}
                className="absolute -top-5 -right-5 w-6 h-6 sm:w-8 sm:h-8"
              />
            </span>{' '}
            di kata-kata.
          </h1>

          {/* Narrative Deck - Deep crisp text */}
          <p className="font-sans text-sm sm:text-base text-ink font-medium max-w-lg mx-auto leading-relaxed mb-7">
            Koma adalah zine digital tempat kamu menuangkan rasa sepi, kelakar konyol, atau
            pikiran larut malam. Tanpa profil, tanpa penghakiman angka suka, hanya catatan
            jujur sesama manusia.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={onOpenComposer}
              className="flex items-center gap-2 px-6 py-3 rounded-sm bg-ink text-paper font-sans font-bold text-sm sm:text-base hover:bg-koma-purple transition-all shadow-paper-lift hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Tulis Coretan Pertama</span>
              <span className="font-mono text-xs opacity-80">↵</span>
            </button>

            <button
              onClick={onExploreFeed}
              className="flex items-center gap-2 px-5 py-3 rounded-sm bg-paper border-2 border-ink/20 text-ink font-sans font-bold text-sm sm:text-base hover:border-koma-purple hover:text-koma-purple transition-all shadow-paper-sm"
            >
              <span>Menyelami Coretan</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-bar with deep, crisp high contrast */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-[11px] text-ink font-bold border-t border-ink/15 pt-4">
            <span className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-koma-purpleDark shrink-0 stroke-[2.5]" />
              <span>Bebas Profil Publik</span>
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-koma-purpleDark shrink-0 stroke-[2.5]" />
              <span>Tanpa Angka Suka Vanity</span>
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-koma-purpleDark shrink-0 stroke-[2.5]" />
              <span>100% Tulisan Manusia Asli</span>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LAYER 4: FOREGROUND TORN PAPER EDGES
          ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform z-35"
        style={{
          transform: `translate3d(0, ${foreTranslate}px, 0)`,
        }}
      >
        <div className="relative w-full h-full opacity-50 sm:opacity-70">
          <Image
            src="/assets/hero-foreground.webp"
            alt="Sobekan Kertas Depan"
            fill
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-ink font-mono text-[10px] uppercase tracking-widest font-bold pointer-events-none animate-pulse">
        <span>Gulir ke Bawah</span>
        <ArrowDown className="w-3.5 h-3.5 text-koma-purpleDark" />
      </div>
    </section>
  );
}
