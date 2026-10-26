import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Dukung Koma', description: 'Dukung ruang ekspresi anonim Koma agar tetap mandiri.', alternates: { canonical: '/dukung' }, openGraph: { url: '/dukung', title: 'Dukung Koma' } };
export default function DukungLayout({ children }: { children: React.ReactNode }) { return children; }
