import type { PageServerLoad } from './$types';
import { fetchHarga } from '$lib/server/harga';
import { invalidateCache } from '$lib/server/cache';

export const load: PageServerLoad = async ({ url }) => {
	if (url.searchParams.get('force') === '1') invalidateCache('harga:harian');
	const r = await Promise.allSettled([fetchHarga()]);
	return {
		harga: r[0].status === 'fulfilled' ? r[0].value : null,
		error: r[0].status === 'rejected' ? String(r[0].reason) : null
	};
};
