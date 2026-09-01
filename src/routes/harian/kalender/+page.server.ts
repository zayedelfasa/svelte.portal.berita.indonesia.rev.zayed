import type { PageServerLoad } from './$types';
import { fetchKalender } from '$lib/server/kalender';
import { invalidateCache } from '$lib/server/cache';

export const load: PageServerLoad = async ({ url }) => {
	if (url.searchParams.get('force') === '1') invalidateCache('kalender');
	const r = await Promise.allSettled([fetchKalender()]);
	return {
		kalender: r[0].status === 'fulfilled' ? r[0].value : null,
		error: r[0].status === 'rejected' ? String(r[0].reason) : null
	};
};
