# AGENTS.md — Portal Berita Indonesia

> **BACA FILE INI DULU** setiap sesi baru. Ini single source of truth konteks bisnis + teknis.
> Detail per folder ada di `README.md` masing-masing folder. Arsitektur diagram di `ARCHITECTURE.md`. Fitur Market di `docs/DOC_FITUR_MARKET_TENTANG.md`.

## 1. Apa Ini?

Portal **agregator berita + market** lokal Indonesia. Mobile-first `max-w-[420px]` (mirip app native), deploy **Vercel**.
- **11 media**: Detik, CNN Indonesia, Antara, CNBC Indonesia, Tempo, Republika, Okezone, Kumparan, JPNN, Media Indonesia, iNews (3 berita teratas/media).
- **Market**: IHSG, LQ45, USD/IDR (Yahoo Finance) + BTC/ETH/SOL/BNB/USDT (CoinGecko) — gratis tanpa API key, ticker global + halaman `/market`.
- **3 fitur utama** via BottomNav: `Berita /` · `Market /market` · `Tentang /tentang`.

**Goal bisnis:** Satu tempat baca headline 11 media + pantau market harian. Bukan full trading app, bukan scrape isi penuh — klik judul → situs asli. **Bukan rekomendasi investasi.**

## 2. Tech Stack

| Layer | Stack | Catatan |
|-------|-------|---------|
| Framework | **SvelteKit 2 + Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`) | `adapter-vercel`, `runes: true` kecuali `node_modules` |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | `app.css` entry, dark mode via `dark:` + `documentElement.classList` |
| Parser | `fast-xml-parser` | RSS XML |
| PWA | `vite-plugin-pwa` (`generateSW`, `NetworkFirst` untuk navigate) | `static/icon-*.png`, `manifest.webmanifest` |
| Bahasa | TypeScript `6.0` | `svelte-check` |
| Deploy | Vercel Hobby | `s-maxage=600` CDN |

**Jangan tambah** heavy UI lib (shadcn dll) tanpa alasan — portal list-based, Tailwind cukup.

## 3. Perintah Penting

```bash
npm install
npm run dev          # vite dev
npm run build        # vite build (cek sebelum push)
npm run preview      # preview build
npm run check        # svelte-kit sync + svelte-check (harus 0 error)
```

**Branch aktif:** `dev` (tracking `origin/dev`). `main` = stabil. Jangan push langsung ke `main`.

## 4. Struktur Project

```
/
├── AGENTS.md                         # ← kamu di sini (root)
├── ARCHITECTURE.md                   # diagram & alur data (root)
├── README.md                         # overview + 3 fitur (root)
├── docs/
│   ├── PLAN.md                       # plan awal + riset endpoint 11 media
│   ├── DOC_FITUR_MARKET_TENTANG.md   # detail ticker + BottomNav + /market + /tentang + roadmap Phase 0-3
│   ├── PLAN_CUACA.md                 # tab Cuaca & Polusi (Open-Meteo)
│   └── PLAN_FITUR_HARIAN.md          # fitur daily habit (Sholat, Briefing, Gempa...)
├── package.json, vite.config.ts, svelte.config.js
├── src/
│   ├── app.html, app.css, app.d.ts
│   ├── lib/
│   │   ├── types.ts                  # Article, SourceDef, CategoryId, SourceResult
│   │   ├── time.ts                   # timeAgo(), isNew()
│   │   ├── categories.ts             # 6 kategori + isCategoryId()
│   │   ├── components/               # Header, Footer, NewsItem, SourceSection, Ticker, MarketTicker, BottomNav...
│   │   ├── config/sources.ts         # registry 11 media (urutan = urutan tampil)
│   │   ├── server/                   # ⚠️ SERVER-ONLY — jangan import dari client
│   │   │   ├── cache.ts              # cached(key, fn) TTL 10m, invalidateCache()
│   │   │   ├── http.ts               # fetchWithTimeout(8000ms), stripHtml(), firstImgSrc()
│   │   │   ├── rss.ts                # parseRss()
│   │   │   ├── aggregator.ts         # fetchAggregator()
│   │   │   ├── market.ts             # fetchMarketData() → MarketData (CoinGecko+Yahoo)
│   │   │   └── sources/              # 1 file/media (detik.ts, cnn.ts, ...), pakai factory
│   │   └── utils/                    # *.svelte.ts runes: clock, bookmarks, settings, url
│   ├── routes/
│   │   ├── +layout.svelte            # wrapper 420px, Header + MarketTicker + main + Footer + BottomNav
│   │   ├── +layout.server.ts         # load market global (cached, try/catch)
│   │   ├── +page.svelte              # home: Ticker berita + chip kategori + filter sumber
│   │   ├── +page.server.ts           # home: Promise.allSettled 11 media, ?kategori
│   │   ├── market/                   # /market — tabel saham/crypto
│   │   ├── tentang/                  # /tentang — static 5 card
│   │   ├── baca/                     # /baca?source=&u=&id= — detail + multi-pool lookup
│   │   ├── media/[source]/           # /media/:source — list 50 + load-more
│   │   ├── cari/                     # /cari?q= — search pool cache
│   │   ├── simpan/                   # /simpan — bookmarks localStorage
│   │   └── api/source/[id]/          # GET /api/source/:id?force=1 — retry per-section
│   └── lib/assets/favicon.svg
└── static/                           # favicon, icon-192/512, robots.txt
```

**README per folder:** `src/lib/README.md`, `components/README.md`, `server/README.md`, `server/sources/README.md`, `utils/README.md`, `routes/README.md` — baca sebelum ubah folder itu.

## 5. Arsitektur & Alur Data

```
Browser → Vercel CDN (s-maxage=600) → SvelteKit Server (Promise.allSettled)
                                              ├─ sources/* → cache.ts (TTL 10m) → RSS / berita-indo-api
                                              └─ market.ts → cached('market:ticker') → CoinGecko + Yahoo Finance
```

- Semua fetch **server-side only** (`+page.server.ts` / `server/*`) → bebas CORS.
- `Promise.allSettled` — 1 sumber gagal ≠ halaman crash.
- Cache 2 lapis: memori `TTL 10m` + CDN `s-maxage=600, stale-while-revalidate=1800`.
- Market reuse key `market:ticker` untuk `+layout.server.ts` & `/market` — hemat quota.
- Upstream timeout 7-8s (`AbortController`), UA browser.

**Types inti:**
```ts
interface Article { source, title, url, publishedAt: ISO, summary, image? }
interface MarketItem { symbol, name, price, change24h: number|null, currency: IDR|USD, type: idx|forex|crypto }
interface MarketData { items: MarketItem[], fetchedAt: ISO }
```

## 6. Peta Route & Konvensi

| Route | File | Fungsi |
|-------|------|--------|
| `/` | `routes/+page.*` | Home: 11 section ×3 artikel, `?kategori=` (6 kategori kanonik), filter sumber client, `Ticker` berita |
| `/market` | `routes/market/+page.*` | Market: IHSG/LQ45/USDIDR + crypto top 5, badge 24h |
| `/tentang` | `routes/tentang/+page.svelte` | Static: 5 card info aplikasi |
| `/baca` | `routes/baca/+page.*` | Detail: `u=` primary → `id` fallback → scan pool kategori |
| `/media/:source` | `routes/media/[source]/+page.*` | List 50 + load-more +10 |
| `/cari?q=` | `routes/cari/+page.*` | Search pool 100/media, max 50 |
| `/simpan` | `routes/simpan/+page.svelte` | Bookmarks localStorage snapshot |
| `GET /api/source/:id` | `routes/api/source/[id]/+server.ts` | Retry per-section, `?force=1` invalidate |

**Layout:** `+layout.svelte` = `Header` sticky + `MarketTicker` global (`data.market`) + `main pb-[calc(56px+safe-area)]` + `Footer` + `BottomNav` fixed 3 tab. `+layout.server.ts` load market (try/catch).

**Konvensi:**
- Svelte 5 runes: `$props()`, `$state`, `$derived`, `$effect`, `onclick={}` (bukan `on:click`)
- Dark mode: `class="dark:bg-..."` + toggle `documentElement.classList.toggle('dark')`
- Waktu relatif: `clock.now` update 30s di layout, `timeAgo(iso, clock.now)`
- Icon: inline SVG `stroke="currentColor"` tanpa lib
- Cache key: `rss:{id}`, `agg:{id}`, `market:ticker`; kategori = headline → dedup

## 7. Data Sources

| Sumber | Endpoint | Key | Catatan |
|--------|----------|-----|---------|
| Berita RSS | `news.detik.com/rss`, `cnnindonesia.com/rss`, `jpnn.com/rss`, `mediaindonesia.com/feed`, `inews.id/feed` | — | `fast-xml-parser`, enclosure/image |
| Berita aggregator | `berita-indo-api.vercel.app/v1/{antara,cnbc,tempo,...}` | — | fallback RSS bila 500 |
| Crypto | `api.coingecko.com/api/v3/coins/markets?ids=bitcoin,ethereum,solana,binancecoin,tether` | tanpa key | 10-50 req/menit |
| Saham/Forex | `query1.finance.yahoo.com/v8/finance/chart/^JKSE,IDR=X` | tanpa key | hitung change dari `previousClose`, fallback dummy + derived LQ45 |

**Jangan** hardcode API key saham/crypto berbayar — pakai yang gratis di atas. Selalu `cached()` + CDN.

## 8. Aturan Untuk Agent (Wajib Patuh)

1. **Jangan import `$lib/server/*` dari komponen client** — hanya dari `+page.server.ts` / `+server.ts` / file `server/*`.
2. **Svelte 5 runes only** — jangan pakai `export let`, `on:click`, store `writable` lama.
3. **Server load harus `Promise.allSettled` + `s-maxage`** — jangan `Promise.all` yang jatuhkan halaman.
4. **Cache TTL 10m** — bungkus fetch baru dengan `cached(key, fn)`.
5. **BottomNav 3 tab tetap** — jangan pindah ke drawer/hamburger (sudah diputuskan). Urutan `Berita|Market|Tentang`.
6. **Mobile-first 420px** — jangan melebar desktop, jangan ubah `max-w-[420px]` tanpa diskusi.
7. **Cek sebelum push:** `npm run check` 0 error + `npm run build` pass.
8. **Branch:** kerja di `dev`, jangan push ke `main` langsung. Commit message `feat|fix|docs|refactor(scope): ...`.

## 9. State Saat Ini (dev — 2026-01-04)

**Done:**
- Market ticker global + `/market` + `/tentang` + BottomNav (build pass, `svelte-check 0`)
- Hapus `PLAN_TIER_*` & `PLAN_BUGFIX_*` (tidak diperlukan lagi)
- README 5 folder update + `ARCHITECTURE.md` + `docs/DOC_FITUR_MARKET_TENTANG.md` + `docs/PLAN_CUACA.md` + `docs/PLAN_FITUR_HARIAN.md` → pindah ke `docs/` kecuali `AGENTS.md` & `ARCHITECTURE.md`

**Belum / Next (opsional):**
- Binance fallback, sparkline 7d, Fear & Greed `alternative.me/fng`, auto-tag berita saham/crypto
- Monetisasi QRIS (slot Footer masih placeholder)

## 10. Cara Lanjut Sesi Baru

1. Baca `AGENTS.md` (ini) → `ARCHITECTURE.md` → `docs/DOC_FITUR_MARKET_TENTANG.md` jika sentuh market → `docs/PLAN_CUACA.md` / `docs/PLAN_FITUR_HARIAN.md` untuk fitur baru.
2. `git status` + `git branch` (pastikan di `dev`).
3. `npm run check` sebelum ubah apa pun.
4. Tanya user mau fitur apa — jangan asumsi. Jika butuh API baru, cek gratis dulu (CoinGecko/Yahoo/Alternative.me/TradingView embed).
5. Setelah ubah: `npm run check` + `npm run build` → ringkas file yang diubah.

## 11. Pitfalls

- Yahoo 403 → ticker sudah ada fallback dummy, jangan panic.
- CoinGecko 429 → sudah di-cache 10m + CDN, jangan tambah polling client.
- LQ45 Yahoo tidak reliable → derived `IHSG*0.135`, jangan fetch symbol aneh.
- `node_modules` runes exception di `vite.config.ts` — jangan hapus.
- PWA `workbox.runtimeCaching NetworkFirst` untuk navigate — jangan ubah ke CacheFirst.
