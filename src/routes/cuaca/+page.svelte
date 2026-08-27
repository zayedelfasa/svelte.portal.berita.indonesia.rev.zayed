<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import WeatherCard from '$lib/components/WeatherCard.svelte';
	import AirQualityCard from '$lib/components/AirQualityCard.svelte';
	import ForecastStrip from '$lib/components/ForecastStrip.svelte';

	let { data } = $props();

	function saveLoc(lat: number, lon: number, name?: string) {
		if (!browser) return;
		try {
			localStorage.setItem('cuaca:loc', JSON.stringify({ lat, lon, name: name ?? data.cityName }));
		} catch {}
	}

	onMount(() => {
		if (!browser) return;
		const hasLat = page.url.searchParams.has('lat');
		const hasLon = page.url.searchParams.has('lon');
		if (!hasLat && !hasLon) {
			try {
				const raw = localStorage.getItem('cuaca:loc');
				if (raw) {
					const { lat, lon } = JSON.parse(raw) as { lat: number; lon: number };
					if (Number.isFinite(lat) && Number.isFinite(lon)) {
						goto(`/cuaca?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`, { replaceState: true });
					}
				}
			} catch {}
		}
	});

	// persist setiap ada lat/lon di URL (termasuk pick kota & lokasi saya)
	$effect(() => {
		if (!browser) return;
		const hasLat = page.url.searchParams.has('lat');
		const hasLon = page.url.searchParams.has('lon');
		if (hasLat && hasLon) {
			const lat = Number(page.url.searchParams.get('lat'));
			const lon = Number(page.url.searchParams.get('lon'));
			const name = page.url.searchParams.get('name') || data.cityName;
			if (Number.isFinite(lat) && Number.isFinite(lon)) saveLoc(lat, lon, name);
		}
	});

	let locating = $state(false);
	let geoError = $state<string | null>(null);

	function useMyLocation() {
		if (!navigator.geolocation) {
			geoError = 'Geolocation tidak didukung browser ini.';
			return;
		}
		locating = true;
		geoError = null;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				locating = false;
				const lat = pos.coords.latitude;
				const lon = pos.coords.longitude;
				saveLoc(lat, lon);
				goto(`/cuaca?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`, { replaceState: true });
			},
			(err) => {
				locating = false;
				if (err.code === 1) geoError = 'Izin lokasi ditolak. Menampilkan Jakarta.';
				else geoError = err.message || 'Gagal ambil lokasi.';
			},
			{ enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
		);
	}
</script>

<svelte:head>
	<title>Cuaca — Portal Berita Indonesia</title>
	<meta name="description" content="Cuaca dan polusi udara terkini Indonesia." />
</svelte:head>

<div class="px-4 py-4">
	<div>
		<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">Cuaca</h2>
		<p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">Suhu, polusi & ramalan — Open-Meteo</p>
		<div class="mt-3 flex gap-2">
			<button
				onclick={useMyLocation}
				disabled={locating}
				class="flex-1 rounded-full border px-3 py-2 text-xs font-bold transition disabled:opacity-50 {locating ? 'border-gray-200 bg-gray-50 text-gray-400 dark:border-neutral-800 dark:bg-neutral-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'}"
			>
				{locating ? 'Mencari…' : '📍 Lokasi Saya'}
			</button>
			<a href="/cuaca/cari" class="flex-1 rounded-full bg-slate-900 px-3 py-2 text-center text-xs font-bold text-white dark:bg-white dark:text-slate-900">🔍 Cari Kota</a>
		</div>
		{#if geoError}
			<div class="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
				<p class="text-xs leading-relaxed text-amber-800 dark:text-amber-300">{geoError}</p>
			</div>
		{/if}
	</div>

	<div class="mt-4 space-y-3">
		<WeatherCard weather={data.weather} cityName={data.cityName} lat={data.lat} lon={data.lon} fetchedAt={data.fetchedAt} error={data.weatherError} />
		<AirQualityCard air={data.airQuality} error={data.airError} />

		<ForecastStrip weather={data.weather} />

		{#if data.weatherError && data.airError}
			<div class="rounded-xl border border-gray-100 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
				<p class="text-xs font-bold text-gray-700 dark:text-neutral-200">Data cuaca & polusi tidak tersedia</p>
				<p class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-neutral-400">Sumber Open-Meteo sedang sibuk. Coba muat ulang.</p>
				<button onclick={() => location.reload()} class="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">Muat ulang</button>
			</div>
		{/if}

		<p class="pt-1 text-center text-[11px] leading-relaxed text-gray-400 dark:text-neutral-500">Data: Open-Meteo • Timezone Asia/Jakarta • Bukan BMKG resmi</p>
	</div>
</div>
