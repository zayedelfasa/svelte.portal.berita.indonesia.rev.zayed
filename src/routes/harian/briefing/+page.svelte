<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import { browser } from '$app/environment';
	import type { BriefingData } from '$lib/harian';

	let { data } = $props();

	let items = $derived((data.briefing as BriefingData | null)?.items ?? []);
	let speaking = $state(false);
	let speakingIndex = $state<number | null>(null);

	function speakFrom(index: number) {
		if (!browser || !('speechSynthesis' in window)) return;
		if (speaking) {
			window.speechSynthesis.cancel();
			speaking = false;
			speakingIndex = null;
			if (speakingIndex === index) return;
		}
		const text = items[index] ? `Berita ${index + 1}. ${items[index].title}` : '';
		if (!text) return;
		const utt = new SpeechSynthesisUtterance(text);
		utt.lang = 'id-ID';
		utt.onend = () => {
			speaking = false;
			speakingIndex = null;
		};
		utt.onerror = () => {
			speaking = false;
			speakingIndex = null;
		};
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utt);
		speaking = true;
		speakingIndex = index;
	}

	$effect(() => () => {
		if (browser && 'speechSynthesis' in window) window.speechSynthesis.cancel();
	});
</script>

<svelte:head>
	<title>Ringkasan Pagi — Portal Berita</title>
</svelte:head>

<div class="space-y-3 px-4 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<h1 class="text-lg font-bold text-gray-900 dark:text-neutral-100">🌅 Ringkasan Pagi</h1>
			<a href="/harian/briefing?force=1" class="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">↻ Muat ulang</a>
		</div>
		<a href="/harian" class="text-xs font-semibold text-red-500 hover:underline dark:text-red-400">← Harian</a>
	</div>

	{#if items.length === 0}
		<div class="rounded-xl border border-gray-100 bg-white px-4 py-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<p class="text-sm text-gray-500 dark:text-neutral-400">Ringkasan sementara tidak tersedia.</p>
			<p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">Sumber berita sedang sibuk. Silakan muat ulang.</p>
		</div>
	{:else}
		<ul class="space-y-2">
			{#each items as a, i (a.url + i)}
				<li class="rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
					<div class="flex items-start justify-between gap-2">
						<a href="/baca?source={a.source}&id={a.sourceIndex}&u={encodeURIComponent(a.url)}" class="group min-w-0 flex-1">
							<span class="mr-1.5 inline-block rounded bg-slate-900 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-white dark:bg-neutral-700">{a.sourceName}</span>
							<span class="align-middle text-sm font-medium leading-snug text-gray-900 group-hover:text-red-500 dark:text-neutral-100 dark:group-hover:text-red-400">{a.title}</span>
							<span class="ml-1 text-[10px] text-gray-400 dark:text-neutral-500">{timeAgo(a.publishedAt, clock.now)}</span>
						</a>
						<button
							onclick={() => speakFrom(i)}
							class="shrink-0 rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-400"
							aria-label="Dengarkan berita {i + 1}"
						>
							{speakingIndex === i ? '⏹' : '🔊'}
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
