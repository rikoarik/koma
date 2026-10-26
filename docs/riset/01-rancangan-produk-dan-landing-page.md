# Rancangan Produk dan Landing Page untuk Platform Ekspresi Publik Anonim

## Ringkasan eksekutif

Konsep yang paling kuat bukan **“social media anonim”** dan bukan pula **“tempat curhat anonim”**. Positioning yang lebih defensible adalah:

> **ruang publik untuk mengatakan hal-hal yang selama ini cuma ada di kepala.**

Perbedaannya penting. “Curhat” terlalu sempit karena produk akhirnya diasosiasikan dengan kesedihan; “bebas bicara tanpa aturan” terlalu berbahaya karena anonimitas memang dapat meningkatkan self-disclosure, tetapi juga menurunkan sebagian hambatan sosial yang biasanya menahan perilaku buruk. Studi CHI menemukan anonimitas menaikkan baseline self-disclosure, sementara penelitian komunitas mental-health menunjukkan anonimitas memang membantu orang membicarakan pengalaman sensitif. Pada saat yang sama, studi moderasi menunjukkan keterlibatan moderator dapat meningkatkan kualitas percakapan dan mengurangi perilaku buruk.

Karena itu, tesis produk yang direkomendasikan adalah:

> **Anonymous-first, tetapi bukan identity-less.**
>
> Pengguna lain tidak perlu tahu siapa kamu. Sistem tetap punya actor identity internal yang tidak tampil ke publik untuk ownership, anti-spam, moderation history, dan penanganan abuse.

Secara produk, ada beberapa keputusan yang sebaiknya tegas sejak awal:

| Area | Keputusan yang direkomendasikan |
|---|---|
| Positioning | Public expression space, bukan confession app |
| Landing page | **Landing page = produk itu sendiri**; composer dan coretan asli muncul langsung |
| Identitas | `Tanpa nama` sebagai default, `nama samaran` opsional, akun permanen opsional |
| Feed | `Terbaru`, `Acak`, dan `Topik`; jangan memulai dengan feed “viral” |
| Social graph | **Tidak ada follower count** pada MVP |
| Popularity | Hindari public like-count; prioritaskan reply dan reaction empatik |
| Replies | Semua boleh membalas, tetapi OP dapat memilih `boleh dibalas` / `cukup didengar` |
| Permanence | Persistent sampai dihapus oleh penulis/moderator |
| Shareability | Public permalink tersedia; **search-engine indexing tidak perlu default** |
| Moderation | Rules + automated risk triage + human review + appeal |
| Abuse | Progressive friction: rate limit → challenge → cooldown → restriction |
| Trust | Jelaskan secara eksplisit apa arti “anonim” dan apa yang tidak anonim |
| Retention | Bangun dari koneksi dan percakapan, bukan streak dan dopamine loop |
| North star | Persentase coretan yang mendapatkan respons manusia yang sehat |
| Tone | Intim, jujur, tenang, tidak corporate, tidak terlalu “mental-health app” |

Hal yang paling krusial: **jangan menjanjikan “100% anonim”**. Tellonym sendiri membedakan anonimitas publik dari kemampuan memberikan data kepada penegak hukum bila ada dasar hukum. Kasus NGL bahkan menunjukkan risiko reputasi dan regulasi ketika produk anonim memberikan klaim menyesatkan tentang keamanan, identitas pengirim, dan moderasi AI.

Copy utama yang paling tepat:

> **Ada yang ingin kamu keluarkan?**
>
> Tempat buat bilang hal-hal yang selama ini cuma ada di kepala.  
> Pakai nama, nama samaran, atau tanpa nama.
>
> **Bebas jujur. Bukan bebas menyakiti.**

Ini menjelaskan value proposition dan batas kebebasan dalam satu layar.

Secara hukum Indonesia, safety tidak boleh dianggap fitur “nanti”. UGC PSE di bawah Permenkominfo 5/2020 diwajibkan memiliki tata kelola konten dan sarana pelaporan publik serta memproses pengaduan; aturan tersebut juga mengatur respons, pemeriksaan, pemberitahuan kepada uploader, dan takedown. Di 2026, rezim pelindungan anak PP TUNAS/Permenkomdigi 9/2026 juga sudah aktif dan mencakup klasifikasi risiko, self-assessment, mitigasi risiko, pelaporan, pengaduan, serta fitur ramah anak.

Jadi secara keseluruhan, produk ini sebaiknya terasa seperti:

**“menulis di dinding kota pada pukul dua pagi, tetapi dindingnya dirawat.”**

Bukan Reddit mini, bukan X anonim, bukan Secret/NGL baru, dan bukan aplikasi terapi.

---

## Benchmark produk dan prinsip desain

Tidak ada satu produk yang tepat untuk ditiru seluruhnya. Yang lebih masuk akal adalah mengambil mekanisme tertentu dari beberapa produk dan menghindari failure mode mereka.

| Produk resmi | Model yang relevan | Yang layak ditiru | Yang sebaiknya dihindari / pelajaran |
|---|---|---|---|
| Jodel | Hyperlocal, **no profile**, feed percakapan | Minim identity baggage; konten menjadi pusat. Jodel juga menggabungkan voting/reporting komunitas dengan moderator dan appeal. | Jangan terlalu bergantung pada voting untuk menentukan apa yang layak terlihat; produkmu lebih cocok untuk ekspresi personal daripada kontes popularitas. |
| Sidechat | Anonymous community berbasis kampus | Contoh bagus bahwa **identitas publik dan eligibility internal bisa dipisahkan**: komunitas dapat anonim sambil tetap memiliki mekanisme verifikasi. | Jangan mengikat produk pada institusi/lokasi jika value utamanya adalah universal emotional expression. |
| Tellonym | Anonymous messages / Q&A | Kontrol pengguna seperti filter, report, dan kemampuan membatasi anonymous sender sangat relevan. Tellonym juga cukup eksplisit bahwa “anonymous to users” tidak berarti kebal terhadap lawful request. | Model “kirim pesan anonim ke seseorang” mudah menjadi attack vector personal. Platformmu sebaiknya **public-post-first**, bukan target-a-person-first. |
| Reddit | Pseudonymous threaded communities | Threaded conversation dan moderation berlapis terbukti dapat beroperasi pada skala besar. Pada Jul–Des 2025, Reddit melaporkan 52,7% removal post/comment dilakukan community moderators dan 44,7% oleh admin, termasuk automation. | Jangan membawa kompleksitas subreddit, karma, flair, award, dan hierarchy ke MVP. |
| Tumblr | Pseudonymous creative social network + anonymous Ask | Anonymous Ask punya friction konkret: maksimal 10 ask/jam, hanya lima yang anonymous. Ini contoh bagus bahwa **anonymous tidak harus unlimited**. | Jangan membuat anonymous messaging ke profil sebagai mekanisme utama; meningkatkan kemungkinan harassment personal. |
| Mastodon | Federated social posting | Content warning yang collapse konten secara default adalah pola sangat bagus untuk pengalaman traumatis, seksual, atau disturbing. | Jangan membawa federasi ke versi awal; operational dan moderation complexity terlalu besar untuk core hypothesis yang belum tervalidasi. |
| Discord | Identity-based communities, tetapi moderation/onboarding kuat | Rules Screening meminta user setuju dengan aturan sebelum berpartisipasi; model ini cocok untuk **first-write onboarding**, bukan ketika sekadar membaca. | Jangan copy onboarding server yang panjang. Produkmu harus bisa dipahami dalam hitungan satu layar. |
| Togetherall | Anonymous peer-support, clinically moderated | Sangat baik dalam memperlihatkan **safety sebagai trust signal**, bukan menyembunyikannya di Terms. Platform menyatakan anonymous peer support, moderation, dan real-time risk detection secara terbuka. | Jangan tampil terlalu klinis kecuali produk memang menjadi layanan kesehatan; orang harus tetap merasa sedang berada di ruang ekspresi, bukan ruang diagnosis. |
| 4chan | Extremely low-friction anonymous board | Kesederhanaan posting dan absennya personal-branding menunjukkan betapa kuatnya content-first interaction. | Sebagai inferensi desain, anonimitas yang hampir tanpa persistent relationship membuat mekanisme trust, ownership, dan relationship sulit dibangun. Jangan menjadikannya blueprint governance. |
| NGL | Anonymous inbox/message | Yang berguna justru sebagai **anti-pattern**. FTC menuduh NGL menggunakan pesan palsu untuk mendorong paid conversion, menyesatkan tentang AI moderation, dan mengeksploitasi rasa ingin tahu soal identitas pengirim. | **Jangan pernah membuat fake activity, fake replies, atau menjual “petunjuk siapa pengirimnya”.** Itu merusak trust fundamental produk anonim. |

Pola terpenting dari benchmark ini adalah bahwa **anonimitas sebenarnya sebuah spectrum**, bukan boolean:

```text
Public identity
┌──────────────────────────────────────────────────────────────┐
│ Real name         Pseudonym        Anonymous to public      │
│    │                  │                    │                 │
│ LinkedIn-ish      Reddit-ish          Jodel-ish             │
└──────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                                   internal actor identity
                                   ownership / abuse control
```

Untuk produk ini, posisi paling kanan untuk publik dipilih, tetapi **tidak paling kanan di backend**.

Tiga mode identitas yang dipahami user:
* **Tanpa nama:** Orang lain hanya melihat “tanpa nama”. Aktivitasmu tidak dipasang ke profil publik.
* **Nama samaran:** Gunakan satu alias untuk membangun kontinuitas tanpa membuka identitas nyata.
* **Akun:** Opsional. Dipakai untuk sinkronisasi, notifikasi, recovery, dan history pribadi—bukan untuk memaksa identitas nyata.

---

## Landing page, copy, dan visual system

Landing page sebaiknya tidak berbentuk homepage SaaS tradisional (Hero → Feature Cards → Testimonial → Pricing → CTA).
Untuk konsep ini, **landing page harus menjadi first session produk.** User boleh membaca sebelum mendaftar, melihat tone komunitas secara langsung, lalu menulis ketika merasa siap.

### Information Architecture:
```text
┌───────────────────────────────────────────────────────────┐
│ coret.                           tentang   aturan   masuk  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│          ada yang ingin kamu keluarkan?                   │
│                                                           │
│   tempat buat bilang hal-hal yang selama ini              │
│   cuma ada di kepala.                                     │
│                                                           │
│   ┌───────────────────────────────────────────────────┐   │
│   │ tulis sesuatu...                                  │   │
│   │                                                   │   │
│   │                                                   │   │
│   │ Tanpa nama ▾                     [ lanjutkan → ]   │   │
│   └───────────────────────────────────────────────────┘   │
│                                                           │
│   nama tidak wajib · kamu bisa hapus · ada moderasi       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│   apa yang sedang orang-orang pikirkan?                   │
│                                                           │
│   [ terbaru ] [ acak ] [ kerja ] [ cinta ] [ hidup ]      │
│                                                           │
│   ┌───────────────────────────────────────────────────┐   │
│   │ tanpa nama · 8 menit lalu                         │   │
│   │                                                   │   │
│   │ akhir-akhir ini aku ngerasa semua orang bergerak  │   │
│   │ maju dan aku masih ada di tempat yang sama.       │   │
│   │                                                   │   │
│   │ ♡ aku dengerin 18       7 balasan        bagikan │   │
│   └───────────────────────────────────────────────────┘   │
│                                                           │
│   ┌───────────────────────────────────────────────────┐   │
│   │ senja · 23 menit lalu                            │   │
│   │ ternyata hari ini gak seburuk yang aku kira.      │   │
│   │ ...                                               │   │
│   └───────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────────┤
│   anonim bukan berarti tanpa tanggung jawab               │
│   [ bagaimana anonimitas bekerja ] [ aturan ruang ini ]   │
├───────────────────────────────────────────────────────────┤
│                    tulis yang ada di kepalamu             │
│                         [ mulai menulis ]                  │
└───────────────────────────────────────────────────────────┘
```

### Visual Direction:
* **Palette:**
  * `--paper`: `#F7F4EE`
  * `--surface`: `#FFFDF8`
  * `--ink`: `#1D1B18`
  * `--muted`: `#6B625A`
  * `--accent`: `#5A46D6`
  * `--accent-soft`: `#E8E3FF`
  * `--danger`: `#8A2D2D`
  * `--border`: `#DDD7CE`
* **Typography:** `Plus Jakarta Sans` (UI & body text) dan `Instrument Serif` / `Fraunces` (headlines).
* **Accessibility:** Standar WCAG 2.2 AA (kontras rasio minimal 4.5:1 untuk teks normal).

---

## Alur interaksi inti (Core Interaction Flows)

* **Browsing:** Bebas membaca feed tanpa perlu izin atau login.
* **Posting:** Composer berada tepat di landing page. Pengguna dapat memilih mode identitas (`tanpa nama` vs `nama samaran`), kontrol balasan (`boleh dibalas` vs `cukup didengar`), dan tag konten sensitif (*content warning*).
* **Just-in-Time Onboarding:** Saat pertama kali menerbitkan tulisan, tampilkan konfirmasi ringkas 3 aturan ruang.
* **Replies:** Thread dangkal (maksimal 2 level). Menghindari debat bercabang liar.
* **Deletion & Ownership:** Kunci pemulihan/hapus acak berbasis hash (`hash(recovery_token)`) disimpan di server, token mentah disimpan secara lokal di perangkat pengguna.

---

## Moderasi, Privasi, & Kepatuhan Regulasi

### Skema Moderasi Bertingkat:
1. **Penyaringan Deterministik:** Deteksi spam otomatis, filter tautan berbahaya, dan regex PII (doxxing).
2. **Pengelompokan Risiko (Risk Triage):** Menilai keparahan pelanggaran (ringan, sedang, kritis).
3. **Penanganan Krisis:** Konten kesedihan emosional/distress diarahkan ke sumber bantuan resmi Indonesia (**Healing119 / 119 ext 8**), bukan dihapus otomatis.
4. **Moderasi Manusia & Banding (Appeals):** Kasus abu-abu atau laporan pengguna ditinjau oleh tim manusia.

### Kepatuhan Hukum Indonesia:
* **UU PDP No. 27/2022:** Perlindungan data kesehatan, emosi, dan data spesifik anak. Larangan keras mencatat isi teks mentah ke logging atau analitik umum.
* **Permenkominfo No. 5/2020 & No. 10/2021:** Fasilitas pelaporan publik dan kepatuhan batas waktu penanganan konten terlarang.
* **PP TUNAS & Permenkomdigi No. 9/2026:** Mitigasi risiko bagi anak dan pembatasan usia pengguna.
