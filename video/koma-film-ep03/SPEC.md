# Koma Episode 03 — "Isi Kepala Jam 2 Pagi"
## Production & Creative Specification

### 1. Overview & Objective
- **Campaign**: Koma Episode 03 — "Isi Kepala Jam 2 Pagi"
- **Creative Concept**: A humorous, 26.0-second internet-native film exploring the absurd digital archive inside someone's head that replays mortifying, 8-year-old memories right when they are trying to fall asleep.
- **Tone**: Absurd, playful, relatable, dry humor, fast-paced editorial collage.
- **Duration**: 26.0 seconds (780 frames @ 30 FPS).
- **Format**: 1080 × 1920 (9:16 vertical), H.264 High Profile (yuv420p) + AAC Stereo 48,000 Hz.

### 2. Narrative Structure & Beats
1. **Beat 1: Midnight Clock & Brain Glitch (0.0s – 5.5s)**:
   - Voice: *"Jam 2 pagi. Baru aja mau tidur... terus tiba-tiba keinget..."*
   - Visual: Vintage midnight clock `02:00 AM` glowing softly, `[ MODE TIDUR: 98% MEREM ]`. Suddenly, a red terminal alert pops up: `SYS_BRAIN // MEMORY_RECALL > File: insiden_dadah_salah_orang.dat`. Fast tape rewind seek.
2. **Beat 2: The Waving Incident Flashback (5.5s – 13.5s)**:
   - Voice: *"Waktu gue dadah balik ke seseorang... padahal... dia lagi dadah ke orang di belakang gue."*
   - Visual: Bossa music kicks in. Vintage case file card: animated waving hand `(^_^) / DADAH!` with 100% confidence. At "padahal...", the hand freezes dead in mid-air on a vinyl record scratch. An arrow arcs behind to reveal the actual recipient: `"Orang di belakang gue."` Cringe rubber stamp slams down: `[ SALAH ORANG ]`.
3. **Beat 3: Brain Storage Absurdity (13.5s – 20.0s)**:
   - Voice: *"Itu kejadian 8 tahun lalu loh. Hah... Kok otak gue masih nyimpen beginian sih?"*
   - Visual: Storage breakdown diagnostic meter: Rumus SMA (0.1%), Password Email (1.2%), Momen Dadah Salah Orang (98.7% Memenuhi Memori). Exhaling sigh cloud pops on "Hah...".
4. **Beat 4: Unloading into Koma (20.0s – 26.0s)**:
   - Voice: *"Ya udah, gua tulis di Koma aja. Siapa tahu ada yang lebih malu dari gue."*
   - Visual: Upbeat bossa returns. The cringe file cleanly transforms into an authentic Koma anonymous post card (`tanpa nama • 02:14 AM • #cringe-malam`, 420 relate, 189 ketawa). Official brand reveal: violet comma logo, `koma,`, and verified URL `ruangkoma.web.id` with tagline *"Bongkar isi kepala lu. Biar bisa tidur nyenyak."*

### 3. Safe Area & Typography
- **Safe Zone**: Action and title safe inside $x \in [110, 970]\text{ px}$, $y \in [180, 1300]\text{ px}$.
- **Typography Floor**: Strictly $\ge 28\text{px}$ across all mobile text.
- **Palette**: Paper ground `#F7F4EE`, card `#FAF8F5`, ink `#1D1B18`, muted `#5C564E`, Koma violet `#5A46D6`, alert `#DC2626`.

### 4. Audio Architecture
- **Voiceover**: Authoritative young-adult Indonesian narration from uploaded MiniMax master (`voiceover-master.mp3`).
- **Foley & Music**:
  - Mechanical clock ticking (`clock-ticks.mp3`)
  - Midnight room ambience (`night-ambience.mp3`)
  - Tape rewind seek (`rewind-archive.mp3`)
  - Quirky memory bossa (`music-memory.mp3`)
  - Vinyl record scratch comedic stop (`record-scratch.mp3`)
  - Awkward silence cricket chirp (`cricket-chirp.mp3`)
  - Facepalm comedic thud (`facepalm-thud.mp3`)
  - Upbeat outro bossa (`music-outro.mp3`)
  - Warm bass impact on brand settle (`impact-bass-1.mp3`)
