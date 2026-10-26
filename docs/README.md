# Dokumentasi Proyek `coret.` (`koma`)

Selamat datang di pusat dokumentasi platform **`coret.`** (dikenal juga dengan identitas visual **`koma`**), sebuah sudut singgah (*digital hangout*) anonim dan ruang ekspresi teks-visual digital.

---

## Peta Dokumentasi

| Folder / Berkas | Keterangan |
|---|---|
| [`PRODUCT.md`](../PRODUCT.md) | Spesifikasi produk, positioning, batasan kapabilitas, komitmen brand, dan prinsip inti produk. |
| [`AGENTS.md`](../AGENTS.md) | Aturan kritis agen AI: kebijakan *Zero-Fallback Credential*, batasan ruang lingkup estetika analog vs admin SaaS, dan kejujuran telemetri. |
| [`docs/riset/`](./riset/README.md) | Arsip riset produk, benchmark 8 platform, strategi peluncuran 12 minggu, dan 6 eksperimen validasi. |
| [`docs/screenshots/`](./screenshots/README.md) | Katalog visual proof, tangkapan layar antarmuka publik, hero desktop/mobile, dan 10 tampilan admin dashboard. |
| [`docs/superpowers/plans/`](./superpowers/plans/) | Rencana kerja dan spesifikasi fitur terstruktur (superpowers implementation plans). |
| [`tests/`](../tests/README.md) | Suite pengujian otomatis: moderasi teks & gambar, integrasi data, dan keamanan admin dashboard. |
| [`.agents/skills/core-konteks/`](../.agents/skills/core-konteks/SKILL.md) | Panduan baku arsitektur Modular Monolith, skema data, aturan moderasi krisis, dan standar koding TypeScript. |

---

## 3 Pilar Utama Platform

1. **Anonim terhadap Publik, Akuntabel terhadap Sistem**
   - Tidak ada keharusan registrasi akun (*guest-first*). Penulis dapat memilih "Tanpa Nama" atau pseudonim acak.
   - Tanpa metrik vanity kompetitif: tidak ada follower count, follow graph, atau public like count. Interaksi dilakukan melalui empat reaksi manusiawi: ☕ *Aku dengerin*, 🖤 *Relate*, 🌿 *Senyum*, dan 🫂 *Peluk jauh*.

2. **Dua Dunia Antarmuka yang Jelas (Scope Boundaries)**
   - **Situs Publik (`/`, `/jelajah`, `/coretan/[id]`, `/dukung`, `/tentang`, `/aturan`, `/privasi`):**
     Estetika *editorial-zine*, tekstur kertas (*paper-grain* `#F7F4EE`), tipografi serif intim (`Instrument Serif` / `Fraunces`), dan aksen selotip washi ungu analog.
   - **Admin Dashboard (`/admin`, `/api/admin/*`):**
     Antarmuka SaaS modern berdensitas tinggi (`#admin-panel-root`), warna netral Slate/Zinc, grafik SVG terukur, dan audit log riil.

3. **Keamanan Kritis & Privasi (Fail-Closed & Real Analytics)**
   - **Strict Zero-Fallback Credential Policy**: Variabel lingkungan rahasia (`ADMIN_PASSWORD`, API key) **DILARANG KERAS** memiliki default fallback hardcoded. Sistem wajib fail-closed jika tidak diset.
   - **Kepatuhan UU PDP No. 27/2022**: Telemetri tidak pernah mencatat teks mentah coretan atau sidik jari invasif tanpa persetujuan.
