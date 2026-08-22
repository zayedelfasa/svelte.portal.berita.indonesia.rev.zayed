/** Ubah URL gambar (//, /, relative) menjadi absolut https:// */
export function absoluteUrl(u?: unknown): string | undefined {
	if (typeof u !== 'string') return undefined;
	const t = u.trim();
	if (!t || t.startsWith('data:')) return undefined;
	if (/^https?:\/\//i.test(t)) return t;
	if (t.startsWith('//')) return 'https:' + t;
	if (t.startsWith('/')) return t; // biarkan relative path — OG butuh absolut; caller bisa prefix origin jika perlu
	return undefined;
}
