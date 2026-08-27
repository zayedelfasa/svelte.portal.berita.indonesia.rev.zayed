import { error } from '@sveltejs/kit';
import { SOURCES } from '$lib/config/sources';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ params }) => {
	const source = SOURCES.find((s) => s.id === params.source);
	if (!source) error(404, 'Media tidak dikenal');

	const articles = await source.fetchTop(50).catch(() => []);
	const fetchedAt = new Date().toISOString();

	return {
		sourceId: source.id,
		name: source.name,
		articles,
		pageSize: PAGE_SIZE,
		fetchedAt
	};
};
