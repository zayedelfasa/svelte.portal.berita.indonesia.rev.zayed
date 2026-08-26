# ARCHITECTURE.md — Arsitektur Portal Berita Indonesia

> Peta besar project. Detail per folder ada di `README.md` masing-masing folder.

## Ringkasan

Portal agregator berita 11 media lokal Indonesia + Market Saham & Crypto. SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4, deploy target Vercel. Navigasi 3 tab BottomNav, MarketTicker global.

```
Browser
   │  HTTP
   ▼
Vercel CDN (s-maxage=600)
   │
SvelteKit server (+layout.server.ts + +page.server.ts / +server.ts)
   │  Promise.allSettled paralel
   ├── lib/server/sources/*  ──►  lib/server/cache.ts (memori, TTL 10 menit)
   │       ├─ RSS resmi ────────────────┤
   │       └─ aggregator berita-indo-api┘
   │                                    │
   │       Upstream media (detik.com, cnnindonesia.com, ...)
   │
   └── lib/server/market.ts ──► cached('market:ticker')
           ├─ CoinGecko API (BTC/ETH/SOL/BNB/USDT)
           └─ Yahoo Finance (^JKSE IHSG, LQ45, IDR=X)
```

## Alur Data

1. Browser meminta `/` → `routes/+layout.server.ts` load **MarketData** (`fetchMarketData()` → CoinGecko+Yahoo, `cached('market:ticker')`) + `routes/+page.server.ts` load berita
2. Load berita memanggil `fetchTop(3)` untuk tiap media **secara paralel** (`Promise.allSettled`) — satu sumber gagal tidak menjatuhkan halaman
3. Adapter (`lib/server/sources/*`) mengecek cache memori; kalau hangus → fetch upstream → normalisasi ke `Article`
4. Hasil ternormalisasi dikirim ke `+page.svelte` sebagai props — browser tidak pernah menyentuh upstream langsung (bebas CORS)
5. Layout render `<MarketTicker data={market}>` di bawah Header (marquee `bg-slate-900`) + `<BottomNav>` fixed 3 tab
6. Response di-cache CDN via header `Cache-Control: s-maxage=600` (berita & market sama)

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
| `market:ticker` | MarketData (IHSG/LQ45/USDIDR + crypto top 5) |
Kategori yang URL/path-nya sama dengan headline otomatis reuse key headline (dedup). Market reuse key yang sama untuk `+layout.server.ts` & `/market`.

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

File loose di `src/lib/`: `types.ts` (interface inti + `MarketItem`/`MarketData` di `server/market.ts`), `time.ts` (`timeAgo`, `isNew`), `categories.ts` (6 kategori kanonik).

## Riwayat Pengembangan
- `docs/PLAN.md` — plan awal + riset endpoint
- `docs/DOC_FITUR_MARKET_TENTANG.md` — Market ticker + BottomNav + /market + /tentang + roadmap Phase 0-3
- `docs/PLAN_CUACA.md` — Tab Cuaca & Polusi (Open-Meteo, 4 tab)
- `docs/PLAN_FITUR_HARIAN.md` — Fitur daily habit (Sholat, Briefing, Gempa...)
