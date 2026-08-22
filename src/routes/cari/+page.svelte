<script lang="ts">
	import NewsItem from '$lib/components/NewsItem.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.q ? `"${data.q}" — Pencarian` : 'Pencarian — Portal Berita'}</title>
</svelte:head>

<div class="px-4 py-4">
	<form method="GET" action="/cari" class="flex gap-2">
		<!-- svelte-ignore a11y_autofocus -->
		<input
			name="q"
			value={data.q}
			placeholder="Cari judul berita..."
			autofocus
			class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
		/>
		<button
			type="submit"
			class="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
		>
			Cari
		</button>
	</form>

	{#if !data.q}
		<p class="mt-6 text-center text-xs leading-relaxed text-gray-400">
			Ketik kata kunci di atas untuk mencari judul berita<br />lintas 11 media lokal.
		</p>
	{:else if data.results.length === 0}
		<p class="mt-6 text-center text-sm text-gray-500">
			Tidak ditemukan untuk "<span class="font-semibold">{data.q}</span>"
		</p>
		<p class="mt-1 text-center text-[11px] text-gray-400">Coba kata kunci lain</p>
	{:else}
		<p class="mt-3 text-[11px] text-gray-400">
			{data.results.length} hasil untuk "<span class="font-medium text-gray-600">{data.q}</span>"
		</p>
		<div class="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
			{#each data.results as article, i (article.url)}
				<NewsItem {article} index={i} />
			{/each}
		</div>
	{/if}
</div>
