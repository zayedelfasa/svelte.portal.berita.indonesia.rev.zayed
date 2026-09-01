<script lang="ts">
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';
	import type { BriefingData } from '$lib/harian';
	import { browser } from '$app/environment';

	let { items }: { items: BriefingData['items'] } = $props();

	let top3 = $derived(items.slice(0, 3));
	let top3SourceIndexes = $derived(top3.map((a) => a.sourceIndex));
	let speaking = $state(false);

	function speakText() {
		if (!browser || !('speechSynthesis' in window)) return;
		if (speaking) {
			window.speechSynthesis.cancel();
			speaking = false;
			return;
		}
		const text = top3.map((a, i) => `${i + 1}. ${a.title}`).join('. ');
		const utt = new SpeechSynthesisUtterance(`Ringkasan pagi. ${text}`);
		utt.lang = 'id-ID';
		utt.onend = () => (speaking = false);
		utt.onerror = () => (speaking = false);
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utt);
		speaking = true;
	}

	$effect(() => () => {
		if (browser && 'speechSynthesis' in window) window.speechSynthesis.cancel();
	});
</script>

<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
	<div class="flex items-center justify-between gap-2">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">🌅 Ringkasan Pagi</h3>
		<button
			onclick={speakText}
			class="shrink-0 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
			aria-label={speaking ? 'Hentikan suara' : 'Dengarkan ringkasan'}
		>
			{speaking ? '⏹ Stop' : '🔊 Dengarkan'}
		</button>
	</div>

	<ul class="mt-3 space-y-3">
		{#each top3 as a, i (a.url)}
			<li>
				<a
					href="/baca?source={a.source}&id={top3SourceIndexes[i]}&u={encodeURIComponent(a.url)}"
					class="group block"
				>
					<span class="mr-1.5 inline-block rounded bg-slate-900 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-white dark:bg-neutral-700">{a.sourceName}</span>
					<span class="align-middle text-sm font-medium leading-snug text-gray-900 group-hover:text-red-500 dark:text-neutral-100 dark:group-hover:text-red-400">{a.title}</span>
					<span class="ml-1 text-[10px] text-gray-400 dark:text-neutral-500">{timeAgo(a.publishedAt, clock.now)}</span>
				</a>
			</li>
		{/each}
	</ul>

	<a
		href="/harian/briefing"
		class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline dark:text-red-400"
	>
		Semua ringkasan →
	</a>
</div>
