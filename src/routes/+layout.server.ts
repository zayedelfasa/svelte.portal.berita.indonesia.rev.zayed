import type { LayoutServerLoad } from './$types';
import { fetchMarketData } from '$lib/server/market';

export const load: LayoutServerLoad = async ({ url, setHeaders }) => {
	// Market ticker — gagal tidak boleh jatuhkan layout
	let market = null;
	try {
		market = await fetchMarketData();
	} catch {
		market = null;
	}
	// CDN cache 10 menit — skip untuk /cari yang pakai TTL 120 sendiri
	if (!url.pathname.startsWith('/cari')) {
		setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });
	}
	return { market };
};
