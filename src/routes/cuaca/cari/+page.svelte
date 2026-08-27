<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let q = $state(data.q);
	$effect(() => {
		q = data.q;
	});
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function onInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		q = val;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = val.trim() ? `/cuaca/cari?q=${encodeURIComponent(val.trim())}` : '/cuaca/cari';
			goto(url, { replaceState: true, keepFocus: true });
		}, 300);
	}

	function pick(lat: number, lon: number, name: string) {
		if (browser) {
			try {
				localStorage.setItem('cuaca:loc', JSON.stringify({ lat, lon, name }));
			} catch {}
		}
		goto(`/cuaca?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&name=${encodeURIComponent(name)}`);
	}

	const popular = [
		{ name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
		{ name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
		{ name: 'Medan', lat: 3.5952, lon: 98.6722 },
		{ name: 'Bandung', lat: -6.9175, lon: 107.6191 },
		{ name: 'Yogyakarta', lat: -7.7956, lon: 110.3695 }
	];
</script>

<svelte:head>
	<title>Cari Kota — Cuaca</title>
</svelte:head>

<div class="px-4 py-4">
	<div class="flex items-center gap-2">
		<a href="/cuaca" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">← Kembali</a>
		<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">Cari Kota</h2>
	</div>

	<div class="relative mt-4">
		<input
			type="search"
			value={q}
			oninput={onInput}
			placeholder="Cari kota, mis. Bandung"
			aria-label="Cari kota"
			class="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-700 dark:focus:ring-neutral-800"
		/>
		<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">🔍</span>
	</div>

	{#if data.error}
		<div class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
			<p class="text-xs leading-relaxed text-amber-800 dark:text-amber-300">{data.error}</p>
		</div>
	{/if}

	{#if q && data.results.length === 0}
		<div class="mt-3 rounded-xl border border-gray-100 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-xs font-bold text-gray-700 dark:text-neutral-200">Tidak ada kota ditemukan</p>
			<p class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-neutral-400">Coba kata kunci lain atau pilih kota populer di bawah.</p>
		</div>
	{/if}

	{#if data.results.length > 0}
		<div class="mt-4">
			<p class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">Hasil {data.results.length} kota</p>
			<div class="mt-2 grid grid-cols-1 gap-2">
				{#each data.results as r (r.id + r.name + r.latitude)}
					<button
						onclick={() => pick(r.latitude, r.longitude, r.name)}
						class="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
					>
						<div class="min-w-0">
							<p class="truncate text-sm font-bold text-gray-900 dark:text-neutral-100">{r.name}</p>
							<p class="truncate text-xs text-gray-500 dark:text-neutral-400">{[r.admin1, r.country].filter(Boolean).join(', ')} · {r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}</p>
						</div>
						<span class="shrink-0 text-xs text-gray-400">→</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Kota Populer</h3>
		<div class="mt-2 flex flex-wrap gap-1.5">
			{#each popular as p (p.name)}
				<button
					onclick={() => pick(p.lat, p.lon, p.name)}
					class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
				>
					{p.name}
				</button>
			{/each}
		</div>
	</div>
</div>
