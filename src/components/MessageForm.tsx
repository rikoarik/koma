'use client';

import { useState, type FormEvent } from 'react';

export default function MessageForm() {
  const [category, setCategory] = useState('masukan');
  const [content, setContent] = useState('');
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setStatus('idle');
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pesan belum terkirim. Coba lagi.');
      setContent('');
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pesan belum terkirim. Coba lagi.');
      setStatus('error');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="message-category" className="block font-mono text-xs font-bold uppercase tracking-wide mb-2">Tentang apa?</label>
        <select id="message-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full border border-ink/40 bg-paper px-3 py-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koma-purpleDark">
          <option value="masukan">Masukan</option>
          <option value="kendala">Kendala memakai koma</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>
      <div>
        <label htmlFor="message-content" className="block font-mono text-xs font-bold uppercase tracking-wide mb-2">Pesanmu</label>
        <textarea id="message-content" value={content} onChange={(event) => setContent(event.target.value)} minLength={10} maxLength={2000} required rows={8} placeholder="Ceritakan apa yang ingin kamu sampaikan..." className="w-full resize-y border border-ink/40 bg-paper p-3 text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-koma-purpleDark" />
        <p className="mt-1 text-xs text-ink-muted">10–2000 karakter · {content.length}/2000</p>
      </div>
      <div aria-live="polite" role="status" className="text-sm">
        {status === 'sent' && <p className="font-semibold text-ink">Pesan terkirim. Terima kasih sudah menghubungi pengelola.</p>}
        {status === 'error' && <p className="font-semibold text-red-800">{error}</p>}
      </div>
      <button type="submit" disabled={pending} className="w-full sm:w-auto bg-ink px-7 py-3 font-semibold text-paper hover:bg-koma-purpleDark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-koma-purpleDark">
        {pending ? 'Mengirim pesan...' : 'Kirim pesan'}
      </button>
    </form>
  );
}
