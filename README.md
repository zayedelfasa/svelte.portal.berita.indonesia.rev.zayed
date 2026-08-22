# Portal Berita Indonesia

Agregator berita lokal Indonesia — 11 media, 3 berita teratas per media.
Dibangun dengan **SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4**, deploy target **Vercel**.

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

Aggregator: [berita-indo-api](https://github.com/satyawikananda/berita-indo-api).

> Tribun News / Jawa Pos / Suara.com tidak dipakai — endpoint & RSS-nya mati/bot-block saat riset (lihat `PLAN.md`).

## Menjalankan Lokal

```bash
npm install
npm run dev          # dev server
npm run build        # build produksi
npm run preview      # preview hasil build
```

## Arsitektur Singkat

- Semua fetch upstream dilakukan **server-side** (`src/lib/server`) → bebas masalah CORS.
- Cache memori TTL 10 menit per sumber + header `s-maxage=600` untuk CDN Vercel.
- Satu sumber gagal ≠ halaman gagal (`Promise.allSettled`, section menampilkan pesan kecil).
- Halaman detail `/baca?source=X&id=Y&u=...` menampilkan gambar bila tersedia + link ke artikel asli.

Detail lengkap: lihat [`PLAN.md`](./PLAN.md).
