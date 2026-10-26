import type { Metadata } from 'next';
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: '/pesan' } };
export default function PesanLayout({ children }: { children: React.ReactNode }) { return children; }
