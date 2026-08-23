# static/ — Aset Publik

File di sini diserve **apa adanya** di root URL (`/`), tanpa diproses Vite. Cocok untuk file yang harus punya URL tetap.

| File | URL publik | Fungsi |
|---|---|---|
| `icon-192.png` | `/icon-192.png` | Icon PWA 192×192 — dipakai `manifest.webmanifest` untuk install prompt & home-screen |
| `icon-512.png` | `/icon-512.png` | Icon PWA 512×512 — sama, ukuran besar |
| `robots.txt` | `/robots.txt` | Aturan crawler |

## Beda `static/` vs `src/lib/assets/`

| Lokasi | Kapan dipakai |
|---|---|
| `static/` | Butuh URL tetap, tidak di-hash (manifest, sw, robots) |
| `src/lib/assets/` | Di-import via `import foo from '$lib/assets/foo.svg'` — Vite akan optimasi, hashing, dan replacer URL |

Pindahkan file yang di-import di Svelte (contoh `favicon.svg` di `app.html` / `+layout.svelte`) ke `lib/assets/` jika ingin optimasi; biarkan di `static/` jika harus diakses langsung oleh PWA / bot.

## PWA

Plugin `vite-plugin-pwa` mem-bake `manifest.webmanifest` dan `sw.js` ke output client. Ikon di atas direferensikan di `vite.config.ts` bagian `manifest.icons` dan `includeAssets`.

Menambah ikon baru: letakkan di `static/`, daftarkan di `vite.config.ts` → rebuild.
