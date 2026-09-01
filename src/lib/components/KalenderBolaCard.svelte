<script lang="ts">
	import type { KalenderData, BolaData } from '$lib/harian';

	let {
		kalender,
		bola,
		showCalendar = true,
		showScore = true
	}: {
		kalender: KalenderData | null;
		bola: BolaData | null;
		showCalendar?: boolean;
		showScore?: boolean;
	} = $props();

	let liveMatches = $derived(bola?.matches?.filter((m) => m.status === 'live' || m.status === 'finished') ?? []);
	let nextScheduled = $derived(bola?.matches?.filter((m) => m.status === 'scheduled').slice(0, 3) ?? []);
	let showBola = $derived(showScore && (liveMatches.length > 0 || nextScheduled.length > 0));
	let displayMatches = $derived(liveMatches.length > 0 ? liveMatches.slice(0, 3) : nextScheduled);
</script>

{#if showCalendar}
<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
	<h3 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">📅 Kalender</h3>
	{#if kalender}
		<p class="mt-2 text-sm font-semibold text-gray-900 dark:text-neutral-100">{kalender.gregorianLabel}</p>
		{#if kalender.hijriLabel}
			<p class="text-xs text-gray-500 dark:text-neutral-400">{kalender.hijriLabel}</p>
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
		{#if kalender.hariBulan && kalender.hariBulan.length > 0}
			<div class="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
					<p class="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Hari penting — {kalender.bulanLabel}</p>
				<ul class="mt-2 space-y-1.5">
					{#each kalender.hariBulan.slice(0,4) as h (h.date + '|' + h.name)}
						<li class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs {h.isToday ? 'bg-amber-50 font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-gray-50 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300'}">
							<span class="flex items-center gap-2">
								<span class="inline-flex min-w-9 justify-center rounded bg-white px-1.5 py-0.5 text-[11px] font-bold text-gray-700 dark:bg-neutral-700 dark:text-neutral-200">{h.date.slice(8,10)}/{h.date.slice(5,7)}</span>
								<span class="leading-tight">{h.name}{#if h.isToday} <span class="ml-1 rounded bg-amber-500 px-1 py-0.5 text-[8px] font-bold uppercase text-white">Hari ini</span>{/if}</span>
							</span>
							{#if h.isLibur}<span class="shrink-0 rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold uppercase text-white">Libur</span>{/if}
						</li>
					{/each}
				</ul>
				{#if kalender.hariBulan.length > 4}<p class="mt-1.5 text-[11px] text-gray-500 dark:text-neutral-400">+{kalender.hariBulan.length - 4} lagi bulan ini • <a href="/harian/kalender" class="font-semibold text-red-500 hover:underline dark:text-red-400">lihat semua</a></p>{/if}
			</div>
		{/if}
	{:else}
		<p class="mt-2 text-xs text-gray-400 dark:text-neutral-500">Kalender tidak tersedia</p>
	{/if}
</div>
{/if}

{#if showBola}
	<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">⚽ Skor Bola</h3>
			<a href="/harian/bola" class="text-[11px] font-semibold text-red-500 hover:underline dark:text-red-400">Jadwal →</a>
		</div>
		<ul class="mt-3 space-y-2">
			{#each displayMatches as m (m.id)}
				<li class="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
					<div class="min-w-[46px] shrink-0 text-center">
						<div class="text-[11px] font-bold text-gray-900 dark:text-neutral-100">{m.kickoff ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).format(new Date(m.kickoff)) : '—'} <span class="text-[9px] font-normal text-gray-400 dark:text-neutral-500">WIB</span></div>
						<div class="text-[9px] text-gray-400 dark:text-neutral-500">{m.kickoff ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short' }).format(new Date(m.kickoff)) : ''}</div>
					</div>
					<div class="h-8 w-px shrink-0 bg-gray-100 dark:bg-neutral-800"></div>
					<div class="min-w-0 flex-1 space-y-1">
						<div class="flex items-center justify-between gap-1.5 text-xs text-gray-700 dark:text-neutral-300"><span class="flex items-center gap-1.5 truncate">{#if m.homeLogo}<img src={m.homeLogo} alt={m.home} class="h-4 w-4 rounded-full bg-white object-contain p-0.5 dark:bg-neutral-700" loading="lazy" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />{/if}<span class="truncate font-medium text-gray-900 dark:text-neutral-100">{m.home}</span></span><span class="font-bold text-gray-900 dark:text-neutral-100">{m.homeScore ?? '—'}</span></div>
						<div class="flex items-center justify-between gap-1.5 text-xs text-gray-700 dark:text-neutral-300"><span class="flex items-center gap-1.5 truncate">{#if m.awayLogo}<img src={m.awayLogo} alt={m.away} class="h-4 w-4 rounded-full bg-white object-contain p-0.5 dark:bg-neutral-700" loading="lazy" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />{/if}<span class="truncate font-medium text-gray-900 dark:text-neutral-100">{m.away}</span></span><span class="font-bold text-gray-900 dark:text-neutral-100">{m.awayScore ?? '—'}</span></div>
					</div>
					<div class="shrink-0">{#if m.status==='live'}<span class="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></span>{:else if m.status==='finished'}<span class="text-[10px] text-gray-400 dark:text-neutral-500">FT</span>{:else}<span class="text-[9px] rounded bg-gray-100 px-1.5 py-0.5 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">{m.liga}</span>{/if}</div>
				</li>
			{/each}
		</ul>
	</div>
{/if}
