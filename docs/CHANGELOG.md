# Changelog Pekerjaan Project

Dokumen ini mencatat pekerjaan terakhir lintas fitur agar perubahan dapat dicek ulang.

## 2026-01-05 — Phase 1 Market: Detail Symbol, Gainer/Loser, Kalkulator, Auto-Tag

Branch kerja: `dev`

### 1. Detail Symbol `/market/[symbol]` (tanpa TradingView)

- Route baru `src/routes/market/[symbol]/+page.server.ts` + `+page.svelte`.
- Param lowercase (`btc`, `eth`, `ihsg`, `usd-idr`) dipetakan via `src/lib/marketSlug.ts` (`slugify`/`symbolFromSlug`).
- Server: `find` dari `fetchMarketData()` reuse cache; simbol tak dikenal → `error(404)`.
- UI: Header symbol + price + badge 24j + tombol balik + `Diperbarui {timeAgo}` + IDR toggle.
- **Chart pakai Sparkline 7d yang sudah ada — keputusan: tidak pakai TradingView embed.**
- Setiap row di `/market` kini link ke `/market/{slug}` → unlock navigasi.

### 2. Top Gainer / Loser + Trending

- Gainer/Loser = `$derived` dari `items` (sort `change24h`, 3 hijau / 3 merah) — tanpa API baru.
- `fetchTrending()` di `market.ts` → cached `market:trending` TTL 1 jam (CoinGecko `/search/trending`, top 6).
- `TTL.trending` ditambah di `cache.ts`.
- UI: 2 card horizontal scroll `🔥 Top Gainer` / `💧 Top Loser` + strip `⭐ Trending` di atas tabel `/market`.
- Gagal/empty → card disembunyikan (jujur, tanpa dummy).

### 3. Kalkulator Lot & Converter

- Komponen baru `src/lib/components/MarketCalculator.svelte` (client only, tanpa fetch).
- IDX/Forex: 1 lot = 100 lembar → `price * qty * 100`; Crypto: `price * qty` USD + konversi IDR via kurs.
- Dipasang di `/market` (default BTC) + `/market/[symbol]`.

### 4. Auto-Tag Berita Market

- `src/lib/marketTag.ts` pure `tagArticle(article, marketItems)` — regex keyword (Bitcoin→BTC, IHSG→IHSG, dsb), filter hanya simbol market aktif.
- Badge `bg-slate-900 text-[10px]` di `NewsItem` (home) + `ArticleView` (detail `/baca`), klik → `/market/{slug}`.
- Wiring: `+page.svelte` home & `/baca` derive `marketPool` dari `data.market`, pass via `SourceSection` → `NewsItem`.

### 5. Refactor & File

- `src/lib/marketFormat.ts` baru — extract `fmtPrice`/`changeCls`/`changeBg`/`typeBadgeCls`/`typeLabel` agar dipakai `/market` & `/market/[symbol]` (hilangkan duplikasi).
- File baru: `marketSlug.ts`, `marketFormat.ts`, `marketTag.ts`, `MarketCalculator.svelte`, `market/[symbol]/+page.*`.
- File diubah: `cache.ts`, `market.ts`, `market/+page.server.ts`, `market/+page.svelte`, `+page.svelte`, `SourceSection.svelte`, `NewsItem.svelte`, `ArticleView.svelte`, `baca/+page.svelte`.

### 6. Validasi

- `npm run check` → 0 error, 0 warning.
- `npm run build` → pass.
- Tidak ada API key berbayar / embed TradingView. Semua data tetap gratis.

## 2026-08-26 — Improvisasi Market, Data Fallback, UI, dan Dokumentasi

Branch kerja: `dev`

### 1. Halaman Market `/market`

- Menambahkan filter chip:
  - `Semua`
  - `IDX`
  - `Forex`
  - `Crypto`
- Menambahkan badge tipe pada setiap item:
  - `IDX`
  - `FOREX`
  - `CRYPTO`
- Tab `Semua` memakai satu section gabungan `Saham & Forex`, seperti tampilan awal.
- Tab `IDX` hanya menampilkan data IDX.
- Tab `Forex` hanya menampilkan data Forex.
- Tab `Crypto` hanya menampilkan data crypto.
- Menambahkan jumlah item pada header section.
- Menambahkan empty-state per filter.
- Pesan empty-state tab `IDX` dan `Forex` disamakan dengan pesan pada tab `Semua`.
- Empty-state menggunakan bahasa sopan jika sumber data bermasalah.
- Menambahkan tombol `Muat ulang` pada empty-state.

### 2. Sorting dan Aksesibilitas

- Menambahkan sorting berdasarkan:
  - Nama
  - Harga
  - Perubahan 24 jam
- Menambahkan arah sorting:
  - `↑` naik
  - `↓` turun
  - `↕` belum aktif
- Sorting berlaku untuk data IDX, Forex, dan Crypto.
- Sorting kembali ke `Nama ↑` saat filter berubah.
- Menambahkan `aria-label` pada tombol sorting.
- Ticker marquee memiliki loop kedua dengan `aria-hidden="true"` agar screen reader tidak membaca data dua kali.

### 3. IDR Toggle dan Tampilan Crypto

- Toggle harga crypto antara USD dan IDR tetap tersedia.
- Konversi IDR menggunakan kurs USD/IDR yang tersedia.
- USDT tidak menampilkan perubahan 24 jam yang tidak bermakna.
- USDT menampilkan label `stablecoin`.

### 4. Sparkline

- Menambahkan `sparkline?: number[]` pada `MarketItem`.
- Yahoo Finance mengambil data `range=7d`.
- CoinGecko menggunakan `sparkline=true`.
- Data close/harga 7 hari disimpan sebagai maksimal 7 titik.
- Menambahkan komponen baru `src/lib/components/Sparkline.svelte`.
- Sparkline dibuat dengan SVG native tanpa library tambahan.
- Sparkline ditampilkan pada card IDX, Forex, dan Crypto.
- Warna garis mengikuti arah perubahan harga:
  - hijau untuk naik
  - merah untuk turun
  - abu-abu jika data tidak cukup/datar

### 5. Sumber Data dan Fallback

- Yahoo Finance mencoba dua host:
  1. `query1.finance.yahoo.com`
  2. `query2.finance.yahoo.com`
- USD/IDR memiliki fallback `exchangerate.host` tanpa API key.
- Jika sumber data gagal, sistem tidak lagi memakai harga dummy hardcode.
- Angka seperti `IHSG 7234.5` dan `USD/IDR 16220` dihapus.
- Jika data gagal:
  1. Coba sumber utama.
  2. Coba host fallback.
  3. Coba stale cache maksimal 24 jam.
  4. Jika tidak ada cache, tampilkan empty-state yang jujur.
- LQ45 derived tetap diberi label `estimasi` dan badge `est`.

### 6. Cache Market

- Cache dipisah berdasarkan jenis data:
  - Crypto: 2 menit
  - IDX: 15 menit
  - Forex: 10 menit
- Menambahkan `peekCache()` untuk membaca stale cache tanpa mengabaikan data expired.
- `cached()` mempertahankan last-known-good data jika fetch berikutnya gagal.
- Stale cache tidak dianggap sebagai data baru.
- Timestamp lama tetap dipakai agar banner stale tampil dengan benar.

### 7. Pesan Status di `/market`

Jika seluruh market tidak tersedia:

> Data market IHSG/LQ45 sementara tidak tersedia.
> Sumber Yahoo Finance sedang sibuk atau dibatasi aksesnya. Kami tidak menampilkan angka perkiraan agar tetap jujur.
> Silakan muat ulang beberapa saat lagi.

Jika stale cache tersedia:

> Menampilkan data terakhir — diperbarui X.
> Sumber Yahoo Finance / CoinGecko sedang sibuk atau dibatasi. Data di bawah adalah cache terakhir sebelum muat ulang.

### 8. Dokumentasi

- Memperbarui `docs/DOC_FITUR_MARKET_TENTANG.md`:
  - status fitur terbaru
  - endpoint dan parameter aktual
  - fallback tanpa dummy
  - status filter, sort, dan sparkline
  - status tracker roadmap
- Menambahkan `docs/DOC_JANGAN_GUNAKAN_DUMMY.md`:
  - kebijakan resmi data market
  - aturan fallback
  - aturan stale cache
  - checklist no-dummy
- Changelog ini menggantikan changelog khusus market agar seluruh pekerjaan terakhir tercatat di satu tempat.

### 9. File Baru

- `docs/CHANGELOG.md`
- `docs/DOC_JANGAN_GUNAKAN_DUMMY.md`
- `src/lib/components/Sparkline.svelte`

### 10. File Utama yang Diubah

- `src/lib/server/cache.ts`
- `src/lib/server/market.ts`
- `src/routes/market/+page.svelte`
- `src/lib/components/MarketTicker.svelte`
- `docs/DOC_FITUR_MARKET_TENTANG.md`

### 11. Validasi

- `npm run check` → pass, 0 error.
- `npm run build` → pass.
- Tidak ada harga dummy di source code market.
- Tidak ada API key berbayar yang ditambahkan.
- Tidak ada library UI berat yang ditambahkan.

## 2026-08-27 — Tunda Market, Switch ke PLAN_CUACA, Hide Tab Market

- Market ditunda: Yahoo 403, TwelveData tidak cover JKSE/IHSG (404), idx.co.id Cloudflare block, GoAPI IDX 550k paid → tidak ada provider free yang pas untuk IDX.
- `market.ts` Yahoo → TwelveData (FOREX) + exchangerate fallback tetap, tapi IDX kosong jujur (no dummy).
- `BottomNav.svelte` Market OFF → ganti ke `Berita | Cuaca | Tentang` (Market hidden, route /market tetap ada tapi tidak di-nav).
- `+layout.svelte` MarketTicker conditional `{#if data?.market}`.
- Fokus next: `docs/PLAN_CUACA.md` Phase C1/C2 (Open-Meteo Weather+Air Quality+Geocoding, gratis unlimited).
- `npm run check` 0 error, `build` pass.

## 2026-08-27 — Phase C1/C2 Cuaca: Open-Meteo, Geocoding, Forecast & Polish

Branch kerja: `dev` — 7 issues (#1-#7) → #1-#6 closed, #7 verifikasi

### 1. Backend Cuaca (C1-1, C1-2)
- Baru `src/lib/weatherCode.ts` — mapping WMO 0-99 → label/icon ID
- Baru `src/lib/server/weather.ts` — `fetchWeather`, `fetchAirQuality`, `searchCity`, `reverseGeocode` via Open-Meteo gratis unlimited, `fetchWithTimeout(7000)` + `cached()`
- Cache split baru di `cache.ts`: `weather:10m`, `geo:1j`, `reverse:1d`
- `Promise.allSettled` — suhu gagal → polusi tetap tampil, card `Tidak tersedia`

### 2. Halaman Cuaca (C1-3, C1-4)
- Baru `src/routes/cuaca/+page.server.ts` — `?lat=&lon=&name=` default Jakarta -6.2088,106.8456, parallel fetch, `reverseGeocode` fallback, tanpa `setHeaders` (hindari double cache-control dengan layout)
- Baru `src/lib/components/WeatherCard.svelte` — standar `rounded-xl border-gray-100 bg-white` (bukan gradient), `Lokasi Saat Ini` uppercase, `H/L`, humidity, wind, `timeAgo`
- Baru `src/lib/components/AirQualityCard.svelte` — AQI 0-300 warna (Baik hijau → Berbahaya ungu), progress bar, PM2.5/PM10/O3, badge `Tidak Sehat`
- `BottomNav.svelte` sudah `Berita|Cuaca|Tentang` — tidak perlu ubah (sync 27-08)
- `+layout.svelte` Footer hide di `/cuaca` → `isCuaca` dari `page.url.pathname.startsWith('/cuaca')`
- Geolocation `Gunakan Lokasi Saya` → `navigator.geolocation` → `goto('/cuaca?lat=&lon=', replaceState)`

### 3. Search & Forecast (C2-1, C2-2)
- Baru `src/routes/cuaca/cari/+page.server.ts` + `+page.svelte` — `?q=` debounce 300ms → `searchCity` 5 hasil, kartu Kota Populer, empty `Tidak ada kota`
- Baru `src/lib/components/ForecastStrip.svelte` — 7 hari (`Sen 31°/26°`) + 24 jam horizontal scroll, `border-gray-100 bg-gray-50`
- Standar UI disamakan `tentang`/`market`: `px-4 py-4`, `rounded-xl border-gray-100`, `text-xs font-bold uppercase tracking-wide`

### 4. Revisi & Fix
- Fix 500 `cache-control header already set` → hapus `setHeaders` di `cuaca` pages (layout sudah set `s-maxage=600`)
- Revisi kaku → standar portal (hilangkan gradient, pakai `border-gray-100 bg-white`)
- Tombol `Lokasi Saya` + `Cari Kota` pindah ke atas (hanya 1 pasang, hapus duplikat bawah)
- Footer `Berita dikumpulkan` hide di tab cuaca
- Persist lokasi: `localStorage 'cuaca:loc'` → `BottomNav` `cuacaHref` dinamis + `cuaca/+page.svelte` auto-restore + `cuaca/cari` pick save → pindah tab Berita → balik Cuaca tetap lokasi terakhir (bukan default)
- `npm run check` 0 error 0 warning, `npm run build` pass (7.1-9s)

### 5. Validasi
- Preview `GET /cuaca` 200 → Jakarta 32° Cerah Berawan, AQI 165 Sangat Tidak Sehat, 7 hari + 24 jam tampil
- `/cuaca/cari?q=Bandung` 5 hasil → klik → `/cuaca?lat=&lon=` Bandung
- Geolocation allow/deny, dark mode, BottomNav active `Cuaca` OK
- Footer hide di `/cuaca`, muncul di `/`

## 2026-08-27 — Polish Layout: Hide Footer & Ticker di Cuaca/Tentang

Branch kerja: `dev`

- `src/routes/+layout.svelte` — tambah `isTentang = pathname.startsWith('/tentang') || '/about'` (cover `/about` alias)
- Footer `Berita dikumpulkan` hide di `/tentang` juga (sebelumnya hanya `/cuaca`) → `{#if !isCuaca && !isTentang}<Footer />{/if}`
- MarketTicker crypto hide di `/cuaca` & `/tentang`/`/about` → `{#if data?.market && !isCuaca && !isTentang}` (bersih, fokus cuaca/tentang)
- Update docs: `README.md`, `ARCHITECTURE.md`, `src/routes/README.md` sinkron kondisi baru
- Validasi: `npm run check` 0 error, 0 warning

## 2026-08-27 — Fix Cuaca: Reverse Geocode Lokasi Saya

Branch kerja: `dev`

- Bug: `Lokasi Saya` hanya tampil lat/lon tanpa nama kota → `geocoding-api.open-meteo.com/v1/reverse` ternyata 404 (Open-Meteo tidak punya endpoint reverse, hanya `search` + `get`)
- Fix `src/lib/server/weather.ts` `reverseGeocode()` → ganti ke `api.bigdatacloud.net/data/reverse-geocode-client?latitude=&longitude=&localityLanguage=id` gratis tanpa key, unlimited → parse `city/locality, principalSubdivision, countryName` → `"Bandung, Jawa Barat, Indonesia"` (test -6.9147,107.6098 → 200 OK)
- Fix `src/routes/cuaca/+page.svelte` `useMyLocation()` → hapus `saveLoc` prematur sebelum `goto` (simpan nama stale Jakarta) → biar `$effect` save setelah server return `cityName` benar
- Update `README.md` sumber cuaca tambah BigDataCloud
- Validasi: `npm run check` 0 error, `npm run build` pass

## 2026-08-27 — PLAN Market TradingView (NEXT PLAN)

Status: **NEXT** — Yahoo HAPUS total (403 kurang bagus)

- Buat `docs/PLAN_MARKET_TRADINGVIEW.md` — plan TradingView embed READ ONLY, gratis tanpa API key
- Sumber baru: TradingView widget (Ticker Tape + Market Overview + Mini Chart), bukan Yahoo/TwelveData/exchangerate.host
- Isi awal: IHSG (`IDX:COMPOSITE`), USD/IDR (`FX_IDC:USDIDR`), BTC/ETH/SOL (`BINANCE:*`) + tombol **Lihat lainnya →** ke `/market`
- Yahoo hapus total: `market.ts` fungsi `fetchTwelveItem`/`fetchIdxForex`/`YAHOO_SYMBOLS`/`query1/2` dihapus
- BottomNav balik 4 tab `Berita | Cuaca | Market | Tentang` (Market ON lagi)
- `+layout.svelte` ganti `MarketTicker` → `TradingViewTicker`, `+layout.server.ts` hapus `fetchMarketData()`
- Validasi next: `npm run check` 0 error + `build` pass + cek dark mode & lazy load

## Pekerjaan yang Belum Dikerjakan

### Market — NEXT PLAN (TradingView)

- EXECUTE `PLAN_MARKET_TRADINGVIEW.md` (3 component TradingView + BottomNav 4 tab + /market widget)
- Watchlist.
- Fear & Greed, dominance, dan market cap.
- Kurs lengkap dan data emas.
- Heatmap LQ45.
- Economic Calendar.
- Berita terkait symbol.
- Portfolio simulasi.
- Alert harga.

### Project Umum

- Monetisasi QRIS pada slot Footer masih placeholder.
- Belum ada commit baru setelah pekerjaan ini.
- Belum push ke remote branch.

## Catatan Verifikasi Manual

1. Buka `/market`.
2. Coba filter `Semua`, `IDX`, `Forex`, dan `Crypto`.
3. Coba sorting `Nama`, `Harga`, dan `24j`.
4. Periksa sparkline pada card market.
5. Jika Yahoo diblokir, pastikan:
   - tidak muncul angka dummy;
   - stale cache memiliki timestamp lama;
   - empty-state memakai bahasa sopan;
   - tombol `Muat ulang` tersedia.
