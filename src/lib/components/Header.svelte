<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { clock } from '$lib/utils/clock.svelte';
	import { timeAgo } from '$lib/time';

	let today = $state('');
	const isHome = $derived(page.url.pathname === '/');
	const fetchedAt = $derived<string | undefined>(page.data?.fetchedAt);
	let refreshing = $state(false);
	let theme: 'light' | 'dark' = $state('light');

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

	function toggleTheme() {
		const next = theme === 'dark' ? 'light' : 'dark';
		theme = next;
		try {
			localStorage.setItem('theme', next);
			document.documentElement.classList.toggle('dark', next === 'dark');
		} catch {}
	}

	let headerEl: HTMLElement | undefined = $state(undefined);

	function syncHeaderH() {
		if (!headerEl) return;
		document.documentElement.style.setProperty('--header-h', headerEl.offsetHeight + 'px');
	}

	$effect(() => {
		today = new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date());
		try {
			const s = localStorage.getItem('theme') as 'light' | 'dark' | null;
			if (s) theme = s;
			else theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
		} catch {}
	});

	$effect(() => {
		void isHome;
		void fetchedAt;
		requestAnimationFrame(syncHeaderH);
	});

	$effect(() => {
		if (typeof window === 'undefined' || !headerEl) return;
		const ro = new ResizeObserver(syncHeaderH);
		ro.observe(headerEl);
		window.addEventListener('resize', syncHeaderH);
		syncHeaderH();
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', syncHeaderH);
		};
	});
</script>

<header
	bind:this={headerEl}
	class="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95"
>
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-2.5">
			{#if !isHome}
				<button
					onclick={goBack}
					aria-label="Kembali"
					class="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
						<path d="M15 18l-6-6 6-6" />
					</svg>
				</button>
			{/if}
			<h1 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">
				Portal Berita<span class="text-red-500">.</span>
			</h1>
		</div>

		<div class="flex items-center gap-1">
			<button
				onclick={toggleTheme}
				aria-label="Ganti tema"
				class="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
			>
				{#if theme === 'dark'}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
				{/if}
			</button>
			<a
				href="/cari"
				aria-label="Cari"
				class="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
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
					class="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
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

	<p class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500">{today || 'Berita terkini Indonesia'}</p>
	{#if isHome && fetchedAt}
		<p class="text-[11px] text-gray-400 dark:text-neutral-500">Diperbarui {timeAgo(fetchedAt, clock.now)}</p>
	{/if}
</header>
