import { error } from '@sveltejs/kit';
import { SOURCES } from '$lib/config/sources';
import type { PageServerLoad } from './$types';

/**
 * Halaman detail satu artikel.
 * Query: ?source=<id>&id=<index>&u=<url asli ter-encode>
 * Pencarian: cocokkan by URL dulu (lebih stabil), fallback ke index.
 */
export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const sourceId = url.searchParams.get('source') ?? '';
	const idx = Number(url.searchParams.get('id'));
	const u = url.searchParams.get('u');

	const source = SOURCES.find((s) => s.id === sourceId);
	if (!source) error(404, 'Sumber tidak dikenal');

	const articles = await source.fetchTop(20).catch(() => []);
	let article = u ? articles.find((a) => a.url === u) : undefined;
	if (!article && Number.isInteger(idx)) article = articles[idx];
	if (!article) error(404, 'Berita tidak ditemukan');

	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });
	return {
		article,
		sourceName: source.name,
		more: articles.filter((a) => a.url !== article!.url).slice(0, 3)
	};
};
