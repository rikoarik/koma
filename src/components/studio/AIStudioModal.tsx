'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, RefreshCw, PenLine, Check, Eye, Wand2 } from 'lucide-react';
import type { StudioCategory } from '@/lib/ai-provider';

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToComposer: (text: string, prompt: string, imageUrl?: string) => void;
  initialDraft?: string;
}

const CATEGORIES: { id: StudioCategory; label: string; desc: string }[] = [
  { id: 'random_thoughts', label: 'Pikiran Acak', desc: 'Uneg-uneg & renungan larut malam' },
  { id: 'humor_receh', label: 'Humor Receh', desc: 'Kelakar getir & komedi relate' },
  { id: 'questions', label: 'Pertanyaan', desc: 'Pemantik tanya tanpa nama' },
  { id: 'discussion_topics', label: 'Topik Obrolan', desc: 'Bahan cerita & diskusi hangat' },
  { id: 'rewrite_shorten', label: 'Tulis Ulang', desc: 'Persingkat & poles tulisanmu' },
];

const STUDIO_VISUALS = [
  { id: 'none', label: 'Tanpa Visual', url: '' },
  { id: 'writing', label: 'Zine Menulis', url: '/assets/section-writing.webp' },
  { id: 'discovering', label: 'Zine Menyelami', url: '/assets/section-discovering.webp' },
  { id: 'connecting', label: 'Zine Terhubung', url: '/assets/section-connecting.webp' },
  { id: 'hero', label: 'Kolase Surealis', url: '/assets/hero-main.webp' },
];

export default function AIStudioModal({
  isOpen,
  onClose,
  onApplyToComposer,
  initialDraft = '',
}: AIStudioModalProps) {
  const [category, setCategory] = useState<StudioCategory>('random_thoughts');
  const [promptInput, setPromptInput] = useState('');
  const [draftToRewrite, setDraftToRewrite] = useState('');
  const [selectedVisual, setSelectedVisual] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [suggestions, setSuggestions] = useState<[string, string, string] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [editedDraft, setEditedDraft] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const requestVersion = React.useRef(0);

  useEffect(() => {
    if (isOpen) {
      setDraftToRewrite(initialDraft.slice(0, 1000));
      setPromptInput('');
      setCategory('random_thoughts');
      setSelectedVisual('');
      setShowPreview(false);
      setErrorMsg('');
    } else {
      requestVersion.current += 1;
      setIsGenerating(false);
      setSuggestions(null);
      setEditedDraft('');
    }
  }, [isOpen, initialDraft]);

  // Sync edited draft when selected index or suggestions change
  useEffect(() => {
    if (suggestions?.[selectedIndex]) {
      setEditedDraft(suggestions[selectedIndex]);
    }
  }, [selectedIndex, suggestions]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const invalidateSuggestions = () => {
    requestVersion.current += 1;
    setIsGenerating(false);
    setSuggestions(null);
    setEditedDraft('');
    setErrorMsg('');
  };

  const handleGenerate = async () => {
    const version = ++requestVersion.current;
    setIsGenerating(true);
    setSuggestions(null);
    setEditedDraft('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          inputPrompt: promptInput,
          draftContent: category === 'rewrite_shorten' ? draftToRewrite : undefined,
        }),
      });

      const json = await res.json();
      if (version !== requestVersion.current) return;
      if (res.ok && json.success && Array.isArray(json.data?.suggestions) && json.data.suggestions.length === 3) {
        setSuggestions(json.data.suggestions);
        setSelectedIndex(0);
        setEditedDraft(json.data.suggestions[0]);
      } else {
        setErrorMsg(json.error || 'Gagal meramu saran studio AI');
      }
    } catch {
      if (version !== requestVersion.current) return;
      setErrorMsg('Koneksi terputus saat meramu inspirasi');
    } finally {
      if (version === requestVersion.current) setIsGenerating(false);
    }
  };

  const handleUseDraft = () => {
    if (!suggestions || editedDraft.trim().length < 3 || editedDraft.length > 2000) return;
    const promptLabel = category === 'rewrite_shorten'
      ? 'Tulis Ulang'
      : promptInput.trim() || CATEGORIES.find((c) => c.id === category)?.label || 'Inspirasi Studio Koma';
    onApplyToComposer(editedDraft, promptLabel, selectedVisual || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="studio-title" className="relative w-full max-w-2xl my-8 p-6 sm:p-8 bg-[#FAF8F5] border-2 border-ink/20 shadow-paper-float rounded-sm text-ink animate-in fade-in zoom-in-95 duration-200">
        {/* Top Washi Tape */}
        <div className="absolute -top-3 left-14 z-10 w-32 pointer-events-none">
          <Image
            src="/assets/tape-purple.svg"
            alt="Tape"
            width={120}
            height={28}
            className="opacity-95"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-black/10 text-ink hover:text-black transition-colors"
          aria-label="Tutup Studio AI"
          title="Tutup (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black text-koma-purpleDark uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-koma-purple" />
              Koma • Studio Konten AI
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-black/5 text-ink font-mono text-[10px] font-bold">
              3 Saran Bahasa Alami
            </span>
          </div>
          <h2 id="studio-title" className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-ink">
            Ramu gagasan, poles dengan sentuhanmu.
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            Studio meramu 3 variasi tulisan dalam bahasa Indonesia santai.
            Pilih variasi terbaik, sunting sesuai kejujuran hatimu, dan tinjau sebelum menerbitkan.
            Topik atau draf yang kamu kirim diproses penyedia AI; jangan masukkan data pribadi.
          </p>
        </div>

        {/* Strict Anti-Autopublish Guarantee Alert */}
        <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-sm text-xs font-mono font-medium flex items-start gap-2.5">
          <span className="text-base mt-0.5">🛡️</span>
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-950">Prinsip Etika AI Koma:</strong> AI tidak pernah menerbitkan
            tulisan secara otomatis. Kunci sepenuhnya di tanganmu: baca, sunting, dan setujui manual.
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 text-xs font-mono font-bold rounded-sm">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-ink mb-1.5 uppercase tracking-wider">
              1. Pilih Kategori Inspirasi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategory(cat.id); invalidateSuggestions(); }}
                  className={`p-2 text-left rounded-sm border-2 transition-all ${
                    category === cat.id
                      ? 'bg-koma-purple text-white border-koma-purple shadow-paper-sm'
                      : 'bg-white border-ink/20 hover:border-ink/40 text-ink'
                  }`}
                >
                  <span className="block font-sans font-bold text-xs">{cat.label}</span>
                  <span
                    className={`block text-[9px] font-mono mt-0.5 font-medium line-clamp-1 ${
                      category === cat.id ? 'text-white/90' : 'text-ink-muted'
                    }`}
                  >
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Input: If 'rewrite_shorten', show Draft Textarea */}
          {category === 'rewrite_shorten' ? (
            <div>
              <label className="block font-mono text-[11px] font-bold text-ink mb-1 uppercase tracking-wider">
                Tempel atau Tulis Draft yang Ingin Dipersingkat
              </label>
              <textarea
                aria-label="Draf untuk ditulis ulang"
                value={draftToRewrite}
                onChange={(e) => { setDraftToRewrite(e.target.value); invalidateSuggestions(); }}
                maxLength={1000}
                placeholder="Tuliskan draf kasarmu di sini untuk dipersingkat dan dipoles menjadi lebih mengena..."
                rows={3}
                className="w-full p-2.5 text-xs font-mono text-ink bg-white border-2 border-ink/20 rounded-sm focus:outline-none focus:border-koma-purple"
              />
            </div>
          ) : (
            <div>
              <label className="block font-mono text-[11px] font-bold text-ink mb-1 uppercase tracking-wider">
                Topik atau Kata Kunci (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Topik atau kata kunci"
                  value={promptInput}
                  onChange={(e) => { setPromptInput(e.target.value); invalidateSuggestions(); }}
                  maxLength={300}
                  placeholder="Contoh: kopi dingin di halte, rindu rumah, overthinking masa depan..."
                  className="flex-1 px-3 py-2 text-xs font-mono font-medium text-ink placeholder:text-ink-muted bg-white border-2 border-ink/20 rounded-sm focus:outline-none focus:border-koma-purple"
                />
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 bg-koma-purple text-white text-xs font-mono font-bold rounded-sm hover:bg-koma-purpleHover disabled:opacity-50 transition-all shadow-paper-sm active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Meramu...' : 'Ramu 3 Saran'}</span>
                </button>
              </div>
            </div>
          )}

          {category === 'rewrite_shorten' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !draftToRewrite.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-koma-purple text-white text-xs font-mono font-bold rounded-sm hover:bg-koma-purpleHover disabled:opacity-50 transition-all shadow-paper-sm active:scale-95"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Mempersingkat...' : 'Persingkat & Tulis Ulang'}</span>
              </button>
            </div>
          )}

          {/* 3 Generated Options Selection */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-ink mb-1.5 uppercase tracking-wider">
              2. Tiga Saran AI yang Dihasilkan (Klik Salah Satu untuk Dipilih)
            </label>
            {!suggestions && <p className="font-sans text-sm text-ink-muted">Pilih kategori lalu ramu saran untuk memulai.</p>}
            <div className="space-y-2">
              {suggestions?.map((sug, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedIndex === idx}
                  onClick={() => {
                    setSelectedIndex(idx);
                    setEditedDraft(sug);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedIndex(idx);
                      setEditedDraft(sug);
                    }
                  }}
                  className={`p-3 rounded-sm border-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-koma-purple transition-colors ${
                    selectedIndex === idx
                      ? 'border-koma-purple bg-white shadow-paper-sm ring-1 ring-koma-purple/30'
                      : 'border-ink/15 bg-white/70 hover:border-ink/35 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-black/5 text-ink-muted">
                      Opsi {idx + 1}
                    </span>
                    {selectedIndex === idx && (
                      <span className="font-mono text-[10px] text-koma-purpleDark font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-koma-purple" />
                        Terpilih untuk disunting
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-sm text-ink mt-1.5 leading-relaxed">
                    "{sug}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Editing Field for the Selected Option */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-koma-purple" />
                <span>3. Sunting Langsung Tulisan Terpilih</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-mono font-bold text-koma-purpleDark hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>{showPreview ? 'Kembali Menyunting' : 'Pratinjau Kertas'}</span>
              </button>
            </div>

            {showPreview ? (
              <div className="p-4 bg-white border-2 border-dashed border-koma-purple rounded-sm shadow-inner space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-koma-purpleLight text-koma-purpleDark font-black border border-koma-purple/30">
                    ✨ Dibantu AI (Studio Koma)
                  </span>
                  <span className="font-mono text-xs text-ink-muted font-medium">
                    Kategori: {CATEGORIES.find((c) => c.id === category)?.label}
                  </span>
                </div>
                <p className="font-serif text-base leading-relaxed italic text-ink font-medium">
                  "{editedDraft}"
                </p>
              </div>
            ) : (
              <textarea
                aria-label="Sunting saran AI terpilih"
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                disabled={!suggestions}
                maxLength={2000}
                rows={3}
                className="w-full p-3 font-serif text-sm text-ink bg-white border-2 border-ink/20 rounded-sm focus:outline-none focus:border-koma-purple shadow-inner leading-relaxed resize-none"
              />
            )}
          </div>

          {/* Optional Visual Attachment from curated zine library */}
          <div>
            <label className="block font-mono text-[11px] font-bold text-ink mb-1 uppercase tracking-wider">
              Padukan dengan Visual Zine (Opsional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {STUDIO_VISUALS.map((vis) => (
                <button
                  key={vis.id}
                  type="button"
                  onClick={() => setSelectedVisual(vis.url)}
                  className={`p-1.5 rounded-sm border-2 text-left font-mono text-[10px] transition-all flex flex-col items-center gap-1 ${
                    selectedVisual === vis.url
                      ? 'border-koma-purple bg-koma-purpleLight text-koma-purpleDark font-bold'
                      : 'border-ink/20 bg-white hover:border-ink/40 text-ink'
                  }`}
                >
                  <span className="text-[10px] text-center font-bold">{vis.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-ink/15 flex items-center justify-between">
            <span className="font-mono text-xs font-medium text-ink-muted">
              ★ Disematkan lencana "✨ Dibantu AI"
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono font-bold text-ink hover:text-black border border-ink/30 rounded-sm hover:bg-black/5"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUseDraft}
                disabled={!suggestions || editedDraft.trim().length < 3 || editedDraft.length > 2000}
                className="flex items-center gap-2 px-5 py-2 bg-koma-purple text-white text-xs sm:text-sm font-sans font-black rounded-sm hover:bg-koma-purpleHover disabled:opacity-50 transition-all shadow-paper-lift active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Gunakan Tulisan Ini</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
