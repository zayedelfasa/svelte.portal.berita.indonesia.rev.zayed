import { SOURCES } from '$lib/config/sources';
import type { SourceResult } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const settled = await Promise.allSettled(
		SOURCES.map(async (s) => ({
			sourceId: s.id,
			name: s.name,
			ok: true as const,
			articles: await s.fetchTop(3)
		}))
	);

	const results: SourceResult[] = settled.map((r, i) => {
		const s = SOURCES[i];
		if (r.status === 'fulfilled' && r.value.articles.length > 0) return r.value;
		return {
			sourceId: s.id,
			name: s.name,
			ok: false,
			articles: [],
			error:
				r.status === 'rejected'
					? String((r.reason as Error)?.message ?? r.reason)
					: 'Tidak ada artikel'
		};
	});

	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });
	return { results };
};
