<script lang="ts">
	import ArticleView from '$lib/components/ArticleView.svelte';
	import NewsItem from '$lib/components/NewsItem.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.article.title} — {data.sourceName}</title>
</svelte:head>

<ArticleView article={data.article} sourceName={data.sourceName} />

{#if data.more.length > 0}
	<section class="border-t border-gray-100">
		<h2 class="px-4 pt-4 pb-1 text-xs font-bold tracking-wider text-gray-900 uppercase">
			Berita lain dari {data.sourceName}
		</h2>
		<div class="divide-y divide-gray-100 pb-4">
			{#each data.more as article, i (article.url)}
				<NewsItem {article} index={i + 1} />
			{/each}
		</div>
	</section>
{/if}

<div class="px-4 pb-6">
	<a href="/" class="text-xs font-medium text-gray-400 hover:text-gray-600">← Kembali ke portal</a>
</div>
