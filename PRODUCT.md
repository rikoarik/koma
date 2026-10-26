# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pengguna internet Indonesia usia muda hingga dewasa (pelajar, mahasiswa, pekerja kantoran, perantau, dan masyarakat umum) yang membutuhkan ruang ekspresi jujur dan hangat tanpa beban kurasi media sosial biasa, penghakiman algoritma, atau tekanan membangun persona publik.

## Product Purpose

Menyediakan ruang singgah (*digital hangout*) anonim bagi pemikiran yang selama ini tertahan di kepala, cerita kecil keseharian, lelucon larut malam, serta karya visual zine. Keberhasilan produk diukur bukan dari waktu scroll (*vanity impressions*), melainkan dari **Supported Coretan Rate (SCR 24h)**: memastikan orang yang berani bersuara mendapatkan respons manusia yang hangat, sehat, dan bermakna.

## Positioning

*"Anonim terhadap publik, akuntabel terhadap sistem."*  
Koma bukan aplikasi curhat medis/klinis sempit, bukan media sosial konvensional berbasis angka pengikut/like publik, dan bukan papan anonim nir-aturan tanpa akuntabilitas. Koma menghadirkan kehangatan internet masa awal melalui format zine digital terbuka di mana setiap manusia setara.

## Operating Context

- **Waktu Penggunaan Utama:** Paling aktif pada jam-jam sepi dan santai (larut malam 00:00 - 04:00 WIB, waktu komuter sore di halte/kereta, serta sela-sela istirahat).
- **Perangkat Akses:** Peramban web di ponsel pintar (mobile-first) dan desktop laptop tanpa keharusan mengunduh aplikasi toko aplikasi.
- **Ritual Interaksi:** Membaca coretan orang asing secara santai, menanggapi coretan yang belum terjawab (*listener supply*), dan menuangkan pikiran tanpa rasa takut dihakimi.

## Capabilities and Constraints

- **Model Identitas:** Sesi anonim murni tanpa keharusan login/registrasi akun (*guest-first*). Penulis dapat memilih "Tanpa Nama" (default) atau menggunakan nama samaran (*pseudonim*) yang dapat diacak.
- **Kontrol Penulis (OP Mode):**
  - `Boleh Dibalas`: Membuka ruang bagi pengguna lain untuk memberikan tanggapan berantai.
  - `Cukup Didengar`: Menegaskan bahwa tulisan adalah ventilasi emosional murni, menutup input tanggapan untuk mencegah *unsolicited advice*.
- **Resonansi Non-Kompetitif:** Menghilangkan tombol *Like* publik. Interaksi dilakukan melalui empat reaksi manusiawi:
  - ☕ *Aku dengerin*
  - 🖤 *Relate*
  - 🌿 *Senyum*
  - 🫂 *Peluk jauh*
- **Studio Konten AI Transparan:**
  - AI (Gemini) berfungsi sebagai pemantik inspirasi teks dan penyuntingan nada.
  - AI **tidak pernah menerbitkan tulisan secara otomatis**. Peninjauan dan penyuntingan manual oleh manusia bersifat wajib sebelum publikasi.
  - Setiap konten hasil bantuan studio otomatis disematkan lencana transparan `✨ Dibantu AI`.
- **Integritas & Keamanan Sistem:**
  - Validasi ketat anti-doxxing: memblokir deteksi nomor telepon pribadi (`08...`, `+62...`) dan alamat email.
  - Pembatasan laju (*rate limiting*) berbasis IP/sesi untuk mitigasi spam dan banjir bot.
  - Sistem pelaporan moderasi komunitas terintegrasi.
- **Batasan Terlarang (Anti-Patterns):**
  - ❌ Tidak ada follower count atau following graph.
  - ❌ Tidak ada direct message (DM) privat anonim di fase MVP (vektor pelecehan tertinggi).
  - ❌ Tidak ada aktivitas palsu (fake bots / simulated engagement).

## Brand Commitments

- **Nama Brand:** Koma (Sudut Singgah Anonim & Zine Digital).
- **Arah Visual:** *Editorial internet zine meets playful digital scrapbook*.
- **Palet Warna Inti:**
  - Kertas Analog: `#F7F4EE`
  - Tinta Arang: `#1D1B18`
  - Ungu Indigo Elektrik: `#5A46D6`
  - Aksen Pendukung: Kraft Tan `#DCCDBB`, Muted Ink `#524E48`.
- **Bahasa & Nada Suara (Voice):** Bahasa Indonesia alami, jujur, hangat, puitis-santai, anti-slop, dan bebas dari jargon korporat AI klise (*elevate, unlock, seamless, revolutionize*).
- **Aset Visual Nyata:** Risograph artwork collage, stempel karet pos kilat, lakban kertas kraft, dan selotip washi tape ungu.

## Evidence on Hand

- Berkas implementasi web fungsional: Next.js 14, Tailwind CSS, Supabase schema di [`supabase/schema.sql`](file:///Users/macbookm2/Documents/antigravity/jolly-lovelace/supabase/schema.sql).
- Arsip aset visual WebP dan SVG di [`public/assets/`](file:///Users/macbookm2/Documents/antigravity/jolly-lovelace/public/assets).
- Riset fondasi produk di [`docs/riset/`](file:///Users/macbookm2/Documents/antigravity/jolly-lovelace/docs/riset).
- Tangkapan layar status aplikasi nyata di [`docs/screenshots/`](file:///Users/macbookm2/Documents/antigravity/jolly-lovelace/docs/screenshots) (`landing/`, `admin/`, `verification/`).

## Product Principles

1. **Manusia Di Atas Metrik:** Produk dirancang untuk menghadirkan kehangatan respons sesama manusia, bukan memaksimalkan adiksi scroll atau kompetisi popularitas.
2. **Anonim Namun Bertanggung Jawab:** Anonim bagi publik di permukaan, namun terproteksi oleh aturan moderasi, anti-doxxing, dan penjaga integritas di tingkat sistem.
3. **Kendali Penuh Penulis:** Penulis memegang kendali atas bagaimana tulisannya diperlakukan (`Boleh Dibalas` vs `Cukup Didengar`).
4. **Kejujuran AI:** AI hanyalah alat bantu pena; ia tidak berbicara sendiri, tidak menerbitkan sendiri, dan selalu diberi label secara transparan.

## Accessibility & Inclusion

- Standar kepatuhan kontras WCAG 2.2 AA pada seluruh teks di atas kertas `#F7F4EE`.
- Dukungan `@media (prefers-reduced-motion: reduce)` di mana animasi scroll dan paralaks secara otomatis dinonaktifkan demi kenyamanan pengguna dengan sensitivitas gerak.
- Tata letak responsif dari layar ponsel 375px hingga monitor desktop lebar.
