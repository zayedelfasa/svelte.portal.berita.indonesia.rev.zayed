# PLAN_BUGFIX_TIER2.md — Perbaikan Bug Tier 2

Tanggal: 2026-08-22
Sumber temuan: Review Tier 2 (read-only)

## Ringkasan
Review menyeluruh Tier 2 (A–F) menemukan **1 bug perlu perbaikan**, sisanya false-positive/acceptable.

---

## BUG-1 — Toast tidak terlihat di dark mode (MEDIUM)
- **Lokasi:** `src/lib/components/Toast.svelte:5`
- **Kode saat ini:**
  ```svelte
  <div class="fixed ... bg-gray-900 ... text-white">
  ```
- **Penyebab:** Di dark mode, background `bg-gray-900` hampir sama dengan `neutral-900` frame → kontras rendah.
- **Dampak:** Toast "Link disalin ✓" tak terbaca saat dark mode aktif.
- **Fix:** Tambah `dark:bg-white dark:text-neutral-900`.
- **Verifikasi:** Toggle dark mode → klik Bagikan → toast putih kontras.

## BUG-2 — invalidateCache kategori (DITARIK, bukan bug)
- Awal dikira prefix tidak match kategori, ternyata `k.startsWith(prefix + ':')` sudah benar untuk `agg:tempo:nasional`.

## BUG-3 — $effect local = result di SourceSection (EDGE CASE, diterima)
- Setelah retry sukses, effect akan menimpa `local` saat props server berubah (invalidateAll). Perilaku benar sesuai Svelte runes.

## MINOR-5 — Halaman 404 fallback light-only (KOSMETIK, tunda)
- Fallback `+error.svelte` bawaan SvelteKit belum di-dark-kan. Tidak menghalangi Tier 2; masuk Tier 3 jika perlu.

## Langkah Eksekusi
1. Tulis PLAN_BUGFIX_TIER2.md (file ini)
2. Patch `Toast.svelte`
3. `npm run check` + `npm run build`
4. Preview curl verify (toast HTML mengandung dark:*, build ✔)
5. Commit `fix(tier2): toast dark mode`
