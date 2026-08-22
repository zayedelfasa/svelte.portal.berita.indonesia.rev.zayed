<script lang="ts">
	let today = $state('');

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
	<h1 class="text-lg font-bold tracking-tight text-gray-900">
		Portal Berita<span class="text-red-500">.</span>
	</h1>
	<p class="mt-0.5 text-[11px] text-gray-400">{today || 'Berita terkini Indonesia'}</p>
</header>
