'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import AdminOverviewView from '@/components/admin/AdminOverviewView';
import AdminAnalyticsView from '@/components/admin/AdminAnalyticsView';
import AdminContentView from '@/components/admin/AdminContentView';
import AdminModerationView from '@/components/admin/AdminModerationView';
import AdminRulesView from '@/components/admin/AdminRulesView';
import AdminAIView from '@/components/admin/AdminAIView';
import AdminDonationsView from '@/components/admin/AdminDonationsView';
import AdminSystemView from '@/components/admin/AdminSystemView';
import AdminMessagesView from '@/components/admin/AdminMessagesView';

import { AdminAnalyticsSummary, DonationConfig } from '@/types';
import { DetailedAnalyticsResult, type AdminMessage } from '@/lib/storage';
import { DEFAULT_DONATION_URL } from '@/lib/donation-defaults';

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialChecking, setIsInitialChecking] = useState(true);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global data states
  const [analyticsSummary, setAnalyticsSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState<DetailedAnalyticsResult | null>(null);
  const [searchVisibility, setSearchVisibility] = useState<{ eligible: number; noindex: number; excluded: number; sitemapUrl: string; note: string } | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [reports, setReports] = useState<any[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');

  // Content management state
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 15,
  });
  const [contentSearch, setContentSearch] = useState('');
  const [contentTopic, setContentTopic] = useState('all');
  const [contentStatus, setContentStatus] = useState('all');
  const [contentSortBy, setContentSortBy] = useState('createdAt');
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Moderation Rules state
  const [baselineRules, setBaselineRules] = useState<any[]>([]);
  const [customRules, setCustomRules] = useState<any[]>([]);

  // System and Donation state
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [donationConfig, setDonationConfig] = useState<DonationConfig>({
    enabled: true,
    qrisImageUrl: '',
    externalLinkUrl: DEFAULT_DONATION_URL,
    customMessage: 'Dukung operasional Koma agar tetap mandiri, bebas iklan, dan bebas pelacak.',
  });
  const [isSavingDonation, setIsSavingDonation] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load analytics
  const fetchAnalytics = useCallback(async (period: '24h' | '7d' | '30d' | 'all' = '7d') => {
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setAnalyticsSummary(data.analytics);
          setDetailedAnalytics(data.detailed);
          setSearchVisibility(data.searchVisibility || null);
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch {}
  }, []);

  // Load content
  const fetchContent = useCallback(async (page: number = 1) => {
    setIsContentLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search: contentSearch,
        topic: contentTopic,
        status: contentStatus,
        sortBy: contentSortBy,
      });
      const res = await fetch(`/api/admin/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(data.items);
          setPagination(data.pagination);
        }
      }
    } catch {} finally {
      setIsContentLoading(false);
    }
  }, [contentSearch, contentTopic, contentStatus, contentSortBy]);

  // Load reports
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReports(data.reports);
        }
      }
    } catch {}
  }, []);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const res = await fetch('/api/admin/messages', { cache: 'no-store' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setMessages([]);
        return;
      }
      if (!res.ok) throw new Error('Gagal memuat pesan. Coba muat ulang.');
      const data = await res.json();
      if (!data.success) throw new Error('Gagal memuat pesan. Coba muat ulang.');
      setMessages(data.messages);
    } catch {
      setMessagesError('Gagal memuat pesan. Coba muat ulang.');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleReadMessage = async (id: string) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      await fetchMessages();
      showToast('Pesan ditandai sudah dibaca.');
    } catch {
      showToast('Gagal menandai pesan. Coba lagi.', 'error');
    }
  };

  // Load rules
  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rules');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBaselineRules(data.baseline || []);
          setCustomRules(data.custom || []);
        }
      }
    } catch {}
  }, []);

  // Load system health
  const fetchSystemHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/system');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSystemHealth(data);
        }
      }
    } catch {}
  }, []);

  // Load donation config
  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDonationConfig(data.config);
        }
      }
    } catch {}
  }, []);

  // Load all data on mount
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchAnalytics(analyticsPeriod),
      fetchReports(),
      fetchMessages(),
      fetchContent(pagination.currentPage),
      fetchRules(),
      fetchSystemHealth(),
      fetchDonations(),
    ]);
    setIsRefreshing(false);
  }, [analyticsPeriod, fetchAnalytics, fetchReports, fetchMessages, fetchContent, pagination.currentPage, fetchRules, fetchSystemHealth, fetchDonations]);

  useEffect(() => {
    const init = async () => {
      setIsInitialChecking(true);
      await refreshAllData();
      setIsInitialChecking(false);
    };
    init();
  }, []);

  // Re-fetch content when search or filters change
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchContent(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [contentSearch, contentTopic, contentStatus, contentSortBy, isAuthenticated, fetchContent]);

  // Auth Handler: Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPasswordInput('');
        await refreshAllData();
        showToast('Autentikasi pengelola berhasil.');
      } else {
        setLoginError(data.error || 'Kata sandi tidak valid.');
      }
    } catch {
      setLoginError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Auth Handler: Logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setMessages([]);
    showToast('Sesi pengelola diakhiri.');
  };

  // Report Resolution Handler
  const handleResolveReport = async (
    reportId: string,
    action: 'DISMISSED' | 'RESOLVED_HIDE' | 'RESOLVED_DELETE' | 'PUBLISH'
  ) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Laporan berhasil ditindaklanjuti.');
        await Promise.all([fetchReports(), fetchContent(pagination.currentPage), fetchSystemHealth()]);
      } else {
        showToast(data.error || 'Gagal memproses laporan', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  // Content Actions: Toggle Hide
  const handleToggleHide = async (postId: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, isHidden: !currentVal, moderationState: currentVal ? 'published' : 'removed' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(currentVal ? 'Coretan ditampilkan kembali di feed publik.' : 'Coretan berhasil disembunyikan.');
        await Promise.all([fetchContent(pagination.currentPage), fetchSystemHealth()]);
      }
    } catch {
      showToast('Gagal memperbarui status coretan', 'error');
    }
  };

  // Content Actions: Toggle Pin
  const handleTogglePin = async (postId: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, isPinned: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(currentVal ? 'Sematan coretan dilepas.' : 'Coretan berhasil disematkan ke atas feed.');
        await Promise.all([fetchContent(pagination.currentPage), fetchSystemHealth()]);
      }
    } catch {
      showToast('Gagal mengubah sematan', 'error');
    }
  };

  // Content Actions: Delete Post
  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/admin/content?id=${encodeURIComponent(postId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Coretan berhasil dihapus secara permanen.');
        await Promise.all([fetchContent(pagination.currentPage), fetchSystemHealth(), fetchReports()]);
      } else {
        showToast(data.error || 'Gagal menghapus coretan', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  // Rules: Add Rule
  const handleAddRule = async (ruleData: any) => {
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Aturan etika baru berhasil ditambahkan.');
        await fetchRules();
        return true;
      } else {
        showToast(data.error || 'Gagal menambahkan aturan', 'error');
        return false;
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
      return false;
    }
  };

  // Rules: Delete Rule
  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/admin/rules?id=${encodeURIComponent(ruleId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Aturan berhasil dihapus.');
        await fetchRules();
        return true;
      } else {
        showToast(data.error || 'Gagal menghapus aturan', 'error');
        return false;
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
      return false;
    }
  };

  // Save Donation Config
  const handleSaveDonation = async (qrisImageUrl: string) => {
    setIsSavingDonation(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...donationConfig, qrisImageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('Pengaturan donasi berhasil diperbarui.');
        showToast('Pengaturan donasi berhasil disimpan.');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        return true;
      } else {
        showToast(data.error || 'Gagal menyimpan donasi', 'error');
        return false;
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
      return false;
    } finally {
      setIsSavingDonation(false);
    }
  };

  // Render Login Gate if unauthenticated
  if (!isAuthenticated && !isInitialChecking) {
    return (
      <div id="admin-panel-root" className="relative z-[60] min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-600 selection:text-white">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl relative text-slate-200 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-bold text-lg text-white tracking-tight">Koma Admin</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-semibold border border-slate-700">
                  v1.4
                </span>
              </div>
              <p className="text-xs text-slate-400">Pusat Kendali & Integritas Operasional</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Area terbatas untuk pengawasan etika, analitik interaksi, moderasi laporan komunitas, dan status pangkalan data Koma.
          </p>

          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Kata Sandi Pengelola
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi pengelola..."
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-semibold text-xs rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoggingIn ? 'Memverifikasi...' : 'Buka Dasbor Pengelola'}</span>
            </button>

            <div className="text-center pt-2 border-t border-slate-900">
              <Link
                href="/"
                className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
              >
                <span>← Kembali ke Beranda Publik</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Initial loading spinner
  if (isInitialChecking) {
    return (
      <div id="admin-panel-root" className="relative z-[60] min-h-screen bg-slate-900 flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span>Memeriksa sesi pengelola Koma...</span>
        </div>
      </div>
    );
  }

  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING').length;
  const dbEngineLabel = systemHealth?.database?.engine || 'Status pangkalan data belum tersedia';
  const aiGeneratedPosts = posts.filter((p) => p.isAiGenerated);

  return (
    <div id="admin-panel-root" className="relative z-[60] min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Dedicated SaaS Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reportCount={pendingReportsCount}
        unreadMessageCount={messages.filter((message) => !message.readAt).length}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        dbEngine={dbEngineLabel}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Dedicated SaaS Topbar */}
        <AdminTopbar
          activeTab={activeTab}
          onOpenMobile={() => setIsMobileOpen(true)}
          onRefresh={refreshAllData}
          isRefreshing={isRefreshing}
        />

        {/* View Content Renderer */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverviewView
              analytics={analyticsSummary}
              reports={reports}
              recentPosts={posts}
              auditLogs={systemHealth?.auditLogs || []}
              aiHealth={systemHealth}
              onNavigate={(tab) => setActiveTab(tab)}
              onResolveReport={handleResolveReport}
              onToggleHide={handleToggleHide}
              onTogglePin={handleTogglePin}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalyticsView
              data={detailedAnalytics}
              searchVisibility={searchVisibility}
              period={analyticsPeriod}
              onPeriodChange={(p) => {
                setAnalyticsPeriod(p);
                fetchAnalytics(p);
              }}
              isLoading={isRefreshing}
            />
          )}

          {activeTab === 'content' && (
            <AdminContentView
              posts={posts}
              pagination={pagination}
              search={contentSearch}
              setSearch={setContentSearch}
              topic={contentTopic}
              setTopic={setContentTopic}
              status={contentStatus}
              setStatus={setContentStatus}
              sortBy={contentSortBy}
              setSortBy={setContentSortBy}
              onPageChange={(p) => fetchContent(p)}
              onToggleHide={handleToggleHide}
              onTogglePin={handleTogglePin}
              onDeletePost={handleDeletePost}
              isLoading={isContentLoading}
            />
          )}

          {activeTab === 'messages' && (
            <AdminMessagesView messages={messages} loading={messagesLoading} error={messagesError} onRefresh={fetchMessages} onRead={handleReadMessage} />
          )}

          {activeTab === 'moderation' && (
            <AdminModerationView
              reports={reports}
              onResolveReport={handleResolveReport}
              onRefresh={fetchReports}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'rules' && (
            <AdminRulesView
              baselineRules={baselineRules}
              customRules={customRules}
              onAddRule={handleAddRule}
              onDeleteRule={handleDeleteRule}
            />
          )}

          {activeTab === 'ai' && (
            <AdminAIView
              aiHealth={systemHealth}
              aiPosts={aiGeneratedPosts}
              onRefresh={fetchSystemHealth}
            />
          )}

          {activeTab === 'donations' && (
            <AdminDonationsView
              donationConfig={donationConfig}
              setDonationConfig={setDonationConfig}
              onSave={handleSaveDonation}
              isSaving={isSavingDonation}
              saveSuccessMsg={saveSuccessMsg}
            />
          )}

          {activeTab === 'system' && (
            <AdminSystemView
              systemHealth={systemHealth}
              auditLogs={systemHealth?.auditLogs || []}
            />
          )}
        </main>
      </div>
    </div>
  );
}
