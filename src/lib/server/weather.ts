import { cached, TTL } from './cache';
import { fetchWithTimeout } from './http';

export interface WeatherData {
	current: {
		temp: number;
		feelsLike: number;
		humidity: number;
		wind: number;
		code: number;
		time: string;
	};
	daily: Array<{ date: string; max: number; min: number; code: number; precip: number }>;
	hourly: Array<{ time: string; temp: number; code: number }>;
	currency?: never;
}

export interface AirQualityData {
	us_aqi: number | null;
	pm2_5: number | null;
	pm10: number | null;
	ozone: number | null;
	no2: number | null;
	category: string;
	time: string;
}

export interface GeoCity {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	country: string;
	admin1?: string;
	admin2?: string;
	timezone?: string;
}

function aqiCategory(aqi: number | null): string {
	if (aqi == null) return '—';
	if (aqi <= 50) return 'Baik';
	if (aqi <= 100) return 'Sedang';
	if (aqi <= 150) return 'Tidak Sehat';
	if (aqi <= 200) return 'Sangat Tidak Sehat';
	if (aqi <= 300) return 'Berbahaya';
	return 'Berbahaya Sekali';
}

function roundCoord(v: number): string {
	return v.toFixed(2);
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
	const key = `weather:current:${roundCoord(lat)},${roundCoord(lon)}`;
	return cached(
		key,
		async () => {
			const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&hourly=temperature_2m,weather_code&timezone=Asia%2FJakarta&forecast_days=7`;
			const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 7000);
			if (!res.ok) throw new Error(`open-meteo weather ${res.status}`);
			const j = (await res.json()) as {
				current?: { temperature_2m?: number; relative_humidity_2m?: number; apparent_temperature?: number; weather_code?: number; wind_speed_10m?: number; time?: string };
				daily?: { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; weather_code?: number[]; precipitation_sum?: number[] };
				hourly?: { time?: string[]; temperature_2m?: number[]; weather_code?: number[] };
			};
			if (!j.current) throw new Error('open-meteo missing current');
			const current = {
				temp: j.current.temperature_2m ?? NaN,
				feelsLike: j.current.apparent_temperature ?? NaN,
				humidity: j.current.relative_humidity_2m ?? NaN,
				wind: j.current.wind_speed_10m ?? NaN,
				code: j.current.weather_code ?? 0,
				time: j.current.time ?? new Date().toISOString()
			};
			const daily: WeatherData['daily'] = [];
			if (j.daily?.time) {
				for (let i = 0; i < j.daily.time.length; i++) {
					daily.push({
						date: j.daily.time[i],
						max: j.daily.temperature_2m_max?.[i] ?? NaN,
						min: j.daily.temperature_2m_min?.[i] ?? NaN,
						code: j.daily.weather_code?.[i] ?? 0,
						precip: j.daily.precipitation_sum?.[i] ?? 0
					});
				}
			}
			const hourly: WeatherData['hourly'] = [];
			if (j.hourly?.time) {
				const len = Math.min(24, j.hourly.time.length);
				for (let i = 0; i < len; i++) {
					hourly.push({
						time: j.hourly.time[i],
						temp: j.hourly.temperature_2m?.[i] ?? NaN,
						code: j.hourly.weather_code?.[i] ?? 0
					});
				}
			}
			return { current, daily, hourly };
		},
		TTL.weather
	);
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
	const key = `weather:air:${roundCoord(lat)},${roundCoord(lon)}`;
	return cached(
		key,
		async () => {
			const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=Asia%2FJakarta`;
			const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 7000);
			if (!res.ok) throw new Error(`open-meteo air ${res.status}`);
			const j = (await res.json()) as {
				current?: { us_aqi?: number; pm2_5?: number; pm10?: number; ozone?: number; nitrogen_dioxide?: number; time?: string };
			};
			if (!j.current) throw new Error('open-meteo air missing current');
			const us_aqi = j.current.us_aqi ?? null;
			return {
				us_aqi,
				pm2_5: j.current.pm2_5 ?? null,
				pm10: j.current.pm10 ?? null,
				ozone: j.current.ozone ?? null,
				no2: j.current.nitrogen_dioxide ?? null,
				category: aqiCategory(us_aqi),
				time: j.current.time ?? new Date().toISOString()
			};
		},
		TTL.weather
	);
}

export async function searchCity(q: string): Promise<GeoCity[]> {
	const qq = q.trim();
	if (!qq) return [];
	const key = `weather:geo:${qq.toLowerCase()}`;
	return cached(
		key,
		async () => {
			const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(qq)}&count=5&language=id&format=json`;
			const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 7000);
			if (!res.ok) throw new Error(`open-meteo geo ${res.status}`);
			const j = (await res.json()) as { results?: Array<{ id?: number; name?: string; latitude?: number; longitude?: number; country?: string; admin1?: string; admin2?: string; timezone?: string }> };
			if (!Array.isArray(j.results)) return [];
			return j.results
				.filter((r) => r.name && Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
				.slice(0, 5)
				.map((r) => ({
					id: r.id ?? 0,
					name: r.name!,
					latitude: r.latitude!,
					longitude: r.longitude!,
					country: r.country ?? '',
					admin1: r.admin1,
					admin2: r.admin2,
					timezone: r.timezone
				}));
		},
		TTL.geo
	);
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
	const key = `weather:reverse:${roundCoord(lat)},${roundCoord(lon)}`;
	return cached(
		key,
		async () => {
			// Open-Meteo has no reverse endpoint (404) → use BigDataCloud free reverse (no key)
			const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
			const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 7000);
			if (!res.ok) throw new Error(`bigdatacloud reverse ${res.status}`);
			const j = (await res.json()) as { city?: string; locality?: string; principalSubdivision?: string; countryName?: string };
			const parts = [j.city || j.locality, j.principalSubdivision, j.countryName].filter(Boolean);
			if (parts.length > 0) return parts.join(', ');
			// fallback: try localityInfo if available
			return j.city || j.locality || null;
		},
		TTL.reverse
	);
}
