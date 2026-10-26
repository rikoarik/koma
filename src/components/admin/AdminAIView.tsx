'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ShieldCheck,
  Code,
} from 'lucide-react';

interface AdminAIViewProps {
  aiHealth: any;
  aiPosts: any[];
  onRefresh: () => void;
}

export default function AdminAIView({
  aiHealth,
  aiPosts,
  onRefresh,
}: AdminAIViewProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_ai' }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({
        success: false,
        error: e?.message || 'Gagal terhubung dengan server penguji',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const engine = aiHealth?.aiEngine || {};

  return (
    <div className="space-y-6">
      {/* Top Architecture Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Provider Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-bold uppercase">Penyedia AI Aktif</span>
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-sans tracking-tight">
            {engine.provider || 'Memuat...'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${engine.apiKeySet ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-slate-600">
              {engine.apiKeySet ? 'Konfigurasi tersedia, koneksi belum diverifikasi' : 'Moderasi AI tidak tersedia; konten ditahan untuk tinjauan'}
            </span>
          </div>
        </div>

        {/* Card 2: Transparency & Integrity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-bold uppercase">Transparansi Publik</span>
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-sans tracking-tight">
            Label konten dibantu AI
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Setiap konten AI otomatis disematkan lencana <code className="text-purple-700 font-bold">✨ Dibantu AI</code>
          </p>
        </div>

        {/* Card 3: AI Output Volume */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-bold uppercase">Volume Konten AI</span>
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-slate-900 font-sans tracking-tight">
            {aiPosts.length} Coretan Publik
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Bantuan pena bagi pengguna yang mengalami writer&apos;s block
          </p>
        </div>
      </div>

      {/* Connectivity & Diagnostic Ping Tool */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">
              Diagnostik & Uji Latensi Studio AI
            </h3>
            <p className="text-xs text-slate-600">
              Uji ini memeriksa Studio AI, bukan koneksi model moderasi konten.
            </p>
          </div>

          <button
            onClick={handleTestPing}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isTesting ? 'animate-bounce' : ''}`} />
            <span>{isTesting ? 'Menguji Koneksi...' : 'Jalankan Uji Latensi AI'}</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
              testResult.success
                ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between font-mono font-bold">
              <span className="flex items-center gap-1.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>Status: {testResult.success ? 'TERHUBUNG (OK)' : 'GAGAL'}</span>
              </span>
              <span>Latensi: {testResult.latencyMs || 0} ms</span>
            </div>

            {testResult.source && (
              <div className="font-mono text-[11px]">
                <strong>Sumber Model:</strong> {testResult.source} ({testResult.modelUsed})
              </div>
            )}

            {testResult.sampleResult && (
              <div className="p-3 bg-white/80 rounded-lg border border-purple-200/60 font-sans italic">
                &quot;{testResult.sampleResult}&quot;
              </div>
            )}

            {testResult.error && (
              <div className="font-sans text-rose-700">
                <strong>Detail Kesalahan:</strong> {testResult.error}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200/80 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">BASE URL ENDPOINT</span>
            <span className="text-slate-800 font-bold">{engine.baseUrl || 'Tidak tersedia'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">JIKA MODERASI AI TIDAK TERSEDIA</span>
            <span className="text-slate-800 font-bold">Konten ditahan untuk tinjauan pengelola</span>
          </div>
        </div>
      </div>

      {/* AI Content Inspection List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-base text-slate-900">Arsip Konten Dibantu AI</h3>
            <p className="text-xs text-slate-600">Inspeksi transparansi prompt masukan pengguna dan hasil kurasi</p>
          </div>
          <span className="font-mono text-xs text-slate-500">{aiPosts.length} Coretan</span>
        </div>

        {aiPosts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-sans">
            Belum ada coretan publik yang dibuat dengan bantuan Studio AI.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {aiPosts.map((post) => (
              <div key={post.id} className="p-5 space-y-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{post.authorAlias}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 font-semibold">
                      #{post.topic}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                      ✨ AI Studio
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(post.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>

                {post.aiPrompt && (
                  <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs font-mono text-slate-700">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Prompt Pengguna:</span>
                    {post.aiPrompt}
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-purple-50/30 border border-purple-100 text-slate-900 font-sans text-xs leading-relaxed">
                  {post.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
