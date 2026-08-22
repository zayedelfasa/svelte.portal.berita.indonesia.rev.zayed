import { cached } from '../cache';
import { fetchWithTimeout } from '../http';
import { parseRss } from '../rss';
import { fetchAggregator } from '../aggregator';
import type { Article, CategoryId, SourceAdapter } from '$lib/types';

interface AggOptions {
	/** RSS fallback untuk feed umum (headline) bila endpoint aggregator mati */
	fallbackFeed?: string;
	/** peta kategori kanonik → path aggregator, hasil verifikasi (lihat PLAN_TIER_1.md) */
	categories?: Partial<Record<CategoryId, string>>;
}

async function headlineFetcher(id: string, apiPath: string, opts: AggOptions): Promise<Article[]> {
	return cached(`agg:${id}`, async () => {
		try {
			return await fetchAggregator(apiPath, id);
		} catch (err) {
			if (!opts.fallbackFeed) throw err;
			const res = await fetchWithTimeout(opts.fallbackFeed);
			if (!res.ok) throw err;
			return parseRss(await res.text(), id);
		}
	});
}

/**
 * Factory sumber berbasis aggregator berita-indo-api,
 * dengan opsi fallback ke RSS resmi bila endpoint headline mati.
 */
export function makeAggregatorSource(
	id: string,
	apiPath: string,
	opts: AggOptions = {}
): SourceAdapter {
	const cats = opts.categories ?? {};

	const fetchCategory = Object.keys(cats).length
		? async (cat: CategoryId, limit: number): Promise<Article[]> => {
				if (cats[cat] === apiPath) return (await headlineFetcher(id, apiPath, opts)).slice(0, limit);
				const items = await cached(`agg:${id}:${cat}`, () => fetchAggregator(cats[cat]!, id));
				return items.slice(0, limit);
			}
		: undefined;

	return {
		fetchTop: async (limit) => (await headlineFetcher(id, apiPath, opts)).slice(0, limit),
		fetchCategory,
		supportedCategories: fetchCategory ? (Object.keys(cats) as CategoryId[]) : undefined
	};
}