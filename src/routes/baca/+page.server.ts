import { error } from '@sveltejs/kit';
import { SOURCES } from '$lib/config/sources';
import type { Article } from '$lib/types';
import type { PageServerLoad } from './$types';

/**
 * Halaman detail satu artikel.
 * Query: ?source=<id>&id=<index>&u=<url asli ter-encode>
 * Pencarian primary via `u` (stabil lintas pool kategori), fallback `id`.
 * Jika tidak ada di pool headline, telusuri pool kategori sumber itu (Fase C anti-404).
 */
export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const sourceId = url.searchParams.get('source') ?? '';
	const idx = Number(url.searchParams.get('id'));
	const u = url.searchParams.get('u');

	const source = SOURCES.find((s) => s.id === sourceId);
	if (!source) error(404, 'Sumber tidak dikenal');

	let articles: Article[] = await source.fetchTop(30).catch(() => []);
	let article: Article | undefined = u ? articles.find((a: Article) => a.url === u) : undefined;
	if (!article && Number.isInteger(idx)) article = articles[idx];

	// Fallback: artikel dari tab kategori tidak selalu ada di pool headline
	if (!article && source.fetchCategory && source.supportedCategories) {
		for (const cat of source.supportedCategories) {
			const pool: Article[] = await source.fetchCategory(cat, 30).catch(() => []);
			const found: Article | undefined = u ? pool.find((a: Article) => a.url === u) : undefined;
			if (found) {
				article = found;
				articles = pool;
				break;
			}
		}
	}

	if (!article) error(404, 'Berita tidak ditemukan');

	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });
	return {
		article,
		sourceName: source.name,
		more: articles.filter((a: Article) => a.url !== article!.url).slice(0, 3)
	};
};
