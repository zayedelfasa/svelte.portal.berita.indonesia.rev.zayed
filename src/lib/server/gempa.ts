import { cached, TTL } from './cache';
import { fetchWithTimeout } from './http';
import type { GempaData, GempaItem } from '$lib/harian';
import { parseBmkgGempa } from './parsers';

/**
 * Gempa terkini BMKG (data.bmkg.go.id, tanpa key, update <5 menit).
 * Gabungan autogempa (1 terbaru, realtime) + gempaterkini (15 terakhir M≥4-ish).
 * Gagal → throw (caller pakai allSettled).
 */
export async function fetchGempa(): Promise<GempaData> {
	return cached(
		'gempa:terkini',
		async () => {
			const [autoR, listR] = await Promise.allSettled([
				fetchWithTimeout('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json', { headers: { accept: 'application/json' } }, 7000),
				fetchWithTimeout('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json', { headers: { accept: 'application/json' } }, 7000)
			]);

			const seen = new Set<string>();
			const items: GempaItem[] = [];

			const push = (item: GempaItem) => {
				const key = `${item.tanggal}|${item.jam}|${item.wilayah}`;
				if (seen.has(key)) return;
				seen.add(key);
				items.push(item);
			};

			if (autoR.status === 'fulfilled' && autoR.value.ok) {
				try {
					for (const g of parseBmkgGempa(await autoR.value.json())) push(g);
				} catch {}
			}
			if (listR.status === 'fulfilled' && listR.value.ok) {
				try {
					for (const g of parseBmkgGempa(await listR.value.json())) push(g);
				} catch {}
			}

			// sort terbaru dulu
			items.sort((a, b) => {
				const ta = a.isoTime ? new Date(a.isoTime).getTime() : 0;
				const tb = b.isoTime ? new Date(b.isoTime).getTime() : 0;
				return tb - ta;
			});

			if (items.length === 0) throw new Error('bmkg gempa kosong / kedua endpoint gagal');

			return { items: items.slice(0, 20), fetchedAt: new Date().toISOString() };
		},
		TTL.gempa
	);
}
