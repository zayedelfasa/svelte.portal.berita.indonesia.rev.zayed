<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { HargaData } from '$lib/harian';

	let { harga }: { harga: HargaData | null } = $props();

	let rows = $derived.by(() => {
		if (!harga?.items) return [];
		// ringkas: emas + max 2 sembako + pertalite — sisanya di /harian/harga
		const emas = harga.items.find((i) => i.grup === 'emas' && i.harga != null);
		const sembako = harga.items.filter((i) => i.grup === 'sembako' && i.harga != null).slice(0, 2);
		const bbm = harga.items.filter((i) => i.grup === 'bbm' && i.harga != null).slice(0, 1);
		return [...(emas ? [emas] : []), ...sembako, ...bbm];
	});

	const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');
</script>

{#if rows.length > 0}
	<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">💰 Harga Hari Ini</h3>
			<a href="/harian/harga" class="text-[11px] font-semibold text-red-500 hover:underline dark:text-red-400">Lihat semua →</a>
		</div>
		<ul class="mt-3 space-y-2">
			{#each rows as r (r.id)}
				<li class="flex items-baseline justify-between gap-2 text-sm">
					<span class="text-gray-700 dark:text-neutral-300">
						{r.nama}
						{#if r.estimasi}<span class="ml-1 rounded bg-gray-100 px-1 py-0.5 align-middle text-[9px] font-semibold uppercase text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">est</span>{/if}
					</span>
					<span class="shrink-0 font-semibold text-gray-900 dark:text-neutral-100">
						{fmt(r.harga ?? 0)} <span class="text-[10px] font-normal text-gray-400">/{r.satuan}</span>
					</span>
				</li>
			{/each}
		</ul>
		<p class="mt-2.5 text-[10px] text-gray-400 dark:text-neutral-500">Diperbarui {timeAgo(harga?.fetchedAt ?? new Date().toISOString())} • Emas bukan harga resmi Antam</p>
	</div>
{/if}
