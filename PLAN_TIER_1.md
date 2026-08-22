# PLAN_TIER_1.md — Fitur Inti Portal Berita

> Lanjutan `PLAN.md`. Prasyarat: project sudah jalan (commit `d284e8f`).
> Isi Tier 1: **A) Badge BARU + waktu berjalan + tombol refresh**, **B) Pencarian**, **C) Tab kategori**.
> Urutan eksekusi disarankan: A → B → C (A paling murah, C butuh verifikasi endpoint).
>
> **Prinsip data: TIDAK ada API baru/khusus.** Semua jalan dengan RSS/aggregator publik yang sudah ada + komputasi lokal.

---

## Fase A — Badge BARU, waktu relatif berjalan, tombol refresh

### Masalah sekarang
- Waktu relatif ("5 mnt lalu") beku sampai reload halaman
- Tidak ada indikator artikel segar maupun kapan data terakhir diperbarui
- Refresh hanya bisa reload browser penuh

### Spesifikasi
1. **Ticker waktu global** — satu interval di root layout menambah `clock.now` tiap 30 detik; semua label waktu ikut berjalan otomatis.
   - File baru: `src/lib/utils/clock.svelte.ts` — `export const clock = $state({ now: Date.now() })`.
   - `+layout.svelte`: mulai interval di `$effect` (clear saat destroy).
   - Refactor `timeAgo(iso)` → `timeAgo(iso, now)` menerima `now` (murni, mudah diuji).
   - Komponen `NewsItem`/`ArticleView` hitung label via `$derived(clock.now)`.
2. **Badge "BARU"** — titik merah + teks kecil di samping waktu jika `publishedAt` < 60 menit dari `clock.now`. File: `NewsItem.svelte`.
3. **"Diperbarui X lalu" + tombol refresh**
   - `+page.server.ts` (home & `/media/*`) mengembalikan `fetchedAt: new Date().toISOString()`.
   - Header home: teks kecil "Diperbarui {timeAgo(fetchedAt)}" + tombol ikon 🔄.
   - Klik → `await invalidateAll()` (`$app/navigation`) + status spin saat pending. Data baru datang dari cache CDN/memory — murah.

### File
| File | Aksi |
|---|---|
| `src/lib/utils/clock.svelte.ts` | baru |
| `src/lib/time.ts` | revisi (timeAgo terima `now`; tambah `isNew()`) |
| `src/lib/components/Header.svelte` | revisi (baris diperbarui + refresh, hanya home) |
| `src/lib/components/NewsItem.svelte` | revisi (badge BARU + waktu berjalan) |
| `src/lib/components/ArticleView.svelte` | revisi kecil (waktu berjalan) |
| `src/routes/+layout.svelte` | revisi (mulai ticker) |
| `src/routes/+page.server.ts`, `src/routes/media/[source]/+page.server.ts` | tambah `fetchedAt` |

### Verifikasi
- [ ] Buka home ≥ 1 menit tanpa reload → label "5 mnt lalu" berubah sendiri
- [ ] Artikel < 1 jam tampil badge BARU; artikel lama tidak
- [ ] Klik refresh → spinner singkat, `fetchedAt` ikut maju, tidak reload penuh

---

## Fase B — Pencarian lintas media

### Spesifikasi
- Route baru: **`/cari?q=<kata kunci>`**
- Input besar autofokus + tombol cari (submit-on-enter, tanpa live-search agar tidak membebani)
- Pencarian **server-side atas pool cache** tiap media: panggil `fetchTop(100)` per sumber (kena cache memori — murah; cold start pertama boleh lambat ±8 dtk, tampilkan pesan "memuat indeks…")
- Cocokkan `title` + `summary` case-insensitive; urut `publishedAt` desc; batas 50 hasil
- Hasil pakai `NewsItem` biasa → klik masuk `/baca` seperti biasa
- Header dapat ikon 🔍 → menuju `/cari`

### File
| File | Aksi |
|---|---|
| `src/routes/cari/+page.server.ts` | baru |
| `src/routes/cari/+page.svelte` | baru |
| `src/lib/components/Header.svelte` | revisi (ikon pencarian) |

### Catatan desain
- Query kosong → tampilkan state kosong ramah ("Ketik kata kunci…")
- Hasil nol → "Tidak ditemukan untuk \"{q}\""
- Tidak perlu Google News RSS di fase ini (opsi upgrade masa depan)

### Verifikasi
- [ ] `/cari?q=prabowo` → hasil relevan dari > 1 media, urut terbaru
- [ ] Query aneh/kosong → empty state rapi
- [ ] Klik hasil → detail jalan; back → query masih terisi

---

## Fase C — Tab kategori

### Spesifikasi
- Kategori kanonik: **Semua · Nasional · Ekonomi · Tekno · Olahraga · Hiburan · Gaya Hidup**
- Baris chip sticky horizontal-scroll tepat di bawah header (hanya di home)
- Aktif via query param: `/?kategori=ekonomi` (URL tetap shareable)
- Saat kategori aktif: server memakai **fetcher kategori** per media yang tersedia; media tanpa dukungan → disembunyikan dari daftar (bukan error) + catatan kecil "{n} media tidak mendukung kategori ini"

### Pemetaan kategori per media (WAJIB diverifikasi dulu dengan batch-curl)
| Media | Kandidat endpoint kategori |
|---|---|
| Antara | RSS `antaranews.com/rss/{nasional→politik\|metro, ekonomi, tekno, olahraga, hiburan, lifestyle}.xml` |
| CNN Indonesia | Aggregator `/cnn-news/{nasional, ekonomi, teknologi, olahraga, hiburan, gaya-hidup}` atau RSS `cnnindonesia.com/rss/<kanal>` |
| Detik | Kanal: `news`(nasional), `finance`(ekonomi), `inet`(tekno), `sport`(olahraga), `hot`(hiburan), `travel`(gaya hidup) — pola `<kanal>.detik.com/rss` |
| CNBC Indonesia | Aggregator `/cnbc-news/{news→nasional, market→ekonomi, tech→tekno, lifestyle}` |
| Tempo | Aggregator `/tempo-news/{nasional, bisnis→ekonomi, tekno, bola/sport→olahraga, cantik→gaya hidup}` |
| Republika | Aggregator `/republika-news/{news, ekonomi, leisure}` |
| Okezone | Aggregator `/okezone-news/{breaking→nasional, economy, techno, sport, lifestyle, celebrity}` |
| Kumparan | ❌ hanya headline umum → sembunyikan di tab kategori |
| JPNN.com | ⚠️ cek varian `jpnn.com/rss` kategori saat verifikasi; kalau tidak ada → sembunyikan |
| Media Indonesia | ⚠️ sama — verifikasi; kalau tidak ada → sembunyikan |
| iNews | ⚠️ sama — verifikasi |

### Perubahan teknis
- `types.ts`: `type CategoryId = 'nasional'|'ekonomi'|'tekno'|'olahraga'|'hiburan'|'gayahidup'`; `SourceDef.fetchTop` opsional menerima kategori, atau field baru `fetchCategory?: (cat, limit) => Promise<Article[]>` + `supports: CategoryId[]`
- Factory `makeAggregatorSource`/`makeRssSource` diperluas terima mapping kategori → path/URL; **cache key harus menyertakan kategori** (`agg:{id}:{cat}`)
- Home `+page.server.ts`: baca `url.searchParams.get('kategori')` → validasi → pakai fetcher kategori

### Verifikasi
- [ ] Batch-curl semua URL kandidat → tabel hasil tersimpan di PLAN_TIER_1.md (append hasil aktual)
- [ ] Tab ekonomi: hanya media pendukung tampil; chip aktif ter-highlight
- [ ] URL `/?kategori=x` bisa dibagikan & langsung membuka tab benar
- [ ] Media tanpa kategori tetap normal di tab "Semua"
- [ ] Build + svelte-check bersih

### Risiko
| Risiko | Mitigasi |
|---|---|
| Banyak URL kategori ternyata mati/bot-block | Verifikasi dulu; sembunyikan media yang tak didukung; fallback aggregator→headline |
| Cold start lambat saat ganti tab (fetch 11 feed kategori paralel) | Cache per-kategori + `s-maxage`; tampilkan skeleton (dari Tier 2, opsional dipindah maju) |

---

## Hasil Verifikasi Endpoint (eksekusi Tier 1)

Tanggal: 2026-08-22. Semua `curl -o /dev/null -w "%{http_code}"` pakai header browser.

| Media | Kategori | Endpoint terverifikasi | HTTP |
|---|---|---|---|
| **Antara RSS** | nasional | `antaranews.com/rss/politik.xml` | 200 |
|  | ekonomi | `/rss/ekonomi.xml` | 200 |
|  | tekno | `/rss/tekno.xml` | 200 |
|  | olahraga | `/rss/olahraga.xml` | 200 |
|  | hiburan | `/rss/hiburan.xml` | 200 |
|  | gayahidup | `/rss/lifestyle.xml` | 200 |
| **Detik kanal** | nasional | `news.detik.com/rss` | 200 |
|  | ekonomi | `finance.detik.com/rss` | 200 |
|  | tekno | `inet.detik.com/rss` | 200 |
|  | olahraga | `sport.detik.com/rss` | 200 |
|  | hiburan | `hot.detik.com/rss` | 200 |
|  | gayahidup | `travel.detik.com/rss` | 200 |
| **CNN agg** | nasional | `/cnn-news/nasional` | 200 |
|  | ekonomi | `/cnn-news/ekonomi` | 200 |
|  | tekno | `/cnn-news/teknologi` | 200 |
|  | olahraga | `/cnn-news/olahraga` | 200 |
|  | hiburan | `/cnn-news/hiburan` | 200 |
|  | gayahidup | `/cnn-news/gaya-hidup` | 200 |
| **Tempo agg** | nasional | `/tempo-news/nasional` | 200 |
|  | ekonomi | `/tempo-news/bisnis` | 200 |
|  | tekno | `/tempo-news/tekno` | 200 |
|  | olahraga | `/tempo-news/sport` | 200 |
|  | gayahidup | `/tempo-news/cantik` | 200 |
| **Republika agg** | nasional | `/republika-news/nusantara` | 200 |
|  | ekonomi | `/republika-news/ekonomi` | 200 |
|  | olahraga | `/republika-news/sepakbola` | 200 |
|  | gayahidup | `/republika-news/leisure` | 200 |
| **Okezone agg** | nasional | `/okezone-news/breaking` | 200 |
|  | ekonomi | `/okezone-news/economy` | 200 |
|  | tekno | `/okezone-news/techno` | 200 |
|  | olahraga | `/okezone-news/sport` | 200 |
|  | hiburan | `/okezone-news/celebrity` | 200 |
|  | gayahidup | `/okezone-news/lifestyle` | 200 |
| **CNBC agg** | nasional | `/cnbc-news/news` | 200 |
|  | ekonomi | `/cnbc-news/market` | 200 |
|  | tekno | `/cnbc-news/tech` | 200 |
|  | gayahidup | `/cnbc-news/lifestyle` | 200 |
| **iNews RSS** | nasional | `inews.id/feed/nasional` | 200 |
|  | ekonomi | `inews.id/feed/ekonomi` | 200 |
|  | tekno | `inews.id/feed/tekno` | 200 |
|  | olahraga | `inews.id/feed/sport` | 200 |
|  | hiburan | `inews.id/feed/hiburan` | 200 |
|  | gayahidup | `inews.id/feed/lifestyle` | 200 |
| Kumparan | — | hanya headline (`/kumparan-news`) | — |
| JPNN | — | hanya headline (`jpnn.com/rss`) | — |
| Media Indonesia | — | hanya headline (`mediaindonesia.com/feed`) | — |

**Kesimpulan:** 8 media mendukung kategori penuh/sebagian (Antara, Detik, CNN, Okezone, iNews = 6 kategori lengkap; Tempo/Republika/CNBC = sebagian). 3 media (Kumparan, JPNN, MedIndo) disembunyikan di tab kategori.
