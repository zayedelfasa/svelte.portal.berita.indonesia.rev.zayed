# components/ — Komponen UI Svelte

Komponen presentational. Data selalu masuk lewat props (dari load function), tidak pernah fetch sendiri.

## Daftar Komponen

| Komponen | Props | Dipakai di | Fungsi |
|---|---|---|---|
| `Header.svelte` | — (baca `page` & `page.data`) | `+layout.svelte` | Top bar sticky: back, judul, tema, cari, bookmark badge, thumb toggle, refresh, tanggal + Diperbarui |
| `Footer.svelte` | — | `+layout.svelte` | Credit sumber + slot QRIS nonaktif |
| `NewsItem.svelte` | `article: Article`, `index: number` | SourceSection, /media, /cari, /simpan(more) | 1 baris artikel: judul clamp-2, badge BARU (<30 mnt), waktu relatif berjalan, thumbnail opsional, tombol bookmark |
| `SourceSection.svelte` | `result: SourceResult` | home | Header media + 3 NewsItem; state lokal untuk retry "Coba lagi" via `/api/source/:id` |
| `SkeletonSection.svelte` | — | home, /media | Placeholder animate-pulse saat `navigating` |
| `ArticleView.svelte` | `article: Article`, `sourceName: string` | `/baca` | Detail: gambar aspect-video, judul, summary, tombol Baca sumber ↗ / Bagikan / Simpan |
| `Ticker.svelte` | `articles: Article[]` | home | Marquee 8 headline terbaru, pause on hover, hormati reduced-motion |
| `MarketTicker.svelte` | `data: MarketData \| null` | `+layout.svelte` (global) | **Market ticker** IHSG/LQ45/USD·IDR+BTC/ETH/SOL/BNB/USDT, marquee 80s `bg-slate-900`, `▲/▼` hijau/merah, duplikasi `[...items,...items]` untuk loop seamless |
| `BottomNav.svelte` | — (baca `page.url.pathname`) | `+layout.svelte` (global) | **Bottom navigation** 3 tab fixed `max-w-[420px]` — Berita `/`+`/baca`/cari/media/simpan, Market `/market`, Tentang `/tentang`; `safe-area-inset-bottom`, active `text-red-500` |
| `Toast.svelte` | `message: string`, `show: boolean` | ArticleView | Notifikasi kecil fixed bottom |

## Konvensi

- Semua komponen **dark-mode ready** (pasangan class `dark:`)
- Waktu relatif membaca `clock.now` dari `$lib/utils/clock.svelte` → label berjalan otomatis tiap 30 detik
- Event pakai sintaks runes (`onclick={...}`), bukan `on:click`
- Ikon = inline SVG stroke currentColor (tanpa library ikon)

## Contoh penggunaan

```svelte
<script lang="ts">
  import NewsItem from '$lib/components/NewsItem.svelte';
  import type { Article } from '$lib/types';
  let { articles }: { articles: Article[] } = $props();
</script>

{#each articles as article, i (article.url)}
  <NewsItem {article} index={i} />
{/each}
```
