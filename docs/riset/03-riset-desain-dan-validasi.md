# Riset Desain dan Validasi Platform “Nongkrong” Teks Anonim: Membuat Orang Asing Mau Berinteraksi dan Kembali

## Ringkasan eksekutif

Masalah utama platform seperti ini **bukan produksi konten**. Orang relatif mudah diberi kotak teks untuk menulis. Masalah tersulit adalah memastikan setiap tulisan memperoleh cukup peluang untuk **dilihat, dibalas, dan menghasilkan hubungan sosial mikro** sebelum penulis kehilangan alasan untuk kembali.

Studi klasik terhadap 2.777 pendatang baru (*newcomers*) di komunitas online menemukan bahwa pengguna yang memperoleh balasan pada postingan pertamanya memiliki probabilitas kembali menulis yang signifikan lebih tinggi (naik dari 44% menjadi 56%). Penelitian tahun 2026 terhadap lebih dari 91.000 post komunitas kesehatan mental kembali menempatkan *time-to-first-reply* sebagai faktor paling krusial pada retensi *peer-support communities*.

Oleh karena itu:
**North Star produk bukan jumlah coretan, melainkan proporsi coretan yang berhasil memperoleh hubungan manusia yang sehat.**

```text
Alur yang Benar:

Seseorang punya sesuatu di kepala
      ↓
Berani menuliskannya
      ↓
Ada orang asing yang benar-benar membaca
      ↓
Mendapat respons yang layak
      ↓
Merasa "oh, ternyata ada orang di sini"
      ↓
Besok dia kembali
      ↓
Kali ini mungkin dia yang mendengarkan orang lain
```

### 4 Kuadran Kondisi Pengguna:
```text
              ingin bicara
                  ↑
                  │
        writer    │    conversationalist
                  │
sendiri ──────────┼────────── ingin orang lain
                  │
        reader    │    listener
                  │
                  ↓
              ingin membaca
```
1. **Writer:** Membutuhkan rasa aman untuk mengeluarkan isi kepala tanpa takut dihakimi.
2. **Listener:** Membutuhkan cara mudah menemukan tulisan yang layak dibalas tanpa tersesat di tumpukan spam.
3. **Reader (Lurker):** Membutuhkan feed yang menarik dan bermakna meskipun memilih tidak pernah menulis.
4. **Conversationalist:** Membutuhkan kontinuitas dan atmosfer komunitas yang konsisten.

---

## 6 Eksperimen Validasi Utama

| Eksperimen | Hipotesis | Desain Pengujian | Metrik Utama | Kriteria Keberhasilan |
|---|---|---|---|---|
| **Landing: Product-First** | Melihat coretan nyata + composer lebih efektif daripada marketing hero konvensional | Variant A: Hero marketing biasa<br>Variant B: Composer + live feed langsung | Meaningful activation rate | Variant B meningkatkan interaksi baca/tulis $\ge 20\%$ |
| **Guest-First Posting** | Kewajiban signup sebelum posting mematikan impuls katarsis seketika | Variant A: Signup wajib di depan<br>Variant B: Tulis langsung sebagai tamu, akun opsional nanti | Draft $\rightarrow$ Publish rate | Variant B meningkatkan konversi terbit $\ge 25\%$ tanpa merusak retensi D7 |
| **Zero-Reply Routing** | Merutekan perhatian ke posting tanpa balasan mengurangi rasa "bicara sendiri" | Control: Feed murni kronologis<br>Treatment: Boost coretan tanpa balasan + antrean *listener* | Supported Coretan Rate (SCR 24h) | Zero-reply rate turun $\ge 30\%$ dan median waktu balasan pertama $< 60$ menit |
| **Post $\rightarrow$ Listen Loop** | Penulis dapat dikonversi menjadi pendengar tepat setelah posting | Setelah terbit: Opsi A: Feed normal; Opsi B: Tampilkan 1 posting yang belum dibalas | Writer $\rightarrow$ Reply conversion | Opsi B menghasilkan konversi balas $\ge 20\%$ tanpa memicu balasan toksik |
| **Opportunity Feed vs Engagement Feed** | Distribusi berbasis peluang perhatian menghasilkan komunitas yang lebih sehat daripada metrik klik | Feed A: Berbobot like/view populer<br>Feed B: Freshness + unanswered + topik beragam | Coverage & retensi jangka panjang | Cakupan tulisan yang mendapat balasan naik $\ge 20\%$, laporan pelanggaran tidak naik |
| **Ritual & Notifikasi Relasional** | Retensi didorong oleh rasa memiliki tempat dan hubungan manusiawi, bukan streak gamifikasi | Model A: Notifikasi balasan saja<br>Model B: Notifikasi balasan + ritual malam opt-in | D7 / WAU return | Kenaikan retensi D7 $\ge 15\%$ tanpa memicu kenaikan unsubscribe |

---

## Formula Perangkingan Feed (Opportunity-Based Ranking)

Pada fase awal, hindari machine learning hitam yang kompleks. Gunakan skoring deterministik berbasis peluang perhatian:

$$\text{Score} = F + U + N + D + Q - S - O$$

* **$F$ (Freshness):** Bobot kebaruan waktu pembuatan ($+0 \dots 40$).
* **$U$ (Unanswered Opportunity):** Bobot tinggi untuk tulisan tanpa balasan setelah 10 menit ($+25$), atau baru memiliki 1 balasan ($+15$).
* **$N$ (Novelty & Serendipity):** Bobot eksplorasi acak ($+0 \dots 12$).
* **$D$ (Diversity Bonus):** Bobot keberagaman topik agar feed tidak monoton ($+10$).
* **$Q$ (Quality Eligibility):** Verifikasi dasar kelayakan teks.
* **$S$ (Safety Penalty):** Penalti skor untuk potensi spam / risiko moderasi ($-\infty$ jika kritis).
* **$O$ (Overexposure Penalty):** Penalti untuk posting yang sudah menerima banyak balasan ($5+$ balasan: $-10$, $10+$ balasan: $-20$).

---

## Dashboard Harian yang Wajib Dipantau Solo Developer

```text
┌───────────────────────────┬─────────────────────────────┐
│ CONNECTION                │ RETENTION                   │
│                           │                             │
│ Posts Today        438    │ Writer D1          38%     │
│ Supported 1h        52%   │ Writer D7          21%     │
│ Supported 24h       79%   │ Listener D7        28%     │
│ Zero Reply          21%   │ Return after reply  47%    │
│ Median first reply  31m   │                             │
├───────────────────────────┼─────────────────────────────┤
│ COMMUNITY                 │ SAFETY                      │
│                           │                             │
│ Replies/post        2.4   │ Reports / 1k       4.1     │
│ Active listeners    119   │ Severe / 1k        0.4     │
│ Reader→reply       8.3%   │ Confirmed           36%    │
│ Writer→listener   18.2%   │ Review median       14m    │
└───────────────────────────┴─────────────────────────────┘
```

Pertanyaan terpenting yang wajib dijawab setiap pagi bukan *"Berapa banyak pengunjung baru?"*, melainkan:
> **"Berapa orang kemarin yang memberanikan diri menulis sesuatu, tetapi tidak ada seorang pun yang datang mendengarkan?"**
