# PLAN_BUGFIX_TIER1.md — Perbaikan Bug Tier 1

Tanggal: 2026-08-22
Sumber temuan: Review Tier 1 (sticky chip, cache duplikat, badge density)

## BUG-1 — Chip kategori tertutup Header (HIGH)
**Lokasi:** `src/routes/+page.svelte` — `<div class="sticky top-[60px]">`
**Penyebab:** Header tinggi dinamis (~69px tanpa Diperbarui, ~84px di home dengan Diperbarui). Nilai magic `60px` 9–24px terlalu kecil → chip terselip di bawah header (header z-10 > chip z-9).
**Dampak:** Saat scroll, bar kategori hilang/terpotong.
**Fix:** Ukur tinggi header real-time, set CSS var `--header-h`, chip pakai `style="top: var(--header-h)"`. Fallback 72px. Ubah z-order: chips z tetap di bawah header blur agar header tetap dominan.
**File:** `Header.svelte` (ukur + set var), `+page.svelte` (pakai var)
**Verifikasi:** Scroll home, chip tetap tepat di bawah header tanpa overlap (inspect visual / curl HTML check var).

## MINOR-2 — Cache duplikat untuk feed identik (LOW)
**Lokasi:** `rssSource.ts` — `nasional` Detik = URL headline yang sama tapi key cache beda (`rss:detik` vs `rss:detik:nasional`).
**Dampak:** Fetch + simpan dobel, buang memori (kecil).
**Fix:** Jika `categories[cat] === feedUrl` maka reuse `fetchTop` cache key (`rss:{id}`) alih-alih `rss:{id}:{cat}`.
**File:** `rssSource.ts`
**Verifikasi:** `curl /?kategori=nasional` vs `/` share cache entry (log atau timing).

## MINOR-3 — Badge BARU terlalu ramai (LOW)
**Lokasi:** `time.ts` `isNew < 60m` → 29 badge sekaligus di home.
**Dampak:** Kosmetik, Red badge kehilangan makna urgensi.
**Fix:** Turun threshold ke 30 menit.
**File:** `time.ts`
**Verifikasi:** Home badge count turun signifikan.

## Langkah Eksekusi
1. Tulis PLAN_BUGFIX_TIER1.md (file ini)
2. Patch BUG-1: Header + +page.svelte
3. Patch MINOR-2: rssSource.ts
4. Patch MINOR-3: time.ts
5. `npm run check` + `npm run build` (0 error/warning)
6. Preview test: curl home, kategori, detail
7. Commit `fix(tier1): BUG-1 sticky + cache dedup + badge 30m`
