import { cached } from '../cache';
import { fetchWithTimeout } from '../http';
import { parseRss } from '../rss';
import type { Article, CategoryId, SourceAdapter } from '$lib/types';

/**
 * Factory sumber berbasis RSS resmi media.
 * `categories` = peta kategori kanonik → URL feed (hasil verifikasi).
 */
export function makeRssSource(
	id: string,
	feedUrl: string,
	categories: Partial<Record<CategoryId, string>> = {}
): SourceAdapter {
	const fetchCategory = Object.keys(categories).length
		? async (cat: CategoryId, limit: number): Promise<Article[]> => {
				// Dedup: kategori yang URL-nya sama dengan headline reuse cache yang sama
				if (categories[cat] === feedUrl) {
					const items = await cached(`rss:${id}`, async () => {
						const res = await fetchWithTimeout(feedUrl);
						if (!res.ok) throw new Error(`HTTP ${res.status}`);
						return parseRss(await res.text(), id);
					});
					return items.slice(0, limit);
				}
				const items = await cached(`rss:${id}:${cat}`, async () => {
					const res = await fetchWithTimeout(categories[cat]!);
					if (!res.ok) throw new Error(`HTTP ${res.status}`);
					return parseRss(await res.text(), id);
				});
				return items.slice(0, limit);
			}
		: undefined;

	return {
		fetchTop: async (limit) => {
			const items = await cached(`rss:${id}`, async () => {
				const res = await fetchWithTimeout(feedUrl);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return parseRss(await res.text(), id);
			});
			return items.slice(0, limit);
		},
		fetchCategory,
		supportedCategories: fetchCategory ? Object.keys(categories) as CategoryId[] : undefined
	};
}
