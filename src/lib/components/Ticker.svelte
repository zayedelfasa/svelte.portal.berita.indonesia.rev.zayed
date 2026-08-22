<script lang="ts">
	import type { Article } from '$lib/types';
	let { articles }: { articles: Article[] } = $props();
</script>

{#if articles.length > 0}
	<div class="overflow-hidden border-b border-gray-100 bg-gray-50 py-2 dark:border-neutral-800 dark:bg-neutral-800/50">
		<div class="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
			{#each [...articles, ...articles] as a, i (i)}
				<a
					href="/baca?source={a.source}&u={encodeURIComponent(a.url)}"
					class="mx-4 inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-neutral-100"
				>
					<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
					<span class="max-w-[260px] truncate">{a.title}</span>
				</a>
				<span class="mx-2 text-gray-300 dark:text-neutral-600">·</span>
			{/each}
		</div>
	</div>
{/if}

<style>
	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}
	.animate-marquee {
		display: flex;
		width: max-content;
		animation: marquee 60s linear infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.animate-marquee {
			animation: none;
		}
	}
</style>
