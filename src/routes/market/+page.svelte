<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import Sparkline from '$lib/components/Sparkline.svelte';
	import MarketCalculator from '$lib/components/MarketCalculator.svelte';
	import { slugify } from '$lib/marketSlug';
	import { fmtPrice, changeCls, changeBg, typeBadgeCls, typeLabel } from '$lib/marketFormat';
	let { data } = $props();

	const items = $derived(data.marketDetail?.items ?? []);
	const usdIdr = $derived(items.find((i) => i.symbol === 'USD/IDR')?.price ?? 16220);
	let showIdr = $state(false);

	// 1.2: trending + gainer/loser (client derived dari items)
	const trending = $derived(data.marketTrending ?? []);
	const gainers = $derived(
		[...items].filter((i) => i.change24h != null).sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0)).slice(0, 3)
	);
	const losers = $derived(
		[...items].filter((i) => i.change24h != null).sort((a, b) => (a.change24h ?? 0) - (b.change24h ?? 0)).slice(0, 3)
	);

	// stale check >30m
	const fetchedAt = $derived(data.marketDetail?.fetchedAt ?? null);
	const isStale = $derived(fetchedAt ? Date.now() - new Date(fetchedAt).getTime() > 30 * 60 * 1000 : false);

	// S3: filter chip state + derived
	type FilterType = 'all' | 'idx' | 'forex' | 'crypto';
	let activeFilter = $state<FilterType>('all');
	const chips: { id: FilterType; label: string }[] = [
		{ id: 'all', label: 'Semua' },
		{ id: 'idx', label: 'IDX' },
		{ id: 'forex', label: 'Forex' },
		{ id: 'crypto', label: 'Crypto' }
	];
	const idxItems = $derived(items.filter((i) => i.type === 'idx'));
	const forexItems = $derived(items.filter((i) => i.type === 'forex'));
	const crypto = $derived(items.filter((i) => i.type === 'crypto'));
	const idxForex = $derived(items.filter((i) => i.type !== 'crypto'));
	const displayedIdxForex = $derived(activeFilter === 'idx' ? idxItems : activeFilter === 'forex' ? forexItems : idxForex);
	const idxForexTitle = $derived(activeFilter === 'all' ? 'Saham & Forex' : activeFilter === 'idx' ? 'IDX' : 'Forex');
	const showIdxForex = $derived(activeFilter === 'all' || activeFilter === 'idx' || activeFilter === 'forex');
	const showCrypto = $derived(activeFilter === 'all' || activeFilter === 'crypto');

	// S2: sort state (tap header) — color-blind friendly via ↑↓
	type SortKey = 'name' | 'price' | 'change';
	let sortKey = $state<SortKey>('name');
	let sortDir = $state<'asc' | 'desc'>('asc');
	function toggleSort(k: SortKey) {
		if (sortKey === k) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = k;
			sortDir = 'asc';
		}
	}
	function sortArrow(k: SortKey) {
		if (sortKey !== k) return '↕';
		return sortDir === 'asc' ? '↑' : '↓';
	}
	function sortItems<T extends { symbol: string; price: number; change24h: number | null }>(list: T[]): T[] {
		const dir = sortDir === 'asc' ? 1 : -1;
		return [...list].sort((a, b) => {
			if (sortKey === 'price') return (a.price - b.price) * dir;
			if (sortKey === 'change') {
				const ca = a.change24h ?? -Infinity;
				const cb = b.change24h ?? -Infinity;
				return (ca - cb) * dir;
			}
			return a.symbol.localeCompare(b.symbol) * dir;
		});
	}
	const sortedIdxForex = $derived(sortItems(displayedIdxForex));
	const sortedCrypto = $derived(sortItems(crypto));
	const filteredCount = $derived(
		(activeFilter === 'all' ? items.length : activeFilter === 'idx' ? idxItems.length : activeFilter === 'forex' ? forexItems.length : crypto.length)
	);
	// reset sort saat ganti filter
	$effect(() => {
		void activeFilter;
		sortKey = 'name';
		sortDir = 'asc';
	});
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
	<!-- S3: Filter Chip [Semua | IDX | Forex | Crypto] -->
	<div class="mt-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter tipe market">
		{#each chips as c (c.id)}
			<button
				role="tab"
				aria-selected={activeFilter === c.id}
				onclick={() => (activeFilter = c.id)}
				class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition {activeFilter === c.id ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'}"
			>
				{c.label}
			</button>
		{/each}
	</div>
	{#if isStale && items.length > 0}
		<div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
			<p class="text-xs font-bold text-amber-800 dark:text-amber-300">Menampilkan data terakhir — diperbarui {timeAgo(fetchedAt!, clock.now)}</p>
			<p class="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">Sumber TwelveData / CoinGecko sedang sibuk atau dibatasi. Data di bawah adalah cache terakhir sebelum muat ulang. Silakan coba lagi beberapa saat lagi.</p>
			<button onclick={() => location.reload()} class="mt-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">Muat ulang</button>
		</div>
	{/if}
</div>

{#if items.length === 0}
	<div class="mx-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
		<p class="text-sm font-bold text-slate-800 dark:text-neutral-100">Data market IHSG/LQ45 sementara tidak tersedia</p>
		<p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-neutral-400">Sumber TwelveData sedang sibuk atau dibatasi aksesnya. Kami tidak menampilkan angka perkiraan agar tetap jujur. Data akan tampil kembali otomatis setelah sumber pulih.</p>
		<p class="mt-1 text-[11px] text-slate-500 dark:text-neutral-500">Silakan muat ulang beberapa saat lagi. Terima kasih atas pengertiannya.</p>
		<button onclick={() => location.reload()} class="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">Muat ulang</button>
	</div>
{:else if filteredCount === 0}
	<div class="mx-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
		<p class="text-sm font-bold text-slate-800 dark:text-neutral-100">Data market IHSG/LQ45 sementara tidak tersedia</p>
		<p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-neutral-400">Sumber TwelveData sedang sibuk atau dibatasi aksesnya. Kami tidak menampilkan angka perkiraan agar tetap jujur. Data akan tampil kembali otomatis setelah sumber pulih.</p>
		<p class="mt-1 text-[11px] text-slate-500 dark:text-neutral-500">Silakan muat ulang beberapa saat lagi. Terima kasih atas pengertiannya.</p>
		<button onclick={() => location.reload()} class="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">Muat ulang</button>
	</div>
{:else}
	{#if gainers.length > 0 || losers.length > 0 || trending.length > 0}
	<div class="px-4 pt-2">
		{#if gainers.length > 0}
		<div class="mb-2">
			<p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">🔥 Top Gainer</p>
			<div class="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{#each gainers as g (g.symbol)}
					<a href="/market/{slugify(g.symbol)}" class="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/30">
						<p class="text-xs font-bold text-emerald-700 dark:text-emerald-300">{g.symbol} <span class="font-normal">+{g.change24h!.toFixed(1)}%</span></p>
					</a>
				{/each}
			</div>
		</div>
		{/if}
		{#if losers.length > 0}
		<div class="mb-2">
			<p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">💧 Top Loser</p>
			<div class="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{#each losers as l (l.symbol)}
					<a href="/market/{slugify(l.symbol)}" class="shrink-0 rounded-xl border border-red-100 bg-red-50 px-3 py-2 dark:border-red-900/40 dark:bg-red-950/30">
						<p class="text-xs font-bold text-red-700 dark:text-red-400">{l.symbol} <span class="font-normal">{l.change24h!.toFixed(1)}%</span></p>
					</a>
				{/each}
			</div>
		</div>
		{/if}
		{#if trending.length > 0}
		<div class="mb-2">
			<p class="mb-1 text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">⭐ Trending</p>
			<div class="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{#each trending as t (t.symbol)}
					<a href="/market/{slugify(t.symbol)}" class="shrink-0 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 dark:border-amber-900 dark:bg-neutral-900 dark:text-neutral-200">
						{t.symbol}<span class="ml-1 font-normal text-gray-400 dark:text-neutral-500">{t.name}</span>
					</a>
				{/each}
			</div>
		</div>
		{/if}
	</div>
	{/if}

	{#if showIdxForex}
	<div class="px-4 pb-2">
		<div class="mb-2 flex items-center justify-between">
			<h3 class="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
				{idxForexTitle}
				<span class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold normal-case tracking-normal text-gray-500 dark:bg-neutral-800">{displayedIdxForex.length} item</span>
			</h3>
			<div class="flex gap-1" aria-label="Urutkan">
				<button aria-label="Urutkan nama" onclick={() => toggleSort('name')} class="rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Nama {sortArrow('name')}</button>
				<button aria-label="Urutkan harga" onclick={() => toggleSort('price')} class="rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Harga {sortArrow('price')}</button>
				<button aria-label="Urutkan perubahan" onclick={() => toggleSort('change')} class="rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800">24j {sortArrow('change')}</button>
			</div>
		</div>
		{#if displayedIdxForex.length === 0}
			<div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
				<p class="text-sm font-bold text-slate-800 dark:text-neutral-100">Data market IHSG/LQ45 sementara tidak tersedia</p>
				<p class="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-neutral-400">Sumber TwelveData sedang sibuk atau dibatasi aksesnya. Kami tidak menampilkan angka perkiraan agar tetap jujur. Data akan tampil kembali otomatis setelah sumber pulih.</p>
				<p class="mt-1 text-[11px] text-slate-500 dark:text-neutral-500">Silakan muat ulang beberapa saat lagi. Terima kasih atas pengertiannya.</p>
				<button onclick={() => location.reload()} class="mt-3 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">Muat ulang</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-2">
				{#each sortedIdxForex as it (it.symbol)}
					<a href="/market/{slugify(it.symbol)}" class="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 active:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800">
						<div class="flex items-center gap-3">
							<Sparkline points={it.sparkline ?? []} up={(it.change24h ?? 0) >= 0} />
							<div>
								<p class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-neutral-100">
									{it.symbol}<span class="rounded px-1 py-0.5 text-[9px] font-bold tracking-wide {typeBadgeCls(it.type)}">{typeLabel(it.type)}</span>{#if it.isEstimated}<span class="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">est</span>{/if}
								</p>
								<p class="text-[11px] text-gray-500 dark:text-neutral-400">{it.name} • {it.currency}{#if it.isEstimated} • estimasi dari IHSG{/if}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{fmtPrice(it.price, it.currency, usdIdr, showIdr, it)}</p>
							<p class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold {changeBg(it.change24h)} {changeCls(it.change24h)}">
								{it.change24h == null ? '—' : `${it.change24h > 0 ? '+' : ''}${it.change24h.toFixed(2)}% 24j`}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
	{/if}

	{#if showCrypto}
	<div class="px-4 py-4">
		<div class="mb-2 flex items-center justify-between">
			<h3 class="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Crypto Top 5 <span class="font-normal normal-case">• kurs USD/IDR {usdIdr.toLocaleString('id-ID')}</span></h3>
			<div class="flex gap-1" aria-label="Urutkan">
				<button aria-label="Urutkan nama" onclick={() => toggleSort('name')} class="rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Nama {sortArrow('name')}</button>
				<button aria-label="Urutkan harga" onclick={() => toggleSort('price')} class="rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800">Harga {sortArrow('price')}</button>
				<button aria-label="Urutkan perubahan" onclick={() => toggleSort('change')} class="rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 transition hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800">24j {sortArrow('change')}</button>
			</div>
		</div>
		{#if crypto.length === 0}
			<div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
				<p class="text-xs font-bold text-slate-700 dark:text-neutral-200">Data Crypto sementara tidak tersedia</p>
				<p class="mt-1 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">Sumber CoinGecko sedang sibuk atau dibatasi. Data akan pulih otomatis.</p>
			</div>
		{:else}
		<div class="grid grid-cols-1 gap-2">
			{#each sortedCrypto as it (it.symbol)}
				<a href="/market/{slugify(it.symbol)}" class="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 active:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:active:bg-neutral-800">
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">{it.symbol.slice(0, 3)}</div>
						<div>
							<p class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-neutral-100">{it.symbol}<span class="rounded px-1 py-0.5 text-[9px] font-bold tracking-wide {typeBadgeCls(it.type)}">{typeLabel(it.type)}</span></p>
							<p class="text-[11px] text-gray-500 dark:text-neutral-400">{it.name}</p>
						</div>
						<Sparkline points={it.sparkline ?? []} up={(it.change24h ?? 0) >= 0} />
					</div>
					<div class="text-right">
						<p class="text-sm font-bold text-gray-900 dark:text-neutral-100">{fmtPrice(it.price, it.currency, usdIdr, showIdr, it)}</p>
						{#if it.symbol === 'USDT'}
							<p class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">stablecoin</p>
						{:else}
							<p class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold {changeBg(it.change24h)} {changeCls(it.change24h)}">
								{it.change24h == null ? '—' : `${it.change24h > 0 ? '+' : ''}${it.change24h.toFixed(2)}% 24j`}
							</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
		<p class="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-neutral-500">Sumber: TwelveData (IHSG, Forex) & CoinGecko (crypto). Data delay ~10 menit. Bukan rekomendasi investasi.</p>
		<div class="mt-3">
			{#if items.length > 0}
				<MarketCalculator item={(items.find((i) => i.symbol === 'BTC') ?? items[0])!} {usdIdr} />
			{/if}
		</div>
		{/if}
	</div>
	{/if}
{/if}
