<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import Sparkline from '$lib/components/Sparkline.svelte';
	import MarketCalculator from '$lib/components/MarketCalculator.svelte';
	import { fmtPrice, changeCls, changeBg, typeBadgeCls, typeLabel } from '$lib/marketFormat';

	let { data } = $props();
	const item = $derived(data.item);
	const usdIdr = $derived(data.usdIdr ?? 16220);

	let showIdr = $state(false);
	const fetchedAt = $derived(data.fetchedAt ?? null);
</script>

<svelte:head>
	<title>{item.symbol} — Market | Portal Berita</title>
	<meta name="description" content="Detail {item.name} ({item.symbol}) - harga & perubahan 24 jam." />
</svelte:head>

<div class="px-4 py-4">
	<a href="/market" class="mb-3 inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
		← Market
	</a>

	<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
		<div class="flex items-start justify-between">
			<div>
				<p class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-neutral-100">
					{item.symbol}<span class="rounded px-1 py-0.5 text-[9px] font-bold tracking-wide {typeBadgeCls(item.type)}">{typeLabel(item.type)}</span>{#if item.isEstimated}<span class="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">est</span>{/if}
				</p>
				<p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
					{item.name}{#if item.isEstimated} • estimasi dari IHSG{/if}{#if item.symbol !== 'USD/IDR' && item.currency === 'USD'}
						<button onclick={() => (showIdr = !showIdr)} class="ml-1 text-[10px] font-bold text-red-500">{showIdr ? 'Rp' : '$'}</button>
					{/if}
				</p>
				<p class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500">{fetchedAt ? `Diperbarui ${timeAgo(fetchedAt, clock.now)}` : ''}</p>
			</div>
			<div class="text-right">
				<p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">{fmtPrice(item.price, item.currency, usdIdr, showIdr, item)}</p>
				{#if item.symbol === 'USDT'}
					<p class="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">stablecoin</p>
				{:else}
					<p class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold {changeBg(item.change24h)} {changeCls(item.change24h)}">
						{item.change24h == null ? '—' : `${item.change24h > 0 ? '+' : ''}${item.change24h.toFixed(2)}% 24j`}
					</p>
				{/if}
			</div>
		</div>

		{#if (item.sparkline ?? []).length >= 2}
			<div class="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
				<p class="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500">7 hari</p>
				<Sparkline points={item.sparkline ?? []} up={(item.change24h ?? 0) >= 0} />
			</div>
		{/if}
	</div>

	<div class="mt-3">
		<MarketCalculator item={item} {usdIdr} />
	</div>

	<p class="mt-4 text-[11px] leading-relaxed text-gray-400 dark:text-neutral-500">Sumber: Yahoo Finance & CoinGecko. Data delay ~10 menit. Bukan rekomendasi investasi.</p>
</div>
