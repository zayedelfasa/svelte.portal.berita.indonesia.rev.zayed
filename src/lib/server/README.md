# server/ — Logika Server-Side Only

**Jangan import folder ini dari komponen client.** Semua kode di sini hanya boleh
dieksekusi dari `+page.server.ts`, `+server.ts`, atau file lain di dalam `server/`.

## File

| File | Fungsi |
|---|---|
| `http.ts` | `fetchWithTimeout(url, opts, ms=8000)` dengan AbortController + UA browser; `stripHtml()` bersihkan tag+entitas; `firstImgSrc()` ambil `<img src>` pertama (skip data-uri & pixel 1x1) |
| `rss.ts` | `parseRss(xml, sourceId)` — fast-xml-parser, `removeNSPrefix` (`content:encoded`→`encoded`), ekstrak gambar dari enclosure → img tag |
| `aggregator.ts` | `fetchAggregator(path, id)` — fetch JSON berita-indo-api, normalisasi ke `Article[]` |
| `cache.ts` | Map memori TTL 10 menit: `cached(key, fn)` + `invalidateCache(prefix)` untuk retry per-section |
| `sources/` | Adapter 11 media — [README](sources/README.md) |

## Alur request

```
load function
  → cached('rss:detik', fn)        # cek cache memori
      → fetchWithTimeout(upstream) # timeout 8 detik
      → parseRss / fetchAggregator # normalisasi Article[]
  → slice(0, limit)
```

## Cache

- TTL **10 menit**, prune otomatis saat map > 200 entri
- Key convention:
  - `rss:{id}` / `agg:{id}` — pool headline
  - `rss:{id}:{cat}` / `agg:{id}:{cat}` — pool kategori
  - Kategori = URL headline → reuse key headline (dedup)
- Per-instance serverless: cache hangus saat instance cold start — itu kenapa
  ada lapisan kedua di CDN (`s-maxage=600`)

## Menambah helper server

1. Pure function murni (tanpa state global) → taruh di `http.ts`
2. Butuh cache → bungkus dengan `cached()` dari `cache.ts`
3. Selalu return tipe `Article[]` yang sudah dinormalisasi — jangan bocorkan bentuk mentah upstream ke route
