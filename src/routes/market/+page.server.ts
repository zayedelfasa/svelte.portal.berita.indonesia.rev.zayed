import type { PageServerLoad } from './$types';
import { fetchMarketData } from '$lib/server/market';

export const load: PageServerLoad = async () => {
	const market = await fetchMarketData().catch(() => null);
	return { marketDetail: market };
};
