<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MarketTicker from '$lib/components/MarketTicker.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { clock } from '$lib/utils/clock.svelte';

	let { children, data } = $props();

	$effect(() => {
		const t = setInterval(() => {
			clock.now = Date.now();
		}, 30_000);
		return () => clearInterval(t);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Portal Berita — Terkini Indonesia</title>
	<meta name="description" content="Ringkasan berita terkini dari 11 media lokal Indonesia." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="flex min-h-screen justify-center bg-[#f3f4f6] dark:bg-neutral-950">
	<div class="flex min-h-screen w-full max-w-[420px] flex-col bg-white shadow-sm dark:bg-neutral-900">
		<Header />
		<MarketTicker data={data?.market ?? null} />
		<main class="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))]">{@render children()}</main>
		<Footer />
		<BottomNav />
	</div>
</div>
