<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';

	let today = $state('');
	const isHome = $derived(page.url.pathname === '/');
	const fetchedAt = $derived<string | undefined>(page.data?.fetchedAt);
	let refreshing = $state(false);

	function goBack() {
		if (history.length > 1) history.back();
		else location.href = '/';
	}

	async function refresh() {
		if (refreshing) return;
		refreshing = true;
		try {
			await invalidateAll();
		} finally {
			setTimeout(() => (refreshing = false), 400);
		}
	}

	$effect(() => {
		today = new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date());
	});
</script>

<header class="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur">
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-2.5">
			{#if !isHome}
				<button
					onclick={goBack}
					aria-label="Kembali"
					class="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</button>
			{/if}
			<h1 class="text-lg font-bold tracking-tight text-gray-900">
				Portal Berita<span class="text-red-500">.</span>
			</h1>
		</div>

		<div class="flex items-center gap-1">
			<a
				href="/cari"
				aria-label="Cari"
				class="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
					<circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" />
				</svg>
			</a>
			{#if isHome}
				<button
					onclick={refresh}
					aria-label="Muat ulang"
					disabled={refreshing}
					class="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4 {refreshing ? 'animate-spin' : ''}"
					>
						<path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<p class="mt-0.5 text-[11px] text-gray-400">{today || 'Berita terkini Indonesia'}</p>
	{#if isHome && fetchedAt}
		<p class="text-[11px] text-gray-400">Diperbarui {timeAgo(fetchedAt, clock.now)}</p>
	{/if}
</header>
