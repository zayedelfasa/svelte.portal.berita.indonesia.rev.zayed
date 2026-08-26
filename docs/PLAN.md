# PLAN.md — Portal Berita Indonesia

> Portal agregator berita lokal Indonesia. SvelteKit + Vercel. Desain minimalis putih, layout fix mobile.
> Dokumen ini = acuan eksekusi. Executor tidak punya memori percakapan — semua konteks ada di sini.

## Konteks & Requirement

- Folder kerja: `/Volumes/samsung_apfs/svelte.portal.berita.indonesia`
- Target deploy: **Vercel** (plan Hobby gratis)
- Requirement final dari user:
  1. Stack **SvelteKit**, struktur folder rapi
  2. Kategori **default headline/terkini**
  3. List = **teks saja**; halaman detail = tampilkan **gambar jika ada** di response JSON/RSS
  4. **11 media lokal Indonesia**
  5. Repo **GitHub baru**
  6. **Monetisasi ditunda** (QRIS nanti — hanya siapkan slot placeholder di footer)

## Status Environment MacBook

| Item | Hasil |
|---|---|
| Node.js | ✅ v22.19.0 (LTS) |
| npm | ✅ 10.9.3 |
| git, gh CLI, disk space | Cek di Langkah 0 |

## Stack (hasil riset)

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Framework | **SvelteKit 2 + Svelte 5** | Zero-config di Vercel (adapter-vercel auto-detect), server load = solusi CORS gratis |
| Styling | **Tailwind CSS v4** | Utility-first, cepat untuk desain minimalis putih |
| Library UI | **shadcn-svelte** (opsional, copy-in) | Komponen di-copy ke project, bisa dimodifikasi bebas (Bits UI + Tailwind). Pemakaian minim untuk portal ini; skip jika CSS manual cukup |
| State management | **Svelte 5 runes** (`$state`, `$derived`, `$effect`) | Built-in cukup. Data utama lewat `+page.server.ts` load functions |
| Parser XML | `fast-xml-parser` | Untuk RSS jalur B |

Keputusan: **tanpa heavy component library** — portal list-based, Tailwind + komponen custom cukup.

## Arsitektur Data

**Prinsip**: semua fetch upstream dilakukan **server-side** (`+page.server.ts` / modul `lib/server`) → tanpa masalah CORS, browser menerima data ternormalisasi.

### Jalur A — Aggregator `berita-indo-api`
Base: `https://berita-indo-api.vercel.app/v1`

Response shape terverifikasi:
```json
{
  "code": 200,
  "status": "OK",
  "messages": "...",
  "total": 50,
  "data": [
    {
      "title": "...",
      "link": "https://...",
      "content:encodedSnippet": "...",
      "enclosure": { "url": "https://...jpg", "type": "image/jpeg" },
      "isoDate": "2026-08-21T14:16:43.000Z",
      "image": "https://...jpg",
      "description": "..."
    }
  ]
}
```

Catatan: `/v1/` root = 404 (normal, tidak ada route index). Endpoint flaky mungkin terjadi (contoh nyata: `/liputan6-news` pernah HTTP 500).

### Jalur B — RSS resmi
XML standar. Item: `title`, `link`, `pubDate`, `description` (berisi `<img>`), `enclosure/@url`, `content:encoded`.

### Registry 11 media → `src/lib/config/sources.ts`

| # | Media | Jalur | Endpoint/URL | Catatan |
|---|---|---|---|---|
| 1 | Detik | RSS | `https://news.detik.com/rss` | ✅ terverifikasi hidup |
| 2 | CNN Indonesia | RSS | `https://www.cnnindonesia.com/rss` | ✅ terverifikasi hidup |
| 3 | Antara | Aggregator | `/antara-news/terkini` | ✅ terverifikasi; fallback RSS `https://www.antaranews.com/rss/terkini.xml` |
| 4 | CNBC Indonesia | Aggregator | `/cnbc-news/news` | fallback kandidat RSS `https://www.cnbcindonesia.com/rss` (verifikasi saat build) |
| 5 | Tempo | Aggregator | `/tempo-news/nasional` | |
| 6 | Republika | Aggregator | `/republika-news/news` | |
| 7 | Okezone | Aggregator | `/okezone-news/breaking` | |
| 8 | Kumparan | Aggregator | `/kumparan-news` | |
| 9 | JPNN.com | RSS | `https://www.jpnn.com/rss` | ✅ pengganti Tribun News — aggregator `/tribun-news/*` = 500 (upstream 403), RSS daerah & utama = HTML error page (bot-block) |
| 10 | Media Indonesia | RSS | `https://mediaindonesia.com/feed` | ✅ pengganti Jawa Pos — aggregator `/jawa-pos/*` = HTTP 500, RSS jawapos.com 404 |
| 11 | iNews | RSS | `https://www.inews.id/feed` | ✅ pengganti Suara.com — aggregator `/suara/*` = HTTP 500, feed suara.com 404 |

> Hasil verifikasi endpoint saat build (curl): semua baris ✅ = HTTP 200. SindoNews (200 tapi text/html = error page) tidak dipakai.

### Normalisasi — semua adapter mengembalikan tipe sama

```ts
interface Article {
  source: string;      // id media
  title: string;
  url: string;         // link artikel asli
  publishedAt: string; // ISO date
  summary: string;     // snippet bersih (strip HTML)
  image?: string;      // enclosure/image — dipakai halaman detail
}

interface SourceResult {
  sourceId: string;
  ok: boolean;
  articles: Article[];   // top 3
  error?: string;
}
```

### Resiliensi

- Timeout fetch upstream: **8 detik** (AbortController)
- `Promise.allSettled` → satu sumber gagal ≠ halaman gagal; section tampil pesan kecil "Gagal memuat"
- Fallback aggregator→RSS untuk sumber yang punya RSS resmi
- Cache memori TTL **10 menit** per sumber (`lib/server/cache.ts`)
- Header `Cache-Control: s-maxage=600` → CDN Vercel ikut cache, hemat hit ke API publik

## Struktur Folder

```
svelte.portal.berita.indonesia/
├── PLAN.md
├── README.md
├── package.json
├── svelte.config.js          # adapter-vercel
├── vite.config.ts
├── .gitignore
├── src/
│   ├── app.html
│   ├── app.css               # Tailwind entry
│   ├── app.d.ts
│   ├── lib/
│   │   ├── types.ts          # interface Article, SourceDef, SourceResult
│   │   ├── config/
│   │   │   └── sources.ts    # registry 11 media (id, nama, adapter fn)
│   │   ├── server/
│   │   │   ├── cache.ts      # Map<TTL> + helper cached()
│   │   │   ├── http.ts       # fetchWithTimeout, stripHtml, timeAgo helper
│   │   │   ├── rss.ts        # parse XML → Article[]
│   │   │   ├── aggregator.ts # fetch berita-indo-api → Article[]
│   │   │   └── sources/      # 1 file per media:
│   │   │       ├── detik.ts
│   │   │       ├── cnn.ts
│   │   │       ├── antara.ts
│   │   │       ├── cnbc.ts
│   │   │       ├── tempo.ts
│   │   │       ├── republika.ts
│   │   │       ├── okezone.ts
│   │   │       ├── kumparan.ts
│   │   │       ├── tribun.ts
│   │   │       ├── jawapos.ts
│   │   │       └── suara.ts
│   │   └── components/
│   │       ├── Header.svelte
│   │       ├── SourceSection.svelte
│   │       ├── NewsItem.svelte
│   │       ├── ArticleView.svelte
│   │       └── Footer.svelte
│   └── routes/
│       ├── +layout.svelte
│       ├── +page.server.ts   # home: allSettled semua sumber, top 3 per media
│       ├── +page.svelte      # render semua section
│       └── baca/
│           ├── +page.server.ts  # ?source=X&id=Y → 1 artikel (dari cache/load ulang)
│           └── +page.svelte     # detail: gambar (jika ada) + judul + ringkasan + link sumber
└── static/
    └── favicon.svg
```

## Desain UI

- **Fix mobile**: container `max-width: 420px`, center horizontal, background luar abu netral (`#f3f4f6`), konten putih — desktop TIDAK melebar
- **Header sticky** putih: judul portal + tanggal hari ini, border tipis bawah
- **Per media (section)**: nama media bold + waktu update → 3 item:
  - Judul artikel (clamp max 2 baris)
  - Waktu relatif ("5 mnt lalu") + badge kecil nama media
  - Divider tipis antar item
  - Klik item → `/baca?source=X&id=Y`
- **Halaman detail**: gambar atas aspect 16:9 `object-cover` (hidden otomatis jika kosong/gagal load via `onerror`) → judul → waktu + sumber → ringkasan → tombol/link "Baca di [Media] ↗" (artikel penuh tetap di situs asli — tidak scrape isi penuh)
- **Footer**: credit "Sumber: [daftar media]" + placeholder slot QRIS nonaktif
- Font: system-ui stack; satu warna aksen (mis. merah coral) untuk elemen interaktif

## Langkah Eksekusi

0. **Cek environment lanjutan**: `git --version`, `gh --version`, `gh auth status`, ruang disk. Jika gh belum auth → minta user login atau buat repo manual via web
1. **Tulis `PLAN.md`** ke folder project (dokumen ini)
2. **Scaffold**: `npx sv create` di folder tsb (SvelteKit minimal, TypeScript, tanpa demo) → tambah `adapter-vercel` + Tailwind (`npx sv add tailwindcss`) → install `fast-xml-parser`
3. **Fondasi data**: `types.ts`, `config/sources.ts`, `server/http.ts`, `server/cache.ts`, `server/rss.ts`, `server/aggregator.ts`
4. **11 adapter sumber** — implement + uji tiap endpoint langsung saat coding; sesuaikan Tribun dengan hasil verifikasi
5. **Home page**: `+page.server.ts` (allSettled + cache) → `+page.svelte` + komponen
6. **Detail page** `/baca`: load ulang sumber terkait (murah karena cache), ambil artikel by index, render gambar jika ada
7. **Uji lokal**: `npm run dev` cek browser → `npm run build` + `npm run preview`; uji degrade graceful (simulasi 1 endpoint mati)
8. **Git + GitHub**: `git init`, commit awal, repo GitHub baru (`gh repo create` atau manual), push
9. **Deploy Vercel**: import repo di dashboard Vercel → preset SvelteKit auto-detect → deploy
10. **Verifikasi live** (checklist bawah)

## Verifikasi

- [ ] Environment lengkap: node ✅, git ✅, gh auth ✅
- [ ] `npm run build` sukses tanpa error fatal
- [ ] Preview lokal: 11 section muncul; sumber gagal = pesan kecil, halaman tidak crash
- [ ] Tiap section tepat **3 item**, urut terbaru
- [ ] `/baca` menampilkan gambar saat ada `image`; tanpa gambar layout tetap rapi
- [ ] Mobile view 420px benar di desktop (tidak melebar)
- [ ] Deploy Vercel live: load < 3 detik, header `s-maxage` aktif
- [ ] README berisi cara run + arsitektur singkat

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Endpoint aggregator flaky (`/liputan6-news` = HTTP 500 terbukti) | Timeout 8s + fallback RSS + skip graceful per sumber |
| Shape endpoint Tribun belum pasti | Verifikasi langsung saat langkah 4; fallback RSS daerah |
| Gambar upstream hotlink gagal render | `onerror` → sembunyikan img; layout tetap utuh |
| Hit berlebihan ke API publik | Cache memori 10 menit + `s-maxage=600` di CDN |
| Limit Vercel Hobby | Cukup — statis + serverless ringan, tanpa DB |

## Revisi 1 (implementasi setelah user review)

1. **Tombol back di header** — muncul otomatis di semua halaman selain home (`/baca`, `/media/*`). `history.back()` dengan fallback ke `/`. File: `Header.svelte` (deteksi route via `$app/state`).
2. **"Lihat Lainnya" per media** — link di header tiap section home → route baru `/media/<id>`.
3. **Halaman `/media/[source]`** — 10 artikel terbaru, tombol **"+ Muat lainnya"** menambah 10 per klik dari pool yang sudah di-cache (opsi A — tanpa request baru; maksimal sebanyak yang feed sediakan). Pool habis → tombol hilang. `visible` di-reset saat pindah media via `$effect`.

## Di Luar Scope (Sekarang)

- Monetisasi QRIS (slot footer disiapkan saja)
- Pencarian/filter artikel
- Kategori per media
- PWA/offline
