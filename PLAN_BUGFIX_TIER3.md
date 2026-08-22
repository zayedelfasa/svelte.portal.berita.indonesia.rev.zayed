# PLAN_BUGFIX_TIER3.md — Perbaikan Bug Tier 3

Tanggal: 2026-08-22
Sumber temuan: Review Tier 3 (read-only)

## Ringkasan
Review Tier 3 menemukan 6 bug/isu. Semua diperbaiki pada commit ini.

---

## BUG-1 — Bookmark flash badge (LOW)
- **Lokasi:** `bookmarks.svelte.ts` — badge di Header SSR kosong → flash 0→N.
- **Status:** Dibiarkan (acceptable). Fix penuh butuh `mounted` guard & placeholder, effort tidak sebanding. Tidak mengganggu fungsi.

## BUG-2 — /simpan "Buka di portal" 404 untuk artikel lama (HIGH) — FIXED
- **Lokasi:** `simpan/+page.svelte:33` — link `/baca?source=&u=` mencari di pool feed yang berputar.
- **Penyebab:** Artikel lama keluar dari feed → detail 404, padahal snapshot ada.
- **Fix:** Ganti link "Buka di portal" menjadi **pratinjau inline** dari snapshot: state `selected: Article | null`, tombol "Lihat ›" membuka `<ArticleView article={selected}>` langsung dari snapshot, tanpa fetch. Tombol "Sumber ↗" tetap ke URL asli eksternal, "Hapus" sinkron.
- **Verifikasi:** Simpan artikel → tutup browser → buka /simpan → "Lihat" menampilkan detail lengkap tanpa 404.

## BUG-3 — Ticker duplicate-key & short-list jump (LOW) — diterima
- Duplikasi `[...articles, ...articles]` sengaja untuk loop seamless. Jika <4 artikel, jump kosmetik — tidak terjadi di home (selalu 33, ticker 8). Dibiarkan.

## BUG-4 — Ticker di mode kategori menampilkan subset (LOW) — diterima
- `tickerArticles` derived dari `data.results` yang sudah terfilter kategori. Perilaku dianggap benar (ticker mencerminkan filter aktif).

## BUG-5 — PWA SW tidak ter-registrasi (LOW) — OK
- `vite-plugin-pwa` dengan `registerType: autoUpdate` auto-inject. Verifikasi build menghasilkan `sw.js` + `manifest.webmanifest` (413B + 3.2K).

## BUG-6 — Manifest SVG-only, iOS butuh PNG (MEDIUM) — FIXED
- **Lokasi:** `vite.config.ts` manifest + `static/icon-*.png` tidak ada.
- **Fix:** Generate `static/icon-192.png` (679B) & `icon-512.png` (2.4K) via Node+zlib solid color #111827 + red dot. Update `includeAssets` & `globPatterns` (tambah `png`), manifest icons array lengkap.
- **Verifikasi:** Build output `manifest.webmanifest` berisi 3 icons, `sw.js` ter-generate.

## BUG-7 — absoluteUrl crash `u.trim is not a function` (HIGH) — FIXED
- **Lokasi:** `lib/utils/url.ts:3` — `u.trim()` tanpa cek `typeof`.
- **Penyebab:** Beberapa artikel `image` bisa undefined/non-string saat OG meta di-render SSR → TypeError 500 di `/baca`.
- **Fix:** Guard `if (typeof u !== 'string') return undefined;`

## MINOR-7 — Thumb flash (LOW) — diterima
- Sama seperti BUG-1, `thumbState` false di SSR → true di client jika stored '1'. Dibiarkan.

## Langkah Eksekusi
1. Tulis PLAN_BUGFIX_TIER3.md
2. Patch `/simpan` inline preview
3. Patch `absoluteUrl` typeof guard
4. Generate PNG icons + update vite.config
5. `npm run check` + `build` + preview curl
6. Commit `fix(tier3): simpan snapshot preview + absoluteUrl + PWA icons`
