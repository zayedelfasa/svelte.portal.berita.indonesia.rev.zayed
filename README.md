# Portal Berita Indonesia

Agregator berita lokal Indonesia — 11 media, 3 berita teratas per media + **Cuaca & Polusi (Open-Meteo)** + **Market ticker Saham & Crypto (hidden, no dummy)**.
Dibangun dengan **SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4**, deploy target **Vercel**.

**3 Tab Aktif:** `📰 Berita` (agregasi + kategori) · `🌤️ Cuaca` (suhu, AQI, forecast 7 hari, search kota) · `ℹ️ Tentang` (info aplikasi). Market `/market` tetap ada tapi **hidden dari BottomNav** (Yahoo 403, TwelveData terbatas, no dummy). Navigasi via **Bottom Tab** fixed `max-w-[420px]`.

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
Market: [CoinGecko API v3](https://api.coingecko.com/api/v3/coins/markets) (crypto, tanpa key) + [TwelveData](https://api.twelvedata.com/quote) (Forex USD/IDR, tanpa key, IDX tunda) — no dummy, empty jujur. Detail: [`docs/DOC_FITUR_MARKET_TENTANG.md`](docs/DOC_FITUR_MARKET_TENTANG.md).
Cuaca: [Open-Meteo](https://open-meteo.com) Weather + Air Quality + Geocoding (gratis tanpa key, unlimited) + [BigDataCloud](https://www.bigdatacloud.com) reverse-geocode (gratis tanpa key) — suhu, AQI, forecast 7 hari, hourly 24 jam, nama kota dari lat/lon. Detail: [`docs/PLAN_CUACA.md`](docs/PLAN_CUACA.md).

> Tribun News / Jawa Pos / Suara.com tidak dipakai — endpoint & RSS-nya mati/bot-block saat riset (lihat `docs/PLAN.md`).

## Menjalankan Lokal

```bash
npm install
npm run dev          # dev server
npm run build        # build produksi
npm run preview      # preview hasil build
npm run check        # svelte-check 0 error
```

## Arsitektur Singkat

- Semua fetch upstream dilakukan **server-side** (`src/lib/server`) → bebas masalah CORS.
- Cache memori TTL 10 menit per sumber + split `market:crypto 2m, idx 15m, forex 10m, weather 10m, geo 1j, reverse 1d` + header `s-maxage=600` untuk CDN Vercel.
- Satu sumber gagal ≠ halaman gagal (`Promise.allSettled`, section menampilkan pesan kecil; market gagal → empty jujur, cuaca gagal → card `Tidak tersedia`, layout tidak crash).
- `+layout.server.ts` load **MarketTicker** global conditional (`{#if data?.market && !isCuaca && !isTentang}`) — tampil di bawah Header hanya di `/` (hide di `/cuaca` & `/tentang` biar bersih).
- BottomNav fixed 3 tab (`/`, `/cuaca`, `/tentang`) — `safe-area-inset-bottom` aware, `cuacaHref` dinamis via `localStorage 'cuaca:loc'` → persist lokasi terakhir, Footer `Berita dikumpulkan` hide di `/cuaca` & `/tentang`.
- Halaman `/cuaca` → `?lat=&lon=&name=` default Jakarta, geolocation + search kota `/cuaca/cari`; `/market` hidden; `/baca?source=X&id=Y&u=...` detail; `/tentang` static — lihat [`src/routes/README.md`](src/routes/README.md).

Detail lengkap: lihat [`docs/PLAN.md`](docs/PLAN.md). Docs lain: [`docs/PLAN_CUACA.md`](docs/PLAN_CUACA.md) (Cuaca+Polusi, Done C1/C2) · [`docs/PLAN_FITUR_HARIAN.md`](docs/PLAN_FITUR_HARIAN.md) (daily habit) · [`docs/CHANGELOG.md`](docs/CHANGELOG.md).
