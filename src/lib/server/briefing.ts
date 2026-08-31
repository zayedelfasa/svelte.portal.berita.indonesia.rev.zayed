import { cached, TTL } from './cache';
import { SOURCES } from '$lib/config/sources';
import type { Article } from '$lib/types';
import type { BriefingData } from '$lib/harian';

const TITLE_DEDUP_LEN = 60;

/**
 * Ringkasan pagi — reuse pool berita per-source (semua fetchTop sudah cached TTL 10m),
 * tanpa API baru. Gabung 11 media → dedup judul → sort terbaru → 10 teratas.
 */
export async function fetchBriefing(): Promise<BriefingData> {
	return cached(
		'briefing:v1',
		async () => {
			const results = await Promise.allSettled(SOURCES.map((s) => s.fetchTop(10)));
			const all: Array<Article & { sourceName: string; sourceIndex: number }> = [];
			for (let i = 0; i < SOURCES.length; i++) {
				const r = results[i];
				if (r.status !== 'fulfilled') continue;
				for (let sourceIndex = 0; sourceIndex < r.value.length; sourceIndex++) {
					all.push({ ...r.value[sourceIndex], sourceName: SOURCES[i].name, sourceIndex });
				}
			}

			// dedup judul mirip (lintas media sering sama)
			const seen = new Set<string>();
			const deduped = all.filter((a) => {
				const key = a.title.toLowerCase().slice(0, TITLE_DEDUP_LEN).replace(/[^a-z0-9]/g, '');
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});

			deduped.sort((x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime());

			if (deduped.length === 0) throw new Error('briefing: pool berita kosong');
			return { items: deduped.slice(0, 10), fetchedAt: new Date().toISOString() };
		},
		TTL.default
	);
}
