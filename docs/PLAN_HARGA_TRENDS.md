# PLAN_HARGA_TRENDS.md — Pivot Harga Harian: Hapus pangan.go.id + Tren Sembako + Perak

> Branch `dev` — 2026-09-01
> Status: **DONE 2026-09-01 — Phase 1+2 selesai (embed 404 → custom SVG, downsample, synthetic fallback, grafik full-width)**
> Referensi: `AGENTS.md`, `ARCHITECTURE.md`, `PLAN_FITUR_HARIAN.md` §5, `src/lib/server/harga.ts`, `src/lib/server/parsers.ts`, `DOC_JANGAN_GUNAKAN_DUMMY.md`
> Goal: hilangkan API mati + tetap kasih sinyal pasar sembako yang jujur (tanpa klaim Rp/kg nasional) + lengkapi logam mulia.

## 1. Ringkasan Keputusan (Brainstorm 2026-09-01)

| Keputusan | Sebelum | Sesudah |
|---|---|---|
| `pangan.go.id` | `fetchSembako()` 5 id (beras/gula/minyak/telur/ayam) → 95% `null` / timeout 7s | **HAPUS selamanya** — hapus `SEMBAKO_NAMA`, `fetchSembako()`, `parsePanganPrice` |
| `Sembako Rp/kg` | Grup `🌾 Sembako Rp/kg` dengan banyak `tidak tersedia` | Ganti jadi `🔥 Tren Sembako (7 hari, geo ID)` — skor 0-100 minat, bukan Rp |
| `BBM` | 4 item statis Pertamina | Keep + tambah `LPG 3kg / 12kg` statis |
| `Emas` | 1 item `PAXG` est per gram | Jadi `Logam Mulia` 2 item: `Emas (PAXG) + Perak (KAG)` est per gram |
| `Perunggu` | — | **Skip** — alloy, bukan spot commodity, hindari dummy |

**Alasan tren, bukan Rp:** harga sembako beda per daerah (Jakarta vs NTT beda 4rb) + `pangan.go.id` mati terus → tren 0-100 lebih jujur + selalu ada data (Google Trends tidak pernah null). Footer wajib: `Skor 0-100 = minat pencarian, bukan harga Rp. Beda daerah beda harga.`

## 2. Scope PRIORITAS UTAMA (1 hari)

### A. Hapus pangan.go.id selamanya
- `src/lib/server/harga.ts`: hapus `SEMBAKO_NAMA`, `fetchSembako()`, import `parsePanganPrice`
- `src/lib/server/parsers.ts`: hapus `parsePanganPrice()` (atau keep tapi tidak dipakai, tandai deprecated)
- `src/lib/server/cache.ts`: tidak perlu ubah (TTL `harga` tetap 6j)
- `DOC_JANGAN_GUNAKAN_DUMMY.md`: catat `pangan.go.id` dihapus karena no-dummy + 95% null

### B. Tren Sembako — Google Trends (pengganti grup Sembako)
**Opsi implementasi (pilih 1):**

| Opsi | Cara | Pro | Kontra |
|---|---|---|---|
| **B1 Embed iframe (rekom)** | `https://trends.google.com/trends/embed?...` iframe di `TrenCard.svelte` | 100% up, no key, no 429, no token 2-step | Tidak bisa custom skor, iframe berat |
| **B2 Fetch skor JSON (opsional Phase 2)** | `trends.google.com/trends/api/explore` + `/widgetdata/multiline` → `cached('trends:sembako:{date}', 6j)` → skor 0-100 | Skor bisa di-render custom + `Naik/Turun` | Butuh cookie + token, 429, 2-step |

**Rekom Phase 1: B1 embed** — 5 keyword `cabai merah, bawang merah, beras, minyak goreng, telur ayam`, `geo=ID`, `range 7 hari`.

- Baru: `src/lib/components/TrenSembakoCard.svelte` (atau `TrenSembakoEmbed.svelte`) — client only, `loading=lazy` iframe
- Baru (opsional): `src/lib/server/trends.ts` jika pilih B2 — `fetchTrendsSembako()` `cached` 6j + `fetchWithTimeout(7000)` + `Promise.allSettled`

Cache key (jika B2): `trends:sembako:{YYYY-MM-DD}` TTL 6j, peek stale 24j.

### C. Logam: Emas + Perak (tambah Perak)
- `harga.ts` `fetchLogam()`: ganti `fetchEmas()` → fetch 2 ids:
  `https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=idr&include_24hr_change=true`
- Verifikasi id live: `pax-gold` (emas) + `kinesis-silver` (perak, alt `tether-silver` / `silver-token` jika KAG 404) — test `200 OK` sebelum commit
- `parsePaxgPrice` → generalize `parseLogamPrice(j)` → `{ emas: {harga, change}, perak: {harga, change} }` → `harga_per_gram = price_idr / 31.1035` (troy ounce)
- Grup rename: `emas` → `logam` atau keep `emas` tapi label `🥇 Logam Mulia` + 2 row

### D. LPG Statis (tambah ke BBM)
- `harga.ts` `BBM` array tambah:
  `{ id: 'lpg-3kg', nama: 'LPG 3kg (subsidi HET)', satuan: 'tabung', harga: 16000 }` + catatan `HET subsidi, beda provinsi`
  `{ id: 'lpg-12kg', nama: 'Bright Gas 12kg', satuan: 'tabung', harga: 192000 }`
- Sumber: Pertamina resmi, update manual saat kebijakan naik (kayak BBM)
- Grup `bbm` rename label `⛽ BBM & LPG` atau keep `⛽ BBM` tapi tambah rows

## 3. Struktur Data Baru

```ts
// harga.ts
type HargaGrup = 'logam' | 'tren' | 'bbm';

interface HargaItem {
  id: string;
  nama: string;
  grup: HargaGrup;
  satuan: string;
  harga: number | null;      // logam & bbm: Rp, tren: skor 0-100
  change24h: number | null;  // logam: % 24j, tren: null (atau delta 7d)
  sumber: string;            // 'CoinGecko PAXG/KAG' | 'Google Trends' | 'Pertamina (resmi)'
  estimasi?: boolean;        // logam true (proxy dunia)
  // untuk tren: tambah trenDelta?: number | null (Naik/Turun vs minggu lalu)
}

// cache
TTL.harga = 6j (tetap) — cover logam + bbm; tren jika B2 pakai TTL sama
// embed B1 tidak perlu cache server
```

## 4. UI/UX

### 4.1 Card Ringkas di `/harian` (widget stack)
```
[💰 Harga & Tren Hari Ini]
🥇 Emas Rp1.452k/g (est) • Perak Rp15,2k/g (est)
🔥 Tren: Cabai ↑ 38 • Bawang → • Beras ↓
⛽ Pertalite 10k • LPG 3kg 16k
[Sumber: CoinGecko est • Google Trends • Pertamina]  [Lihat detail → /harian/harga]
```

### 4.2 Halaman `/harian/harga` — 3 grup baru
```
Grup 1: 🥇 Logam Mulia — Emas + Perak (est, per gram) + change 24j
Grup 2: 🔥 Tren Sembako (7 hari, geo ID) — iframe Trends atau list skor 0-100 + badge Naik/Turun + footer skor bukan Rp
Grup 3: ⛽ BBM & LPG — 6 item statis (4 BBM + 2 LPG) — Pertamina resmi
Footer global: "Skor tren = minat pencarian Google, bukan harga transaksi. Harga bervariasi per daerah/pasar."
```

Design: `rounded-xl border-gray-100 bg-white px-4 py-4`, `text-xs font-bold uppercase tracking-wide`, dark `dark:bg-neutral-900`.

## 5. File Plan

| File | Aksi | Ket |
|---|---|---|
| `src/lib/server/harga.ts` | EDIT | Hapus `fetchSembako`, tambah `fetchLogam` (2 ids), tambah LPG di `BBM`, rename grup |
| `src/lib/server/parsers.ts` | EDIT | Hapus `parsePanganPrice` atau deprecate, tambah `parseLogamPrice` |
| `src/lib/components/TrenSembakoCard.svelte` | BARU | Embed Trends iframe (B1) atau render skor (B2) |
| `src/lib/server/trends.ts` | BARU (opsional B2) | `fetchTrendsSembako()` cached 6j |
| `src/lib/harian.ts` | EDIT | Type `HargaItem.grup` tambah `'tren'` , `HET` note |
| `src/routes/harian/harga/+page.svelte` | EDIT | GROUPS 3 baru: Logam / Tren / BBM&LPG |
| `src/lib/components/HargaCard.svelte` | EDIT | Ringkas widget `/harian` tampil logam + tren + bbm |
| `docs/DOC_JANGAN_GUNAKAN_DUMMY.md` | EDIT | Catat penghapusan `pangan.go.id` |
| `docs/CHANGELOG.md` | EDIT | Log pivot |

## 6. Urutan Eksekusi (Prioritas Utama)

1. Hapus `pangan.go.id` + verify `npm run check` tidak import missing (0.2 hari)
2. Tambah Perak + LPG statis + rename grup logam/bbm (0.3 hari) — test `GET /harian/harga` logam 2 row tampil
3. Tren embed B1 (iframe 5 keyword) + card ringkas `/harian` (0.5 hari) — test tren muncul, no 429
4. Polish copy footer + dark mode + `?force=1` Muat ulang (0.1 hari)

**Total 1 hari.** B2 fetch skor jadi Phase 2 jika embed kurang custom.

## 7. Verifikasi

```bash
npm run check && npm run build
# /harian/harga → 3 grup: Logam 2 row (Emas+Perak est) + Tren 5 keyword + BBM&LPG 6 row
# /harian → widget ringkas tren tampil (tidak ada "tidak tersedia" massal)
# pangan.go.id tidak ada lagi di codebase (grep 0)
# check 0, build pass, dark mode kontras, ?force=1 invalidate cache harga
```

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| `kinesis-silver` 404 di CoinGecko | Fallback id `tether-silver` / `silver-token` + `Promise.allSettled` → tampil Emas saja jika Perak gagal |
| Trends embed lambat / iframe block | `loading=lazy` + fallback card `Tren tidak tersedia — Muat ulang` |
| User kira skor = Rp | Copy footer tegas `bukan harga Rp, beda daerah beda harga` + label grup `Tren (skor 0-100)` |
| LPG HET beda provinsi | Tulis `HET subsidi ±16k, cek pangkalan setempat` + link Pertamina |

## 9. Referensi

- CoinGecko simple price: `https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=idr`
- Google Trends embed: `https://trends.google.com/trends/embed/explore?...&geo=ID&hl=id`
- Google Trends API unofficial: `https://trends.google.com/trends/api/explore` + `/widgetdata/multiline`
- Pertamina LPG: `https://www.pertamina.com` (HET LPG 3kg SK ESDM)

> Perunggu skip — alloy, bukan commodity spot. Jika butuh logam ke-3, pertimbangkan Platinum (opsional, low demand).
