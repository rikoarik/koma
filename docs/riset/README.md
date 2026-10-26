# Arsip Riset & Dokumentasi Fondasi Produk (`coret.`)

Direktori ini berisi seluruh dokumen riset, analisis komparatif, dan strategi peluncuran produk **`coret.`** yang menjadi acuan utama perancangan sistem dan fitur:

1. [01. Rancangan Produk dan Landing Page](./01-rancangan-produk-dan-landing-page.md)
   * Analisis positioning ruang ekspresi publik vs confession app.
   * Benchmark produk: Jodel, Sidechat, Tellonym, Reddit, Tumblr, Togetherall, 4chan, NGL.
   * Desain visual *Paper After Midnight*, token warna, dan aksesibilitas WCAG 2.2 AA.
   * Model identitas anonim vs pseudonim dan alur interaksi awal.

2. [02. Rancangan dan Strategi Peluncuran](./02-rancangan-dan-strategi-peluncuran.md)
   * Tesis "Anonim terhadap publik, akuntabel terhadap sistem".
   * Arsitektur teknis Modular Monolith (Next.js, Fastify, Prisma, PostgreSQL, Redis, Cloudflare).
   * Mekanisme redistribusi balasan (*listener supply*) dan kontrol OP (`boleh dibalas`/`cukup didengar`).
   * Roadmap peluncuran 12 minggu (MVP $\rightarrow$ Closed Beta $\rightarrow$ Public Beta) dan mitigasi risiko regulasi Indonesia.

3. [03. Riset Desain dan Validasi](./03-riset-desain-dan-validasi.md)
   * Mengapa masalah utama platform adalah *listener supply*, bukan produksi konten.
   * 4 Kuadran peran pengguna (Writer, Listener, Reader, Conversationalist).
   * 6 Eksperimen validasi produk inti.
   * Formula algoritma feed berbasis peluang perhatian (*Opportunity-based ranking*).
   * Dashboard harian dan metrik penjaga (*guardrails*).

---
*Catatan: Aturan baku implementasi kode yang diringkas untuk Antigravity dapat ditemukan di file skill [core-konteks](../../.agents/skills/core-konteks/SKILL.md).*
