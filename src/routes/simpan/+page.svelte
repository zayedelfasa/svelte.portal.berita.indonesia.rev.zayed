<script lang="ts">
	import { bookmarks, removeBookmark } from '$lib/utils/bookmarks.svelte';
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import ArticleView from '$lib/components/ArticleView.svelte';
	import type { Article } from '$lib/types';

	let selected: Article | null = $state(null);
</script>

<svelte:head>
	<title>Tersimpan — Portal Berita</title>
</svelte:head>

{#if selected}
	<div class="border-b border-gray-100 dark:border-neutral-800">
		<div class="flex items-center justify-between px-4 py-2">
			<span class="text-[11px] font-medium text-gray-400 dark:text-neutral-500">Pratinjau tersimpan</span>
			<button onclick={() => (selected = null)} class="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300">Tutup ✕</button>
		</div>
		<ArticleView article={selected} sourceName={selected.source} />
	</div>
{/if}

<div class="px-4 py-4">
	<h2 class="text-sm font-bold text-gray-900 dark:text-neutral-100">Tersimpan</h2>
	<p class="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
		{bookmarks.length} artikel
	</p>
</div>

{#if bookmarks.length === 0}
	<p class="px-4 py-10 text-center text-xs leading-relaxed text-gray-400 dark:text-neutral-500">
		Belum ada yang disimpan.<br />Tap ikon bookmark di artikel untuk menyimpan.
	</p>
{:else}
	<div class="divide-y divide-gray-100 dark:divide-neutral-800">
		{#each bookmarks as article (article.url)}
			<div class="flex gap-3 px-4 py-3">
				{#if article.image}
					<img src={article.image} alt="" class="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" onerror={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
				{/if}
				<div class="min-w-0 flex-1">
					<a href={article.url} target="_blank" rel="noopener noreferrer" class="line-clamp-2 text-sm font-medium leading-snug text-gray-900 hover:underline dark:text-neutral-100">
						{article.title}
					</a>
					<p class="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">{timeAgo(article.publishedAt, clock.now)} · {article.source}</p>
					<div class="mt-2 flex gap-2">
						<button onclick={() => (selected = article)} class="text-[11px] font-medium text-red-500 hover:text-red-600">Lihat ›</button>
						<a href={article.url} target="_blank" rel="noopener noreferrer" class="text-[11px] text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">Sumber ↗</a>
						<button onclick={() => { removeBookmark(article.url); if (selected?.url === article.url) selected = null; }} class="text-[11px] text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">Hapus</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<div class="px-4 py-6">
	<a href="/" class="text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300">← Kembali ke portal</a>
</div>
