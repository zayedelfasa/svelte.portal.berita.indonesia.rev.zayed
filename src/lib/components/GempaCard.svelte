<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import type { GempaData, GempaItem } from '$lib/harian';

	let { gempa }: { gempa: GempaData | null } = $props();

	/** signifikan = M≥5 dan <24 jam (FOMO banner) */
	let significant = $derived.by(() => {
		const first = gempa?.items?.[0];
		if (!first) return null;
		const m = first.magnitude ?? 0;
		const t = first.isoTime ? new Date(first.isoTime).getTime() : 0;
		const fresh = t > 0 && Date.now() - t < 24 * 60 * 60 * 1000;
		return m >= 5 && fresh ? first : null;
	});

	let latest = $derived(gempa?.items?.[0] ?? null);

	function gmapsUrl(g: GempaItem): string {
		const lat = g.lintang.replace(',', '.');
		const lon = g.bujur.replace(',', '.');
		// BMKG: "6.2 LS" / "102.4 BT" → konversi
		const latV = lat.includes('LS') ? -parseFloat(lat) : parseFloat(lat);
		const lonV = lon.includes('BB') ? -parseFloat(lon) : parseFloat(lon);
		if (!Number.isFinite(latV) || !Number.isFinite(lonV)) return '/harian/gempa';
		return `https://maps.google.com/?q=${latV},${lonV}`;
	}
</script>

{#if !gempa}
	<!-- sumber gagal → tidak tampil (jujur, semuaSettled) -->
{:else if significant}
	<div class="rounded-xl border border-gray-100 border-l-4 border-l-red-500 bg-red-50 px-4 py-4 dark:border-neutral-800 dark:bg-red-950/40">
		<h3 class="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">🔴 Gempa M{significant.magnitude} — {significant.wilayah}</h3>
		<p class="mt-1 text-xs text-red-700 dark:text-red-300">
			{significant.tanggal} {significant.jam} WIB • Kedalaman {significant.kedalaman}
			{#if significant.isoTime}• {timeAgo(significant.isoTime, clock.now)}{/if}
		</p>
		{#if significant.potensi}
			<p class="mt-1 text-xs font-medium text-red-700 dark:text-red-300">{significant.potensi}</p>
		{/if}
		<div class="mt-3 flex gap-2">
			<a
				href={gmapsUrl(significant)}
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-600"
			>🗺 Peta</a>
			<a href="/harian/gempa" class="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-100 dark:bg-neutral-900 dark:text-red-400">Semua gempa →</a>
		</div>
	</div>
{:else if latest}
	<a
		href="/harian/gempa"
		class="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
	>
		<span class="text-xs text-gray-600 dark:text-neutral-300">
			Tidak ada gempa signifikan • terakhir <span class="font-semibold">M{latest.magnitude ?? '—'}</span> {latest.wilayah}
		</span>
		<span class="shrink-0 text-[10px] text-gray-400 dark:text-neutral-500">
			{latest.isoTime ? timeAgo(latest.isoTime, clock.now) : ''} →
		</span>
	</a>
{/if}
