# PLAN_TIER_2.md — Poles Pengalaman Pakai

> Prasyarat: Tier 1 fase A (ticker waktu) sudah jalan — beberapa fitur di sini memakainya.
> Isi: **A) Skeleton loading · B) Retry per-section · C) Tombol share · D) Meta OG dinamis · E) Chip filter sumber · F) Dark mode**.
> Urutan eksekusi disarankan sesuai abjad fase (A paling dulu).
>
> Semua fitur TETAP dalam batas portal berita — tanpa API baru.

---

## Fase A — Skeleton loading

### Masalah
Navigasi client-side & refresh memperlihatkan kedip kosong sebelum data datang.

### Spesifikasi
- Komponen `SkeletonSection.svelte` (baris header palsu + 3 baris teks berkedip, `animate-pulse`)
- Di home & `/media/*`: saat `$app/state.navigating === true` → render 3–11 skeleton section menggantikan konten
- Refresh tombol (Tier 1-A) ikut memakai skeleton

### File
| File | Aksi |
|---|---|
| `src/lib/components/SkeletonSection.svelte` | baru |
| `src/routes/+page.svelte`, `src/routes/media/[source]/+page.svelte` | revisi (branch navigating) |

---

## Fase B — Retry per-section (tanpa reload semua)

### Masalah
Satu sumber gagal → satu-satunya jalan = reload seluruh halaman.

### Spesifikasi
- Endpoint baru: **`GET /api/source/[id]`** (`+server.ts`) → jalankan fetchTop satu sumber, kembalikan `{ sourceId, name, ok, articles }`; param `?force=1` membersihkan entri cache sumber itu dulu
- Section gagal menampilkan tombol **"Coba lagi"** → fetch endpoint → hasil menimpa state lokal section (state lokal di-seed dari props server)
- Berhasil → render artikel; gagal lagi → pesan tetap

### File
| File | Aksi |
|---|---|
| `src/routes/api/source/[id]/+server.ts` | baru |
| `src/lib/server/cache.ts` | revisi kecil (export helper `invalidate(prefix)`) |
| `src/lib/components/SourceSection.svelte` | revisi (state lokal + tombol coba lagi) |

### Verifikasi
- [ ] Blok satu upstream (simulasi) → hanya section itu error; klik Coba lagi → pulih tanpa reload
- [ ] Endpoint validasi id tak dikenal → 404 JSON rapi

---

## Fase C — Tombol Share di halaman detail

### Spesifikasi
- Di `ArticleView`: tombol sekunder "Bagikan" berdampingan tombol "Baca di {media}"
- `navigator.share({ title, url })` bila tersedia (mobile) → fallback `navigator.clipboard.writeText(url)` + toast kecil "Link disalin ✓" (auto hilang 2 detik)

### File
| File | Aksi |
|---|---|
| `src/lib/components/ArticleView.svelte` | revisi |
| `src/lib/components/Toast.svelte` | baru (opsional, bisa inline) |

---

## Fase D — Meta OG dinamis (preview WhatsApp/Telegram rapi)

### Masalah
Halaman `/baca` belum punya og:title/og:image → link yang dibagikan tampil polos.

### Spesifikasi
Di `/baca`:
```svelte
<svelte:head>
  <meta property="og:type" content="article" />
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={article.summary} />
  {#if absoluteImage}<meta property="og:image" content={absoluteImage} />{/if}
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
```
- Helper `absoluteUrl(u)` di `time.ts`/util: ubah protocol-relative (`//...`) & relative → absolut; fallback undefined jika tidak valid
- Catatan: scraper sosial media mengeksekusi server-render → SSR SvelteKit otomatis menyuplai tag

### File
| File | Aksi |
|---|---|
| `src/routes/baca/+page.svelte` | revisi (meta head) |
| util absolut URL | baru kecil |

### Verifikasi
- [ ] View-source halaman detail berisi og:title & og:image absolut
- [ ] Tempel URL ke webmaster metatag checker / WhatsApp → preview muncul

---

## Fase E — Chip filter sumber di home

### Spesifikasi
- Baris chip horizontal-scroll di bawah tab kategori: **Semua** + nama 11 media
- Klik chip → client-side filter section yang tampil (`$state selectedSource`) — nol request
- State hilang saat navigasi penuh; tidak perlu URL param (berbeda dari kategori yang shareable)

### File
| File | Aksi |
|---|---|
| `src/routes/+page.svelte` | revisi |
| `src/lib/components/SourceChip.svelte` | baru (opsional, bisa inline) |

---

## Fase F — Dark mode

### Spesifikasi
- Tailwind v4 class strategy: `@custom-variant dark (&:where(.dark, .dark *));` di `app.css`
- Toggle ikon 🌙/☀️ di Header; preferensi disimpan `localStorage('theme')`
- Script inline mini di `app.html` untuk set class `.dark` pada `<html>` sebelum paint (anti-FOUC), default mengikuti `prefers-color-scheme`
- Palet gelap: luar `neutral-950`, frame `neutral-900`, teks `neutral-100`, divider `neutral-800`, aksen merah sama

### File
| File | Aksi |
|---|---|
| `src/app.css` | revisi (custom variant + token gelap) |
| `src/app.html` | revisi (script anti-FOUC) |
| `src/lib/components/Header.svelte` | revisi (toggle) |
| semua komponen | revisi class `dark:` |

### Verifikasi
- [ ] Toggle langsung berganti tanpa flash putih saat pertama load
- [ ] Preferensi bertahan setelah tutup-buka browser
- [ ] Kontras teks masih nyaman di kedua mode (cek manual tiap section)

---

## Risiko umum Tier 2
| Risiko | Mitigasi |
|---|---|
| Dark mode menyapu banyak file (rawan terlewat) | Kerjakan paling akhir, satu commit khusus, audit visual semua route |
| Retry endpoint jadi celah spam upstream | Rate-limit ringan: cache tetap aktif; `force=1` hanya invalidate satu key |
| OG image hotlink diblokir scraper tertentu | Sudah ada onerror di UI; meta tetap dicoba — bukan fatal |
