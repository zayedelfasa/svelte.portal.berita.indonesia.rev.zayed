import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fetchMarketData } from '$lib/server/market';
import { symbolFromSlug } from '$lib/marketSlug';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const market = await fetchMarketData().catch(() => null);
	const symbol = symbolFromSlug(params.symbol);
	const item = market?.items.find((i) => i.symbol === symbol);
	if (!item) throw error(404, 'Simbol tidak ditemukan');

	const usdIdr = market?.items.find((i) => i.symbol === 'USD/IDR')?.price ?? 16220;

	setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });
	return { item, fetchedAt: market?.fetchedAt ?? null, usdIdr };
};
