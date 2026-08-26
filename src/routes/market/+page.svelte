<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	let { data } = $props();

	const items = $derived(data.marketDetail?.items ?? []);
	const usdIdr = $derived(items.find((i) => i.symbol === 'USD/IDR')?.price ?? 16220);
	let showIdr = $state(false);

	// stale check >30m
	const fetchedAt = $derived(data.marketDetail?.fetchedAt ?? null);
	const isStale = $derived(fetchedAt ? Date.now() - new Date(fetchedAt).getTime() > 30 * 60 * 1000 : false);

	const crypto = $derived(items.filter((i) => i.type === 'crypto'));
	const idxForex = $derived(items.filter((i) => i.type !== 'crypto'));

	function fmtPrice(v: number, cur: string, item?: { symbol: string }) {
		// crypto IDR toggle
		if (item && item.symbol !== 'USD/IDR' && cur === 'USD' && showIdr) {
			const idr = v * usdIdr;
			return 'Rp ' + idr.toLocaleString('id-ID', { maximumFractionDigits: 0 });
		}
		if (cur === 'IDR') return 'Rp ' + v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
		if (v >= 1000) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
		if (v >= 1) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
		return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 4 });
	}

	function changeCls(v: number | null) {
		if (v == null) return 'text-gray-400';
		if (v > 0) return 'text-emerald-600 dark:text-emerald-400';
		if (v < 0) return 'text-red-600 dark:text-red-400';
		return 'text-gray-400';
	}
	function changeBg(v: number | null) {
		if (v == null) return 'bg-gray-100 dark:bg-neutral-800';
		if (v > 0) return 'bg-emerald-50 dark:bg-emerald-950/40';
		if (v < 0) return 'bg-red-50 dark:bg-red-950/40';
		return 'bg-gray-100 dark:bg-neutral-800';
	}
</script>

<svelte:head>
	<title>Market — Saham & Crypto | Portal Berita</title>
	<meta name="description" content="Pantau IHSG, LQ45, USD/IDR dan harga crypto BTC ETH SOL BNB USDT realtime." />
</svelte:head>

<div class="px-4 py-4">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">Market</h2>
			<p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">Saham IDX & Crypto — update tiap 10 menit</p>
			{#if fetchedAt}
				<p class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500">Diperbarui {timeAgo(fetchedAt, clock.now)}</p>
			{/if}
		</div>
		<button onclick={() => (showIdr = !showIdr)} class="rounded-full border px-3 py-1.5 text-xs font-bold {showIdr ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white text-gray-700 dark:bg-neutral-900 dark:text-neutral-300'}">
			{showIdr ? 'Rp' : '$'} • {showIdr ? 'IDR' : 'USD'}
		</button>
	</div>
	{#if isStale}
		<div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
			<p class="text-xs font-bold text-amber-800 dark:text-amber-300">Data agak basi (&gt;30 menit)</p>
			<p class="text-[11px] text-amber-700 dark:text-amber-400">Yahoo/CoinGecko mungkin lambat. Harga terakhir tetap tampil.</p>
			<button onclick={() => location.reload()} class="mt-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">Muat ulang</button>
		</div>
	{/if}
</div>

{#if items.length === 0}
	<p class="px-4 py-8 text-center text-xs text-gray-400 dark:text-neutral-500">Data market belum tersedia. Coba muat ulang.</p>
{:else}
	<div class="px-4 pb-2">
		<h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Saham & Forex</h3>
		<div class="grid grid-cols-1 gap-2">
			{#each idxForex as it (it.symbol)}
				<div class="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
					<div>
						<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{it.symbol} {#if it.isEstimated}<span class="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">est</span>{/if}</p>
						<p class="text-[11px] text-gray-500 dark:text-neutral-400">{it.name} • {it.currency}{#if it.isEstimated} • estimasi dari IHSG{/if}</p>
					</div>
					<div class="text-right">
						<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{fmtPrice(it.price, it.currency, it)}</p>
						<p class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold {changeBg(it.change24h)} {changeCls(it.change24h)}">
							{it.change24h == null ? '—' : `${it.change24h > 0 ? '+' : ''}${it.change24h.toFixed(2)}% 24j`}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="px-4 py-4">
		<h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Crypto Top 5 <span class="font-normal normal-case">• kurs USD/IDR {usdIdr.toLocaleString('id-ID')}</span></h3>
		<div class="grid grid-cols-1 gap-2">
			{#each crypto as it (it.symbol)}
				<div class="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">{it.symbol.slice(0, 3)}</div>
						<div>
							<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{it.symbol}</p>
							<p class="text-[11px] text-gray-500 dark:text-neutral-400">{it.name}</p>
						</div>
					</div>
					<div class="text-right">
						<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{fmtPrice(it.price, it.currency, it)}</p>
						{#if it.symbol === 'USDT'}
							<p class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">stablecoin</p>
						{:else}
							<p class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold {changeBg(it.change24h)} {changeCls(it.change24h)}">
								{it.change24h == null ? '—' : `${it.change24h > 0 ? '+' : ''}${it.change24h.toFixed(2)}% 24j`}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		<p class="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-neutral-500">Sumber: Yahoo Finance (IHSG, Forex) & CoinGecko (crypto). Data delay ~10 menit. Bukan rekomendasi investasi.</p>
	</div>
{/if}
