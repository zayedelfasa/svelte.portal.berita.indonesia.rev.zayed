<script lang="ts">
	import { timeAgo } from '$lib/time';
	import type { TrendsSembakoData } from '$lib/harian';

	let { trends = null as TrendsSembakoData | null } = $props();

	const keywords = ['cabai merah', 'bawang merah', 'beras', 'minyak goreng', 'telur ayam'];
	const exploreHref = `https://trends.google.com/trends/explore?date=now%207-d&geo=ID&q=${keywords.map(encodeURIComponent).join(',')}&hl=id`;

	const hasData = $derived(!!trends?.series?.length);

	const colorFor = (delta: number | null) => {
		if (delta == null) return '#9ca3af';
		if (delta > 2) return '#ef4444';
		if (delta < -2) return '#3b82f6';
		return '#10b981';
	};

	function chartPoints(scores: number[], W = 340, H = 48, pad = 12): string {
		if (!scores.length) return '';
		const min = Math.min(...scores);
		const max = Math.max(...scores);
		const span = max - min || 1;
		return scores
			.map((v, i) => {
				const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
				const y = pad + (1 - (v - min) / span) * (H - pad * 2);
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	function dotPos(scores: number[], idx: number, W = 340, H = 48, pad = 12) {
		const min = Math.min(...scores);
		const max = Math.max(...scores);
		const span = max - min || 1;
		const x = pad + (idx / (scores.length - 1)) * (W - pad * 2);
		const y = pad + (1 - (scores[idx] - min) / span) * (H - pad * 2);
		return { x, y };
	}

	function dateLabels(): string[] {
		const out: string[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			out.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);
		}
		return out;
	}
	const dates = dateLabels();
</script>

<div class="rounded-xl border border-gray-100 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
	<div class="flex items-center justify-between">
		<h2 class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400">🔥 Tren Sembako (7 hari, geo ID)</h2>
		<span class="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-700 dark:bg-amber-950 dark:text-amber-300">skor 0–100</span>
	</div>

	<div class="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/30">
		<p class="text-[11px] font-bold text-amber-800 dark:text-amber-300">Apa itu skor 0–100?</p>
		<p class="mt-1 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
			<b>100</b> = puncak minat 7 hari di Indonesia untuk keyword itu. <b>50</b> = setengah puncak. <b>0</b> = sepi. Skor <b>relatif per keyword</b> (100 cabai ≠ 100 beras). <b>Bukan harga Rp</b> — naik = banyak dicari, cek pasar lokal. Beda daerah beda harga.
		</p>
	</div>

	{#if hasData && trends}
		<p class="mt-2 text-[11px] text-gray-500 dark:text-neutral-400">7 titik harian • {timeAgo(trends.fetchedAt)} • geo ID • cached 6j</p>
		<ul class="mt-3 space-y-3">
			{#each trends.series as s (s.keyword)}
				{@const col = colorFor(s.delta)}
				{@const up = (s.delta ?? 0) > 2}
				{@const down = (s.delta ?? 0) < -2}
				<li class="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-800/40">
					<div class="flex items-center justify-between px-3 pt-3">
						<span class="text-sm font-semibold capitalize text-gray-800 dark:text-neutral-100">{s.keyword}</span>
						<span class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold {up ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300' : down ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'}">{up ? '↗ Naik' : down ? '↘ Turun' : '→ Flat'}</span>
					</div>
					<!-- chart -->
					<div class="px-2 pt-1">
						<svg viewBox="0 0 340 48" width="100%" height="48" class="block" preserveAspectRatio="none">
							<line x1="12" y1="12" x2="328" y2="12" stroke="#f3f4f6" stroke-width="0.7" />
							<line x1="12" y1="24" x2="328" y2="24" stroke="#f3f4f6" stroke-width="0.7" />
							<line x1="12" y1="36" x2="328" y2="36" stroke="#f3f4f6" stroke-width="0.7" />
							<polyline fill="none" stroke={col} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points={chartPoints(s.scores)} />
							{#each s.scores as v, i}
								{@const p = dotPos(s.scores, i)}
								<circle cx={p.x} cy={p.y} r="3" fill={col} stroke="white" stroke-width="1.2" />
								<!-- skor label with bg for readability, alternate offset to avoid overlap -->
								<!-- bg rect -->
								<rect x={p.x - 8} y={p.y - 14} width="16" height="9" rx="3" fill="white" opacity="0.9" />
								<text x={p.x} y={p.y - 7} text-anchor="middle" font-size="7.5" font-weight="700" fill={col}>{v}</text>
							{/each}
						</svg>
						<!-- tanggal terpisah HTML (lebih beraturan di mobile) -->
						<div class="grid grid-cols-7 gap-0 px-1 pb-2 text-center">
							{#each dates as d}
								<span class="text-[9px] font-medium text-gray-400 dark:text-neutral-500">{d}</span>
							{/each}
						</div>
					</div>
				</li>
			{/each}
		</ul>
		<p class="mt-2.5 text-[10px] leading-relaxed text-gray-400 dark:text-neutral-500">
			Sumber: Google Trends (geo ID, now 7-d).
			<a href={exploreHref} target="_blank" rel="noopener noreferrer" class="font-semibold underline decoration-dotted">Buka di Trends →</a>
		</p>
	{:else}
		<p class="mt-2 text-[11px] text-gray-500 dark:text-neutral-400">{keywords.join(' • ')}</p>
		<div class="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
			<p class="text-xs font-semibold text-amber-800 dark:text-amber-300">Tren belum tersedia — Google Trends sedang sibuk (429)</p>
			<p class="mt-1 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/80">
				Kami cache 6 jam. Coba <a href="/harian/harga?force=1" class="font-semibold underline">Muat ulang</a> atau lihat langsung di Google Trends.
			</p>
			<a href={exploreHref} target="_blank" rel="noopener noreferrer" class="mt-2.5 inline-flex rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">Buka Tren 5 Sembako di Google →</a>
		</div>
	{/if}
</div>
