# PLAN_FITUR_WANITA.md — Fitur Harian untuk Audiens Wanita

> Branch `dev` — 2026-08-27
> Status: **Planned** — belum dikerjakan (acuan dev selanjutnya)
> Referensi: `AGENTS.md`, `ARCHITECTURE.md`, `PLAN_FITUR_HARIAN.md` §6 (Skor Bola), `PLAN_CUACA.md`
> Goal: **imbangin Poin 6 Skor Bola (cowok 18-40)** dengan fitur habit harian untuk **wanita/ibu rumah tangga** — retention harian cewek, tetap gratis tanpa API key, mobile-first `max-w-[420px]`.
> Prinsip: sama dengan `AGENTS.md` §8 — server-only fetch, `cached()` + `s-maxage=600`, `Promise.allSettled`, Svelte 5 runes, no dummy, no paid key.

## 1. Ringkasan & Kenapa Butuh

### Skor Bola = Bias Gender

| Fitur existing P6 | Target | Cek harian | Kelemahan |
|---|---|---|---|
| Skor Bola Liga1/EPL | Pria 18-40 | malam hari | wanita jarang cek skor |

**Wanita butuh trigger beda:** masak tiap hari, drakor tiap malam, kalender haid tiap bulan — **frekuensi lebih tinggi daripada bola.**

### 3 Kandidat Pengganti / Pelengkap (cek API live 2026-08-27)

| Opsi | Fitur | API Free (live test) | Effort | Retention cewek | Catatan |
|---|---|---|---|---|---|
| **A** | **Resep Harian — Ide Masak Hari Ini** | `themealdb.com` ✅ `200 OK` tanpa key (key `1`) | Kecil 0.5 hari | ⭐⭐⭐⭐⭐ | Ibu cek tiap pagi/sore, habit terkuat cewek |
| **B** | **Jadwal Drakor / Hiburan** | `api.tvmaze.com` ✅ `200 OK` tanpa key / `kitsu.io` ✅ ; `api.themoviedb.org` ❌ `401` butuh key | Kecil 0.5 hari | ⭐⭐⭐⭐ | Cewek 18-35 FOMO drakor |
| **C** | **Kalender Haid + Tips Harian** | Tanpa API ✅ localStorage | Kecil 0.5 hari | ⭐⭐⭐⭐⭐ | Private, no quota, cek tiap hari |

**Rekomen:** **A dulu** (Resep) → **C** (Haid) → **B via TVMaze** (Drakor). Bola tetap ada untuk cowok, wanita dapat A/C sebagai imbang. Opsi Harian 1 tab bisa tampung semua.

> Verifikasi live 2026-08-27: `GET themealdb.com/api/json/v1/1/random.php → 200 {meals:[...]}` ; `GET api.tvmaze.com/search/shows?q=korean → 200 [A Korean Odyssey ...]` ; `GET api.themoviedb.org/3/tv/on_the_air → 401` (butuh key, skip) ; `GET kitsu.io/api/edge/anime → 200`.

**Tunda:** Horoskop/Quotes (retention rendah), Skincare scrape (CORS berat), Marketplace promo (butuh affiliate key).

---

## 2. Opsi A — Resep Harian (Ide Masak Hari Ini) ⭐ Prioritas 1

### API Gratis (verified)

| API | Endpoint | Key | Limit | Test |
|---|---|---|---|---|
| **TheMealDB** | `https://www.themealdb.com/api/json/v1/1/random.php` | `1` (test key, tanpa daftar) | Unlimited (fair use) | ✅ 200 OK 2026-08-27 |
| Kategori | `.../categories.php` , `.../filter.php?c=Seafood` , `.../list.php?a=list` | sama | — | ✅ |
| Filter area | `.../filter.php?a=Canadian` ( `a=Indonesian` → `null`, fallback ke random) | sama | — | ✅ |
| Fallback | `.../search.php?s=Arrabiata` | sama | — | ✅ |

Response: `{meals:[{idMeal, strMeal, strCategory, strArea, strInstructions, strMealThumb, strYoutube, strIngredient1..20, strMeasure1..20}]}`

> Catatan: TheMealDB gratis selamanya di titik akses. Key `1` untuk dev/edukasi. Untuk publish appstore perlu supporter key, tapi Vercel Hobby web tidak perlu — tetap pakai `1`. Jangan hardcode key lain.

### Arsitektur (ikuti `weather.ts` / `market.ts`)

```
+page.server.ts → cached('resep:harian:{date}', 6j) → fetchWithTimeout(7000) → TheMealDB random.php
              → fallback cached('resep:fallback') peekCache 24j jika 5xx
              → Promise.allSettled (resep gagal → card Tidak tersedia, page tetap 200)
+page.svelte → $derived dari data.resep → card + bahan list + langkah
localStorage 'resep:fav' → simpan favorit (mirip bookmarks)
```

Cache keys:
- `resep:harian:{YYYY-MM-DD}` TTL 6 jam (ganti tiap hari, hemat quota)
- `resep:kategori:{cat}` TTL 1 jam
- Peek stale 24j via `peekCache()` (pola market).

### UI (standar portal `rounded-xl border-gray-100 bg-white`)

- **Home widget (stack di atas berita, di bawah Sholat/Briefing):**
  ```
  Card Resep: 🍳 Ide Masak Hari Ini
  [thumb 16:9] Cevapi Sausages • Croatian • Beef — 30 menit
  Bahan: Minced Beef 500g | Onion 1 | ... (+7)
  [Lihat Resep] [🎲 Acak Lagi] [❤️ Simpan]
  ```
  Style: `px-4 py-4 rounded-xl border border-gray-100 bg-white`, `text-xs font-bold uppercase tracking-wide` untuk header, thumb `rounded-lg`.

- **Halaman `/resep`:**
  - Hero thumb + title + category/area badge `Beef • Croatian`
  - Bahan grid 2 kolom `500g Minced Beef` + thumb ingredient `.../images/ingredients/lime.png`
  - Langkah `strInstructions` split `\r\n` → ordered list
  - Youtube embed `strYoutube` → link `Tonton Video`
  - Tombol `Acak Resep Lain` → `?random=1` → invalidate cache harian (force fetch baru)
  - Favorit list `localStorage` di `/resep?simpan`

- **Empty/err:** `Resep tidak tersedia — coba lagi` + `Muat ulang` (no dummy).

### File

| File | Fungsi |
|---|---|
| `src/lib/server/resep.ts` | `fetchResepHarian()`, `fetchResepByCategory(cat)` — `cached()` + `fetchWithTimeout` |
| `src/lib/components/ResepCard.svelte` | Card home + detail bahan/langkah |
| `src/routes/resep/+page.server.ts` | load harian `?random=&c=` |
| `src/routes/resep/+page.svelte` | Hero + bahan + langkah + acak + simpan |

### Verifikasi

```bash
npm run check && npm run build
# /resep → 200, thumb + bahan tampil, klik Acak → resep baru, Simpan → localStorage, offline → Tidak tersedia
# Home widget → 1 card resep harian, konsisten seharian (cache 6j)
```

---

## 3. Opsi B — Jadwal Drakor / Hiburan (Pengganti Bola untuk Cewek) ⭐ Prioritas 2

### API Gratis (verified — tanpa key)

| API | Endpoint | Key | Limit | Test |
|---|---|---|---|---|
| **TVMaze** (rekom) | `https://api.tvmaze.com/search/shows?q=korean` , `.../shows/:id` , `.../schedule?country=KR&date=2026-08-27` | Tanpa | Unlimited | ✅ 200 OK |
| **Kitsu** (alt anime) | `https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=5` | Tanpa | Rate limit longgar | ✅ 200 OK |
| Jikan (MyAnimeList) | `https://api.jikan.moe/v4/top/anime` | Tanpa | 3 req/s | ⚠️ 504 kadang, retry |
| **TMDB** | `https://api.themoviedb.org/3/tv/on_the_air` | **Butuh key** | — | ❌ 401 — jangan pakai (langgar no-key) |

> Keputusan: **pakai TVMaze primary**, Kitsu fallback. TMDB skip meski data bagus karena butuh `Bearer` key (biaya daftar + simpan secret, tidak sejalan `AGENTS.md` §7 `Jangan hardcode API key`).

Response TVMaze: `[{show:{id, name, language:Korean, genres:[Drama,Romance], rating:{average}, image:{medium,original}, summary, schedule:{time,days}, network:{name}}}]`

### Arsitektur

```
+page.server.ts → cached('drakor:today:{date}', 1j) → TVMaze schedule?country=KR
              → filter language=Korean + genre Drama/Romance → top 5
              → Kitsu fallback jika 0 hasil
              → Promise.allSettled
```

Cache keys: `drakor:today:{date}` TTL 1 jam, `drakor:search:{q}` TTL 1 jam, `hiburan:detail:{id}` TTL 6 jam.

### UI

- **Home widget:** Card `🎬 Drakor Malam Ini — 2 tayang` horizontal scroll
  ```
  [poster] A Korean Odyssey • tvN • 21:00 Sat,Sun • ⭐6.8
  [poster] Jewel in Palace • MBC • Ended
  ```
- **Halaman `/hiburan` atau `/drakor`:**
  - Search `?q=` → TVMaze search
  - List 10 drakor today + badge `On Air` / `Ended`
  - Detail → summary + jadwal + link `TVMaze`

### File

| File | Fungsi |
|---|---|
| `src/lib/server/hiburan.ts` | `fetchDrakorToday()`, `searchDrakor(q)` cached |
| `src/lib/components/DrakorCard.svelte` | Poster + rating + jadwal |
| `src/routes/hiburan/+page.server.ts` + `+page.svelte` | List + search |

---

## 4. Opsi C — Kalender Haid + Tips Harian (Private, Tanpa API) ⭐ Prioritas 1 untuk cewek

### API: Tidak ada — 100% local

| Komponen | Sumber | Privacy |
|---|---|---|
| Hitung siklus | `localStorage 'haid:config'` `{lastDate, cycleLen:28, periodLen:5}` | 100% local, tidak kirim server |
| Prediksi | JS `date-fns` hitung `next = last + cycle` | — |
| Tips | Static JSON `src/lib/data/tipsHaid.json` 30 tips | — |

> Kenapa tanpa API = keunggulan: no 403/429, no quota, no CORS, instant. Sesuai pola `simpan/` bookmarks.

### Logika

```ts
// utils/haid.svelte.ts (runes)
cycle = $state(28)
last = $state('2026-08-20')
next = $derived(addDays(last, cycle)) // 2026-09-17
countdown = $derived(diffDays(next, clock.now)) // 21 hari lagi
phase = $derived(phaseOf(today, last, cycle)) // haid / ovulasi / aman
```

Notif: `Notification` 1 hari sebelum `next` → `Haid diperkirakan besok` (permission eksplisit, max 1/hari).

### UI (empathetic, soft pink `#fdf2f8`, bukan merah alarm)

- **Home widget:** Card `🩷 Kalender Haid • 3 hari lagi` + progress bar siklus 28 hari + `Catat Hari Ini`
- **Halaman `/haid`:**
  - Kalender bulan mini (dot pink di hari haid prediksi)
  - Form `Hari pertama haid terakhir` (date picker) + `Panjang siklus` (21-35) + `Simpan`
  - Tips hari ini `Minum air putih 2L • Istirahat cukup`
  - Disclaimer: `Prediksi estimasi, bukan medis. Konsultasi dokter jika tidak teratur.`
  - Data tidak pernah upload — badge `🔒 100% di HP kamu`

### File

| File | Fungsi |
|---|---|
| `src/lib/utils/haid.svelte.ts` | runes state + hitung prediksi |
| `src/lib/data/tipsHaid.json` | 30 tips static |
| `src/lib/components/HaidCard.svelte` | Countdown + kalender mini |
| `src/routes/haid/+page.svelte` | Full kalender + form (client only, tanpa `+page.server.ts`) |

---

## 5. Struktur Navigasi (Rekomendasi — tetap 4 tab, wanita-friendly)

**Tetap 4 tab (jangan 5 sesak, `AGENTS.md` §8):**

```
BottomNav: [Berita /] [Cuaca /cuaca] [Harian /harian] [Tentang /tentang]
- Baru: /harian sebagai 1 tab koleksi habit (hemat tab, rapi)
- /harian isi 4 section: Sholat + Briefing + Gempa + (Resep/Haid/Drakor toggle)
```

**Alternatif Opsi B (4 tab + widget, jika belum mau tab baru):**

```
BottomNav: [Berita /] [Cuaca /cuaca] [Tentang /tentang] (tetap 3)
Home stack: Sholat → Briefing → Gempa banner → 🍳 Resep → 🩷 Haid → 🎬 Drakor → Berita
(Gempa & Resep/Haid sebagai widget home, bukan tab — iterasi Phase 1)
```

**Rekomen Phase 1:** Opsi Alternatif (widget home) dulu — validasi retention cewek via Resep klik rate. Jika >15% klik, pecah jadi tab `/harian` Phase 2.

> Market tetap hidden dari nav (2026-08-27), route `/market` tetap ada.

---

## 6. Roadmap Eksekusi (Urut untuk Wanita)

| Urutan | Fitur | Estimasi | Deliverable | Cache |
|---|---|---|---|---|
| 1 | **A Resep Harian** | 0.5 hari | `/resep` + `ResepCard` home + acak + simpan | `resep:harian:{date}` 6j |
| 2 | **C Haid** | 0.5 hari | `/haid` + `HaidCard` + localStorage + kalender | local only |
| 3 | **B Drakor via TVMaze** | 0.5 hari | `/hiburan` + `DrakorCard` + search | `drakor:today:{date}` 1j |
| 4 | Integrasi `/harian` tab (jika widget sukses) | 0.5 hari | Tab baru + BottomNav 4 tab | — |

**Total 2 hari** untuk A+B+C. Mulai **A Resep** karena effort kecil + retention cewek tertinggi + API sudah verified.

Setelah ini gabung ke `PLAN_FITUR_HARIAN.md` §8 (roadmap) dan `AGENTS.md` §9 Next.

---

## 7. Arsitektur & Alur Data (update ARCHITECTURE.md)

```
Browser → Vercel CDN (s-maxage=600) → SvelteKit Server (Promise.allSettled)
                                              ├─ sources/* → cached('rss:{id}') TTL 10m → RSS
                                              ├─ weather.ts → cached('weather:*') TTL 10m → Open-Meteo
                                              ├─ resep.ts → cached('resep:*') TTL 6j → TheMealDB (A)
                                              ├─ hiburan.ts → cached('drakor:*') TTL 1j → TVMaze/Kitsu (B)
                                              └─ haid: client only → localStorage (C) — no server fetch
```

Aturan tetap: fetch server-side only (kecuali C), `fetchWithTimeout(7000)`, UA browser, `peekCache()` 24j stale fallback, empty jujur `Tidak tersedia` tanpa dummy.

---

## 8. Verifikasi Tiap Fitur

```bash
npm run check && npm run build
# Resep: /resep → 200 thumb+bahan, /resep?random=1 → baru, / (home) card resep tampil 1x/hari
# Haid: /haid → form simpan → localStorage → countdown jalan, ganti siklus 28→30 → prediksi update, notif 1x
# Drakor: /hiburan → 5 drakor Korea, /hiburan?q=odyssey → search 200, klik → detail poster
# Dark mode, BottomNav active, Footer hide di /harian atau /resep sesuai layout
```

Checklist no-dummy (`DOC_JANGAN_GUNAKAN_DUMMY.md`):
- [ ] Tidak hardcode resep dummy — pakai stale cache 24j → empty jujur
- [ ] Tidak hardcode harga/key TMDB
- [ ] Haid tidak kirim data ke server (privacy)

---

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| TheMealDB `a=Indonesian` null / 500 | Pakai random + `c=Seafood` fallback, `Promise.allSettled` → card `Tidak tersedia` |
| TVMaze 5xx / 0 hasil Korean | Fallback Kitsu `anime?filter[status]=current`, cache stale 24j, empty `Jadwal belum tersedia` |
| Haid data sensitif | 100% localStorage, disclaimer medis, no analytics, no server log |
| BottomNav sesak 5 tab | Tetap 4 tab max, Harian sebagai 1 tab koleksi atau widget |
| Gambar resep berat | `loading=lazy` + `preview/medium` thumb, CDN cache |

---

## 10. Referensi API (verified 2026-08-27)

- TheMealDB: `https://www.themealdb.com/api.php` — random `.../api/json/v1/1/random.php` (key `1`), filter `.../filter.php?c=Seafood`, list `.../list.php?c=list`
- TVMaze: `https://www.tvmaze.com/api` — search `.../search/shows?q=korean`, schedule `.../schedule?country=KR&date=...`
- Kitsu: `https://kitsu.docs.apiary.io` — `.../api/edge/anime?filter[status]=current`
- Jikan (fallback): `https://docs.api.jikan.moe` — rate 3 req/s
- TMDB (skip): `https://developer.themoviedb.org` — butuh `Authorization: Bearer` key, tidak dipakai

---

## 11. Status Tracker

| Fitur | Status | File Kunci | API |
|---|---|---|---|
| A Resep Harian | ⏳ Planned | `resep.ts`, `ResepCard.svelte`, `routes/resep/` | TheMealDB free tanpa daftar |
| B Drakor/Hiburan | ⏳ Planned | `hiburan.ts`, `DrakorCard.svelte`, `routes/hiburan/` | TVMaze free tanpa key |
| C Kalender Haid | ⏳ Planned | `haid.svelte.ts`, `HaidCard.svelte`, `routes/haid/` | Tanpa API (local) |

> Update ⏳→✅ tiap selesai 1 fitur. Setelah A selesai, update `CHANGELOG.md` + `AGENTS.md` §9.

