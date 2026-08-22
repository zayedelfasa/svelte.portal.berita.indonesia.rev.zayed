import { cached } from '../cache';
import { fetchWithTimeout } from '../http';
import { parseRss } from '../rss';
import type { Article } from '$lib/types';

/** Factory sumber berbasis RSS resmi media */
export function makeRssSource(id: string, feedUrl: string) {
	return async (limit: number): Promise<Article[]> => {
		const items = await cached(`rss:${id}`, async () => {
			const res = await fetchWithTimeout(feedUrl);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return parseRss(await res.text(), id);
		});
		return items.slice(0, limit);
	};
}
