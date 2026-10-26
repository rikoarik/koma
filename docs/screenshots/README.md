# Arsip Tangkapan Layar & Bukti Visual (`docs/screenshots`)

Direktori ini menyimpan seluruh artefak visual, bukti implementasi (*visual proof*), dan hasil verifikasi tampilan platform **`coret.`** / **`koma`**.

---

## Struktur Folder

```
docs/screenshots/
├── landing/        # Tangkapan layar antarmuka publik, hero, mobile, & story acts
├── admin/          # Tangkapan layar 10 tampilan admin dashboard
└── verification/   # Tangkapan layar uji interaktif (dropdown, validasi route, dll.)
```

---

## 1. Landing & Public Zine (`docs/screenshots/landing/`)

Tangkapan layar resolusi tinggi untuk memverifikasi estetika analog *Paper After Midnight*, kolase zine, dan alur pengunjung:

| Berkas | Deskripsi |
|---|---|
| `screenshot-fullpage.png` | Tangkapan layar halaman beranda penuh (*full-page*) |
| `screenshot-hero-desktop.png` | Hero section viewport desktop lebar (1440px) |
| `screenshot-hero-updated.png` | Hero section setelah pembaruan tipografi & stamp |
| `screenshot-mobile.png` | Tata letak responsive mobile (viewport 390px) |
| `screenshot-view-hero.png` | Detail visual elemen hero layer |
| `screenshot-view-acts.png` | Tiga babak narasi zine (*Story Acts*) |
| `screenshot-view-feed.png` | Aliran coretan publik dengan reaksi non-kompetitif |
| `shot-1-hero.png` s/d `shot-7-verified-journey.png` | Rangkaian alur verifikasi end-to-end penjelajahan publik |
| `shot-enhanced-cards.png` | Tampilan kartu coretan analog dengan tekstur kertas |
| `shot-enhanced-feed.png` | Feed terkurasi dengan filter topik |
| `shot-fixed-footer.png` | Footer bernuansa zine editorial analog |

---

## 2. Admin Dashboard (`docs/screenshots/admin/`)

Tangkapan layar antarmuka SaaS modern densitas tinggi (`#admin-panel-root`):

| Berkas | Deskripsi |
|---|---|
| `admin-1-login.png` | Halaman login admin terproteksi (fail-closed auth) |
| `admin-2-overview.png` | Ringkasan metrik riil & Supported Coretan Rate (SCR 24h) |
| `admin-3-analytics.png` | Analitik periodik (24h, 7d, 30d, all) & kepatuhan UU PDP |
| `admin-4-content.png` | Arsip & manajemen tabel coretan publik |
| `admin-5-moderation.png` | Antrean laporan komunitas & aksi cepat |
| `admin-6-rules.png` | Manajemen aturan moderasi & sandbox uji kata |
| `admin-7-ai.png` | Status kuota, provider, dan latensi AI Studio |
| `admin-8-donations.png` | Konfigurasi traktir kopi & QRIS dinamis |
| `admin-9-system.png` | Status infrastruktur database & audit log |
| `admin-10-mobile.png` | Tampilan dashboard admin pada viewport mobile |

> *Catatan: Tangkapan layar admin dapat diperbarui otomatis menggunakan script `npm run` atau `node scripts/capture-admin-screens.js` (membutuhkan env `ADMIN_PASSWORD`).*

---

## 3. Verifikasi & Interaksi Khusus (`docs/screenshots/verification/`)

Tangkapan layar dari uji interaksi Playwright dan pengecekan rute khusus:

| Berkas | Deskripsi |
|---|---|
| `shot-dropdown-closed.png` | Dropdown visual zine saat tertutup |
| `shot-dropdown-visual-open.png` | Dropdown visual zine saat terbuka |
| `shot-dropdown-response-open.png` | Pilihan mode balasan (*Boleh Dibalas* vs *Cukup Didengar*) |
| `shot-dropdown-selected-state.png` | Status terpilih setelah opsi diklik |
| `verify-jelajah.png` | Halaman `/jelajah` publik |
| `verify-dukung.png` | Halaman `/dukung` traktir kopi |
| `verify-tentang.png` | Halaman `/tentang` filosofi produk |
| `verify-single-post.png` | Halaman detail posting `/coretan/[id]` |
| `verify-nav-bg.png` | Pengecekan kontras navbar |
| `verify-no-dot.png` | Pengecekan tipografi & logo tanpa artefak dot |
