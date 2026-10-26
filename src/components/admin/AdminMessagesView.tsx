'use client';

import type { AdminMessage } from '@/lib/storage';

const labels: Record<string, string> = { masukan: 'Masukan', kendala: 'Kendala', lainnya: 'Lainnya' };

interface Props {
  messages: AdminMessage[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onRead: (id: string) => Promise<void>;
}

export default function AdminMessagesView({ messages, loading, error, onRefresh, onRead }: Props) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pesan pengunjung</h2>
          <p className="text-sm text-slate-600">100 pesan terbaru · {messages.filter((m) => !m.readAt).length} belum dibaca</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50 rounded-md">Muat ulang</button>
      </div>
      {error && <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {loading && <p role="status" className="text-sm text-slate-600">Memuat pesan...</p>}
      {!loading && !error && messages.length === 0 && <p className="border border-slate-200 bg-white p-8 text-sm text-slate-600">Belum ada pesan dari pengunjung.</p>}
      <div className="space-y-3">
        {messages.map((message) => (
          <article key={message.id} className={`border bg-white p-5 sm:p-6 ${message.readAt ? 'border-slate-200' : 'border-indigo-400'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span className="font-semibold uppercase tracking-wide">{labels[message.category] || 'Lainnya'} · {message.readAt ? 'Sudah dibaca' : 'Belum dibaca'}</span>
              <time dateTime={new Date(message.createdAt).toISOString()}>{new Date(message.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</time>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-900">{message.content}</p>
            {!message.readAt && <button type="button" onClick={() => onRead(message.id)} className="mt-5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Tandai sudah dibaca</button>}
          </article>
        ))}
      </div>
    </section>
  );
}
