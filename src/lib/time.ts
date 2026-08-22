/** Waktu relatif bahasa Indonesia, aman dipakai client & server */
export function timeAgo(iso: string): string {
	const t = new Date(iso).getTime();
	if (!Number.isFinite(t)) return '';
	const diffMin = Math.floor((Date.now() - t) / 60000);
	if (diffMin < 1) return 'baru saja';
	if (diffMin < 60) return `${diffMin} mnt lalu`;
	const h = Math.floor(diffMin / 60);
	if (h < 24) return `${h} jam lalu`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d} hari lalu`;
	return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso));
}
