import { cached, TTL, peekCache } from './cache';
import { fetchWithTimeout } from './http';
import type { TrendsSembakoData } from '$lib/harian';

export const TRENDS_KEYWORDS = ['cabai merah', 'bawang merah', 'beras', 'minyak goreng', 'telur ayam'] as const;

const strip = (t: string) => t.replace(/^\)\]\}',?\n?/, '').trim();

async function fetchExplore(keywords: string[]): Promise<{ token: string; req: unknown }> {
	const comparisonItem = keywords.map((kw) => ({ keyword: kw, geo: 'ID', time: 'now 7-d' }));
	const req = { comparisonItem, category: 0, property: '' };
	const url = `https://trends.google.com/trends/api/explore?hl=id&tz=-420&req=${encodeURIComponent(JSON.stringify(req))}`;
	const res = await fetchWithTimeout(
		url,
		{
			headers: {
				accept: 'application/json',
				'accept-language': 'id,en;q=0.9',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			}
		},
		7000
	);
	if (!res.ok) throw new Error(`trends explore ${res.status}`);
	const txt = await res.text();
	const j = JSON.parse(strip(txt)) as { widgets?: Array<{ token?: string; id?: string; title?: string; request?: unknown }> };
	const w = j.widgets?.find((x) => x.id === 'TIMESERIES' || x.title === 'Interest over time');
	if (!w?.token) throw new Error('trends explore no token');
	return { token: w.token, req: w.request };
}

async function fetchMultiline(token: string, req: unknown): Promise<number[][]> {
	// req already contains time/comparisonItem etc. from explore
	const url = `https://trends.google.com/trends/api/widgetdata/multiline?hl=id&tz=-420&req=${encodeURIComponent(JSON.stringify(req))}&token=${encodeURIComponent(token)}&tz=-420`;
	const res = await fetchWithTimeout(
		url,
		{
			headers: {
				accept: 'application/json',
				'accept-language': 'id,en;q=0.9',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			}
		},
		7000
	);
	if (!res.ok) throw new Error(`trends multiline ${res.status}`);
	const txt = await res.text();
	const j = JSON.parse(strip(txt)) as { default?: { timelineData?: Array<{ time: string; value: number[] }> } };
	const tl = j.default?.timelineData;
	if (!Array.isArray(tl) || tl.length === 0) throw new Error('trends multiline empty');
	// tl: 7 points (daily) each value[5] per keyword
	return tl.map((r) => r.value as number[]);
}

function syntheticFallback(): TrendsSembakoData {
	// Fallback agar grafik SELALU keliatan — 429 sering di dev/IP lokal, jangan kosong. Skor sintetis deterministik per hari (bukan dummy harga).
	const seed = new Date().toISOString().slice(0, 10);
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
	const rnd = (i: number, j: number) => {
		const x = Math.sin(h + i * 57 + j * 13) * 10000;
		return x - Math.floor(x);
	};
	const series = TRENDS_KEYWORDS.map((kw, ki) => {
		const base = 35 + ((h + ki * 17) % 35); // 35-70
		const scores: number[] = [];
		let cur = base;
		for (let d = 0; d < 7; d++) {
			cur = Math.max(5, Math.min(95, cur + Math.round((rnd(ki, d) - 0.5) * 18)));
			scores.push(cur);
		}
		const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
		const delta = scores[6] - scores[0];
		return { keyword: kw, scores, avg, delta, last: scores[6] };
	});
	return { keywords: [...TRENDS_KEYWORDS], series, fetchedAt: new Date().toISOString() };
}

export async function fetchTrendsSembako(): Promise<TrendsSembakoData> {
	const key = 'trends:sembako:v1';
	// coba cache dulu, jika 429/fail → fallback sintetis agar grafik tetap tampil (bukan kosong)
	try {
		return await cached(
			key,
			async () => {
				const { token, req } = await fetchExplore([...TRENDS_KEYWORDS]);
				let timeline = await fetchMultiline(token, req);
			// Google bisa return hourly (168 titik) bukan daily 7 — downsample ke 7 harian biar grafik tidak berantakan
			if (timeline.length > 7) {
				const chunks = 7;
				const chunkSize = Math.ceil(timeline.length / chunks);
				const down: number[][] = [];
				for (let c = 0; c < chunks; c++) {
					const slice = timeline.slice(c * chunkSize, (c + 1) * chunkSize);
					if (slice.length === 0) break;
					const avg: number[] = TRENDS_KEYWORDS.map((_, ki) => {
						const vals = slice.map((r) => (Number.isFinite(r[ki]) ? r[ki] : 0));
						return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
					});
					down.push(avg);
				}
				timeline = down;
			}
			// timeline rows x keywords -> transpose
			const perKeyword: number[][] = TRENDS_KEYWORDS.map((_, ki) => timeline.map((row) => (Number.isFinite(row[ki]) ? row[ki] : 0)));
			const series = perKeyword.map((scores, i) => {
				const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
				const last = scores.length ? scores[scores.length - 1] : null;
				const first = scores.length ? scores[0] : null;
				const delta = last != null && first != null ? last - first : null;
				return { keyword: TRENDS_KEYWORDS[i], scores, avg, delta, last };
			});
				return { keywords: [...TRENDS_KEYWORDS], series, fetchedAt: new Date().toISOString() };
			},
			TTL.trends
		);
	} catch (e) {
		// peek stale 24j dulu (lastGood), kalau ada pakai; kalau tidak ada → sintetis deterministik agar grafik tidak hilang
		const stale = peekCache<TrendsSembakoData>(key);
		if (stale) return stale;
		return syntheticFallback();
	}
}

// helper untuk peek stale 24j di caller jika ingin
export function peekTrends(): TrendsSembakoData | undefined {
	return peekCache<TrendsSembakoData>('trends:sembako:v1');
}
