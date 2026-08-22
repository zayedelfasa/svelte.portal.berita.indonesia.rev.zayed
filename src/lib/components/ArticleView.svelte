<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import type { Article } from '$lib/types';
	import Toast from './Toast.svelte';

	let { article, sourceName }: { article: Article; sourceName: string } = $props();

	let imgBroken = $state(false);
	let toastMsg = $state('');
	let toastShow = $state(false);
	const label = $derived(timeAgo(article.publishedAt, clock.now));

	function showToast(msg: string) {
		toastMsg = msg;
		toastShow = true;
		setTimeout(() => (toastShow = false), 2000);
	}

	async function share() {
		const shareData = { title: article.title, text: article.title, url: article.url };
		if (navigator.share) {
			try {
				await navigator.share(shareData);
				return;
			} catch {
				// fallback ke clipboard
			}
		}
		try {
			await navigator.clipboard.writeText(article.url);
			showToast('Link disalin ✓');
		} catch {
			showToast('Gagal menyalin link');
		}
	}
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
		<h1 class="mt-1.5 text-xl leading-tight font-bold text-gray-900 dark:text-neutral-100">{article.title}</h1>
		<p class="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">{label}</p>

		{#if article.summary}
			<p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-neutral-300">{article.summary}</p>
		{/if}

		<div class="mt-6 flex flex-wrap gap-2">
			<a
				href={article.url}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
			>
				Baca selengkapnya di {sourceName} ↗
			</a>
			<button
				onclick={share}
				class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
			>
				Bagikan
			</button>
		</div>
	</div>
</article>

<Toast message={toastMsg} show={toastShow} />
