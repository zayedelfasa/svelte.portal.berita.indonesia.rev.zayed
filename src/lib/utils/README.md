# utils/ — State Global Runes + Helper Client

Modul reaktif yang dipakai bersama di banyak komponen. Semua file `*.svelte.ts` (memakai `$state`, `$derived`, `$effect`).

## Daftar File

| File | Export | Fungsi |
|---|---|---|
| `clock.svelte.ts` | `clock = $state({ now })` | Ticker global — interval 30 detik di `+layout.svelte`, dibaca `NewsItem`/`ArticleView` untuk waktu relatif yang berjalan |
| `bookmarks.svelte.ts` | `bookmarks`, `isBookmarked()`, `toggleBookmark()`, `removeBookmark()` | Snapshot bookmark di localStorage key `bookmarks`; sync antar-tab via `storage` event |
| `settings.svelte.ts` | `thumbState`, `toggleThumb()` | Preferensi thumbnail 56×56, key `thumb` (`'1'`/`'0'`), default OFF |
| `url.ts` | `absoluteUrl(u)` | Normalisasi URL gambar: `//` → `https:`, guard `typeof !== string`, tolak `data:` |

## Aturan

- Selalu guard `browser` (`import { browser } from '$app/environment'`) sebelum akses `localStorage` / `window`
- `$state` di tingkat module bersifat **singleton** — semua import mendapat instance yang sama
- Perubahan array (`push`, `splice`, `length = 0`) pada `$state<Article[]>` otomatis memicu re-render

## Menambah preference baru

Ikuti pola `settings.svelte.ts`:
```ts
const KEY = 'myPref';
export const myPref = $state({ value: browser ? localStorage.getItem(KEY) === '1' : false });
export function toggleMyPref() {
  myPref.value = !myPref.value;
  localStorage.setItem(KEY, myPref.value ? '1' : '0');
}
```

Gunakan di komponen:
```svelte
<script lang="ts">
  import { myPref, toggleMyPref } from '$lib/utils/settings.svelte';
</script>
<button onclick={toggleMyPref}>{myPref.value ? 'ON' : 'OFF'}</button>
```
