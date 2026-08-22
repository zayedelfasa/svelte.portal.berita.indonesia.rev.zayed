<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { isNew, timeAgo } from '$lib/time';
	import type { Article } from '$lib/types';

	let { article, index }: { article: Article; index: number } = $props();

	const label = $derived(timeAgo(article.publishedAt, clock.now));
	const fresh = $derived(isNew(article.publishedAt, clock.now));
</script>

<a
	href="/baca?source={article.source}&id={index}&u={encodeURIComponent(article.url)}"
	class="block px-4 py-2.5 transition-colors hover:bg-gray-50 active:bg-gray-50 dark:hover:bg-neutral-800"
>
	<h3 class="line-clamp-2 text-sm leading-snug font-medium text-gray-900 dark:text-neutral-100">{article.title}</h3>
	<p class="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-neutral-500">
		{#if fresh}
			<span class="inline-flex items-center gap-1 font-semibold text-red-500">
				<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>BARU
			</span>
			<span>·</span>
		{/if}
		<span>{label}</span>
	</p>
</a>
