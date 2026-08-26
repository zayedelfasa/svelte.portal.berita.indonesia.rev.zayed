# Portal Berita Indonesia

Agregator berita lokal Indonesia — 11 media, 3 berita teratas per media + **Market ticker Saham & Crypto**.
Dibangun dengan **SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4**, deploy target **Vercel**.

**3 Fitur Utama:** `📰 Berita` (agregasi + kategori) · `📈 Market` (IHSG/LQ45/USD·IDR + BTC/ETH/SOL/BNB/USDT) · `ℹ️ Tentang` (info aplikasi). Navigasi via **Bottom Tab** fixed `max-w-[420px]`.

## Media Sumber

| Media | Jalur |
|---|---|
| Detik | RSS `news.detik.com/rss` |
| CNN Indonesia | RSS `cnnindonesia.com/rss` |
| Antara News | aggregator (+ fallback RSS resmi) |
| CNBC Indonesia | aggregator (+ fallback RSS resmi) |
| Tempo | aggregator |
| Republika | aggregator |
| Okezone | aggregator |
| Kumparan | aggregator |
| JPNN.com | RSS `jpnn.com/rss` |
| Media Indonesia | RSS `mediaindonesia.com/feed` |
| iNews | RSS `inews.id/feed` |

Aggregator berita: [berita-indo-api](https://github.com/satyawikananda/berita-indo-api).
Market: [CoinGecko API v3](https://api.coingecko.com/api/v3/coins/markets) (crypto, tanpa key) + [Yahoo Finance](https://query1.finance.yahoo.com/v8/finance/chart/^JKSE) (IHSG/LQ45/USD·IDR, tanpa key). Detail: [`docs/DOC_FITUR_MARKET_TENTANG.md`](docs/DOC_FITUR_MARKET_TENTANG.md).

> Tribun News / Jawa Pos / Suara.com tidak dipakai — endpoint & RSS-nya mati/bot-block saat riset (lihat `docs/PLAN.md`).

## Menjalankan Lokal

```bash
npm install
npm run dev          # dev server
npm run build        # build produksi
npm run preview      # preview hasil build
```

## Arsitektur Singkat

- Semua fetch upstream dilakukan **server-side** (`src/lib/server`) → bebas masalah CORS.
- Cache memori TTL 10 menit per sumber + per market (`market:ticker`) + header `s-maxage=600` untuk CDN Vercel.
- Satu sumber gagal ≠ halaman gagal (`Promise.allSettled`, section menampilkan pesan kecil; market gagal → fallback dummy, layout tidak crash).
- `+layout.server.ts` load **MarketTicker** global (IHSG/LQ45/USD·IDR + crypto) — tampil di semua halaman di bawah Header.
- BottomNav fixed 3 tab (`/`, `/market`, `/tentang`) — `safe-area-inset-bottom` aware.
- Halaman detail `/baca?source=X&id=Y&u=...` menampilkan gambar bila tersedia + link ke artikel asli.
- Halaman `/market` & `/tentang` — lihat [`src/routes/README.md`](src/routes/README.md).

Detail lengkap: lihat [`docs/PLAN.md`](docs/PLAN.md). Docs lain: [`docs/PLAN_CUACA.md`](docs/PLAN_CUACA.md) (Cuaca+Polusi) · [`docs/PLAN_FITUR_HARIAN.md`](docs/PLAN_FITUR_HARIAN.md) (daily habit).
