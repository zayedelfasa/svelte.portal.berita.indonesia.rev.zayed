import { cached, peekCache, TTL } from './cache';
import { fetchWithTimeout } from './http';
import { env } from '$env/dynamic/private';

export interface MarketItem {
	symbol: string;
	name: string;
	price: number;
	change24h: number | null;
	currency: string;
	type: 'idx' | 'forex' | 'crypto';
	isEstimated?: boolean;
	// A3: sparkline 7d close prices (Yahoo range=7d), kosong kalau tak tersedia
	sparkline?: number[];
}

export interface MarketData {
	items: MarketItem[];
	fetchedAt: string;
}

// CoinGecko ids mapped to display
const CRYPTO_MAP: Record<string, { symbol: string; name: string }> = {
	bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
	ethereum: { symbol: 'ETH', name: 'Ethereum' },
	solana: { symbol: 'SOL', name: 'Solana' },
	binancecoin: { symbol: 'BNB', name: 'BNB' },
	tether: { symbol: 'USDT', name: 'Tether' }
};

const CRYPTO_IDS = Object.keys(CRYPTO_MAP).join(',');

// TwelveData symbols (IHSG = JKSE composite on IDX)
const TWELVE_SYMBOLS = [
	{ td: 'JKSE', symbol: 'IHSG', name: 'IHSG', currency: 'IDR', type: 'idx' as const },
	{ td: 'USD/IDR', symbol: 'USD/IDR', name: 'USD/IDR', currency: 'IDR', type: 'forex' as const }
];
// LQ45 derived from IHSG if not available via TwelveData (no reliable LQ45.JK quote)

async function fetchCrypto(): Promise<MarketItem[]> {
	return cached('market:crypto', async () => {
		try {
			const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS}&order=market_cap_desc&per_page=5&page=1&sparkline=true&price_change_percentage=24h`;
			const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 7000);
			if (!res.ok) throw new Error(`coingecko ${res.status}`);
		const data = (await res.json()) as Array<{
			id: string;
			current_price: number;
			price_change_percentage_24h: number | null;
			sparkline_in_7d?: { price?: number[] };
		}>;
			return data.map((d) => {
				const m = CRYPTO_MAP[d.id] ?? { symbol: d.id.toUpperCase(), name: d.id };
				// A3: sparkline 7d dari CoinGecko
				const sparkline = (d.sparkline_in_7d?.price ?? [])
					.filter((p) => typeof p === 'number' && !Number.isNaN(p))
					.slice(-7);
				return {
					symbol: m.symbol,
					name: m.name,
					price: d.current_price,
					change24h: d.price_change_percentage_24h,
					currency: 'USD',
					type: 'crypto' as const,
					sparkline
				};
			});
		} catch {
			return [];
		}
	}, TTL.crypto);
}

async function fetchForexFallback(): Promise<MarketItem | null> {
	try {
		const res = await fetchWithTimeout('https://api.exchangerate.host/convert?from=USD&to=IDR', {}, 7000);
		if (!res.ok) throw new Error(`exchangerate ${res.status}`);
		const j = (await res.json()) as { result?: number; info?: { rate?: number } };
		const rate = j.result ?? j.info?.rate;
		if (rate == null) return null;
		return { symbol: 'USD/IDR', name: 'USD/IDR', price: rate, change24h: null, currency: 'IDR', type: 'forex' };
	} catch {
		return null;
	}
}

async function fetchTwelveItem(tdSymbol: string, meta: (typeof TWELVE_SYMBOLS)[number]): Promise<MarketItem | null> {
	const key = (env.TWELVEDATA_KEY as string | undefined)?.trim();
	if (!key) {
		if (meta.symbol === 'USD/IDR') return fetchForexFallback();
		return null;
	}
	try {
		const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(tdSymbol)}&interval=1day&apikey=${encodeURIComponent(key)}`;
		const res = await fetchWithTimeout(url, {}, 7000);
		if (!res.ok) throw new Error(`twelvedata ${res.status}`);
		const j = (await res.json()) as { price?: string; close?: string; percent_change?: string; previous_close?: string; currency?: string; status?: string; message?: string };
		if (j.status === 'error') throw new Error(j.message ?? 'twelvedata error');
		const price = j.price != null ? Number(j.price) : j.close != null ? Number(j.close) : NaN;
		if (!Number.isFinite(price)) return null;
		const change = j.percent_change != null ? Number(j.percent_change) : null;
		// sparkline 7d via time_series
		let sparkline: number[] = [];
		try {
			const tsUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tdSymbol)}&interval=1day&outputsize=7&apikey=${encodeURIComponent(key)}`;
			const tsRes = await fetchWithTimeout(tsUrl, {}, 7000);
			if (tsRes.ok) {
				const tj = (await tsRes.json()) as { values?: Array<{ close?: string }> };
				if (Array.isArray(tj.values)) sparkline = tj.values.map((v) => Number(v.close)).filter((n) => Number.isFinite(n)).reverse().slice(-7);
			}
		} catch {}
		return { symbol: meta.symbol, name: meta.name, price, change24h: Number.isFinite(change as number) ? (change as number) : null, currency: meta.currency, type: meta.type, sparkline };
	} catch {
		if (meta.symbol === 'USD/IDR') {
			const fb = await fetchForexFallback();
			if (fb) return fb;
		}
		return null;
	}
}

async function fetchIdxForex(): Promise<MarketItem[]> {
	return cached('market:idx', async () => {
		const results = await Promise.allSettled(TWELVE_SYMBOLS.map((m) => fetchTwelveItem(m.td, m)));
		const items: MarketItem[] = [];
		for (const r of results) if (r.status === 'fulfilled' && r.value) items.push(r.value);
		if (items.length === 0) return [];
		const hasLQ45 = items.some((i) => i.symbol.startsWith('LQ45'));
		if (!hasLQ45) {
			const ihsg = items.find((i) => i.symbol === 'IHSG');
			if (ihsg) {
				items.splice(1, 0, { symbol: 'LQ45', name: 'LQ45 (estimasi)', price: Math.round(ihsg.price * 0.135), change24h: ihsg.change24h != null ? ihsg.change24h * 0.9 : null, currency: 'IDR', type: 'idx', isEstimated: true });
			}
		}
		return items;
	}, TTL.idx);
}

/** CoinGecko trending — cached 1 jam. Gagal → []. */
export async function fetchTrending(): Promise<{ symbol: string; name: string }[]> {
	return cached('market:trending', async () => {
		try {
			const res = await fetchWithTimeout('https://api.coingecko.com/api/v3/search/trending', { headers: { accept: 'application/json' } }, 7000);
			if (!res.ok) throw new Error(`coingecko trending ${res.status}`);
			const j = (await res.json()) as { coins?: Array<{ item?: { symbol?: string; name?: string } }> };
			return (j.coins ?? [])
				.slice(0, 6)
				.map((c) => ({ symbol: (c.item?.symbol ?? '').toUpperCase(), name: c.item?.name ?? '' }))
				.filter((c) => c.symbol);
		} catch {
			return [];
		}
	}, TTL.trending);
}

export async function fetchMarketData(): Promise<MarketData> {
	// TTL split: crypto 2m, idx 15m sudah di-cache per-fetch, ticker gabungan cache pendek 2m
	return cached('market:ticker', async () => {
		const fetchedAt = new Date().toISOString();
		const [crypto, idxForex] = await Promise.all([fetchCrypto(), fetchIdxForex()]);
		let items = [...idxForex, ...crypto];
		// JANGAN GUNAKAN DUMMY: jika semua sumber 403 dan items kosong → coba stale 24j, kalau tidak ada → return kosong jujur
		if (items.length === 0) {
			const stale = peekCache<MarketData>('market:ticker');
			if (stale && stale.items.length > 0) {
				const ageMs = Date.now() - new Date(stale.fetchedAt).getTime();
				if (ageMs < 24 * 60 * 60 * 1000) return stale; // stale max 24j, lewat itu kosong jujur
			}
		}
		return { items, fetchedAt };
	}, TTL.crypto);
}
