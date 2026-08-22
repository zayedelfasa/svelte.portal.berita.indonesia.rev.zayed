import { cached } from '../cache';
import { fetchWithTimeout } from '../http';
import { parseRss } from '../rss';
import { fetchAggregator } from '../aggregator';
import type { Article } from '$lib/types';

/**
 * Factory sumber berbasis aggregator berita-indo-api,
 * dengan opsi fallback ke RSS resmi bila endpoint aggregator mati.
 */
export function makeAggregatorSource(id: string, apiPath: string, fallbackFeed?: string) {
	return async (limit: number): Promise<Article[]> => {
		const items = await cached(`agg:${id}`, async () => {
			try {
				return await fetchAggregator(apiPath, id);
			} catch (err) {
				if (!fallbackFeed) throw err;
				const res = await fetchWithTimeout(fallbackFeed);
				if (!res.ok) throw err;
				return parseRss(await res.text(), id);
			}
		});
		return items.slice(0, limit);
	};
}
