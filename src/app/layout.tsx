import type { Metadata, Viewport } from 'next';
import PWARegistration from '@/components/PWARegistration';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ruangkoma.web.id'),
  title: 'Koma — Sudut Singgah Anonim & Zine Digital',
  alternates: { canonical: '/' },
  openGraph: { title: 'Koma — Sudut Singgah Anonim & Zine Digital', description: 'Tempat buat bilang hal-hal yang selama ini cuma ada di kepala.', url: '/', siteName: 'Koma', locale: 'id_ID', type: 'website', images: ['/brand/png/koma-app-icon-512.png'] },
  twitter: { card: 'summary', title: 'Koma — Sudut Singgah Anonim & Zine Digital', description: 'Tempat buat bilang hal-hal yang selama ini cuma ada di kepala.', images: ['/brand/png/koma-app-icon-512.png'] },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined, other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : {} },
  description: 'Tempat buat bilang hal-hal yang selama ini cuma ada di kepala. Tanpa nama, tanpa algoritma penghakiman.',
  applicationName: 'Koma',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Koma',
    statusBarStyle: 'default',
  },
  icons: {
    apple: [{ url: '/brand/png/koma-app-icon-512.png', sizes: '512x512', type: 'image/png' }],
    icon: [
      { url: '/brand/svg/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/png/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#F7F4EE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="ard" href="/.well-known/ard.json" type="application/json" />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased selection:bg-koma-purple selection:text-paper">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [
          { '@type': 'WebSite', '@id': 'https://ruangkoma.web.id/#website', name: 'Koma', url: 'https://ruangkoma.web.id', inLanguage: 'id-ID', description: 'Ruang ekspresi anonim dan percakapan teks dalam bahasa Indonesia.' },
          { '@type': 'Organization', '@id': 'https://ruangkoma.web.id/#organization', name: 'Koma', url: 'https://ruangkoma.web.id', logo: 'https://ruangkoma.web.id/brand/png/koma-app-icon-512.png' },
        ] }).replace(/</g, '\\u003c') }} />
        <PWARegistration />
        {/* Grain overlay across the app */}
        <div className="paper-grain fixed inset-0 z-50 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
