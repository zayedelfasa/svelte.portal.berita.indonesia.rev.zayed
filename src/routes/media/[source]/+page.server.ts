import { error } from '@sveltejs/kit';
import { SOURCES } from '$lib/config/sources';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

/**
 * Halaman "Lihat Lainnya" per media.
 * Ambil pool artikel dari adapter (cache 10 menit), client yang memotong
 * tampilan 10-per-10 (opsi A — tanpa request tambahan saat load more).
 */
export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const source = SOURCES.find((s) => s.id === params.source);
	if (!source) error(404, 'Media tidak dikenal');

	const articles = await source.fetchTop(50).catch(() => []);

	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });

	return {
		sourceId: source.id,
		name: source.name,
		articles,
		pageSize: PAGE_SIZE
	};
};
