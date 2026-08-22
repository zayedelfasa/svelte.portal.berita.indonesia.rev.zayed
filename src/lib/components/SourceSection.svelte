<script lang="ts">
	import type { SourceResult } from '$lib/types';
	import NewsItem from './NewsItem.svelte';

	let { result }: { result: SourceResult } = $props();

	// svelte-ignore state_referenced_locally
	let local: SourceResult = $state(result);
	let retrying = $state(false);

	$effect(() => {
		local = result;
	});

	async function retry() {
		if (retrying) return;
		retrying = true;
		try {
			const res = await fetch(`/api/source/${local.sourceId}?force=1`);
			const data = (await res.json()) as SourceResult;
			local = data;
		} catch {
			// tetap tampil error
		} finally {
			retrying = false;
		}
	}
</script>

<section>
	<div class="flex items-center justify-between px-4 pb-1">
		<h2 class="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-neutral-100">{local.name}</h2>
		<a
			href="/media/{local.sourceId}"
			class="text-[11px] font-medium text-red-500 transition-colors hover:text-red-600"
		>
			Lihat Lainnya ›
		</a>
	</div>

	{#if local.ok && local.articles.length > 0}
		<div class="divide-y divide-gray-100 dark:divide-neutral-800">
			{#each local.articles as article, i (article.url)}
				<NewsItem {article} index={i} />
			{/each}
		</div>
	{:else}
		<div class="flex items-center justify-between px-4 py-2">
			<p class="text-xs text-gray-400 dark:text-neutral-500">Gagal memuat berita dari sumber ini.</p>
			<button
				onclick={retry}
				disabled={retrying}
				class="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				{retrying ? 'Memuat...' : 'Coba lagi'}
			</button>
		</div>
	{/if}
</section>
