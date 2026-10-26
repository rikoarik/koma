'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Sparkles, Shuffle, Send, AlertTriangle, Upload, Check, MessageCircle, FileText } from 'lucide-react';
import { AliasType, ResponseMode } from '@/types';
import { validatePostContent, extractTopicFromContent } from '@/lib/validation';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import { IconDengerin } from '@/components/ui/BrandIcons';

interface ComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (data: {
    content: string;
    authorAlias: string;
    authorType: AliasType;
    topic: string;
    responseMode: ResponseMode;
    imageUrl?: string;
    uploadToken?: string;
    searchConsent: boolean;
    paperColor: 'cream' | 'kraft' | 'lavender' | 'charcoal';
    isAiGenerated?: boolean;
    aiPrompt?: string;
  }) => Promise<{ success: boolean; state?: 'published' | 'held_for_review' | 'removed'; error?: string }>;
  onOpenStudio?: () => void;
  initialContent?: string;
  isAiAssisted?: boolean;
  aiPrompt?: string;
}

const PSEUDONYM_SUGGESTIONS = [
  'Kucing Hujan',
  'Penjaga Lentera',
  'Kopi Dingin Jam Tiga',
  'Pejalan Kaki Larut',
  'Burung Kertas',
  'Radio Tua',
  'Angin Jendela',
  'Pemuja Senja Palsu',
  'Penikmat Gerimis',
  'Pengamat Halte',
];

const PRESET_ARTWORKS = [
  { label: 'Tanpa Gambar', url: '' },
  { label: 'Zine Menulis', url: '/assets/section-writing.webp' },
  { label: 'Zine Menyelami', url: '/assets/section-discovering.webp' },
  { label: 'Zine Terhubung', url: '/assets/section-connecting.webp' },
  { label: 'Kolase Hero Koma', url: '/assets/hero-main.webp' },
];

const RESPONSE_MODE_OPTIONS: SelectOption[] = [
  {
    value: 'boleh_dibalas',
    label: 'Boleh Dibalas',
    sublabel: '(Terbuka)',
    badge: 'Terbuka',
    description: 'Terbuka tanggapan & obrolan sesama pembaca',
    icon: <MessageCircle className="w-3.5 h-3.5" />,
  },
  {
    value: 'cukup_didengar',
    label: 'Cukup Didengar',
    sublabel: '(Hening)',
    badge: 'Ventilasi',
    description: 'Hanya ingin didengar tanpa balasan publik',
    icon: <IconDengerin className="w-3.5 h-3.5" />,
  },
];

const VISUAL_PRESET_OPTIONS: SelectOption[] = [
  {
    value: '',
    label: 'Tanpa Visual',
    description: 'Teks zine vintage murni tanpa visual',
    icon: <FileText className="w-3.5 h-3.5 text-ink/50" />,
  },
  {
    value: '/assets/section-writing.webp',
    label: 'Zine Menulis',
    imageUrl: '/assets/section-writing.webp',
    description: 'Ilustrasi mesin tik & lembar naskah',
  },
  {
    value: '/assets/section-discovering.webp',
    label: 'Zine Menyelami',
    imageUrl: '/assets/section-discovering.webp',
    description: 'Eksplorasi arsip & pikiran manusia',
  },
  {
    value: '/assets/section-connecting.webp',
    label: 'Zine Terhubung',
    imageUrl: '/assets/section-connecting.webp',
    description: 'Koneksi hangat antar pembaca',
  },
  {
    value: '/assets/hero-main.webp',
    label: 'Kolase Hero Koma',
    imageUrl: '/assets/hero-main.webp',
    description: 'Kolase editorial zine khas Koma',
  },
];

export default function ComposerModal({
  isOpen,
  onClose,
  onSubmitPost,
  onOpenStudio,
  initialContent = '',
  isAiAssisted = false,
  aiPrompt,
}: ComposerModalProps) {
  const [content, setContent] = useState(initialContent);
  const [authorType, setAuthorType] = useState<AliasType>('tanpa_nama');
  const [pseudonym, setPseudonym] = useState('Kucing Hujan');
  const [responseMode, setResponseMode] = useState<ResponseMode>('boleh_dibalas');
  const [paperColor, setPaperColor] = useState<'cream' | 'kraft' | 'lavender' | 'charcoal'>('cream');
  const [selectedImage, setSelectedImage] = useState('');
  const [uploadToken, setUploadToken] = useState('');
  const [searchConsent, setSearchConsent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const artworkOptions: SelectOption[] = [
    ...VISUAL_PRESET_OPTIONS,
    ...(selectedImage && !VISUAL_PRESET_OPTIONS.some((a) => a.value === selectedImage)
      ? [
          {
            value: selectedImage,
            label: 'Gambar Diunggah',
            imageUrl: selectedImage,
            description: 'Berkas visual yang kamu unggah',
          },
        ]
      : []),
  ];

  // Sync initial content if provided
  React.useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Escape key support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRandomizePseudonym = () => {
    const random = PSEUDONYM_SUGGESTIONS[Math.floor(Math.random() * PSEUDONYM_SUGGESTIONS.length)];
    setPseudonym(random);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Gunakan gambar JPG, PNG, atau WebP maksimal 5 MB.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url && data.uploadToken) {
        setUploadToken(data.uploadToken);
        setSelectedImage(data.url);
      } else {
        setErrorMessage(data.error || 'Gagal mengunggah gambar.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validation = validatePostContent(content);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Konten tidak valid');
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmitPost({
      content,
      authorAlias: authorType === 'pseudonim' ? pseudonym : 'Tanpa Nama',
      authorType,
      topic: extractTopicFromContent(content, 'isi-kepala'),
      responseMode,
      imageUrl: selectedImage || undefined,
      uploadToken: uploadToken || undefined,
      searchConsent,
      paperColor,
      isAiGenerated: isAiAssisted,
      aiPrompt,
    });

    if (result.success) {
      setContent('');
      setSelectedImage('');
      setUploadToken('');
      setSearchConsent(false);
      onClose();
      if (result.state !== 'published') {
        window.alert(result.state === 'removed'
          ? 'Coretan disimpan, tetapi tidak ditampilkan karena terindikasi melanggar aturan. Pengelola dapat meninjaunya.'
          : 'Coretan disimpan dan menunggu pemeriksaan pengelola sebelum tampil di publik.');
      }
    } else setErrorMessage(result.error || 'Coretan gagal dikirim. Coba lagi.');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Modal centering wrapper */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl my-6 p-5 sm:p-8 bg-[#FAF8F5] border-2 border-ink/20 shadow-paper-float rounded-sm text-ink animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Washi Tape */}
        <div className="absolute -top-3 left-12 z-10 w-28 pointer-events-none">
          <Image
            src="/assets/tape-purple.svg"
            alt="Tape"
            width={110}
            height={26}
            className="opacity-95"
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm hover:bg-black/10 text-ink hover:text-black transition-colors"
          title="Tutup (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black text-sela-purpleDark uppercase tracking-wider">
              Koma • Lembar Baru
            </span>
            {isAiAssisted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-sela-purpleLight text-sela-purpleDark border border-sela-purple/40 font-mono text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-sela-purple" />
                <span>Dari Studio AI Koma</span>
              </span>
            )}
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-ink">
            Tumpahkan isi kepalamu.
          </h2>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 text-red-900 text-xs font-mono font-bold rounded-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Identity Selector (Tanpa Nama vs Pseudonim) */}
          <div className="p-3.5 bg-paper border border-ink/20 rounded-sm space-y-2">
            <span className="block font-mono text-[11px] font-bold text-ink uppercase tracking-wider">
              Identitas Pengirim
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-ink">
                <input
                  type="radio"
                  name="authorType"
                  value="tanpa_nama"
                  checked={authorType === 'tanpa_nama'}
                  onChange={() => setAuthorType('tanpa_nama')}
                  className="text-sela-purple focus:ring-sela-purple"
                />
                <span className="font-bold">Tanpa Nama (100% Rahasia)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-ink">
                <input
                  type="radio"
                  name="authorType"
                  value="pseudonim"
                  checked={authorType === 'pseudonim'}
                  onChange={() => setAuthorType('pseudonim')}
                  className="text-sela-purple focus:ring-sela-purple"
                />
                <span className="font-semibold">Gunakan Samaran</span>
              </label>
            </div>

            {authorType === 'pseudonim' && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="Nama samaranmu..."
                  maxLength={30}
                  className="flex-1 px-3 py-1.5 text-xs font-mono font-medium text-ink bg-white border border-ink/30 rounded-sm focus:outline-none focus:border-sela-purple"
                />
                <button
                  type="button"
                  onClick={handleRandomizePseudonym}
                  className="px-2.5 py-1.5 bg-white border border-ink/30 hover:border-sela-purple text-xs font-mono font-bold rounded-sm flex items-center gap-1 text-ink"
                  title="Acak nama samaran"
                >
                  <Shuffle className="w-3.5 h-3.5 text-sela-purple" />
                  <span className="hidden sm:inline">Acak</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Main Content Area */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs font-mono font-bold text-ink">
              <span>Coretan (Minimal 3 karakter)</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan apa pun yang lagi mengendap di pikiranmu... kejujuranmu aman di sini."
              rows={5}
              maxLength={2000}
              required
              className="w-full p-4 font-serif text-base text-ink placeholder:text-ink-muted bg-white border-2 border-ink/20 rounded-sm focus:outline-none focus:border-sela-purple shadow-inner leading-relaxed resize-none"
            />
            <div className="flex justify-between items-center text-xs font-mono font-semibold text-ink-muted mt-1">
              <span>Jangan sertakan data pribadi / kontak rahasia</span>
              <span className="text-ink">{content.length} / 2000 karakter</span>
            </div>

            {/* In-Text Quick Hashtag Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-ink/10">
              <span className="font-mono text-[10px] text-ink-muted uppercase tracking-wider font-bold">
                Tag otomatis (klik untuk sisipkan):
              </span>
              {[
                '#isi-kepala',
                '#tengah-malam',
                '#cerita-kecil',
                '#tanya-tanpa-nama',
                '#visual-zine',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setContent((prev) => {
                      const trimmed = prev.trim();
                      if (trimmed.includes(tag)) return prev;
                      return trimmed ? `${trimmed} ${tag}` : tag;
                    });
                  }}
                  className="px-2 py-0.5 rounded-sm bg-white border border-ink/20 hover:border-sela-purple text-ink hover:text-sela-purple text-[10px] font-mono font-bold transition-all shadow-xs active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Response Mode & Paper Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Response Mode */}
            <div>
              <label className="block font-mono text-[11px] font-bold text-ink mb-1 uppercase tracking-wider">
                Respon yang Diharapkan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResponseMode('boleh_dibalas')}
                  className={`p-2 sm:p-2.5 rounded-sm border-2 text-left transition-all flex flex-col justify-between ${
                    responseMode === 'boleh_dibalas'
                      ? 'border-sela-purple bg-sela-purple/10 ring-1 ring-sela-purple/40 shadow-xs'
                      : 'border-ink/20 bg-white hover:border-ink/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold text-ink">
                    <MessageCircle className="w-3.5 h-3.5 text-sela-purple shrink-0" />
                    <span>Boleh Dibalas</span>
                  </div>
                  <div className="text-[10px] text-ink-muted font-sans mt-0.5 truncate">
                    Terbuka tanggapan
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setResponseMode('cukup_didengar')}
                  className={`p-2 sm:p-2.5 rounded-sm border-2 text-left transition-all flex flex-col justify-between ${
                    responseMode === 'cukup_didengar'
                      ? 'border-sela-purple bg-sela-purple/10 ring-1 ring-sela-purple/40 shadow-xs'
                      : 'border-ink/20 bg-white hover:border-ink/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold text-ink">
                    <IconDengerin className="w-3.5 h-3.5 text-sela-purple shrink-0" />
                    <span>Cukup Didengar</span>
                  </div>
                  <div className="text-[10px] text-ink-muted font-sans mt-0.5 truncate">
                    Hanya ventilasi
                  </div>
                </button>
              </div>
            </div>

            {/* Paper Color */}
            <div>
              <label className="block font-mono text-[11px] font-bold text-ink mb-1 uppercase tracking-wider">
                Warna Kertas
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cream', bg: 'bg-[#FAF8F5]', border: 'border-ink/30', label: 'Cream', text: 'text-ink' },
                  { id: 'kraft', bg: 'bg-[#F2ECE1]', border: 'border-ink/30', label: 'Kraft', text: 'text-ink' },
                  { id: 'lavender', bg: 'bg-[#F4F1FD]', border: 'border-sela-purple/40', label: 'Ungu', text: 'text-ink' },
                  { id: 'charcoal', bg: 'bg-[#1E1C1A]', border: 'border-black', label: 'Gelap', text: 'text-white' },
                ].map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setPaperColor(col.id as any)}
                    className={`py-2 px-1 text-xs font-mono font-bold rounded-sm border ${col.border} ${col.bg} ${col.text} ${
                      paperColor === col.id ? 'ring-2 ring-sela-purple shadow-sm' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Visual Attachment Preset */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[11px] font-bold text-ink uppercase tracking-wider">
                Lampiran Visual Zine (Opsional)
              </label>
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => { setSelectedImage(''); setUploadToken(''); }}
                  className="font-mono text-[10px] font-bold text-rose-700 hover:text-rose-900 transition-colors"
                >
                  × Hapus Visual
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {/* Option 1: Tanpa Visual */}
              <button
                type="button"
                onClick={() => { setSelectedImage(''); setUploadToken(''); }}
                className={`relative p-1.5 sm:p-2 rounded-sm border-2 text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[68px] sm:min-h-[74px] ${
                  !selectedImage
                    ? 'border-sela-purple bg-sela-purple/10 ring-1 ring-sela-purple/40 shadow-xs'
                    : 'border-ink/20 bg-white hover:border-ink/40'
                }`}
              >
                <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${!selectedImage ? 'text-sela-purple' : 'text-ink/40'}`} />
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-ink leading-tight">Tanpa Visual</span>
                {!selectedImage && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sela-purple" />
                )}
              </button>

              {/* Presets 2 to 5 */}
              {VISUAL_PRESET_OPTIONS.filter((v) => v.value).map((preset) => {
                const isSelected = selectedImage === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => { setSelectedImage(preset.value); setUploadToken(''); }}
                    className={`relative p-1 sm:p-1.5 rounded-sm border-2 text-center transition-all flex flex-col items-center justify-between min-h-[68px] sm:min-h-[74px] overflow-hidden group ${
                      isSelected
                        ? 'border-sela-purple bg-sela-purple/10 ring-1 ring-sela-purple/40 shadow-xs'
                        : 'border-ink/20 bg-white hover:border-ink/40'
                    }`}
                  >
                    <div className="relative w-full h-7 sm:h-8 rounded-xs overflow-hidden border border-ink/15">
                      <Image
                        src={preset.imageUrl!}
                        alt={preset.label}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="60px"
                      />
                    </div>
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold text-ink truncate w-full mt-0.5">
                      {preset.label.replace('Zine ', '').replace('Kolase ', '').replace('Hero Koma', 'Sampul')}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sela-purple ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Pilih foto untuk unggahan"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold border border-ink/30 rounded-sm hover:border-sela-purple disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Memeriksa foto...' : 'Unggah foto (JPG, PNG, WebP · maks. 5 MB)'}
            </button>
            {selectedImage && !VISUAL_PRESET_OPTIONS.some((option) => option.value === selectedImage) && (
              <div className="flex items-center gap-2 text-xs font-mono text-ink">
                <Check className="w-4 h-4 text-sela-purple" /> Foto sudah diperiksa dan siap dilampirkan
              </div>
            )}
          </div>

          <label className="flex items-start gap-2 text-xs font-sans text-ink-muted cursor-pointer">
            <input type="checkbox" checked={searchConsent} onChange={(e) => setSearchConsent(e.target.checked)} className="mt-0.5" />
            <span>Izinkan coretan ini ditemukan melalui mesin pencari jika lolos pemeriksaan keamanan dan kelayakan. Tanpa izin, coretan tetap publik tetapi tidak diajukan untuk pengindeksan. Izin direset jika coretan disunting.</span>
          </label>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-ink/15 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-ink-muted">
              Coretan diperiksa sebelum tampil di publik
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
                type="submit"
                disabled={isSubmitting || isUploading || !content.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-ink text-paper text-xs sm:text-sm font-sans font-black rounded-sm hover:bg-sela-purple disabled:opacity-50 transition-all shadow-paper hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan Coretan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}
