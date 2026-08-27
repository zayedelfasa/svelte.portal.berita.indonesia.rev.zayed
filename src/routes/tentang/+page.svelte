<svelte:head>
	<title>Tentang Aplikasi — Portal Berita Indonesia</title>
	<meta name="description" content="Tentang Portal Berita Indonesia — agregator 11 media lokal, fitur Market saham & crypto." />
</svelte:head>

<div class="px-4 py-6">
	<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">Tentang Aplikasi</h2>
	<p class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-neutral-400">
		Portal Berita Indonesia — agregator berita lokal + pantauan market saham & crypto.
	</p>

	<div class="mt-6 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Apa ini?</h3>
		<p class="mt-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			Aplikasi ini mengumpulkan 3 berita teratas dari 11 media nasional (Detik, CNN Indonesia, Antara News, CNBC Indonesia, Tempo, Republika, Okezone, Kumparan, JPNN, Media Indonesia, iNews) dan menampilkan ticker market IHSG / LQ45 / USD·IDR / Crypto top 5 secara realtime (cache 10 menit).
		</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">3 Fitur Utama</h3>
		<ul class="mt-2 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">📰 Berita</span> — Agregasi 11 sumber, filter kategori (Nasional, Ekonomi, Tekno, Olahraga, Hiburan, Gaya Hidup) & filter sumber, pencarian, bookmark.</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">📈 Market</span> — Ticker di header + halaman Market untuk IHSG, LQ45, USD/IDR (TwelveData) dan BTC/ETH/SOL/BNB/USDT (CoinGecko).</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">ℹ️ Tentang</span> — Halaman ini. Info sumber data & teknologi.</li>
		</ul>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Teknologi</h3>
		<p class="mt-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			SvelteKit 2 (Svelte 5 runes) + Tailwind CSS v4 + TypeScript. Fetch server-side (bebas CORS), cache memori TTL 10 menit + CDN <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">s-maxage=600</code>. Deploy di Vercel. PWA ready.
		</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Sumber Data</h3>
		<ul class="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			<li>Berita: RSS resmi + aggregator <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">berita-indo-api</code></li>
			<li>Saham/Forex: TwelveData (<code>query1.finance.yahoo.com</code>) — ^JKSE, LQ45, IDR=X</li>
			<li>Crypto: CoinGecko API v3 (<code>/coins/markets</code>) — tanpa API key</li>
		</ul>
		<p class="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">Bukan rekomendasi investasi. Data hanya untuk informasi.</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Versi</h3>
		<p class="mt-2 text-xs text-gray-600 dark:text-neutral-400">v0.1.0 — branch <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">dev</code> • Market ticker + BottomNav (3 tab) + Tentang</p>
	</div>

	<p class="mt-6 text-center text-[11px] text-gray-400 dark:text-neutral-500">© {new Date().getFullYear()} Portal Berita Indonesia</p>
</div>
