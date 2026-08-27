import type { PageServerLoad } from './$types';
import { searchCity } from '$lib/server/weather';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	let results: Awaited<ReturnType<typeof searchCity>> = [];
	let error: string | null = null;
	if (q) {
		try {
			results = await searchCity(q);
		} catch (e) {
			error = String(e);
			results = [];
		}
	}
	// cache-control set in +layout.server.ts
	return { q, results, error };
};
