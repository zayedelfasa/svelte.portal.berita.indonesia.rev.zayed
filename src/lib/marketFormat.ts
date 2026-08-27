/** Format & kelas warna market — dipakai halaman `/market` dan `/market/[symbol]`. */

export function fmtPrice(v: number, cur: string, usdIdr: number, showIdr: boolean, item?: { symbol: string }) {
	// crypto IDR toggle (kecuali USD/IDR itu sendiri)
	if (item && item.symbol !== 'USD/IDR' && cur === 'USD' && showIdr) {
		const idr = v * usdIdr;
		return 'Rp ' + idr.toLocaleString('id-ID', { maximumFractionDigits: 0 });
	}
	if (cur === 'IDR') return 'Rp ' + v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
	if (v >= 1000) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
	if (v >= 1) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
	return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

export function changeCls(v: number | null) {
	if (v == null) return 'text-gray-400';
	if (v > 0) return 'text-emerald-600 dark:text-emerald-400';
	if (v < 0) return 'text-red-600 dark:text-red-400';
	return 'text-gray-400';
}

export function changeBg(v: number | null) {
	if (v == null) return 'bg-gray-100 dark:bg-neutral-800';
	if (v > 0) return 'bg-emerald-50 dark:bg-emerald-950/40';
	if (v < 0) return 'bg-red-50 dark:bg-red-950/40';
	return 'bg-gray-100 dark:bg-neutral-800';
}

export function typeBadgeCls(t: string) {
	if (t === 'idx') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
	if (t === 'forex') return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
	return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
}

export function typeLabel(t: string) {
	if (t === 'idx') return 'IDX';
	if (t === 'forex') return 'FOREX';
	return 'CRYPTO';
}
