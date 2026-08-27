<script lang="ts">
	import type { WeatherData } from '$lib/server/weather';
	import { getWeatherCodeInfo } from '$lib/weatherCode';

	let { weather }: { weather: WeatherData | null } = $props();

	function fmtDate(iso: string): string {
		try {
			const d = new Date(iso);
			return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
		} catch {
			return iso.slice(5, 10);
		}
	}
	function fmtHour(iso: string): string {
		try {
			const d = new Date(iso);
			return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(d);
		} catch {
			return iso.slice(11, 16);
		}
	}
</script>

{#if weather?.daily?.length}
	<div class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Ramalan 7 Hari</h3>
		<div class="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{#each weather.daily as d (d.date)}
				{@const info = getWeatherCodeInfo(d.code)}
				<div class="flex min-w-[68px] shrink-0 flex-col items-center rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-center dark:border-neutral-800 dark:bg-neutral-800">
					<p class="text-[11px] font-medium text-gray-600 dark:text-neutral-300">{fmtDate(d.date)}</p>
					<p class="mt-1 text-base leading-none">{info.icon}</p>
					<p class="mt-1 text-xs font-bold text-gray-900 dark:text-neutral-100">{Number.isFinite(d.max) ? Math.round(d.max) + '°' : '—'}/{Number.isFinite(d.min) ? Math.round(d.min) + '°' : '—'}</p>
					<p class="text-[10px] text-gray-400 dark:text-neutral-500">{Number.isFinite(d.precip) ? d.precip.toFixed(1) + ' mm' : ''}</p>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if weather?.hourly?.length}
	<div class="rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Per Jam · 24 Jam</h3>
		<div class="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{#each weather.hourly as h (h.time)}
				{@const info = getWeatherCodeInfo(h.code)}
				<div class="flex min-w-[56px] shrink-0 flex-col items-center rounded-xl border border-gray-100 bg-gray-50 p-2 text-center dark:border-neutral-800 dark:bg-neutral-800">
					<p class="text-[10px] text-gray-500 dark:text-neutral-400">{fmtHour(h.time)}</p>
					<p class="mt-1 text-sm leading-none">{info.icon}</p>
					<p class="text-xs font-bold text-gray-900 dark:text-neutral-100">{Number.isFinite(h.temp) ? Math.round(h.temp) + '°' : '—'}</p>
				</div>
			{/each}
		</div>
	</div>
{/if}
