<script lang="ts">
	import { page } from '$app/state';

	let today = $state('');

	const isHome = $derived(page.url.pathname === '/');

	function goBack() {
		if (history.length > 1) history.back();
		else location.href = '/';
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
	<div class="flex items-center gap-2.5">
		{#if !isHome}
			<button
				onclick={goBack}
				aria-label="Kembali"
				class="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4"
				>
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>
		{/if}
		<h1 class="text-lg font-bold tracking-tight text-gray-900">
			Portal Berita<span class="text-red-500">.</span>
		</h1>
	</div>
	<p class="mt-0.5 text-[11px] text-gray-400">{today || 'Berita terkini Indonesia'}</p>
</header>
