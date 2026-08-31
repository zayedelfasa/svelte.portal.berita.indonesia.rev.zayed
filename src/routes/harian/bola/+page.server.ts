import type { PageServerLoad } from './$types';
import { fetchBola } from '$lib/server/bola';
import { invalidateCache } from '$lib/server/cache';

export const load: PageServerLoad = async ({ url }) => {
	const week = url.searchParams.get('week') === '1';
	if (url.searchParams.get('force') === '1') {
		invalidateCache('bola:scoreboard');
		invalidateCache('bola:scoreboard:week');
	}
	const r = await Promise.allSettled([fetchBola({ week })]);
	return {
		bola: r[0].status === 'fulfilled' ? r[0].value : null,
		error: r[0].status === 'rejected' ? String(r[0].reason) : null,
		week
	};
};
