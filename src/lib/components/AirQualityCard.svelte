<script lang="ts">
	import type { AirQualityData } from '$lib/server/weather';

	let {
		air,
		error
	}: {
		air: AirQualityData | null;
		error?: string | null;
	} = $props();

	function barColor(aqi: number | null): string {
		if (aqi == null) return 'bg-gray-300 dark:bg-neutral-700';
		if (aqi <= 50) return 'bg-emerald-500';
		if (aqi <= 100) return 'bg-yellow-400';
		if (aqi <= 150) return 'bg-orange-500';
		if (aqi <= 200) return 'bg-red-500';
		if (aqi <= 300) return 'bg-purple-600';
		return 'bg-rose-800';
	}
	function badgeCls(aqi: number | null): string {
		if (aqi == null) return 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300';
		if (aqi <= 50) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40';
		if (aqi <= 100) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/40';
		if (aqi <= 150) return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-900/40';
		if (aqi <= 200) return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/40';
		if (aqi <= 300) return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/40';
		return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/40';
	}
	const pct = $derived(air?.us_aqi != null ? Math.min(100, (air.us_aqi / 300) * 100) : 0);
</script>

<div class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
	<div class="flex items-center justify-between gap-2">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Kualitas Udara</h3>
		{#if air?.us_aqi != null}
			<span class="rounded-full border px-2.5 py-1 text-xs font-bold {badgeCls(air.us_aqi)}">{air.category}</span>
		{/if}
	</div>

	{#if error}
		<div class="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-800">
			<p class="text-xs font-bold text-gray-700 dark:text-neutral-200">Polusi tidak tersedia</p>
			<p class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-neutral-400">{error}</p>
		</div>
	{:else if !air}
		<div class="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-800">
			<p class="text-xs font-bold text-gray-700 dark:text-neutral-200">Polusi tidak tersedia</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">Coba muat ulang.</p>
		</div>
	{:else}
		<div class="mt-3">
			<div class="flex items-baseline gap-2">
				<span class="text-xl font-bold text-gray-900 dark:text-neutral-100">AQI {air.us_aqi ?? '—'}</span>
				<span class="text-xs text-gray-500 dark:text-neutral-400">{air.category}</span>
			</div>
			<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
				<div class="h-full rounded-full transition-all {barColor(air.us_aqi)}" style="width: {pct}%"></div>
			</div>
			<div class="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-neutral-500">
				<span>0 Baik</span><span>50</span><span>100</span><span>150</span><span>300</span>
			</div>
			<div class="mt-3 grid grid-cols-3 gap-2 text-center">
				<div class="rounded-xl border border-gray-100 bg-gray-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800">
					<p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-neutral-400">PM2.5</p>
					<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{air.pm2_5 != null ? air.pm2_5.toFixed(1) : '—'}</p>
					<p class="text-[10px] text-gray-400">µg/m³</p>
				</div>
				<div class="rounded-xl border border-gray-100 bg-gray-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800">
					<p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-neutral-400">PM10</p>
					<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{air.pm10 != null ? air.pm10.toFixed(1) : '—'}</p>
					<p class="text-[10px] text-gray-400">µg/m³</p>
				</div>
				<div class="rounded-xl border border-gray-100 bg-gray-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800">
					<p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-neutral-400">O₃ / NO₂</p>
					<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{air.ozone != null ? air.ozone.toFixed(0) : '—'} / {air.no2 != null ? air.no2.toFixed(0) : '—'}</p>
					<p class="text-[10px] text-gray-400">µg/m³</p>
				</div>
			</div>
		</div>
	{/if}
	<p class="mt-3 text-[10px] leading-relaxed text-gray-400 dark:text-neutral-500">Sumber: Open-Meteo (CAMS) • Bukan BMKG resmi</p>
</div>
