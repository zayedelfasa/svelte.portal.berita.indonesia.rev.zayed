import { SOURCES } from '$lib/config/sources';
import type { Article } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const q = (url.searchParams.get('q') ?? '').trim();
	if (!q) return { q: '', results: [] as Article[], totalPools: 0 };

	const needle = q.toLowerCase();
	const settled = await Promise.allSettled(
		SOURCES.map(async (s) => ({
			sourceId: s.id,
			articles: await s.fetchTop(100)
		}))
	);

	const all: Article[] = [];
	for (const r of settled) if (r.status === 'fulfilled') all.push(...r.value.articles);

	const results = all
		.filter((a) => a.title.toLowerCase().includes(needle) || a.summary.toLowerCase().includes(needle))
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
		.slice(0, 50);

	setHeaders({ 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' });
	return { q, results, totalPools: all.length };
};
