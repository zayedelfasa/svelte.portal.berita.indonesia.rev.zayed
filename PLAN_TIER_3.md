# PLAN_TIER_3.md — Fitur Lanjutan (Nanti)

> Prasyarat: Tier 1 & 2 selesai.
> Isi: **A) Bookmark "Baca Nanti" · B) Opsi thumbnail mini · C) Ticker headline berjalan · D) PWA/offline**.
> Semua masih dalam batas fitur portal berita. Kerjakan per-fase, boleh dipilih — tidak wajib urut, kecuali D paling akhir.

---

## Fase A — Bookmark "Baca Nanti" (localStorage)

### Spesifikasi
- Ikon bookmark di `NewsItem` (pojok kanan, muncul subtle) + di halaman detail
- Simpan **snapshot artikel lengkap** (title, url, summary, image, source name, publishedAt) ke `localStorage('bookmarks')` — bukan cuma URL
- Halaman baru **`/simpan`**:
  - Daftar tersimpan dirender dari snapshot (TIDAK lewat `/baca` — pool upstream berputar sehingga artikel lama bisa 404; snapshot membuat daftar tahan lama)
  - Tiap item: tombol hapus + link keluar ke artikel asli
  - Kosong → empty state "Belum ada yang disimpan"
- Ikon header (🔖) dengan badge jumlah saat > 0

### Teknis
- `src/lib/utils/bookmarks.svelte.ts`: state reaktif `$state<Article[]>` + sinkron localStorage (guard SSR `browser` check)
- Toggle bookmark harus sinkron antara list & detail (sumber state tunggal dari modul tsadi)

### File
| File | Aksi |
|---|---|
| `src/lib/utils/bookmarks.svelte.ts` | baru |
| `src/routes/simpan/+page.svelte` (+server ringan opsional) | baru |
| `NewsItem.svelte`, `ArticleView.svelte`, `Header.svelte` | revisi |

### Verifikasi
- [ ] Simpan → muncul di /simpan → reload browser tetap ada
- [ ] Hapus satu → hilang di semua tempat (list & badge ikut berkurang)
- [ ] Artikel disimpan kemarin → /simpan tetap menampilkan snapshot walau sudah tidak ada di feed

---

## Fase B — Opsi thumbnail mini di list

### Spesifikasi
- Gambar kecil `56×56 rounded-lg object-cover` di kanan tiap item (dari `article.image`, sudah ternormalisasi)
- **Default mengikuti preferensi user** — toggle di Header/menu kecil, tersimpan `localStorage('thumb')`; default OFF (sesuai keputusan awal teks-saja)
- `onerror` → sembunyikan gambar (hotlink mati sering terjadi)

### File
| File | Aksi |
|---|---|
| `src/lib/components/NewsItem.svelte` | revisi |
| pengaturan toggle | Header atau halaman `/cari`-style panel kecil |

---

## Fase C — Ticker headline berjalan

### Spesifikasi
- Strip tipis di bawah header: judul 8 artikel terbaru lintas media, animasi marquee CSS (bukan JS loop)
- Klik ticker → buka artikel itu (pause animasi on hover/press)
- Data: gabungan pool home yang sudah ada, sort desc, ambil 8 — nol request baru
- Hormati `prefers-reduced-motion` → fallback statis

### File
| File | Aksi |
|---|---|
| `src/lib/components/Ticker.svelte` | baru |
| `src/routes/+layout.svelte` atau `+page.svelte` | pasang |

### Risiko
Rawan terasa gimmick/noisy — evaluasi visual dulu di staging sebelum commit final.

---

## Fase D — PWA / offline shell

### Spesifikasi
- `@vite-plugin-pwa` (manifest + service worker Workbox):
  - App shell & aset statis → cache-first
  - Halaman HTML → network-first, fallback cache terakhir saat offline + halaman "Anda sedang offline"
  - Upstream API/RSS **tidak** di-cache SW (sudah ditangani server cache + CDN)
- Meta theme-color, icon 192/512 (buatkan SVG→PNG sederhana logo "Portal Berita.")

### File
| File | Aksi |
|---|---|
| `vite.config.ts` | tambah plugin PWA |
| `static/manifest.webmanifest`, `static/icons/*` | baru |
| `src/app.html` | link manifest |

### Verifikasi
- [ ] Lighthouse PWA installable
- [ ] Matikan internet → app terbuka dengan konten terakhir + banner offline
- [ ] Update service worker tidak bikin cache usang bermasalah (versi bump)

### Catatan
Fase paling kompleks & paling jauh dari inti "portal berita". Kerjakan terakhir; kalau effort melebihi nilai, boleh dibuang permanen.

---

## Ringkasan dependensi antar-tier

```
Tier 1 (inti) ──▶ Tier 2 (poles) ──▶ Tier 3 (lanjutan)
                                    A bookmark  ← independen
                                    B thumbnail ← independen
                                    C ticker    ← butuh data home (sudah ada)
                                    D PWA       ← terakhir setelah UI stabil
```
