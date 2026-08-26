import type { PageServerLoad } from './$types';
import { fetchMarketData, fetchTrending } from '$lib/server/market';

export const load: PageServerLoad = async () => {
	const [market, trending] = await Promise.allSettled([fetchMarketData(), fetchTrending()]);
	return {
		marketDetail: market.status === 'fulfilled' ? market.value : null,
		marketTrending: trending.status === 'fulfilled' ? trending.value : []
	};
};
