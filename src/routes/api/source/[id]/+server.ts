import { json, error } from '@sveltejs/kit';
import { SOURCES } from '$lib/config/sources';
import { invalidateCache } from '$lib/server/cache';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const source = SOURCES.find((s) => s.id === params.id);
	if (!source) error(404, 'Media tidak dikenal');

	if (url.searchParams.get('force')) {
		invalidateCache(`agg:${source.id}`);
		invalidateCache(`rss:${source.id}`);
	}

	try {
		const articles = await source.fetchTop(3);
		return json({ sourceId: source.id, name: source.name, ok: true, articles });
	} catch (e) {
		return json(
			{
				sourceId: source.id,
				name: source.name,
				ok: false,
				articles: [],
				error: String((e as Error)?.message ?? e)
			},
			{ status: 500 }
		);
	}
};
