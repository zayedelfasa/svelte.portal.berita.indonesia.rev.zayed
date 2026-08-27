<script lang="ts">
	import type { WeatherData } from '$lib/server/weather';
	import { getWeatherCodeInfo } from '$lib/weatherCode';
	import { timeAgo } from '$lib/time';
	import { clock } from '$lib/utils/clock.svelte';

	let {
		weather,
		cityName,
		lat,
		lon,
		fetchedAt,
		error
	}: {
		weather: WeatherData | null;
		cityName: string;
		lat: number;
		lon: number;
		fetchedAt: string;
		error?: string | null;
	} = $props();

	const info = $derived(weather ? getWeatherCodeInfo(weather.current.code) : null);
	const temp = $derived(weather?.current.temp);
	const feels = $derived(weather?.current.feelsLike);
	const humidity = $derived(weather?.current.humidity);
	const wind = $derived(weather?.current.wind);
	const dailyToday = $derived(weather?.daily[0]);
</script>

<div class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
	<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Lokasi Saat Ini</h3>
	{#if error}
		<div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-900 dark:bg-amber-950/30">
			<p class="text-xs font-bold text-amber-800 dark:text-amber-300">Cuaca tidak tersedia</p>
			<p class="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400">{error}</p>
		</div>
	{:else if !weather || temp == null || Number.isNaN(temp)}
		<div class="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-800">
			<p class="text-xs font-bold text-gray-700 dark:text-neutral-200">Cuaca tidak tersedia</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">Coba muat ulang beberapa saat lagi.</p>
		</div>
	{:else}
		<div class="mt-3">
			<p class="truncate text-sm font-bold text-gray-900 dark:text-neutral-100">{cityName}</p>
			<p class="text-[11px] text-gray-500 dark:text-neutral-400">{lat.toFixed(2)}, {lon.toFixed(2)} · Diperbarui {timeAgo(fetchedAt, clock.now)}</p>
			<div class="mt-3 flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-xl dark:bg-sky-950/30">{info?.icon}</div>
				<div>
					<p class="text-2xl font-bold tracking-tight text-gray-900 dark:text-neutral-100">{Math.round(temp)}° <span class="text-sm font-medium text-gray-500 dark:text-neutral-400">{info?.label}</span></p>
					<p class="text-xs text-gray-600 dark:text-neutral-400">Feels like {Number.isFinite(feels) ? Math.round(feels!) + '°' : '—'}{#if dailyToday} · H {Number.isFinite(dailyToday.max) ? Math.round(dailyToday.max) + '°' : '—'} L {Number.isFinite(dailyToday.min) ? Math.round(dailyToday.min) + '°' : '—'}{/if}</p>
				</div>
			</div>
			<div class="mt-3 flex gap-2">
				<span class="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">💧 {Number.isFinite(humidity) ? Math.round(humidity!) + '%' : '—'} Hum</span>
				<span class="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">💨 {Number.isFinite(wind) ? Math.round(wind!) + ' km/h' : '—'}</span>
			</div>
		</div>
	{/if}
</div>
