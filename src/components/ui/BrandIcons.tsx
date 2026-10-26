import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Bespoke Vector Icon System for Koma
 * Replaces unicode emojis with scalable, editorial-grade SVGs.
 */

// 1. Aku Dengerin (Hot Beverage / Steam Mug) — Replaces ☕
export function IconDengerin({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M17 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M4 8h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
      <path d="M7 2c0 1.5 1 2 1 3" />
      <path d="M11 1c0 2 1.5 2.5 1.5 4" />
    </svg>
  );
}

// 2. Relate (Sculpted Resonant Heart) — Replaces 🖤
export function IconRelate({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// 3. Senyum (Fresh Botanical Sprout) — Replaces 🌿
export function IconSenyum({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21v-9" />
      <path
        d="M12 12C8.5 12 5 9.5 5 5c4.5 0 7 2.5 7 7z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path
        d="M12 15c3.5 0 6-2 6-6-4 0-6 2.5-6 6z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path d="M8 21h8" />
    </svg>
  );
}

// 4. Peluk Jauh (Gentle Warm Embrace) — Replaces 🫂
export function IconPeluk({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx={12} cy={7} r={3} />
      <path d="M5 16c2-3 4-4 7-4s5 1 7 4" />
      <path d="M3 13c1.5 3 4 7 9 7s7.5-4 9-7" />
    </svg>
  );
}

// 5. Dibantu AI (Editorial Sparkle Star) — Replaces ✨
export function IconSparkle({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
      <path d="M19 2.5L19.7 4.3L21.5 5L19.7 5.7L19 7.5L18.3 5.7L16.5 5L18.3 4.3L19 2.5Z" />
      <path d="M5 16.5L5.6 17.9L7 18.5L5.6 19.1L5 20.5L4.4 19.1L3 18.5L4.4 17.9L5 16.5Z" />
    </svg>
  );
}

// 6. Prinsip Etika & Privasi (Editorial Shield Guard) — Replaces 🛡️
export function IconShield({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill="currentColor"
        fillOpacity={0.18}
      />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// 7. Terbit Anonim Seketika (Instant Star) — Replaces ★
export function IconStar({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2L14.3 9.7L22 12L14.3 14.3L12 22L9.7 14.3L2 12L9.7 9.7L12 2Z" />
    </svg>
  );
}

// 8. Verifikasi Editorial (Crisp Checkmark) — Replaces ✓
export function IconCheck({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
