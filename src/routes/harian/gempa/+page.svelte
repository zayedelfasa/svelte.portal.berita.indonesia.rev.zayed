<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import type { GempaData, GempaItem } from '$lib/harian';

	let { data } = $props();

	let items = $derived((data.gempa as GempaData | null)?.items ?? []);
	let filterM5 = $state(false);
	let shown = $derived(filterM5 ? items.filter((g) => (g.magnitude ?? 0) >= 5) : items);

	function gmapsUrl(g: GempaItem): string {
		const lat = g.lintang.replace(',', '.');
		const lon = g.bujur.replace(',', '.');
		const latV = lat.includes('LS') ? -parseFloat(lat) : parseFloat(lat);
		const lonV = lon.includes('BB') ? -parseFloat(lon) : parseFloat(lon);
		if (!Number.isFinite(latV) || !Number.isFinite(lonV)) return '#';
		return `https://maps.google.com/?q=${latV},${lonV}`;
	}
</script>

<svelte:head>
	<title>Gempa Terkini — Portal Berita</title>
</svelte:head>

<div class="space-y-3 px-4 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">🌍 Gempa Terkini</h1>
			<a href="/harian/gempa?force=1" class="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">↻ Muat ulang</a>
		</div>
		<a href="/harian" class="text-xs font-semibold text-red-500 hover:underline dark:text-red-400">← Harian</a>
	</div>

	<div class="flex gap-2">
		<button
			onclick={() => (filterM5 = false)}
			class="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {filterM5
				? 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
				: 'bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900'}"
		>Semua</button>
		<button
			onclick={() => (filterM5 = true)}
			class="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {filterM5
				? 'bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
				: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'}"
		>M≥5</button>
		<span class="ml-auto self-center text-[10px] text-gray-400 dark:text-neutral-500">Sumber BMKG</span>
	</div>

	{#if shown.length === 0}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm text-gray-500 dark:text-neutral-400">
				{filterM5 ? 'Tidak ada gempa M≥5 terbaru.' : 'Data gempa sementara tidak tersedia.'}
			</p>
			{#if !filterM5}<p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">BMKG sedang sibuk. Silakan muat ulang.</p>{/if}
		</div>
	{:else}
		<ul class="space-y-2">
			{#each shown as g, i (g.tanggal + g.jam + i)}
				<li class="rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 {(g.magnitude ?? 0) >= 5 ? 'border-l-4 border-l-red-500' : ''}">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="text-sm font-semibold text-gray-900 dark:text-neutral-100">
								M{g.magnitude ?? '—'} • {g.wilayah}
							</p>
							<p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
								{g.tanggal} {g.jam} WIB • Kedalaman {g.kedalaman}
							</p>
							<p class="text-xs text-gray-500 dark:text-neutral-400">
								{g.lintang} {g.bujur}
								{#if g.isoTime}• {timeAgo(g.isoTime, clock.now)}{/if}
							</p>
							{#if g.potensi}<p class="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">{g.potensi}</p>{/if}
						</div>
						<a
							href={gmapsUrl(g)}
							target="_blank"
							rel="noopener noreferrer"
							class="shrink-0 rounded-full bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300"
						>🗺 Peta</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
