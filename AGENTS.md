# Project Rules & Guidelines (`coret.` / `koma`)

## 1. Strict Zero-Fallback Credential Policy (CRITICAL SECURITY)
- **DILARANG KERAS / STRICTLY FORBIDDEN**: Never provide fallback defaults for secret credentials or administrative passwords (e.g., `process.env.ADMIN_PASSWORD || 'default_password'`).
- **Prinsip Fail-Closed**: Jika variabel lingkungan (`ADMIN_PASSWORD`, API keys, secrets) tidak diset atau kosong, sistem **WAJIB** menolak akses sepenuhnya (`return false`, status 500/401, security error log).
- **Alasan**: CWE-798 (Use of Hard-coded Credentials). Default password dalam codebase adalah kerentanan keamanan fatal. Kredensial hanya boleh disuntikkan murni melalui environment variable server.

## 2. Batasan Ruang Lingkup (Scope Boundaries)
- **Situs Publik (`/`, `/jelajah`, `/coretan/[id]`, `/dukung`, dll.)**:
  - DILARANG mengubah desain editorial-zine, tekstur kertas (`paper-grain`), tipografi vintage, layout grid, dan estetika analog publik.
- **Admin Dashboard (`/admin`, `/api/admin/*`)**:
  - Beroperasi di antarmuka SaaS modern berdensitas tinggi (`#admin-panel-root`), warna netral Slate/Zinc.
  - Gunakan visualisasi SVG terukur dan komponen data dense.

## 3. Kejujuran Data & Privasi (Real Analytics Only)
- Dilarang membuat metrik palsu, bot tiruan, atau persentase pertumbuhan fiktif.
- Jika data telemetri tertentu (seperti device/browser fingerprinting) tidak dilacak demi kepatuhan UU PDP No. 27/2022, tampilkan status kosong yang jujur (*honest empty state*).
