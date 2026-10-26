import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koma — Ruang Jeda & Spontan',
    short_name: 'Koma',
    description: 'Tempat buat bilang hal-hal yang selama ini cuma ada di kepala.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F4EE',
    theme_color: '#F7F4EE',
    lang: 'id',
    icons: [
      {
        src: '/brand/png/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/png/koma-app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
