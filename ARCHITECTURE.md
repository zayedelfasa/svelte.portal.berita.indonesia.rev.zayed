# ARCHITECTURE.md — Arsitektur Portal Berita Indonesia

> Peta besar project. Detail per folder ada di `README.md` masing-masing folder.

## Ringkasan

Portal agregator berita 11 media lokal Indonesia. SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4, deploy target Vercel.

```
Browser
   │  HTTP
   ▼
Vercel CDN (s-maxage=600)
   │
SvelteKit server (+page.server.ts / +server.ts)
   │  Promise.allSettled paralel
   ▼
lib/server/sources/*  ──►  lib/server/cache.ts (memori, TTL 10 menit)
   │                            ▲
   ├─ RSS resmi ────────────────┤
   └─ aggregator berita-indo-api┘
   │
Upstream media (detik.com, cnnindonesia.com, antaranews.com, ...)
```

## Alur Data

1. Browser meminta `/` → `routes/+page.server.ts`
2. Load function memanggil `fetchTop(3)` untuk tiap media **secara paralel** (`Promise.allSettled`) — satu sumber gagal tidak menjatuhkan halaman
3. Adapter (`lib/server/sources/*`) mengecek cache memori; kalau hangus → fetch upstream → normalisasi ke `Article`
4. Hasil ternormalisasi dikirim ke `+page.svelte` sebagai props — browser tidak pernah menyentuh upstream langsung (bebas CORS)
5. Response di-cache CDN via header `Cache-Control: s-maxage=600`

## Pola Kunci

### Normalisasi Article
Semua sumber (RSS XML maupun JSON aggregator) dilewatakan menjadi satu bentuk:
```ts
interface Article {
  source: string;      // id media
  title: string;
  url: string;
  publishedAt: string; // ISO
  summary: string;     // HTML di-strip
  image?: string;      // enclosure/image
}
```

### Adapter factory
- `makeRssSource(id, feedUrl, categories?)` — parse XML via fast-xml-parser
- `makeAggregatorSource(id, apiPath, { fallbackFeed?, categories? })` — JSON dari berita-indo-api, fallback ke RSS bila mati
- Keduanya mengembalikan `{ fetchTop, fetchCategory?, supportedCategories? }`

### Cache key convention
| Key | Isi |
|---|---|
| `rss:{id}` / `agg:{id}` | pool headline |
| `rss:{id}:{cat}` / `agg:{id}:{cat}` | pool kategori |
Kategori yang URL/path-nya sama dengan headline otomatis reuse key headline (dedup).

### Multi-pool lookup di `/baca`
Artikel bisa datang dari pool kategori yang tidak ada di pool headline. Detail page mencari: match `u=` (URL asli) dulu → fallback `id=` → lalu telusuri seluruh pool kategori sumber tersebut.

## Peta Folder

| Folder | Fungsi | README |
|---|---|---|
| `src/lib/components/` | Komponen UI Svelte | [README](src/lib/components/README.md) |
| `src/lib/config/` | Registry 11 media | [README](src/lib/config/README.md) |
| `src/lib/server/` | Fetch & cache server-side only | [README](src/lib/server/README.md) |
| `src/lib/server/sources/` | Adapter per media | [README](src/lib/server/sources/README.md) |
| `src/lib/utils/` | State global runes (.svelte.ts) + helper | [README](src/lib/utils/README.md) |
| `src/routes/` | File-based routing | [README](src/routes/README.md) |
| `static/` | Aset publik + icon PWA | [README](static/README.md) |

File loose di `src/lib/`: `types.ts` (interface inti), `time.ts` (`timeAgo`, `isNew`), `categories.ts` (6 kategori kanonik).

## Riwayat Pengembangan
- `PLAN.md` — plan awal + riset endpoint
- `PLAN_TIER_1.md` — badge BARU, pencarian, tab kategori
- `PLAN_TIER_2.md` — skeleton, retry, share, OG meta, filter sumber, dark mode
- `PLAN_TIER_3.md` — bookmark, thumbnail, ticker, PWA
- `PLAN_BUGFIX_TIER{1,2,3}.md` — perbaikan pasca-review tiap tier
