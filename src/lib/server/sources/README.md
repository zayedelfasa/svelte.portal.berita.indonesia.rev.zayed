# sources/ — Adapter Per Media

Factory yang menstandarkan 11 media ke satu interface `SourceAdapter`.

## Factory

| Factory | Sumber data | Hasil verifikasi |
|---|---|---|
| `makeRssSource(id, feedUrl, categories?)` | RSS resmi media | parse XML → `Article[]` |
| `makeAggregatorSource(id, apiPath, { fallbackFeed?, categories? })` | berita-indo-api (`berita-indo-api.vercel.app/v1`) | fetch JSON → `Article[]`, fallback ke RSS bila mati |

Keduanya mengembalikan:
```ts
{
  fetchTop: (limit) => Promise<Article[]>,
  fetchCategory?: (cat, limit) => Promise<Article[]>,  // hanya bila categories diisi
  supportedCategories?: CategoryId[]
}
```

Cache otomatis menempel di tiap factory:
- headline: `rss:{id}` / `agg:{id}`
- kategori: `rss:{id}:{cat}` / `agg:{id}:{cat}`
- dedup: bila URL kategori === headline → reuse key headline

## Tabel 11 Media

| # | Media | Tipe | Headline | Kategori didukung |
|---|---|---|---|---|
| 1 | Detik | RSS | `news.detik.com/rss` | 6 (nasional, ekonomi, tekno, olahraga, hiburan, gayahidup) |
| 2 | CNN Indonesia | aggregator | `/cnn-news/` | 6 |
| 3 | Antara | RSS | `antaranews.com/rss/terkini.xml` | 6 |
| 4 | CNBC Indonesia | aggregator | `/cnbc-news/news` | 4 (nasional, ekonomi, tekno, gayahidup) |
| 5 | Tempo | aggregator | `/tempo-news/nasional` | 5 |
| 6 | Republika | aggregator | `/republika-news/news` | 4 |
| 7 | Okezone | aggregator | `/okezone-news/breaking` | 6 |
| 8 | Kumparan | aggregator | `/kumparan-news` | 0 (headline saja) |
| 9 | JPNN.com | RSS | `jpnn.com/rss` | 0 |
| 10 | Media Indonesia | RSS | `mediaindonesia.com/feed` | 0 |
| 11 | iNews | RSS | `inews.id/feed` | 6 |

Lihat `PLAN_TIER_1.md` bagian *Hasil Verifikasi Endpoint* untuk URL tepat per kategori.

## Menambah Media Baru

1. Buat file baru di sini, mis. `liputan6.ts`:
   ```ts
   import { makeRssSource } from './rssSource';
   export const fetchLiputan6Adapter = makeRssSource('liputan6', 'https://www.liputan6.com/rss');
   ```
2. Daftarkan di `src/lib/config/sources.ts` → tambah entry `...fetchLiputan6Adapter`
3. Verifikasi endpoint: `curl -o /dev/null -w "%{http_code}" -A "Mozilla/5.0" "<url>"`
4. Bila kategori ada, isi peta `categories` dan update tabel atas
