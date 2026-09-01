import type { PageServerLoad } from './$types';
import { fetchHarga } from '$lib/server/harga';
import { fetchTrendsSembako } from '$lib/server/trends';
import { invalidateCache } from '$lib/server/cache';

export const load: PageServerLoad = async ({ url }) => {
	if (url.searchParams.get('force') === '1') {
		invalidateCache('harga:harian');
		invalidateCache('trends:sembako:v1');
	}
	const [hargaR, trendsR] = await Promise.allSettled([fetchHarga(), fetchTrendsSembako()]);
	return {
		harga: hargaR.status === 'fulfilled' ? hargaR.value : null,
		trends: trendsR.status === 'fulfilled' ? trendsR.value : null,
		error: hargaR.status === 'rejected' ? String(hargaR.reason) : trendsR.status === 'rejected' ? String(trendsR.reason) : null
	};
};
