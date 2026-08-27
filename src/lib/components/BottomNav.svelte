<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let cuacaHref = $state('/cuaca');

	function syncCuacaHref() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem('cuaca:loc');
			if (raw) {
				const { lat, lon } = JSON.parse(raw) as { lat: number; lon: number };
				if (Number.isFinite(lat) && Number.isFinite(lon)) {
					cuacaHref = `/cuaca?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
					return;
				}
			}
		} catch {}
		cuacaHref = '/cuaca';
	}

	onMount(() => {
		syncCuacaHref();
		const onStorage = () => syncCuacaHref();
		window.addEventListener('storage', onStorage);
		// sync tiap navigasi (page berubah)
		const iv = setInterval(syncCuacaHref, 1000);
		return () => {
			window.removeEventListener('storage', onStorage);
			clearInterval(iv);
		};
	});

	$effect(() => {
		// re-sync saat pathname berubah (pindah tab)
		void page.url.pathname;
		if (browser) syncCuacaHref();
	});

	const navs = $derived([
		{
			href: '/',
			label: 'Berita',
			match: (p: string) => p === '/' || p.startsWith('/baca') || p.startsWith('/cari') || p.startsWith('/media') || p.startsWith('/simpan'),
			icon: 'berita'
		},
		{ href: cuacaHref, label: 'Cuaca', match: (p: string) => p.startsWith('/cuaca'), icon: 'cuaca' },
		{ href: '/tentang', label: 'Tentang', match: (p: string) => p.startsWith('/tentang'), icon: 'tentang' }
	]);

	const pathname = $derived(page.url.pathname);
	function isActive(href: string, match: (p: string) => boolean) {
		return match(pathname);
	}
</script>

<nav
	class="fixed bottom-0 left-1/2 z-20 flex w-full max-w-[420px] -translate-x-1/2 items-stretch border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/95"
	style="padding-bottom: env(safe-area-inset-bottom);"
	aria-label="Navigasi utama"
>
	{#each navs as n (n.href)}
		{@const active = isActive(n.href, n.match)}
		<a
			href={n.href}
			aria-current={active ? 'page' : undefined}
			class="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide transition-colors {active
				? 'text-red-500 dark:text-red-400'
				: 'text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300'}"
		>
			{#if n.icon === 'berita'}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={active ? 2.2 : 1.8} stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
					<path d="M4 22h14a2 2 0 0 0 2-2V6H6a2 2 0 0 0-2 2v14z" />
					<path d="M16 2v4" /><path d="M8 2v4" /><path d="M4 10h16" />
					<path d="M8 14h8" /><path d="M8 18h5" />
				</svg>
			{:else if n.icon === 'cuaca'}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={active ? 2.2 : 1.8} stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
					<circle cx="12" cy="12" r="4" /><path d="M12 2v1" /><path d="M12 21v1" /><path d="M4.2 4.2l.7.7" /><path d="M19.1 19.1l.7.7" /><path d="M2 12h1" /><path d="M21 12h1" /><path d="M4.2 19.8l.7-.7" /><path d="M19.1 4.9l.7-.7" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={active ? 2.2 : 1.8} stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
					<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
				</svg>
			{/if}
			<span class={active ? 'font-bold' : ''}>{n.label}</span>
		</a>
	{/each}
</nav>

<!-- spacer agar konten tidak ketutup fixed nav (sinkron dengan tinggi nav ~56px + safe area) -->
<div class="h-[56px] w-full shrink-0" style="height: calc(56px + env(safe-area-inset-bottom));" aria-hidden="true"></div>
