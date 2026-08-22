/** Waktu relatif bahasa Indonesia — aman dipakai client & server.
 *  `now` di-inject agar label bisa berjalan mengikuti ticker global. */
export function timeAgo(iso: string, now: number = Date.now()): string {
	const t = new Date(iso).getTime();
	if (!Number.isFinite(t)) return '';
	const diffMin = Math.max(0, Math.floor((now - t) / 60000));
	if (diffMin < 1) return 'baru saja';
	if (diffMin < 60) return `${diffMin} mnt lalu`;
	const h = Math.floor(diffMin / 60);
	if (h < 24) return `${h} jam lalu`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d} hari lalu`;
	return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(
		new Date(iso)
	);
}

/** artikel dianggap BARU jika < 30 menit */
export function isNew(iso: string, now: number = Date.now()): boolean {
	const t = new Date(iso).getTime();
	if (!Number.isFinite(t)) return false;
	return now - t < 30 * 60 * 1000;
}
