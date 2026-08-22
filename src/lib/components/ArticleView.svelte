<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { Article } from '$lib/types';

	let { article, sourceName }: { article: Article; sourceName: string } = $props();

	let imgBroken = $state(false);
</script>

<article class="pb-10">
	{#if article.image && !imgBroken}
		<img
			src={article.image}
			alt={article.title}
			loading="lazy"
			class="aspect-video w-full object-cover"
			onerror={() => (imgBroken = true)}
		/>
	{/if}

	<div class="px-4 pt-4">
		<p class="text-[11px] font-semibold tracking-wider text-red-500 uppercase">{sourceName}</p>
		<h1 class="mt-1.5 text-xl leading-tight font-bold text-gray-900">{article.title}</h1>
		<p class="mt-2 text-[11px] text-gray-400">{timeAgo(article.publishedAt)}</p>

		{#if article.summary}
			<p class="mt-3 text-sm leading-relaxed text-gray-600">{article.summary}</p>
		{/if}

		<a
			href={article.url}
			target="_blank"
			rel="noopener noreferrer"
			class="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
		>
			Baca selengkapnya di {sourceName} ↗
		</a>
	</div>
</article>
