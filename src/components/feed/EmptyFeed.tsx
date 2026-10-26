'use client';

import React from 'react';
import Image from 'next/image';
import { PenTool } from 'lucide-react';

interface EmptyFeedProps {
  onOpenComposer: () => void;
}

export default function EmptyFeed({ onOpenComposer }: EmptyFeedProps) {
  return (
    <div className="relative p-8 sm:p-12 text-center max-w-lg mx-auto bg-paper-card border border-ink/15 shadow-paper rounded-sm">
      {/* Tape decor */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 w-32">
        <Image
          src="/assets/tape-kraft.svg"
          alt="Tape"
          width={120}
          height={30}
          className="opacity-90"
        />
      </div>

      {/* Generated Artwork */}
      <div className="relative w-48 h-36 mx-auto mb-6 overflow-hidden rounded-[2px] border border-ink/10 shadow-inner">
        <Image
          src="/assets/feed-empty-state.webp"
          alt="Sudut Kosong Tenang"
          fill
          sizes="200px"
          className="object-cover"
        />
      </div>

      <h3 className="font-serif font-black text-2xl text-ink mb-2">
        Sudut ini sedang tenang.
      </h3>

      <p className="font-sans text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
        Belum ada coretan yang tersangkut di sini. Lembaran kertas masih bersih, menunggu
        suara atau keluh kesahmu yang pertama.
      </p>

      <button
        onClick={onOpenComposer}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-ink text-paper font-sans text-xs sm:text-sm font-bold hover:bg-koma-purple transition-all shadow-paper hover:-translate-y-0.5 active:translate-y-0"
      >
        <PenTool className="w-3.5 h-3.5" />
        <span>Tulis Coretan Sekarang</span>
      </button>
    </div>
  );
}
