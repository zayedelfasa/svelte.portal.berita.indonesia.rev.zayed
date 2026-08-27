<script lang="ts">
	// Kalkulator lot saham & converter crypto — client only, tanpa fetch.
	// idx/forex: 1 lot = 100 lembar → total = price * qty * 100
	// crypto: qty coin → USD, plus konversi IDR via kurs usdIdr
	let { item, usdIdr }: { item: { symbol: string; price: number; currency: string; type: string }; usdIdr: number } =
		$props();

	let qty = $state<number>(1);

	const isIdx = $derived(item.type === 'idx' || item.type === 'forex');
	const perUnit = $derived(isIdx ? 100 : 1);
	const total = $derived(item.price * (qty || 0) * perUnit);
	const totalIdr = $derived(item.currency === 'USD' ? total * usdIdr : total);

	function fmt(n: number) {
		if (n >= 100 || item.currency === 'IDR') return n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
		return n.toLocaleString('en-US', { maximumFractionDigits: Math.max(n >= 1 ? 2 : 4, item.price < 1 ? 4 : 2) });
	}
</script>

<div class="rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
	<h4 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
		{isIdx ? 'Kalkulator Lot' : 'Konverter Crypto'} • {item.symbol}
	</h4>
	<div class="mt-2 flex items-center gap-2">
		<label for="calc-qty" class="text-xs text-gray-500 dark:text-neutral-400">
			{isIdx ? 'Jumlah lot' : 'Jumlah koin'}
		</label>
		<input
			id="calc-qty"
			type="number"
			min="1"
			bind:value={qty}
			class="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-right text-sm font-bold text-gray-900 focus:border-slate-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
		/>
	</div>
	<div class="mt-3 space-y-0.5 text-sm">
		{#if isIdx}
			<p class="font-bold text-gray-900 dark:text-neutral-100">{fmt(total)} {item.currency}</p>
			<p class="text-[11px] text-gray-400 dark:text-neutral-500">
				≈ {qty || 0} lot × {item.price.toLocaleString('id-ID')} × 100 lembar
			</p>
		{:else}
			<p class="font-bold text-gray-900 dark:text-neutral-100">{fmt(total)} USD</p>
			<p class="text-[11px] text-gray-400 dark:text-neutral-500">≈ {fmt(totalIdr)} IDR (kurs {usdIdr.toLocaleString('id-ID')})</p>
		{/if}
	</div>
	<p class="mt-2 text-[10px] text-gray-300 dark:text-neutral-600">Estimasi — bukan rekomendasi investasi.</p>
</div>
