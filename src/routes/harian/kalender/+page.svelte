<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { KalenderData } from '$lib/harian';

	let { data } = $props();
	let kalender = $derived(data.kalender as KalenderData | null);
</script>

<svelte:head>
	<title>Hari Penting — Kalender</title>
</svelte:head>

<div class="space-y-3 px-4 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">📅 Kalender</h1>
			<a href="/harian/kalender?force=1" class="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">↻ Muat ulang</a>
		</div>
		<a href="/harian" class="text-xs font-semibold text-red-500 hover:underline dark:text-red-400">← Harian</a>
	</div>

	{#if kalender}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm font-semibold text-gray-900 dark:text-neutral-100">{kalender.gregorianLabel}</p>
			{#if kalender.hijriLabel}
				<p class="text-xs text-gray-500 dark:text-neutral-400">{kalender.hijriLabel} • {kalender.bulanLabel}</p>
			{/if}
			{#if kalender.holiday}
				<p class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
					{#if kalender.holiday.daysUntil === 0}
						Hari ini: {kalender.holiday.name}
					{:else}
						{kalender.holiday.daysUntil} hari lagi: {kalender.holiday.name}
					{/if}
					{#if kalender.holiday.isLibur}<span class="rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold uppercase text-white">Libur</span>{/if}
				</p>
			{/if}
		</div>

		<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
			<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Hari penting — {kalender.bulanLabel}</h2>
			<p class="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">{kalender.hariBulan.length} hari penting bulan ini • sumber Nager.Date + kurasi nasional</p>
			<ul class="mt-3 space-y-1.5">
				{#each kalender.hariBulan as h (h.date + '|' + h.name)}
					<li class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm {h.isToday ? 'bg-amber-50 font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-gray-50 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300'}">
						<span class="flex items-center gap-2">
							<span class="inline-flex min-w-10 justify-center rounded bg-white px-1.5 py-0.5 text-[11px] font-bold text-gray-700 dark:bg-neutral-700 dark:text-neutral-200">{h.date.slice(8,10)}/{h.date.slice(5,7)}</span>
							<span class="leading-tight">{h.name}{#if h.isToday} <span class="ml-1 rounded bg-amber-500 px-1 py-0.5 text-[8px] font-bold uppercase text-white">Hari ini</span>{/if}</span>
						</span>
						{#if h.isLibur}<span class="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Libur</span>{/if}
					</li>
				{/each}
			</ul>
			<p class="mt-3 text-[10px] leading-relaxed text-gray-400 dark:text-neutral-500">Menampilkan hanya bulan berjalan. Beda bulan → tunggu pergantian kalender otomatis (cache 12j).</p>
		</div>

		<p class="text-[10px] text-gray-400 dark:text-neutral-500">Diperbarui {timeAgo(new Date().toISOString())}</p>
	{:else}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm text-gray-500 dark:text-neutral-400">Kalender tidak tersedia</p>
			<p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">Sumber Aladhan / Nager.Date sedang sibuk. Silakan muat ulang.</p>
		</div>
	{/if}
</div>
