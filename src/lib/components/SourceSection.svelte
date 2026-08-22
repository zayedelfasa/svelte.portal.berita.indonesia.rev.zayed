<script lang="ts">
	import type { SourceResult } from '$lib/types';
	import NewsItem from './NewsItem.svelte';

	let { result }: { result: SourceResult } = $props();
</script>

<section>
	<div class="flex items-center justify-between px-4 pb-1">
		<h2 class="text-xs font-bold tracking-wider text-gray-900 uppercase">{result.name}</h2>
		<span class="text-[10px] text-gray-300">3 teratas</span>
	</div>

	{#if result.ok && result.articles.length > 0}
		<div class="divide-y divide-gray-100">
			{#each result.articles as article, i (article.url)}
				<NewsItem {article} index={i} />
			{/each}
		</div>
	{:else}
		<p class="px-4 py-2 text-xs text-gray-400">Gagal memuat berita dari sumber ini.</p>
	{/if}
</section>
