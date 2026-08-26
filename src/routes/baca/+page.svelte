<script lang="ts">
	import ArticleView from '$lib/components/ArticleView.svelte';
	import NewsItem from '$lib/components/NewsItem.svelte';
	import { absoluteUrl } from '$lib/utils/url';
	let { data } = $props();

	const marketPool = $derived((data.market?.items ?? []).map((i) => ({ symbol: i.symbol })));
	const ogImage = $derived(absoluteUrl(data.article.image));
</script>

<svelte:head>
	<title>{data.article.title} — {data.sourceName}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.article.title} />
	<meta property="og:description" content={data.article.summary} />
	{#if ogImage}<meta property="og:image" content={ogImage} />{/if}
	<meta property="og:url" content={data.article.url} />
	<meta name="twitter:card" content="summary_large_image" />
	{#if ogImage}<meta name="twitter:image" content={ogImage} />{/if}
</svelte:head>

<ArticleView article={data.article} sourceName={data.sourceName} {marketPool} />

{#if data.more.length > 0}
	<section class="border-t border-gray-100 dark:border-neutral-800">
		<h2 class="px-4 pt-4 pb-1 text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-neutral-100">
			Berita lain dari {data.sourceName}
		</h2>
		<div class="divide-y divide-gray-100 pb-4 dark:divide-neutral-800">
			{#each data.more as article, i (article.url)}
				<NewsItem {article} index={i + 1} {marketPool} />
			{/each}
		</div>
	</section>
{/if}

<div class="px-4 pb-6">
	<a href="/" class="text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">← Kembali ke portal</a>
</div>
