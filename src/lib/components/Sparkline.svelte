<script lang="ts">
	// A3: mini sparkline SVG 7d, tanpa library. Naik=hijau, turun=merah, datar=abu.
	let { points = [] as number[], up = true }: { points?: number[]; up?: boolean } = $props();

	const W = 48;
	const H = 16;

	const norm = $derived(() => {
		if (!points || points.length < 2) return [];
		const min = Math.min(...points);
		const max = Math.max(...points);
		const span = max - min || 1;
		return points.map((p, i) => {
			const x = (i / (points.length - 1)) * (W - 2) + 1;
			const y = H - 2 - ((p - min) / span) * (H - 4);
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		});
	});

	const color = $derived(points && points.length > 1 ? (up ? '#34d399' : '#f87171') : '#9ca3af');
</script>

{#if norm().length >= 2}
	<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" aria-hidden="true" class="shrink-0">
		<polyline points="{norm().join(' ')}" fill="none" stroke="{color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{/if}
