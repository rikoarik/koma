# Rangkaian Pengujian Proyek (`tests/`)

Direktori ini berisi seluruh suite pengujian otomatis untuk memverifikasi fungsionalitas, keamanan, dan moderasi platform **`coret.`** / **`koma`**.

---

## Daftar Berkas Uji

| Berkas | Jenis Pengujian | Deskripsi |
|---|---|---|
| `test-image-moderation.ts` | Unit & Security Test | Pengujian upload gambar, tanda tangan sesi kriptografis unexpired, fail-closed saat provider AI mati, dan penolakan konten visual tidak aman. |
| `test-moderation.ts` | Integration Test | Alur moderasi teks, filter anti-doxxing (nomor HP/email), penanganan krisis/distress (Healing119), dan aturan banned words dinamis. |
| `test-admin-suite.ts` | Integration & Security Test | Pengujian 57+ skenario admin dashboard: perhitungan SCR 24h, analitik riil bebas bot, dan kebijakan keamanan **Strict Zero-Fallback Password** (CWE-798). |
| `test-integration.ts` | End-to-End Core Test | Pengujian pembuatan posting, permission OP (`boleh_dibalas` vs `cukup_didengar`), empat reaksi non-kompetitif, dan studio saran AI. |
| `test-dropdown.js` | UI / Playwright Test | Uji interaktif pemilih lampiran visual zine dan mode respons. |

---

## Cara Menjalankan Uji

Gunakan script npm yang telah disediakan:

```bash
# Menjalankan pengujian moderasi & keamanan gambar
npm test

# Menjalankan uji moderasi teks spesifik
npm run test:moderation

# Menjalankan uji keamanan upload & moderasi gambar
npm run test:image

# Menjalankan uji admin dashboard & zero-fallback security
npm run test:admin

# Menjalankan uji integrasi core
npm run test:integration

# Menjalankan seluruh suite pengujian
npm run test:all
```
