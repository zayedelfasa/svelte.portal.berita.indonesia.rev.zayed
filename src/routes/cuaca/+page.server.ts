import type { PageServerLoad } from './$types';
import { fetchWeather, fetchAirQuality, reverseGeocode } from '$lib/server/weather';

const DEFAULT_LAT = -6.2088;
const DEFAULT_LON = 106.8456;
const DEFAULT_NAME = 'Jakarta';

function parseCoord(v: string | null, fallback: number): number {
	if (v == null) return fallback;
	const n = Number(v);
	return Number.isFinite(n) ? n : fallback;
}

export const load: PageServerLoad = async ({ url }) => {
	const lat = parseCoord(url.searchParams.get('lat'), DEFAULT_LAT);
	const lon = parseCoord(url.searchParams.get('lon'), DEFAULT_LON);
	const nameParam = url.searchParams.get('name')?.trim() || null;

	// Parallel fetch - 1 gagal tidak jatuhkan halaman
	const [weatherR, airR, reverseR] = await Promise.allSettled([
		fetchWeather(lat, lon),
		fetchAirQuality(lat, lon),
		nameParam ? Promise.resolve(nameParam) : reverseGeocode(lat, lon)
	]);

	const weather = weatherR.status === 'fulfilled' ? weatherR.value : null;
	const airQuality = airR.status === 'fulfilled' ? airR.value : null;
	const cityName =
		reverseR.status === 'fulfilled' && reverseR.value
			? reverseR.value
			: nameParam ?? (lat === DEFAULT_LAT && lon === DEFAULT_LON ? `${DEFAULT_NAME}, DKI Jakarta, Indonesia` : `${lat.toFixed(2)}, ${lon.toFixed(2)}`);

	const weatherError = weatherR.status === 'rejected' ? String(weatherR.reason) : null;
	const airError = airR.status === 'rejected' ? String(airR.reason) : null;

	// cache-control already set in +layout.server.ts, don't set again to avoid double header
	return {
		lat,
		lon,
		cityName,
		weather,
		airQuality,
		weatherError,
		airError,
		fetchedAt: new Date().toISOString()
	};
};
