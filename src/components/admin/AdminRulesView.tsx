'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  TestTube,
  X,
  Search,
} from 'lucide-react';
import { ModerationRuleItem, checkContentModeration } from '@/lib/moderation';

interface AdminRulesViewProps {
  baselineRules: ModerationRuleItem[];
  customRules: ModerationRuleItem[];
  onAddRule: (rule: {
    wordOrPattern: string;
    ruleType: 'banned_word' | 'allowlist' | 'regex';
    action: 'allow' | 'warn' | 'review' | 'reject';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
  }) => Promise<boolean>;
  onDeleteRule: (ruleId: string) => Promise<boolean>;
}

export default function AdminRulesView({
  baselineRules,
  customRules,
  onAddRule,
  onDeleteRule,
}: AdminRulesViewProps) {
  const [activeTab, setActiveTab] = useState<'custom' | 'baseline' | 'tester'>('custom');
  const [showAddModal, setShowAddModal] = useState(false);

  // New rule form state
  const [newWord, setNewWord] = useState('');
  const [newRuleType, setNewRuleType] = useState<'banned_word' | 'allowlist' | 'regex'>('banned_word');
  const [newAction, setNewAction] = useState<'allow' | 'warn' | 'review' | 'reject'>('reject');
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test sandbox state
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState<any | null>(null);

  const handleTest = () => {
    if (!testText.trim()) return;
    const res = checkContentModeration(testText, customRules);
    setTestResult(res);
  };

  const handleSubmitNewRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setIsSubmitting(true);
    const ok = await onAddRule({
      wordOrPattern: newWord.trim(),
      ruleType: newRuleType,
      action: newAction,
      severity: newSeverity,
      description: newDesc.trim() || undefined,
    });

    if (ok) {
      setNewWord('');
      setNewDesc('');
      setShowAddModal(false);
    }
    setIsSubmitting(false);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getActionBadge = (act: string) => {
    switch (act) {
      case 'reject':
        return 'bg-rose-50 text-rose-700 font-bold';
      case 'review':
        return 'bg-amber-50 text-amber-700 font-bold';
      case 'warn':
        return 'bg-blue-50 text-blue-700 font-bold';
      default:
        return 'bg-emerald-50 text-emerald-700 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-base text-slate-900">
            Aturan Moderasi & Penyaring Etika
          </h2>
          <p className="text-xs text-slate-600">
            Kelola kata terlarang, pola regex anti-doxxing, dan daftar pengecualian (allowlist)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Aturan Kustom</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'custom'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Aturan Kustom Pengelola ({customRules.length})
        </button>
        <button
          onClick={() => setActiveTab('baseline')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'baseline'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pelindung Bawaan Sistem ({baselineRules.length})
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'tester'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TestTube className="w-3.5 h-3.5" />
          <span>Uji Simulasi Kata (Sandbox)</span>
        </button>
      </div>

      {/* Tab 1: Custom Rules */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {customRules.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-500">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-sm text-slate-900">Belum Ada Aturan Kustom</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Pelindung bawaan sistem ({baselineRules.length} aturan baseline) sudah aktif melindungi platform dari nomor HP, NIK, ancaman kekerasan, dan kata vulgar berat. Anda dapat menambahkan aturan kustom sewaktu-waktu.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 inline-block"
              >
                + Tambah Kata Kustom Sekarang
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Kata / Pola</th>
                  <th className="py-3 px-4 font-bold">Tipe Aturan</th>
                  <th className="py-3 px-4 font-bold">Tindakan Sistem</th>
                  <th className="py-3 px-4 font-bold">Keparahan</th>
                  <th className="py-3 px-6 font-bold">Keterangan</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rule.wordOrPattern}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[10px] text-slate-600">
                      {rule.ruleType}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getActionBadge(rule.action)}`}>
                        {rule.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getSeverityBadge(rule.severity)}`}>
                        {rule.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {rule.description || '–'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => rule.id && onDeleteRule(rule.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus aturan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Baseline Rules */}
      {activeTab === 'baseline' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Aturan bawaan tertanam di inti sistem Koma untuk mencegah doxxing dan ancaman kekerasan.</span>
            <span className="font-mono text-[10px] text-emerald-700 font-bold">✓ Selalu Aktif</span>
          </div>
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 font-bold">Kata / Pola</th>
                <th className="py-3 px-4 font-bold">Tipe</th>
                <th className="py-3 px-4 font-bold">Tindakan</th>
                <th className="py-3 px-4 font-bold">Keparahan</th>
                <th className="py-3 px-6 font-bold">Deskripsi Etika</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {baselineRules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                    {rule.wordOrPattern}
                  </td>
                  <td className="py-2.5 px-4 uppercase font-mono text-[10px] text-slate-600">
                    {rule.ruleType}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getActionBadge(rule.action)}`}>
                      {rule.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getSeverityBadge(rule.severity)}`}>
                      {rule.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-6 text-slate-600">
                    {rule.description || '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Interactive Sandbox Tester */}
      {activeTab === 'tester' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-2xl">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">Simulasi Pengujian Etika Konten</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Uji kalimat sebelum diterapkan ke produksi untuk memastikan normalisasi leetspeak dan allowlist berfungsi akurat tanpa false-positive (Scunthorpe problem).
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Ketik contoh kalimat pengujian di sini (misal: 'gue benci banget anj11ng' atau 'pantai kuta indah')..."
              rows={3}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900"
            />

            <button
              type="button"
              onClick={handleTest}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
            >
              Jalankan Analisis Etika
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl border space-y-2 mt-4 ${
              testResult.action === 'reject'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : testResult.action === 'review'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : testResult.action === 'warn'
                ? 'bg-blue-50 border-blue-200 text-blue-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between font-mono text-xs font-bold">
                <span>Hasil Keputusan: {testResult.action.toUpperCase()}</span>
                <span>Tingkat Keparahan: {testResult.severity.toUpperCase()}</span>
              </div>
              {testResult.reason && (
                <div className="text-xs font-sans">
                  <strong>Alasan:</strong> {testResult.reason}
                </div>
              )}
              {testResult.flaggedWord && (
                <div className="text-xs font-mono">
                  <strong>Kata/Pola Terdeteksi:</strong> {testResult.flaggedWord}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitNewRule}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans font-bold text-base text-slate-900">
                Tambah Aturan Moderasi Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kata atau Pola Regex *
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="contoh: penipu, scam, judi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Aturan</label>
                  <select
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="banned_word">Kata Terlarang (Banned)</option>
                    <option value="allowlist">Pengecualian (Allowlist)</option>
                    <option value="regex">Pola Regex Kustom</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tindakan</label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="reject">Tolak & Blokir Langsung (Reject)</option>
                    <option value="review">Tahan untuk Peninjauan (Review)</option>
                    <option value="warn">Peringatan Halus (Warn)</option>
                    <option value="allow">Izinkan (Allow)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Keparahan</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="critical">Critical (Doxxing / Ancaman Nyawa)</option>
                  <option value="high">High (Umpatan Kasar / Pelecehan)</option>
                  <option value="medium">Medium (Spam / Pelanggaran Sedang)</option>
                  <option value="low">Low (Umpatan Ringan / Slang)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan / Alasan</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Alasan pemblokiran..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Aturan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
