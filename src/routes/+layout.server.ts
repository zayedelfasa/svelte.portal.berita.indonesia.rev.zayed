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
	// Force reload harus bypass CDN agar upstream benar-benar dipanggil ulang.
	if (url.searchParams.get('force') === '1') {
		setHeaders({ 'cache-control': 'no-store, no-cache, must-revalidate' });
	} else if (!url.pathname.startsWith('/cari')) {
		setHeaders({ 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' });
	}
	return { market };
};
