<script lang="ts">
	import SourceSection from '$lib/components/SourceSection.svelte';
	import SkeletonSection from '$lib/components/SkeletonSection.svelte';
	import { CATEGORIES } from '$lib/categories';
	import { navigating } from '$app/state';
	let { data } = $props();

	const inactive =
		'whitespace-nowrap rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800';
	const active =
		'whitespace-nowrap rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-900';

	let selectedSource: string | null = $state(null);
	const filtered = $derived(
		selectedSource ? data.results.filter((r) => r.sourceId === selectedSource) : data.results
	);

	$effect(() => {
		void data.kategori;
		void data.results;
		selectedSource = null;
	});
</script>

<!-- Chip kategori — sticky di bawah Header (top via --header-h) -->
<div class="sticky z-[9] border-b border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900" style="top: var(--header-h, 72px)">
	<div class="flex gap-1.5 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
		<a href="/" class={data.kategori == null ? active : inactive}>Semua</a>
		{#each CATEGORIES as c (c.id)}
			<a href="/?kategori={c.id}" class={data.kategori === c.id ? active : inactive}>
				{c.label}
			</a>
		{/each}
	</div>
</div>

<!-- Filter sumber — client-side, di bawah kategori -->
<div class="flex gap-1.5 overflow-x-auto border-b border-gray-50 bg-white px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-neutral-800 dark:bg-neutral-900">
	<button onclick={() => (selectedSource = null)} class={selectedSource == null ? active : inactive}>
		Semua Sumber
	</button>
	{#each data.results as r (r.sourceId)}
		<button onclick={() => (selectedSource = r.sourceId)} class={selectedSource === r.sourceId ? active : inactive}>
			{r.name}
		</button>
	{/each}
</div>

{#if data.unsupported > 0}
	<p class="px-4 pt-2 text-[11px] text-gray-400 dark:text-neutral-500">
		{data.unsupported} media tidak mendukung kategori ini
	</p>
{/if}

{#if navigating?.to}
	<div class="space-y-4 px-0 py-4">
		{#each Array(6) as _, i (i)}
			<SkeletonSection />
		{/each}
	</div>
{:else}
	<div class="space-y-6 px-0 py-4">
		{#each filtered as result (result.sourceId)}
			<SourceSection {result} />
		{/each}
		{#if filtered.length === 0}
			<p class="px-4 py-6 text-center text-xs text-gray-400 dark:text-neutral-500">Tidak ada sumber yang dipilih.</p>
		{/if}
	</div>
{/if}
