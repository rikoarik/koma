'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shuffle, Pin, ArrowRight } from 'lucide-react';

interface StickyItem {
  id?: string;
  quote: string;
  from: string;
  authorAlias: string;
  topic?: string;
  bg: string;
  rot: string;
}

const DEFAULT_STICKY_THOUGHTS: StickyItem[] = [
  {
    quote: 'Hal paling berani yang bisa kamu lakukan hari ini adalah mengakui kalau kamu lagi ga baik-baik aja.',
    from: 'Coretan Harian',
    authorAlias: 'Tanpa Nama',
    bg: 'bg-[#FFFDF7]',
    rot: '-rotate-2',
  },
  {
    quote: 'Ternyata dewasa itu bukan tahu segalanya, tapi bisa tidur nyenyak meski besok masih banyak tanda tanya.',
    from: 'Coretan Harian',
    authorAlias: 'Penjaga Lentera',
    bg: 'bg-[#F5EFE6]',
    rot: 'rotate-1',
  },
  {
    quote: 'Jangan lupa minum air putih dan terima kasih ke diri sendiri yang udah bertahan sampai jam segini.',
    from: 'Coretan Harian',
    authorAlias: 'Kucing Hujan',
    bg: 'bg-[#F0EBFF]',
    rot: '-rotate-1',
  },
  {
    quote: 'Kadang kita ga butuh jalan keluar, cuma butuh teman duduk yang ga banyak tanya.',
    from: 'Coretan Harian',
    authorAlias: 'Pejalan Kaki Larut',
    bg: 'bg-[#FAF5EB]',
    rot: 'rotate-2',
  },
];

const BG_COLORS = ['bg-[#FFFDF7]', 'bg-[#F5EFE6]', 'bg-[#F0EBFF]', 'bg-[#FAF5EB]'];
const ROTATIONS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

export default function CollageInteractive() {
  const [notes, setNotes] = useState<StickyItem[]>(DEFAULT_STICKY_THOUGHTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // Fetch live top resonant posts from the last 24h
  useEffect(() => {
    let isMounted = true;
    async function fetchTopPosts() {
      try {
        const res = await fetch('/api/posts?filter=populer');
        const data = await res.json();
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          const liveItems: StickyItem[] = data.posts.slice(0, 8).map((p: any, idx: number) => ({
            id: p.id,
            quote: p.content.length > 140 ? `${p.content.substring(0, 137)}...` : p.content,
            from: `#${p.topic || 'isi-kepala'}`,
            authorAlias: p.authorAlias || 'Tanpa Nama',
            bg: BG_COLORS[idx % BG_COLORS.length],
            rot: ROTATIONS[idx % ROTATIONS.length],
          }));

          if (isMounted && liveItems.length > 0) {
            setNotes(liveItems);
          }
        }
      } catch (err) {
        console.warn('Could not load live sticky notes, using curated defaults:', err);
      }
    }

    fetchTopPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextThought = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notes.length);
      setIsRotating(false);
    }, 150);
  };

  const current = notes[currentIndex] || DEFAULT_STICKY_THOUGHTS[0];

  return (
    <div className="my-16 max-w-4xl mx-auto px-4">
      <div className="relative p-6 sm:p-10 bg-paper-card border border-ink/15 shadow-paper-lift rounded-sm">
        {/* Kraft tape top */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 w-36 pointer-events-none">
          <Image
            src="/assets/tape-kraft.svg"
            alt="Plester Kraft"
            width={140}
            height={32}
            className="opacity-90"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Interactive Sticky Note */}
          <div className="w-full sm:w-2/3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pin className="w-3.5 h-3.5 text-koma-purple rotate-45" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                  Pojok Catatan Tempel Harian &bull; Otomatis 24 Jam
                </span>
              </div>
              <span className="font-mono text-[10px] text-ink-muted font-bold">
                {currentIndex + 1} / {notes.length}
              </span>
            </div>

            <div
              className={`p-5 rounded-sm border border-ink/10 shadow-paper transition-all duration-300 ${
                current.bg
              } ${current.rot} ${isRotating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
            >
              <p className="font-serif italic text-base sm:text-lg text-ink leading-relaxed mb-3">
                "{current.quote}"
              </p>
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-t border-ink/10 pt-2.5">
                <span className="font-bold text-koma-purpleDark">{current.from}</span>
                <div className="flex items-center gap-2">
                  <span className="text-ink font-medium">{current.authorAlias}</span>
                  {current.id && (
                    <Link
                      href={`/coretan/${current.id}`}
                      className="inline-flex items-center gap-0.5 text-[11px] text-koma-purple hover:underline font-bold"
                    >
                      Buka <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive CTA */}
          <div className="w-full sm:w-1/3 flex flex-col items-center sm:items-start gap-3">
            <p className="font-sans text-xs text-ink-muted text-center sm:text-left leading-normal">
              Setiap catatan di Koma ditulis oleh orang sungguhan tanpa topeng nama. Terkurasi otomatis dari coretan paling beresonansi hari ini.
            </p>
            <button
              onClick={nextThought}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-paper border border-ink/20 hover:border-koma-purple text-ink hover:text-koma-purple font-mono text-xs font-semibold rounded-sm shadow-sm transition-all active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Ganti Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
