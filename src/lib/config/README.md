# config/ — Registry Media

Single source of truth daftar media yang tampil di portal.

## Isi

`src/lib/config/sources.ts`:
```ts
import { fetchDetikAdapter } from '$lib/server/sources/detik';
// ... 10 adapter lain
export const SOURCES: SourceDef[] = [
  { id: 'detik', name: 'Detik', ...fetchDetikAdapter },
  // ...
];
```

- **Urutan array = urutan tampil** di home (Detik paling atas, iNews paling bawah)
- Tiap entry spread dari factory adapter → otomatis punya `fetchTop`, `fetchCategory`, `supportedCategories`
- `SourceDef` didefinisikan di `$lib/types.ts`

## Mengubah urutan / menambah media

1. Buat adapter baru di `src/lib/server/sources/` (lihat README di sana)
2. Import adapter di file ini
3. Masukkan ke array `SOURCES` di posisi yang diinginkan
4. `npm run check` — pastikan tidak ada nama id yang duplikat

## Konsumen

- `routes/+page.server.ts` (home) — iterasi semua atau filter `supportedCategories`
- `routes/media/[source]/+page.server.ts` & `routes/baca/+page.server.ts` — cari via `SOURCES.find(s => s.id === params.source)`
- `routes/api/source/[id]/+server.ts` — endpoint retry per-section

`Header.svelte` tidak membaca registry langsung — ia hanya membaca `page.data` dari load function.
