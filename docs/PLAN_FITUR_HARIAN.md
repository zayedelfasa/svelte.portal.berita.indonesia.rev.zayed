# PLAN_FITUR_HARIAN.md — Fitur Agar Dibuka Tiap Hari

> Branch `dev` — 2026-01-04
> Status: **Planned** — belum dikerjakan
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

**Habit = rutinitas, bukan penasaran.** Butuh fitur yang dicek karena **waktu** (sholat), **pagi** (briefing), **FOMO** (gempa).

### Prioritas (Effort vs Retention)

| Prioritas | Fitur | API Free | Effort | Retention | Kenapa |
|-----------|-------|----------|--------|-----------|--------|
| **P1** | **Jadwal Sholat + Countdown + Adzan Reminder** | Aladhan tanpa key | Kecil (1 hari) | ⭐⭐⭐⭐⭐ | 87% user Indo, cek 5x/hari — habit terkuat |
| **P1** | **Daily Briefing 07:00 + Push** | Tanpa API (reuse berita pool) | Kecil (1 hari) | ⭐⭐⭐⭐ | Alasan buka jam 7 pagi, tanpa LLM |
| **P2** | **Gempa BMKG Realtime + Banner** | BMKG tanpa key | Kecil (0.5 hari) | ⭐⭐⭐⭐ | FOMO, 1 gempa M5 → semua buka |
| **P2** | **Harga Harian Emas Antam + Sembako + BBM** | CoinGecko gold + scrape pangan.go.id | Kecil (1 hari) | ⭐⭐⭐ | Ibu/ayah cek tiap pagi |
| **P3** | **Kalender Hijriah/Jawa + Hari Libur** | Aladhan Hijri + API hari libur | Kecil | ⭐⭐⭐ | Dicek tiap hari + jelang libur |
| **P3** | **Skor Bola Liga 1 & EPL** | ESPN hidden API tanpa key | Medium | ⭐⭐⭐⭐ | Pria 18-40 cek tiap malam |

**Tunda:** Horoskop, Quotes (retention rendah), Chat AI (cost), Game (konten harian berat).

---

## 2. P1 — Jadwal Sholat (Wajib Pertama) ⭐

### API Gratis

| API | Endpoint | Key | Limit |
|-----|----------|-----|-------|
| **Aladhan** | `https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=20` (Kemenag) | Tanpa | Unlimited |
| Fallback | `https://api.myquran.com/v2/sholat/jadwal/:kota/:tanggal` | Tanpa | Unlimited |

Response: `{Fajr:04:42, Dhuhr:11:58, Asr:15:12, Maghrib:17:58, Isha:19:10, Hijri:{date, month}}`

### Arsitektur

```
+page.server.ts ?city=Jakarta → cached('sholat:Jakarta:{date}') → Aladhan → timings
+page.svelte → hitung countdown ke sholat berikut via clock.now (30s tick)
PWA: setTimeout ke jam sholat → new Notification("Dzuhur 11:58") + Toast
```

Cache key `sholat:{city}:{date}` TTL 12 jam. Fallback kota dari `/cuaca` lat/lon → reverse geocode → `city`.

### UI

- **Home widget top:** Card gradient `QiblaHijau` — `Dzuhur 11:58 • 1j 23m lagi` + 5 jadwal mini `Subuh 04:42 | Dzuhur 11:58* | Ashar 15:12 ...`, toggle kota
- **Halaman `/sholat` (atau tab Harian):** Tabel 5 waktu + Hijriah `12 Rajab 1447` + kiblat compass (optional Phase 2)
- **Push:** minta `Notification.requestPermission()`, schedule 5 waktu, max 1 notif/waktu

### File

| File | Fungsi |
|------|--------|
| `src/lib/server/sholat.ts` | `fetchSholat(city)` cached |
| `src/lib/components/SholatCard.svelte` | Countdown + 5 jadwal |
| `src/routes/sholat/+page.*` atau integrasi di home | Halaman sholat |
| Update `BottomNav` jika jadi tab ke-5, atau gabung di `Harian` | — |

### Verifikasi

`/sholat` → 5 waktu Jakarta benar, countdown jalan tiap menit, ganti kota Surabaya → jam update, tolak lokasi → Jakarta default.

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

- Hijriah gratis dari Aladhan `Hijri.date` (sudah ada di sholat response)
- Hari libur: `https://api-harilibur.vercel.app/api` atau `https://www.googleapis.com/calendar/v3/calendars/indonesian__id@holiday.calendar.google.com` (tanpa key untuk public)
- UI: Card `Hari ini: Senin, 12 Rajab 1447 • 7 hari lagi: Isra Miraj (libur)` di home

### Skor Bola

- API free: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard` (EPL tanpa key), Liga 1 via scrape `ligaindonesiabaru.com` (Phase 2)
- UI: Card `Live: Persija 1-0 Persib 67'` di home, halaman `/bola` jadwal
- File: `src/lib/server/bola.ts` cached `bola:scoreboard` TTL 5m

---

## 7. Struktur Navigasi Akhir (Rekomendasi)

**Opsi A — 5 tab (max):**

```
[Berita /] [Market /market] [Cuaca /cuaca] [Harian /harian] [Tentang /tentang]
Harian = Sholat + Briefing + Gempa + Harga (4 fitur 1 tab, hemat tab)
```

**Opsi B — 4 tab (lebih lega):**

```
[Berita /] [Market /market] [Cuaca /cuaca] [Tentang /tentang]
+ Home widget stack: Sholat countdown → Briefing → Gempa banner → Harga ticker → Berita
(Gempa & Briefing sebagai widget home, bukan tab)
```

**Rekomen:** Opsi B dulu (4 tab), Harian sebagai widget home. Jika retensi bagus, pecah jadi tab `/harian` di Phase 2.

---

## 8. Roadmap & Urutan Eksekusi

| Urutan | Fitur | Estimasi | Deliverable |
|--------|-------|----------|-------------|
| 1 | **Sholat** (Aladhan) | 1 hari | `/sholat` + home card + countdown |
| 2 | **Briefing 07:00** (reuse berita) | 1 hari | Card home + push + `/briefing` |
| 3 | **Gempa BMKG** | 0.5 hari | Banner + `/gempa` + push M≥5 |
| 4 | Harga Harian | 1 hari | Ticker + `/harga` |
| 5 | Kalender Hijriah + Libur | 0.5 hari | Card kalender |
| 6 | Skor Bola | 1-2 hari | Card skor + `/bola` |

**Mulai 1+2 dulu** → langsung ada alasan buka jam 05:00 (Subuh) & 07:00 (Briefing) tiap hari.

---

## 9. Verifikasi Tiap Fitur

```bash
npm run check && npm run build
# Sholat: /sholat → 5 waktu, countdown jalan, ganti kota, notif 1x
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
| Aladhan/BMKG 5xx | `Promise.allSettled` + fallback static, card `Tidak tersedia` |
| Push spam | Max 1 notif/hari per fitur (briefing 07:00, sholat 5x), debounce, permission eksplisit |
| BottomNav 5 tab sesak | Opsi B 4 tab + widget, max 5 tab `text-[10px]` |
| Sembako API CORS | Fetch server-side only (sudah pola), fallback static 3 komoditas |
| Skor bola quota | Cache 5m + fallback `Jadwal belum tersedia` |

---

## 11. Referensi

- Aladhan: `https://aladhan.com/prayer-times-api`
- MyQuran: `https://api.myquran.com`
- BMKG: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
- Hari Libur: `https://api-harilibur.vercel.app`
- ESPN Scoreboard: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`
- CoinGecko Gold: `https://api.coingecko.com/api/v3/coins/markets?ids=gold`
- Pangan: `https://panelharga.badanpangan.go.id`

---

## 12. Status Tracker

| Fitur | Status | File Kunci |
|-------|--------|------------|
| Sholat | ⏳ Planned | `sholat.ts`, `SholatCard` |
| Briefing 07:00 | ⏳ Planned | `briefing.ts`, `BriefingCard` |
| Gempa BMKG | ⏳ Planned | `gempa.ts`, `GempaBanner` |
| Harga Harian | ⏳ Planned | `harga.ts`, `HargaTicker` |
| Kalender | ⏳ Planned | `Hijri` dari sholat |
| Skor Bola | ⏳ Planned | `bola.ts` |

> Update ⏳→✅ tiap selesai 1 fitur. Gabung ke `DOC_FITUR_MARKET_TENTANG.md` §11 jika mau 1 tracker pusat.
