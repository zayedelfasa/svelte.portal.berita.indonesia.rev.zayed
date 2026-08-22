# Plan: On

Review Tier 1 — posisi saat ini:

## 1. Yang belum dikerjakan

**Fase A — Badge BARU + waktu berjalan + refresh**
- [x] `clock.svelte.ts` + `time.ts`
- [ ] `Header` — belum: baris "Diperbarui X lalu" + tombol 🔄 + ikon 🔍 search
- [ ] `NewsItem` — belum: badge BARU + waktu `clock.now`
- [ ] `ArticleView` — belum: waktu berjalan
- [ ] `+layout.svelte` — belum: start ticker interval
- [ ] `+page.server.ts` home & `media/[source]` — belum: `fetchedAt`

**Fase B — Pencarian**
- [ ] `src/routes/cari/+page.server.ts` — belum dibuat
- [ ] `src/routes/cari/+page.svelte` — belum dibuat

**Fase C — Tab kategori**
- [x] Verifikasi endpoint — selesai
- [x] `types.ts` + `categories.ts` + `aggSource`/`rssSource` rewrite
- [x] Adapter 6/11: `cnn`, `antara`, `detik`, `cnbc`, `tempo`, `republika`
- [ ] Adapter 5/11 belum: `okezone` (belum update kategori), `inews` (belum: 6 feed RSS), `kumparan` (file salah import — `makeRssSource` import tapi pakai `makeAggregatorSource`), `jpnn`, `mediaindonesia` (keduanya masih tanpa kategori — perlu konfirmasi tetap tanpa kategori)
- [ ] `config/sources.ts` — belum: spread adapter baru (`fetchDetikAdapter` vs `fetchDetik` — nama export mismatch, akan error kompilasi)
- [ ] `home +page.server.ts` — belum: param `?kategori=` + `allSettled` per kategori + `unsupported` count
- [ ] `home +page.svelte` — belum: chip bar sticky
- [ ] `baca/+page.server.ts` — belum: multi-pool lookup (general + kategori) untuk anti-404
- [ ] `PLAN_TIER_1.md` — belum: append tabel hasil verifikasi
- [ ] `build` + `svelte-check` + preview test + commit — belum

## 2. Yang belum di-review

Semua file yang ditulis **setelah review terakhir** (belum pernah di-check):

| File | Masalah potensial |
|---|---|
| `types.ts` | Baru — CategoryId + SourceAdapter, perlu cek tidak ada circular |
| `categories.ts` | Baru — isCategoryId |
| `aggSource.ts` | Rewrite — cache key `agg:id:cat`, fallback hanya headline, perlu cek |
| `rssSource.ts` | Rewrite — sama, categories via `rss:id:cat` |
| `antara.ts` | Switch ke `makeRssSource` — benar (terverifikasi), tapi export name `fetchAntaraAdapter` mismatch dengan `sources.ts` lama |
| `detik.ts` | Baru — 6 kanal RSS, export name mismatch |
| `cnbc.ts` | Baru — 4 kategori, mismatch |
| `tempo.ts` | Baru — 5 kategori |
| `republika.ts` | Baru — 4 kategori |
| `cnn.ts` | Baru — 6 kategori |
| `kumparan.ts` | **Bug** — import `makeRssSource` tapi pakai `makeAggregatorSource` → build gagal |

Belum di-review = belum `build`/`svelte-check`, jadi error di atas belum tertangkap.

**Next:** perbaiki `kumparan.ts` + tulis 5 adapter sisa + `sources.ts` + semua route/komponen di atas, baru verifikasi.
