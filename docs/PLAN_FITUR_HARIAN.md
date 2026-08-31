# PLAN_FITUR_HARIAN.md — Fitur Agar Dibuka Tiap Hari

> Branch `dev` — 2026-01-04 → 2026-08-31
> Status: **DONE** — 5 fitur selesai (Sholat dihapus)
> Referensi: `../AGENTS.md`, `../ARCHITECTURE.md`, `DOC_FITUR_MARKET_TENTANG.md`, `PLAN_CUACA.md`
> Goal: tambah **habit trigger harian** biar bukan cuma dibuka pas ada berita viral. Target: user buka 1-2x/hari karena rutinitas.

## 1. Ringkasan & Analisa

### Kenapa 3-4 fitur sekarang belum cukup daily?

| Fitur | Kapan dibuka | Frekuensi real |
|-------|--------------|----------------|
| Berita (11 media) | Ada isu / scroll iseng | 2-3x/minggu |
| Market (IHSG/crypto) | Jam bursa 09-16 | 1x/hari (hanya trader) |
| Cuaca+Polusi (planned) | Pagi mau berangkat | 1x/hari (cepat bosan) |
| Tentang | Sekali lihat | Jarang |

**Habit = rutinitas, bukan penasaran.** Butuh fitur yang dicek karena **pagi** (briefing), **FOMO** (gempa), **pagi** (harga).

### Prioritas (Effort vs Retention)

| Prioritas | Fitur | API Free | Effort | Retention | Kenapa |
|-----------|-------|----------|--------|-----------|--------|
| **P1** | **Daily Briefing 07:00 + Push** | Tanpa API (reuse berita pool) | Kecil (1 hari) | ⭐⭐⭐⭐ | Alasan buka jam 7 pagi, tanpa LLM |
| **P2** | **Gempa BMKG Realtime + Banner** | BMKG tanpa key | Kecil (0.5 hari) | ⭐⭐⭐⭐ | FOMO, 1 gempa M5 → semua buka |
| **P2** | **Harga Harian Emas Antam + Sembako + BBM** | CoinGecko gold + scrape pangan.go.id | Kecil (1 hari) | ⭐⭐⭐ | Ibu/ayah cek tiap pagi |
| **P3** | **Kalender Hijriah/Jawa + Hari Libur** | Aladhan Hijri + API hari libur | Kecil | ⭐⭐⭐ | Dicek tiap hari + jelang libur |
| **P3** | **Skor Bola 7 liga (Liga 1 + EPL/LaLiga/SerieA/Bundesliga/Ligue1/UCL)** | ESPN + TheSportsDB fallback tanpa key | Medium | ⭐⭐⭐⭐ | Pria 18-40 cek tiap malam |

**Tunda:** Horoskop, Quotes (retention rendah), Chat AI (cost), Game (konten harian berat).

---

## 2. ~~P1 — Jadwal Sholat~~ — DIHAPUS

> **2026-08-29:** Fitur Sholat dibatalkan (keputusan owner). Tidak diimplementasi — tidak ada `sholat.ts`, `SholatCard`, route `/sholat`, atau notifikasi adzan. Aladhan/myquran tidak dipakai.

---

## 3. P1 — Daily Briefing 07:00 + Push

### Logika (Tanpa LLM, Gratis)

Reuse pool berita `100/media`:
```ts
// +page.server.ts 07:00
const top3 = results.flatMap(r=>r.articles).sort(byDate).slice(0,3)
const perKategori = CATEGORIES.map(c => top1[c])
// → "Pagi ini: Nasional — Prabowo ... • Ekonomi — IHSG ... • Tekno — ..."
```

Tambah `Web Speech API` `speechSynthesis.speak(text)` untuk tombol `🔊 Dengarkan`.

### Push 07:00

`VitePWA` `workbox` + `setInterval` cek `if now=07:00 && !notifiedToday → showNotification("Ringkasan Pagi: 3 berita teratas")`

### UI

- **Home top:** Card `🌅 Ringkasan Pagi — 3 berita 2 menit baca` + `Dengarkan`
- **Halaman `/briefing`:** List 6 kategori top 1 + link `/baca`

### File

| File | Fungsi |
|------|--------|
| `src/lib/server/briefing.ts` | `fetchBriefing()` dari cache berita, tanpa fetch baru |
| `src/lib/components/BriefingCard.svelte` | 3 bullet + audio button |
| `src/routes/briefing/+page.*` | Halaman briefing |

---

## 4. P2 — Gempa BMKG Realtime

### API Gratis

| API | Endpoint | Update |
|-----|----------|--------|
| **BMKG gempaterkini** | `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json` | <5 menit, tanpa key |
| **BMKG autogempa** | `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json` | Realtime |

Response: `{Infogempa:{gempa:[{Tanggal,Jam,Magnitude,Kedalaman, Wilayah, Coordinates}]}}`

### UI

- **Banner merah di home** (jika Magnitude ≥5 & <1 jam): `🔴 Gempa M5.2 di Sukabumi, 2 menit lalu — 10km • Cek`
- **Halaman `/gempa`:** List 15 gempa terbaru + peta link `maps.google.com/?q=lat,lon`, filter `M≥5`
- **Push:** cek 5 menit via `setInterval` → notif jika M≥5 & baru

### File

| File | Fungsi |
|------|--------|
| `src/lib/server/gempa.ts` | `fetchGempa()` cached `gempa:terkini` TTL 5m |
| `src/lib/components/GempaBanner.svelte` | Banner home |
| `src/routes/gempa/+page.*` | List gempa |

---

## 5. P2 — Harga Harian (Emas + Sembako + BBM)

### API Gratis

| Komoditas | API | Catatan |
|-----------|-----|---------|
| Emas Antam | CoinGecko `coins/markets?ids=gold` atau scrape `logammulia.com` (fallback static `Rp 1.452.000/g`) | Model vs Antam, footer disclaimer |
| Sembako | `https://api.pangan.go.id/api/harga` atau scrape `panelharga.badanpangan.go.id` (tanpa key, cek CORS server-side) | Fallback static 3 komoditas |
| BBM | List statis `Pertalite 10.000, Pertamax 12.900` (update manual bulanan) | — |

### UI

- **Ticker kedua** di bawah MarketTicker: `Emas 1.452k/g • Beras 13.200 • Cabe 45k • Pertalite 10k` (marquee kuning `bg-amber-50`)
- **Halaman `/harga`:** Tabel 3 section Emas/Sembako/BBM, sumber + disclaimer

### File

| File | Fungsi |
|------|--------|
| `src/lib/server/harga.ts` | `fetchHarga()` cached `harga:harian` TTL 6 jam |
| `src/lib/components/HargaTicker.svelte` | Ticker kedua |
| `src/routes/harga/+page.*` | Tabel harga |

---

## 6. P3 — Kalender Hijriah/Jawa + Hari Libur & Skor Bola

### Kalender

- Hijriah gratis dari Aladhan `/v1/gToH` (Gregorian → Hijri, tanpa key) — tidak lagi bergantung response sholat yang dihapus
- Hari libur: `https://api-harilibur.vercel.app/api` atau `https://www.googleapis.com/calendar/v3/calendars/indonesian__id@holiday.calendar.google.com` (tanpa key untuk public)
- UI: Card `Hari ini: Senin, 12 Rajab 1447 • 7 hari lagi: Isra Miraj (libur)` di home

### Skor Bola — 7 liga (DONE 2026-08-31)

- API free: ESPN `.../soccer/{idn.1,eng.1,esp.1,ita.1,ger.1,fra.1,uefa.champions}/scoreboard?dates=YYYYMMDD` (tanpa key, UA `axios/1.7.0` — Mozilla diblokir 403) + TheSportsDB `eventsnextleague.php?id=4790` fallback Liga 1 (gratis)
- UI: Timeline Opsi C `jam WIB kiri 52px | divider | logo tim stack + skor | LIVE/FT` — `py-3 gap-3 rounded-xl`, chip liga `Semua|Liga 1|EPL...`, toggle `Hari Ini | Minggu Ini` (7 hari Mon-Sun), group per hari
- File: `src/lib/server/bola.ts` (7 liga, week view, dedup) + `parsers.ts` `parseTheSportsDb` + `BolaMatch.homeLogo/awayLogo`, cached `bola:scoreboard` + `bola:scoreboard:week` TTL 5m

---

## 7. Struktur Navigasi Akhir (Rekomendasi)

**Opsi A — 5 tab (max):**

```
[Berita /] [Market /market] [Cuaca /cuaca] [Harian /harian] [Tentang /tentang]
Harian = Briefing + Gempa + Harga (3 fitur 1 tab, hemat tab)
```

**Opsi B — 4 tab (lebih lega):**

```
[Berita /] [Market /market] [Cuaca /cuaca] [Tentang /tentang]
+ Home widget stack: Briefing → Gempa banner → Harga ticker → Berita
(Gempa & Briefing sebagai widget home, bukan tab)
```

**Rekomen:** Opsi B dulu (4 tab), Harian sebagai widget home. Jika retensi bagus, pecah jadi tab `/harian` di Phase 2.

---

## 8. Roadmap & Urutan Eksekusi

| Urutan | Fitur | Estimasi | Deliverable |
|--------|-------|----------|-------------|
| 1 | **Briefing 07:00** (reuse berita) | 1 hari | Card home + push + `/briefing` |
| 2 | **Gempa BMKG** | 0.5 hari | Banner + `/gempa` + push M≥5 |
| 3 | Harga Harian | 1 hari | Ticker + `/harga` |
| 4 | Kalender Hijriah + Libur | 0.5 hari | Card kalender |
| 5 | Skor Bola | 1-2 hari | Card skor + `/bola` |

> ~~Sholat~~ dihapus dari roadmap (2026-08-29).

**Mulai Briefing dulu** → alasan buka jam 07:00 tiap hari.

---

## 9. Verifikasi Tiap Fitur

```bash
npm run check && npm run build
# Sholat: dihapus dari plan
# Briefing: home 07:00 card 3 bullet, klik → /briefing 6 kategori, audio play
# Gempa: banner muncul jika M5 <1 jam, /gempa list 15, klik peta → maps
# Harga: ticker emas/beras, /harga tabel 3 section
# Kalender: hijriah benar, libur 7 hari lagi
# Bola: live score, /bola jadwal
```

---

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| BMKG 5xx | `Promise.allSettled` + fallback static, card `Tidak tersedia` |
| Push spam | Max 1 notif/hari per fitur (briefing 07:00), debounce, permission eksplisit |
| BottomNav 5 tab sesak | Opsi B 4 tab + widget, max 5 tab `text-[10px]` |
| Sembako API CORS | Fetch server-side only (sudah pola), fallback static 3 komoditas |
| Skor bola quota | Cache 5m + fallback `Jadwal belum tersedia` |

---

## 11. Referensi

- Aladhan: ~~sholat~~ dihapus — masih relevan hanya untuk Hijriah (fitur Kalender)
- BMKG: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
- Hari Libur: `https://api-harilibur.vercel.app`
- ESPN Scoreboard: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`
- CoinGecko Gold: `https://api.coingecko.com/api/v3/coins/markets?ids=gold`
- Pangan: `https://panelharga.badanpangan.go.id`

---

## 12. Status Tracker

| Fitur | Status | File Kunci |
|-------|--------|------------|
| Sholat | ❌ Dihapus (2026-08-29) | — |
| Briefing 07:00 | ✅ DONE | `briefing.ts`, `BriefingCard`, `harian/briefing` + Web Speech |
| Gempa BMKG | ✅ DONE | `gempa.ts`, `GempaCard`, `harian/gempa` + filter M≥5 |
| Harga Harian | ✅ DONE | `harga.ts`, `HargaCard`, `harian/harga` (3 grup, est) |
| Kalender | ✅ DONE | `kalender.ts`, `KalenderBolaCard` (Hijri + libur Nager 30 hari) |
| Skor Bola | ✅ DONE — 7 liga + timeline + logo + week view | `bola.ts` (7 liga, UA fix, week), `parsers.ts`, `KalenderBolaCard`, `harian/bola` |

> Update ⏳→✅ tiap selesai 1 fitur. Gabung ke `DOC_FITUR_MARKET_TENTANG.md` §11 jika mau 1 tracker pusat.

## 13. Hasil Implementasi (2026-08-31)

**Tab `/harian` — semua 5 fitur terangkum 1 halaman (widget stack) + 4 route detail.**

| Fitur | Status | File |
|-------|--------|------|
| Sholat | ❌ Dihapus | — |
| Briefing | ✅ DONE — `/harian` card + `/harian/briefing` + Web Speech `id-ID` (sourceIndex fix) | `briefing.ts`, `BriefingCard.svelte` |
| Gempa BMKG | ✅ DONE — banner M≥5 + strip + `/harian/gempa` filter M≥5 + peta | `gempa.ts`, `GempaCard.svelte` |
| Harga | ✅ DONE — card ringkas + `/harian/harga` 3 grup + disclaimer | `harga.ts`, `HargaCard.svelte` |
| Kalender | ✅ DONE — Masehi+Hijriah+libur Nager ≤30 hari (timeline header) | `kalender.ts`, `KalenderBolaCard.svelte` |
| Skor Bola | ✅ DONE — 7 liga + timeline Opsi C + logo + week view + chip liga | `bola.ts` (7 liga, UA fix), `parsers.ts`, `KalenderBolaCard`, `harian/bola` |

**Navigasi:** BottomNav 4 tab `Berita | Cuaca | Harian | Tentang`. MarketTicker + Footer hide di `/harian`.

**Server baru:** `briefing.ts` (reuse pool berita, dedup judul, 10 teratas), `gempa.ts` (autogempa+gempaterkini digabung dedup, TTL 5m), `harga.ts` (emas PAXG label `est`, sembako pangan.go.id — API sering down → null jujur, BBM statis resmi, TTL 6j), `kalender.ts` (Aladhan gToH TTL 12j + Nager.Date libur ID TTL 24j), `bola.ts` (ESPN eng.1, TTL 5m). TTL baru di `cache.ts`: gempa/bola 5m, harga 6j, hijri 12j, libur 24j.

**Catatan riset endpoint:** dayoffapi.vercel.app & api-harilibur.vercel.app mati (402 deployment disabled) → pakai `date.nager.at/api/v3/publicholidays/{tahun}/ID` (aktif, gratis). Aladhan `gToH` perlu `curl -L` (301). `pangan.go.id` timeout → sembako tampil `tidak tersedia` (no dummy).

**Validasi:** `check 0` `build pass`; preview 200 semua route (`/harian`, `briefing`, `gempa`, `harga`, `bola`); gempa 15 item BMKG tampil; briefing 10 berita lintas media; emas est + sembako jujur tidak tersedia; Hijriah `18 Rabiul Awal 1448 H`; jadwal EPL Aston Villa vs Arsenal kickoff WIB.

**Update Bola 7 liga (2026-08-31):** ESPN 7 slug verified (`idn.1` 0 event → fallback TheSportsDB 4790 ada Arema vs Kalteng 2026-09-04), UA fix `axios/1.7.0` lolos WAF (Mozilla 403), week view 7 hari Mon-Sun, timeline `py-3` lega + logo `h-5/h-6 rounded-full`, dark widget fix `text-gray-900 dark:text-neutral-100`.

### QA Polish (2026-08-31) ✅
- Detail route punya `↻ Muat ulang` → `?force=1`; invalidasi cache fitur spesifik.
- Normal CDN header tervalidasi: `public, s-maxage=600, stale-while-revalidate=1800`.
- Force header tervalidasi: `no-store, no-cache, must-revalidate` (bypass CDN).
- Semua endpoint Harian eksplisit timeout 7s; AbortController + timer cleanup diuji.
- Briefing fallback `/baca` pakai `sourceIndex` asli, bukan index global hasil sort/dedup.
- Parser pure BMKG/ESPN/PAXG/Pangan + timeout test: `npm test` → 8 pass.
