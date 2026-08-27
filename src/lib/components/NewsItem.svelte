<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { isNew, timeAgo } from '$lib/time';
	import type { Article } from '$lib/types';
	import { bookmarks, isBookmarked, toggleBookmark } from '$lib/utils/bookmarks.svelte';
	import { thumbState } from '$lib/utils/settings.svelte';
	import { tagArticle } from '$lib/marketTag';

	let { article, index, marketPool = [] as { symbol: string }[] }: { article: Article; index: number; marketPool?: { symbol: string }[] } = $props();

	const tags = $derived(tagArticle(article, marketPool));

	const label = $derived(timeAgo(article.publishedAt, clock.now));
	const fresh = $derived(isNew(article.publishedAt, clock.now));
	const saved = $derived(isBookmarked(article.url));

	let thumbBroken = $state(false);

	function onBookmark(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		toggleBookmark(article);
	}
</script>

<div class="flex gap-2 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-50 dark:hover:bg-neutral-800">
	<a
		href="/baca?source={article.source}&id={index}&u={encodeURIComponent(article.url)}"
		class="min-w-0 flex-1"
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

	{#if tags.length > 0}
		<div class="mt-1 flex flex-wrap gap-1">
			{#each tags as t (t.symbol)}
				<a href="/market/{t.slug}" class="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">{t.symbol}</a>
			{/each}
		</div>
	{/if}

	{#if thumbState.enabled && article.image && !thumbBroken}
		<a
			href="/baca?source={article.source}&id={index}&u={encodeURIComponent(article.url)}"
			class="shrink-0"
		>
			<img
				src={article.image}
				alt=""
				loading="lazy"
				class="h-14 w-14 rounded-lg object-cover"
				onerror={() => (thumbBroken = true)}
			/>
		</a>
	{/if}

	<button
		onclick={onBookmark}
		aria-label={saved ? 'Hapus bookmark' : 'Simpan'}
		class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors {saved
			? 'text-red-500 bg-red-50 dark:bg-red-950/40'
			: 'text-gray-300 hover:bg-gray-100 dark:text-neutral-600 dark:hover:bg-neutral-800'}"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" class="h-4 w-4">
			<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16l-6-3-6 3z" />
		</svg>
	</button>
</div>
