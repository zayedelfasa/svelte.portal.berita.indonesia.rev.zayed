<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { Article } from '$lib/types';

	let { article, index }: { article: Article; index: number } = $props();
</script>

<a
	href="/baca?source={article.source}&id={index}&u={encodeURIComponent(article.url)}"
	class="block px-4 py-2.5 transition-colors hover:bg-gray-50 active:bg-gray-50"
>
	<h3 class="line-clamp-2 text-sm leading-snug font-medium text-gray-900">{article.title}</h3>
	<p class="mt-1 text-[11px] text-gray-400">{timeAgo(article.publishedAt)}</p>
</a>
