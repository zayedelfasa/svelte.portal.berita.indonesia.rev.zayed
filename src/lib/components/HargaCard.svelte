<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { HargaData } from '$lib/harian';

	let { harga }: { harga: HargaData | null } = $props();

	let rows = $derived.by(() => {
		if (!harga?.items) return [];
		// ringkas: emas + perak + 1 bbm — tren ditampilkan sebagai hint statis (embed di /harian/harga)
		const logam = harga.items.filter((i) => i.grup === 'logam' && i.harga != null).slice(0, 2);
		const bbm = harga.items.filter((i) => i.grup === 'bbm' && i.harga != null).slice(0, 1);
		return [...logam, ...bbm];
	});

	const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');
</script>

{#if rows.length > 0}
	<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">💰 Harga & Tren Hari Ini</h3>
			<a href="/harian/harga" class="text-[11px] font-semibold text-red-500 hover:underline dark:text-red-400">Lihat detail →</a>
		</div>
		<ul class="mt-3 space-y-2">
			{#each rows as r (r.id)}
				<li class="flex items-baseline justify-between gap-2 text-sm">
					<span class="text-gray-700 dark:text-neutral-300">
						{r.nama}
						{#if r.estimasi}<span class="ml-1 rounded bg-gray-100 px-1 py-0.5 align-middle text-[9px] font-semibold uppercase text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">est</span>{/if}
						{#if r.change24h != null}<span class="ml-1 text-[10px] font-semibold {r.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}">{r.change24h >= 0 ? '↗' : '↘'} {r.change24h.toFixed(1)}%</span>{/if}
					</span>
					<span class="shrink-0 font-semibold text-gray-900 dark:text-neutral-100">
						{fmt(r.harga ?? 0)} <span class="text-[10px] font-normal text-gray-400">/{r.satuan}</span>
					</span>
				</li>
			{/each}
			<li class="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-sm dark:bg-amber-950/40">
				<span class="text-amber-800 dark:text-amber-300">🔥 Tren Sembako 7d</span>
				<span class="text-[11px] font-medium text-amber-700 dark:text-amber-400">skor 0–100 • Google Trends →</span>
			</li>
		</ul>
		<p class="mt-2.5 text-[10px] leading-relaxed text-gray-400 dark:text-neutral-500">Diperbarui {timeAgo(harga?.fetchedAt ?? new Date().toISOString())} • Logam est dunia (bukan Antam) • Skor tren = minat, bukan Rp</p>
	</div>
{/if}
