# routes/ — File-Based Routing SvelteKit

Konvensi: tiap folder = 1 route/halaman. File `+page.server.ts` = load data server-side, `+page.svelte` = UI.

## Peta Route

| Folder | URL | File kunci | Fungsi |
|---|---|---|---|
| `routes/` | `/` | `+page.server.ts` | Home: `Promise.allSettled` fetchTop(3) per media; filter `?kategori=` + `unsupported` count |
| `routes/market/` | `/market` | `+page.server.ts` + `+page.svelte` | **Market**: tabel Saham/Forex (IHSG/LQ45/USD·IDR) + Crypto Top 5 (BTC/ETH/SOL/BNB/USDT), `MarketData` dari `fetchMarketData()` (reuse `market:ticker` cache), badge 24h hijau/merah |
| `routes/tentang/` | `/tentang` | `+page.svelte` (static) | **Tentang Aplikasi**: 5 card — Apa ini / 3 Fitur / Teknologi / Sumber Data / Versi; tanpa load function |
| `routes/media/[source]/` | `/media/:source` | `+page.server.ts` | List 50 artikel 1 media + load-more client (`visible` +10) |
| `routes/baca/` | `/baca?source=&u=&id=` | `+page.server.ts` | Detail: `u` primary match → `id` fallback → telusuri pool kategori (anti-404); kirim `more` 3 artikel |
| `routes/cari/` | `/cari?q=` | `+page.server.ts` | Filter pool cache 100/media (case-insensitive title+summary), max 50, s-maxage=120 |
| `routes/simpan/` | `/simpan` | `+page.svelte` | Daftar snapshot bookmarks (client localStorage), pratinjau inline `ArticleView` |
| `routes/api/source/[id]/` | `GET /api/source/:id?force=1` | `+server.ts` | Endpoint retry per-section; `force=1` → `invalidateCache` |

## Layout

`+layout.svelte` — wrapper `max-w-[420px]` putih di atas backdrop abu; sticky Header; **MarketTicker** global di bawah Header (`data.market` dari `+layout.server.ts`); `main` dengan `pb-[calc(56px+safe-area)]`; render `<Footer/>` + `<BottomNav>` fixed 3 tab.
`+layout.server.ts` — load `market: MarketData \| null` via `fetchMarketData()` (try/catch, tidak jatuhkan layout), header `s-maxage=600`.

## Konvensi

- Load function selalu kirim `fetchedAt` + header `Cache-Control: s-maxage=600` (ditampilkan di Header sebagai "Diperbarui X lalu")
- Direktif Svelte 5 runes: `$props()`, `$state`, `$derived`, `$effect`, `onclick={}`
- Navigasi: `history.back()` di Header dengan fallback `location.href='/'`; invalidasi via `invalidateAll()`
- Detail lebih dari pool umum dicari di pool kategori untuk menghindari 404 (lihat `baca/+page.server.ts`)

## Menambah halaman baru

```bash
mkdir -p src/routes/contoh
# src/routes/contoh/+page.server.ts
export const load: PageServerLoad = async () => ({ hello: 'world' });
# src/routes/contoh/+page.svelte
<script lang="ts"> let { data } = $props(); </script>
<p>{data.hello}</p>
```

Jangan lupa tambahkan link navigasi jika perlu.
