import type { PageServerLoad } from './$types';
import { fetchBriefing } from '$lib/server/briefing';
import { invalidateCache } from '$lib/server/cache';

export const load: PageServerLoad = async ({ url }) => {
	if (url.searchParams.get('force') === '1') invalidateCache('briefing:v1');
	const r = await Promise.allSettled([fetchBriefing()]);
	return {
		briefing: r[0].status === 'fulfilled' ? r[0].value : null,
		error: r[0].status === 'rejected' ? String(r[0].reason) : null
	};
};
