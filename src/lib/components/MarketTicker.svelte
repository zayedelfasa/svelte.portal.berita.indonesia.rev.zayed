<script lang="ts">
	import type { MarketData } from '$lib/server/market';

	let { data }: { data: MarketData | null } = $props();

	const items = $derived(data?.items ?? []);

	function fmtPrice(v: number, cur: string) {
		if (cur === 'IDR') {
			if (v >= 1000) return v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
			return v.toLocaleString('id-ID', { maximumFractionDigits: 2 });
		}
		// USD crypto
		if (v >= 1000) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
		if (v >= 1) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
		return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 4 });
	}

	function fmtChange(v: number | null) {
		if (v == null || Number.isNaN(v)) return '';
		const sign = v > 0 ? '▲' : v < 0 ? '▼' : '■';
		return `${sign} ${Math.abs(v).toFixed(2)}%`;
	}
	function typeBadgeCls(t: string) {
		if (t === 'idx') return 'bg-sky-500/20 text-sky-300';
		if (t === 'forex') return 'bg-violet-500/20 text-violet-300';
		return 'bg-amber-500/20 text-amber-300';
	}
	function typeLabel(t: string) {
		if (t === 'idx') return 'IDX';
		if (t === 'forex') return 'FOREX';
		return 'CRYPTO';
	}
</script>

{#if items.length > 0}
	<div
		class="overflow-hidden border-b border-slate-800 bg-slate-900 py-2 dark:border-neutral-800 dark:bg-neutral-900"
		role="status"
		aria-label="Ticker saham dan crypto"
	>
		<div class="flex animate-marquee-market whitespace-nowrap hover:[animation-play-state:paused]" aria-hidden="false">
			{#each items as it (it.symbol)}
				<span class="mx-3 inline-flex items-center gap-1.5 text-xs font-medium">
					<span class="rounded px-1 py-0.5 text-[8px] font-bold leading-none tracking-wide {typeBadgeCls(it.type)}">{typeLabel(it.type)}</span>
					<span class="font-bold tracking-wide text-slate-200">{it.symbol}</span>
					<span class="text-slate-100">{fmtPrice(it.price, it.currency)}</span>
					{#if it.change24h != null && it.symbol !== 'USDT'}
						<span
							class="rounded px-1 py-0.5 text-[10px] font-bold leading-none {it.change24h > 0
								? 'bg-emerald-500/20 text-emerald-400'
								: it.change24h < 0
									? 'bg-red-500/20 text-red-400'
									: 'bg-slate-700 text-slate-300'}"
						>
							{fmtChange(it.change24h)}
						</span>
					{/if}
					{#if it.isEstimated}
						<span class="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-400">est</span>
					{/if}
				</span>
				<span class="mx-1 text-slate-600">·</span>
			{/each}
			{#each items as it (it.symbol + '-dup')}
				<span class="mx-3 inline-flex items-center gap-1.5 text-xs font-medium" aria-hidden="true">
					<span class="rounded px-1 py-0.5 text-[8px] font-bold leading-none tracking-wide {typeBadgeCls(it.type)}">{typeLabel(it.type)}</span>
					<span class="font-bold tracking-wide text-slate-200">{it.symbol}</span>
					<span class="text-slate-100">{fmtPrice(it.price, it.currency)}</span>
					{#if it.change24h != null && it.symbol !== 'USDT'}
						<span
							class="rounded px-1 py-0.5 text-[10px] font-bold leading-none {it.change24h > 0
								? 'bg-emerald-500/20 text-emerald-400'
								: it.change24h < 0
									? 'bg-red-500/20 text-red-400'
									: 'bg-slate-700 text-slate-300'}"
						>
							{fmtChange(it.change24h)}
						</span>
					{/if}
					{#if it.isEstimated}
						<span class="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-400">est</span>
					{/if}
				</span>
				<span class="mx-1 text-slate-600" aria-hidden="true">·</span>
			{/each}
		</div>
	</div>
{/if}

<style>
	@keyframes marquee-market {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}
	.animate-marquee-market {
		display: flex;
		width: max-content;
		animation: marquee-market 80s linear infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-marquee-market {
			animation: none;
		}
	}
</style>
