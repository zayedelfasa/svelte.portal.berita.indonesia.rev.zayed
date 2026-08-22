/**
 * Ticker waktu global — satu interval untuk seluruh aplikasi.
 * Mulai interval dari `+layout.svelte` ($effect); komponen lain cukup
 * membaca `clock.now` di `$derived` agar label waktu ikut berjalan.
 */
export const clock = $state({ now: Date.now() });
