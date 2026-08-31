<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { HargaData, HargaItem } from '$lib/harian';

	let { data } = $props();

	let harga = $derived(data.harga as HargaData | null);

	const GROUPS: Array<{ key: HargaItem['grup']; label: string; catatan: string }> = [
		{ key: 'emas', label: '🥇 Emas', catatan: 'Proksi PAXG (emas dunia) — bukan harga resmi Antam' },
		{ key: 'sembako', label: '🌾 Sembako', catatan: 'Sumber: pangan.go.id / panelharga' },
		{ key: 'bbm', label: '⛽ BBM', catatan: 'Harga resmi Pertamina' }
	];

	const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');
</script>

<svelte:head>
	<title>Harga Harian — Portal Berita</title>
</svelte:head>

<div class="space-y-3 px-4 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">💰 Harga Harian</h1>
			<a href="/harian/harga?force=1" class="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">↻ Muat ulang</a>
		</div>
		<a href="/harian" class="text-xs font-semibold text-red-500 hover:underline dark:text-red-400">← Harian</a>
	</div>

	{#if harga}
		{#each GROUPS as g (g.key)}
			{@const rows = harga.items.filter((i) => i.grup === g.key)}
			{#if rows.length > 0}
				<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
					<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">{g.label}</h2>
					<ul class="mt-3 space-y-2">
						{#each rows as r (r.id)}
							<li class="flex items-baseline justify-between gap-2 text-sm">
								<span class="text-gray-700 dark:text-neutral-300">
									{r.nama}
									{#if r.harga == null}<span class="ml-1 text-[10px] text-gray-400">(tidak tersedia)</span>{/if}
									{#if r.estimasi}<span class="ml-1 rounded bg-gray-100 px-1 py-0.5 align-middle text-[9px] font-semibold uppercase text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">est</span>{/if}
								</span>
								<span class="shrink-0 font-semibold text-gray-900 dark:text-neutral-100">
									{#if r.harga != null}{fmt(r.harga)} <span class="text-[10px] font-normal text-gray-400">/{r.satuan}</span>{/if}
								</span>
							</li>
						{/each}
					</ul>
					<p class="mt-2.5 text-[10px] text-gray-400 dark:text-neutral-500">{g.catatan}</p>
				</div>
			{/if}
		{/each}
		<p class="text-[10px] text-gray-400 dark:text-neutral-500">Diperbarui {timeAgo(harga.fetchedAt)}</p>
	{:else}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm text-gray-500 dark:text-neutral-400">Data harga sementara tidak tersedia.</p>
			<p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">Kami tidak menampilkan angka perkiraan. Silakan muat ulang.</p>
		</div>
	{/if}
</div>
