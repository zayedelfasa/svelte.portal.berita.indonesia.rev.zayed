<script lang="ts">
	import type { SourceResult } from '$lib/types';
	import NewsItem from './NewsItem.svelte';

	let { result }: { result: SourceResult } = $props();
</script>

<section>
	<div class="flex items-center justify-between px-4 pb-1">
		<h2 class="text-xs font-bold tracking-wider text-gray-900 uppercase">{result.name}</h2>
		<a
			href="/media/{result.sourceId}"
			class="text-[11px] font-medium text-red-500 transition-colors hover:text-red-600"
		>
			Lihat Lainnya ›
		</a>
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
