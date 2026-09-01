<script lang="ts">
	import type { BolaData, BolaMatch } from '$lib/harian';

	let { data } = $props();

	let bola = $derived(data.bola as BolaData | null);
	let week = $derived((data as { week?: boolean }).week ?? false);
	let selectedLiga = $state<string>('Semua');
	let ligas = $derived(['Semua', ...Array.from(new Set(bola?.matches.map((m) => m.liga) ?? []))]);
	let filtered = $derived(selectedLiga === 'Semua' ? (bola?.matches ?? []) : (bola?.matches.filter((m) => m.liga === selectedLiga) ?? []));
	let live = $derived(filtered.filter((m) => m.status === 'live'));
	let finished = $derived(filtered.filter((m) => m.status === 'finished'));
	let scheduled = $derived(filtered.filter((m) => m.status === 'scheduled'));
	let groupedScheduled = $derived.by(() => {
		const map = new Map<string, BolaMatch[]>();
		for (const m of scheduled) {
			const key = m.kickoff ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(m.kickoff)) : 'Jadwal';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(m);
		}
		return [...map.entries()];
	});

	function kickoffTime(iso?: string): string {
		if (!iso) return '—';
		try {
			return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
		} catch {
			return '—';
		}
	}
	function kickoffDate(iso?: string): string {
		if (!iso) return '';
		try {
			return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short' }).format(new Date(iso));
		} catch {
			return '';
		}
	}

	const fmt = (n: number) => n.toLocaleString('id-ID');
</script>

<svelte:head>
	<title>Skor Bola — Portal Berita</title>
</svelte:head>

<div class="space-y-3 px-4 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">⚽ Skor Bola</h1>
			<a href="/harian/bola?force=1{week ? '&week=1' : ''}{selectedLiga !== 'Semua' ? `&liga=${encodeURIComponent(selectedLiga)}` : ''}" class="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">↻ Muat ulang</a>
		</div>
		<a href="/harian" class="text-xs font-semibold text-red-500 hover:underline dark:text-red-400">← Harian</a>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
			{#each ligas as liga (liga)}
				<button onclick={() => (selectedLiga = liga)} class="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors {selectedLiga === liga ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'}">{liga}</button>
			{/each}
		</div>
		<div class="flex gap-1.5">
			<a href="/harian/bola{selectedLiga !== 'Semua' ? `?liga=${encodeURIComponent(selectedLiga)}` : ''}" class="rounded-full px-3 py-1.5 text-[11px] font-semibold {week ? 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300' : 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900'}">Hari Ini</a>
			<a href="/harian/bola?week=1{selectedLiga !== 'Semua' ? `&liga=${encodeURIComponent(selectedLiga)}` : ''}" class="rounded-full px-3 py-1.5 text-[11px] font-semibold {week ? 'bg-slate-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300'}">Minggu Ini</a>
		</div>
	</div>

	{#if !bola || filtered.length === 0}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm text-gray-500 dark:text-neutral-400">Jadwal belum tersedia{selectedLiga !== 'Semua' ? ` untuk ${selectedLiga}` : ''}.</p>
			<p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">Sumber ESPN / TheSportsDB sedang sibuk. Silakan muat ulang.</p>
		</div>
	{:else}
		{#if live.length > 0}
			<section class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
				<h2 class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-500">
					<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span> Live
				</h2>
				<ul class="mt-3 space-y-1">
					{#each live as m (m.id)}
						<li class="rounded-lg border border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">{@render MatchRow(m)}</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if finished.length > 0}
			<section class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
				<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Selesai</h2>
				<ul class="mt-3 space-y-1">
					{#each finished as m (m.id)}
						<li class="rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40">{@render MatchRow(m)}</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if groupedScheduled.length > 0}
			<section class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
				<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">{week ? 'Minggu Ini' : 'Jadwal'}</h2>
				{#each groupedScheduled as [day, list] (day)}
					<p class="mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">{day}</p>
					<ul class="mt-1.5 space-y-1">
						{#each list as m (m.id)}
							<li class="rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40">{@render MatchRow(m)}</li>
						{/each}
					</ul>
				{/each}
			</section>
		{/if}

		<p class="text-[10px] text-gray-400 dark:text-neutral-500">Sumber ESPN + TheSportsDB • {ligas.length - 1} liga</p>
	{/if}
</div>

{#snippet MatchRow(m: BolaMatch)}
	<div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900">
		<div class="min-w-[52px] shrink-0 text-center">
			<div class="text-[11px] font-bold text-gray-900 dark:text-neutral-100">{kickoffTime(m.kickoff)} <span class="text-[10px] font-normal text-gray-400">WIB</span></div>
			<div class="text-[10px] text-gray-400 dark:text-neutral-500">{kickoffDate(m.kickoff)}</div>
			<div class="mt-1 text-[8px] font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">{m.liga}</div>
		</div>
		<div class="h-10 w-px shrink-0 bg-gray-100 dark:bg-neutral-800"></div>
		<div class="min-w-0 flex-1 space-y-1.5">
			<div class="flex items-center justify-between gap-2">
				<span class="flex min-w-0 items-center gap-2 truncate text-[13px] font-medium text-gray-700 dark:text-neutral-300">{#if m.homeLogo}<img src={m.homeLogo} alt={m.home} class="h-5 w-5 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm dark:bg-neutral-700" loading="lazy" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />{/if}<span class="truncate">{m.home}</span></span>
				<span class="shrink-0 text-[13px] font-bold text-gray-900 dark:text-neutral-100">{m.homeScore ?? '—'}</span>
			</div>
			<div class="flex items-center justify-between gap-2">
				<span class="flex min-w-0 items-center gap-2 truncate text-[13px] font-medium text-gray-700 dark:text-neutral-300">{#if m.awayLogo}<img src={m.awayLogo} alt={m.away} class="h-5 w-5 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm dark:bg-neutral-700" loading="lazy" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />{/if}<span class="truncate">{m.away}</span></span>
				<span class="shrink-0 text-[13px] font-bold text-gray-900 dark:text-neutral-100">{m.awayScore ?? '—'}</span>
			</div>
		</div>
		<div class="min-w-[44px] shrink-0 text-right">
			{#if m.status === 'live'}
				<span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500 dark:bg-red-950/30"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span>{m.clock ?? 'LIVE'}</span>
			{:else if m.status === 'finished'}
				<span class="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">FT</span>
			{:else}
				<span class="text-[10px] text-gray-400 dark:text-neutral-500">vs</span>
			{/if}
		</div>
	</div>
{/snippet}
