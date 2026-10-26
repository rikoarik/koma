'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PenTool, Compass, Menu, X, Shield, Info, Coffee } from 'lucide-react';

interface NavbarProps {
  onOpenComposer: () => void;
  onOpenStudio?: () => void;
  onOpenDonation?: () => void;
}

export default function Navbar({ onOpenComposer, onOpenDonation }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationEnabled, setDonationEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/donations')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) setDonationEnabled(data.config?.enabled !== false);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 bg-paper/95 backdrop-blur-md border-b border-ink/10 shadow-paper-xs ${
          scrolled ? 'py-2.5 shadow-paper-sm' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo - KOMA */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/brand/svg/koma-logo-horizontal-color.svg"
              alt="koma,"
              width={95}
              height={36}
              className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:-translate-y-0.5"
              priority
            />
            <span className="hidden sm:inline-block border-l border-ink/15 pl-2.5 font-mono text-[9px] uppercase tracking-wider text-ink-muted leading-tight">
              Ruang Jeda<br />& Spontan
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-bold text-ink-muted">
            <Link
              href="/jelajah"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm hover:text-koma-purple hover:bg-black/5 transition-all text-ink font-extrabold"
            >
              <Compass className="w-3.5 h-3.5 text-koma-purple" />
              <span>Jelajah</span>
            </Link>
            <Link
              href="/tentang"
              className="px-3 py-1.5 rounded-sm hover:text-ink hover:bg-black/5 transition-all"
            >
              Tentang
            </Link>
            <Link
              href="/aturan"
              className="px-3 py-1.5 rounded-sm hover:text-ink hover:bg-black/5 transition-all"
            >
              Aturan
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* New Post Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenComposer();
              }}
              className="whitespace-nowrap flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-sm bg-ink text-paper hover:bg-koma-purple transition-all shadow-paper hover:shadow-paper-lift hover:-translate-y-0.5 active:translate-y-0"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Tulis Coretan</span>
            </button>

            {donationEnabled && onOpenDonation && (
              <button
                type="button"
                onClick={onOpenDonation}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border border-ink/20 font-mono text-xs font-bold text-ink hover:border-koma-purple hover:text-koma-purple transition-colors"
              >
                <Coffee className="w-3.5 h-3.5" />
                Traktir Kopi
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-sm border border-ink/20 bg-paper text-ink hover:bg-black/5 active:scale-95 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown Card */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-ink/15 bg-[#FBF9F5] px-4 py-4 space-y-2 shadow-2xl animate-fadeIn mt-2">
            <div className="pb-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted font-bold">
              Menu Navigasi
            </div>

            <Link
              href="/jelajah"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-sm bg-paper border border-ink/15 hover:border-koma-purple text-ink hover:text-koma-purple transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-sm bg-koma-purple/10 flex items-center justify-center text-koma-purple shrink-0">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold">Jelajah Coretan</span>
                <span className="text-[10px] text-ink-muted font-sans">Pencarian & filter topik</span>
              </div>
            </Link>

            <Link
              href="/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-sm bg-paper border border-ink/15 hover:border-ink text-ink transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-sm bg-black/5 flex items-center justify-center text-ink shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold">Tentang Koma</span>
                <span className="text-[10px] text-ink-muted font-sans">Manifesto zine analog</span>
              </div>
            </Link>

            <Link
              href="/aturan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-sm bg-paper border border-ink/15 hover:border-ink text-ink transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-sm bg-black/5 flex items-center justify-center text-ink shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold">Aturan Ruang</span>
                <span className="text-[10px] text-ink-muted font-sans">Etika & anti-doxxing</span>
              </div>
            </Link>

            {donationEnabled && onOpenDonation && <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onOpenDonation(); }}
              className="w-full flex items-center gap-3 p-2.5 rounded-sm bg-paper border border-ink/15 hover:border-amber-600 text-ink text-left transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-sm bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <Coffee className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold">Traktir Kopi</span>
                <span className="text-[10px] text-ink-muted font-sans">Dukung operasional server</span>
              </div>
            </button>}
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
