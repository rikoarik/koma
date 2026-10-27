# Koma Episode 02 — "Pesan yang Nggak Pernah Terkirim"
## Production & Creative Specification

### 1. Overview & Goal
- **Title**: Pesan yang Nggak Pernah Terkirim (Episode 02)
- **Concept**: A 19.0-second film capturing the universally recognizable experience of typing a long, honest message, hesitating, rereading it, and deleting it completely.
- **Narrative Arc**:
  1. *Beat 1 (0.0s – 3.8s)*: The Relatable Hook — Rapid typing on an editorial draft paper, heavy words accumulating ("Pernah ngetik panjang... terus dihapus semua?").
  2. *Beat 2 (3.8s – 9.1s)*: Hesitation, Sigh & The Backspace — Freezing on the blinking cursor, reread, physical strikethrough, stamp `[ DIHAPUS ]`, and deletion dissolve ("Udah ditulis, dibaca ulang, (sigh) nggak jadi dikirim.").
  3. *Beat 3 (9.1s – 13.7s)*: Floating Unsent Thoughts — The shredded fragments drift in negative space. "Padahal masih pengen cerita, cuma bingung ke siapa."
  4. *Beat 4 (13.7s – 19.0s)*: Koma as Sanctuary — The pieces dock into an authentic anonymous post card; the iconic Koma violet comma `,` emerges with the verified domain. "Koma. Cerita apa aja, tanpa harus kirim ke siapa-siapa."
- **Output**: 1080 × 1920, 30 FPS, H.264 (High Profile, YUV420p) + AAC Stereo 48kHz.
- **Duration**: 19.0 seconds (570 frames).

### 2. Visual System & Typography
- **Palette**:
  - Paper Ground: `#F7F4EE` (authentic warm textured paper)
  - Card Fill: `#FAF8F5`
  - Charcoal Ink: `#1D1B18`
  - Muted Ink: `#36322D`
  - Secondary Ink: `#5C564E`
  - Koma Signature Violet: `#5A46D6`
  - Violet Ink Accent: `#3F2EA6`
  - Border: `#CBC3B5`
- **Fonts**:
  - `Koma Serif`: Georgia (Regular, Bold, Italic) — literary weight, honest editorial presence.
  - `Koma Mono`: Courier New (Regular, Bold) — raw typewriter, drafted thoughts, timestamps, metadata.
- **Scale**:
  - Hero Headlines: 92px – 130px, tracking -3.5px to -6px.
  - Subheads & Body: 42px – 52px, line-height 1.25 – 1.38.
  - Captions: 42px – 48px Courier / Georgia hybrid inside high-contrast badge.
  - Metadata / Badges: 28px monospace uppercase.
- **Safe Area Enforcement**:
  - Action Safe: 1080×1920 with x ∈ [110, 970], y ∈ [180, 1300].
  - Essential copy strictly avoids the top status bar (y < 180) and TikTok UI footer / action rail (y > 1300, x > 970).

### 3. Motion Language & Physics
- **Deterministic GSAP Timelines**: Seekable, frame-accurate, zero random jitter, strictly driven by timeline frame index.
- **Physicality of Language**:
  - Typewriter keystroke accumulation with blinking cursor.
  - Dark selection sweep and strikethrough marker animation.
  - Bold rubber stamp slam `[ DIHAPUS ]`.
  - Rapid reverse character backspace deletion into empty space.
  - Floating paper scraps drifting gently with subtle sine oscillation.
  - Magnetic reassembly into Koma post card using smooth cubic ease (`power3.out`).

### 4. Audio Architecture
- **Voiceover**: MiniMax `speech-2.8-hd` (Preset: *Cute Girl - Crisp, Engaging*, intonation tuned with natural breath/sigh at beat 2 hesitation). Conversational, intimate, empathetic, zero corporate posture.
- **Music Bed**: Kevin MacLeod's recording of Erik Satie's *Gymnopedie No. 1* (solo acoustic piano, D major, 77 BPM), softened with high-shelf EQ, ducked to -18dB under dialogue, 19.0s length with smooth fade-out.
- **Tactile Foley**:
  - Mechanical switch keystrokes & spacebar on typing (`typing.mp3`).
  - Selection click and distinct mechanical backspace tap on deletion (`click-soft.mp3`, `BACKSPACE.mp3`).
  - Soft paper whooshes on scene transitions (`whoosh-short.mp3`).
  - Tactile pop on scrap reveals (`pop.mp3`).
  - Warm sub-bass impact (`impact-bass-1.mp3`) on the closing brand lockup.
