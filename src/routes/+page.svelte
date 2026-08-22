<script lang="ts">
	import SourceSection from '$lib/components/SourceSection.svelte';
	import { CATEGORIES } from '$lib/categories';
	let { data } = $props();

	const inactive =
		'whitespace-nowrap rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50';
	const active =
		'whitespace-nowrap rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white';
</script>

<!-- Chip kategori — sticky di bawah Header -->
<div class="sticky top-[60px] z-[9] border-b border-gray-100 bg-white">
	<div class="flex gap-1.5 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
		<a href="/" class={data.kategori == null ? active : inactive}>Semua</a>
		{#each CATEGORIES as c (c.id)}
			<a
				href="/?kategori={c.id}"
				class={data.kategori === c.id ? active : inactive}
			>
				{c.label}
			</a>
		{/each}
	</div>
</div>

{#if data.unsupported > 0}
	<p class="px-4 pt-2 text-[11px] text-gray-400">
		{data.unsupported} media tidak mendukung kategori ini
	</p>
{/if}

<div class="space-y-6 px-0 py-4">
	{#each data.results as result (result.sourceId)}
		<SourceSection {result} />
	{/each}
</div>
