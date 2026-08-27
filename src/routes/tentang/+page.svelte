<svelte:head>
	<title>Tentang Aplikasi — Portal Berita Indonesia</title>
	<meta name="description" content="Tentang Portal Berita Indonesia — agregator 11 media lokal, fitur Cuaca & Polusi." />
</svelte:head>

<div class="px-4 py-6">
	<h2 class="text-lg font-bold tracking-tight text-gray-900 dark:text-neutral-100">Tentang Aplikasi</h2>
	<p class="mt-1 text-xs leading-relaxed text-gray-500 dark:text-neutral-400">
		Portal Berita Indonesia — agregator berita lokal + pantauan cuaca & polusi harian.
	</p>

	<div class="mt-6 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Apa ini?</h3>
		<p class="mt-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			Aplikasi ini mengumpulkan 3 berita teratas dari 11 media nasional (Detik, CNN Indonesia, Antara News, CNBC Indonesia, Tempo, Republika, Okezone, Kumparan, JPNN, Media Indonesia, iNews) dan menampilkan cuaca & polusi harian (suhu, AQI, forecast 7 hari) via Open-Meteo secara realtime (cache 10 menit).
		</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Fitur Utama</h3>
		<ul class="mt-2 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">📰 Berita</span> — Agregasi 11 sumber, filter kategori (Nasional, Ekonomi, Tekno, Olahraga, Hiburan, Gaya Hidup) & filter sumber, pencarian, bookmark.</li>
			<li><span class="font-bold text-gray-900 dark:text-neutral-200">🌤️ Cuaca</span> — Suhu saat ini, polusi AQI/PM2.5, forecast 7 hari & 24 jam, search kota & geolocation via Open-Meteo (gratis tanpa key, cache 10 menit).</li>
		</ul>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Sumber Data</h3>
		<ul class="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-gray-600 dark:text-neutral-400">
			<li>Berita: RSS resmi + aggregator <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">berita-indo-api</code></li>
			<li>Saham/Forex: TwelveData (<code>query1.finance.yahoo.com</code>) — ^JKSE, LQ45, IDR=X</li>
			<li>Crypto: CoinGecko API v3 (<code>/coins/markets</code>) — tanpa API key (hidden, no dummy)</li>
			<li>Cuaca & Polusi: Open-Meteo Weather + Air Quality + Geocoding — tanpa API key, unlimited</li>
		</ul>
		<p class="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">Bukan rekomendasi investasi. Data hanya untuk informasi.</p>
	</div>

	<div class="mt-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
		<h3 class="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-neutral-300">Versi</h3>
		<p class="mt-2 text-xs text-gray-600 dark:text-neutral-400">v0.1.0 — branch <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-neutral-800">dev</code> • Cuaca (Open-Meteo) + BottomNav (Berita|Cuaca|Tentang)</p>
	</div>

	<p class="mt-6 text-center text-[11px] text-gray-400 dark:text-neutral-500">© {new Date().getFullYear()} Portal Berita Indonesia</p>
</div>
