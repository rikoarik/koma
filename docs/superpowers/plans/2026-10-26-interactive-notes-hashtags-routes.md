# Dynamic Catatan Tempel, In-Text Hashtags, & Core Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static "Pojok Catatan Tempel Harian" into an automated dynamic live component driven by top daily posts, streamline post creation with in-text hashtag extraction, and build essential routes (`/coretan/[id]`, `/tentang`, `/aturan`, `/privasi`, `/dukung`).

**Architecture:**
- Frontend: Next.js 14 App Router, Tailwind CSS, Lucide icons.
- State & Storage: Existing local DB / Supabase storage layer with time-decay engagement scoring.
- In-Text Hashtag: Regex parser extracting `#hashtag` from textarea content on backend & quick clickable chip presets on frontend.
- Dynamic Sticky: Fetches top resonant posts from `/api/posts?filter=hangat` to display real community voices in "Pojok Catatan Tempel Harian".

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React.

**Spec:** Chat design brief approved by user ("terserah rekomendasimu").

## Global Constraints
- WCAG 2.2 AA contrast compliance on `--paper` (#F7F4EE) and `--ink` (#1D1B18).
- Current brand name is koma. Keep the name consistent in UI copy.
- No public vanity metrics (no follower counts, no public like counts).
- Mobile-first responsive design.

---

### Task 1: In-Text Hashtag Auto-Extraction & Composer Streamlining
**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/app/api/posts/route.ts`
- Modify: `src/lib/storage.ts`
- Modify: `src/components/feed/ComposerModal.tsx`

- [ ] Add `extractTopicFromContent(content: string): string` helper in `src/lib/validation.ts` using regex `/#([a-zA-Z0-9_\-]+)/`.
- [ ] Update `src/app/api/posts/route.ts` to automatically extract the topic from `content` if not specified or override with in-text hashtag.
- [ ] Update `src/components/feed/ComposerModal.tsx`:
  - Remove the select dropdown for "Topik Coretan".
  - Add quick-click hashtag chips (`#isi-kepala`, `#tengah-malam`, `#cerita-kecil`, `#tanya-tanpa-nama`, `#visual-zine`) below textarea that insert the tag at the end of the text.
- [ ] Verify creation of post with hashtag in text (e.g. `Malam ini dingin #tengah-malam`) tags it as `tengah-malam`.

### Task 2: Live Dynamic "Pojok Catatan Tempel Harian"
**Files:**
- Modify: `src/components/scrollcraft/CollageInteractive.tsx`

- [ ] In `src/components/scrollcraft/CollageInteractive.tsx`:
  - Fetch top engaging posts via `/api/posts?filter=hangat` on mount.
  - Fallback gracefully to curated inspirational thoughts if no posts are returned.
  - Keep copy consistent with the current koma brand.
  - Make "Ganti Catatan" cycle through the live resonant posts with smooth transitions.
- [ ] Test the component by verifying it displays live posts and rotates on button click.

### Task 3: Post Detail Permalink Page (`/coretan/[id]`)
**Files:**
- Create: `src/app/coretan/[id]/page.tsx`
- Modify: `src/components/feed/PostCard.tsx` (add direct permalink link or button)

- [ ] Create `src/app/coretan/[id]/page.tsx` with:
  - Header with back navigation to `/`.
  - Full single-post card view with paper styling.
  - Complete replies thread and reply input.
  - Share link button (copies URL to clipboard).
- [ ] Update `PostCard.tsx` to include an option/link to open `/coretan/[id]`.
- [ ] Test navigation and permalink rendering.

### Task 4: Informational Brand Pages (`/tentang`, `/aturan`, `/privasi`, `/dukung`)
**Files:**
- Create: `src/app/tentang/page.tsx`
- Create: `src/app/aturan/page.tsx`
- Create: `src/app/privasi/page.tsx`
- Create: `src/app/dukung/page.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] Create `src/app/tentang/page.tsx` explaining koma's ethos: Digital Zine, Paper After Midnight, anonymous-first.
- [ ] Create `src/app/aturan/page.tsx` detailing community guidelines (3 aturan ruang, anti-doxxing, safe space).
- [ ] Create `src/app/privasi/page.tsx` explaining PDP compliance, zero-tracking, client-side delete secret.
- [ ] Create `src/app/dukung/page.tsx` supporting coffee donations (connect to `/api/donations` and QRIS/Trakteer).
- [ ] Update `Navbar.tsx` and `Footer.tsx` links to point to these new pages.

### Task 5: Build Verification & Testing
- [ ] Run `npm run build` to verify all new routes compile statically and dynamically with no type errors.
- [ ] Verify dev server is running and all pages load with 200 HTTP status.
