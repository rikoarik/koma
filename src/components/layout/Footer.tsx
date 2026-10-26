'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { href: '/tentang', label: 'Tentang Koma' },
  { href: '/aturan', label: 'Aturan ruang' },
  { href: '/privasi', label: 'Privasi' },
  { href: '/pesan', label: 'Pesan untuk pengelola' },
  { href: '/dukung', label: 'Dukung Koma' },
];

export default function Footer() {
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

  return (
    <footer className="mt-24 border-t-2 border-ink bg-paper-warm px-5 pt-12 pb-7 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 border-b border-ink/20 pb-12 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] sm:gap-16 sm:pb-16">
          <div className="max-w-xl">
            <Link href="/" aria-label="Koma, kembali ke beranda" className="inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purpleDark">
              <Image
                src="/brand/svg/koma-logo-horizontal-color.svg"
                alt="koma,"
                width={118}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-7 max-w-[24ch] font-sans text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-[1.2] tracking-tight text-ink">
              Internet masih bisa terasa dekat.
            </p>
            <p className="mt-5 max-w-sm font-sans text-sm leading-relaxed text-ink-muted">
              Tempat untuk menulis apa yang ada di kepala, lalu mendengar cerita orang lain. Tanpa harus jadi siapa-siapa.
            </p>
          </div>

          <nav aria-label="Tautan footer" className="sm:justify-self-end sm:min-w-44">
            <p className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-ink-faint">Baca lebih lanjut</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-1 sm:gap-y-3">
              {footerLinks.filter(({ href }) => donationEnabled || href !== '/dukung').map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="inline-block rounded-sm font-sans text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-koma-purpleDark hover:decoration-koma-purpleDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purpleDark">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-5 pt-6">
          <div className="flex items-center gap-4">
            <Image src="/assets/stamp-koma.svg" alt="" width={60} height={60} className="h-14 w-14 -rotate-6 opacity-85" />
            <p className="max-w-[24ch] font-sans text-xs leading-relaxed text-ink-muted">
              Anonim di depan orang lain. Tetap saling jaga di sini.
            </p>
          </div>
          <p className="font-sans text-xs leading-relaxed text-ink-faint">
            © 2026 Koma. All rights reserved. -{' '}
            <a
              href="https://dexotic.digital/en"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:text-koma-purpleDark hover:decoration-koma-purpleDark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koma-purpleDark"
            >
              Dexotic Factory
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
