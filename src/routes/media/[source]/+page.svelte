<script lang="ts">
	import NewsItem from '$lib/components/NewsItem.svelte';
	import SkeletonSection from '$lib/components/SkeletonSection.svelte';
	import { navigating } from '$app/state';
	let { data } = $props();

	let visible = $state(10);

	// reset saat pindah antar media (komponen di-reuse SvelteKit)
	$effect(() => {
		void data.sourceId;
		visible = data.pageSize;
	});

	const shown = $derived(data.articles.slice(0, visible));
	const hasMore = $derived(visible < data.articles.length);
</script>

<svelte:head>
	<title>{data.name} — Portal Berita</title>
</svelte:head>

{#if navigating?.to}
	<div class="space-y-4 py-4">
		<SkeletonSection />
		<SkeletonSection />
	</div>
{:else}
<div class="py-4">
	<p class="px-4 text-[11px] text-gray-400 dark:text-neutral-500">
		{data.articles.length} artikel tersedia dari {data.name}
	</p>

	{#if data.articles.length > 0}
		<div class="mt-1 divide-y divide-gray-100 dark:divide-neutral-800">
			{#each shown as article, i (article.url)}
				<NewsItem {article} index={i} />
			{/each}
		</div>

		{#if hasMore}
			<div class="flex justify-center px-4 pt-5 pb-8">
				<button
					onclick={() => (visible += data.pageSize)}
					class="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
				>
					+ Muat lainnya
				</button>
			</div>
		{:else}
			<p class="pt-3 pb-8 text-center text-[11px] text-gray-300 dark:text-neutral-600">
				Semua artikel sudah ditampilkan
			</p>
		{/if}
	{:else}
		<p class="px-4 py-10 text-center text-xs text-gray-400 dark:text-neutral-500">
			Belum ada artikel dari sumber ini.
		</p>
	{/if}
</div>
{/if}
