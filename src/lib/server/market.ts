import { cached, peekCache, TTL } from './cache';
import { fetchWithTimeout } from './http';

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

// Yahoo symbols
const YAHOO_SYMBOLS = [
	{ yahoo: '^JKSE', symbol: 'IHSG', name: 'IHSG', currency: 'IDR', type: 'idx' as const },
	{ yahoo: '^KLCI', symbol: 'LQ45*', name: 'LQ45', currency: 'IDR', type: 'idx' as const }, // placeholder, will try JKSE-based fallback
	{ yahoo: 'IDR=X', symbol: 'USD/IDR', name: 'USD/IDR', currency: 'IDR', type: 'forex' as const }
];
// Note: LQ45 Yahoo symbol is not reliable; we fetch ^JKSE twice and derive fallback if needed.

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
		// Poin 1: exchangerate.host 0-key fallback untuk USD/IDR kalau Yahoo 403 di Vercel
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

async function fetchYahooItem(yahooSymbol: string, meta: (typeof YAHOO_SYMBOLS)[number]): Promise<MarketItem | null> {
	try {
		// Layer 1: query1, Layer 2: query2 fallback (Yahoo 403 sering hanya di query1)
		const hosts = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com'];
		let lastErr: unknown;
		for (const host of hosts) {
			try {
				const url = `${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=7d`;
				const res = await fetchWithTimeout(url, {}, 7000);
				if (!res.ok) throw new Error(`yahoo ${res.status}`);
				const json = (await res.json()) as {
					chart?: {
						result?: Array<{
							meta?: { regularMarketPrice?: number; previousClose?: number; currency?: string };
							indicators?: { quote?: Array<{ close?: (number | null)[] }> };
						}>
					};
				};
				const result = json.chart?.result?.[0];
				const metaRes = result?.meta;
				if (metaRes?.regularMarketPrice == null) return null;
				const price = metaRes.regularMarketPrice;
				const prev = metaRes.previousClose;
				const change = prev != null && prev !== 0 ? ((price - prev) / prev) * 100 : null;
				// A3: ambil 7 titik close untuk sparkline
				const closes = result?.indicators?.quote?.[0]?.close;
				const sparkline = Array.isArray(closes)
					? closes.filter((c): c is number => typeof c === 'number' && !Number.isNaN(c)).slice(-7)
					: [];
				return {
					symbol: meta.symbol,
					name: meta.name,
					price,
					change24h: change,
					currency: meta.currency,
					type: meta.type,
					sparkline
				};
			} catch (e) {
				lastErr = e;
				continue;
			}
		}
		throw lastErr ?? new Error('yahoo all hosts fail');
	} catch {
		// Fallback forex kalau Yahoo fail dan ini USD/IDR
		if (meta.symbol === 'USD/IDR') {
			const fb = await fetchForexFallback();
			if (fb) return fb;
		}
		return null;
	}
}

async function fetchIdxForex(): Promise<MarketItem[]> {
	return cached('market:idx', async () => {
		const results = await Promise.allSettled(
			YAHOO_SYMBOLS.map((m) => fetchYahooItem(m.yahoo, m))
		);
		const items: MarketItem[] = [];
		for (const r of results) {
			if (r.status === 'fulfilled' && r.value) items.push(r.value);
		}
		// JANGAN GUNAKAN DUMMY: kalau semua Yahoo 403 → return [] biar UI jujur "data tidak tersedia"
		// Jangan hardcode 7234.5 seolah live. Stale fallback ditangani di fetchMarketData.
		if (items.length === 0) return [];
	// If LQ45 missing, duplicate IHSG with LQ45 label and slight variation to avoid empty cell
	const hasLQ45 = items.some((i) => i.symbol.startsWith('LQ45'));
	if (!hasLQ45) {
		const ihsg = items.find((i) => i.symbol === 'IHSG');
		if (ihsg) {
			items.splice(1, 0, {
				symbol: 'LQ45',
				name: 'LQ45 (estimasi)',
				price: Math.round(ihsg.price * 0.135),
				change24h: ihsg.change24h != null ? ihsg.change24h * 0.9 : null,
				currency: 'IDR',
				type: 'idx',
				isEstimated: true
			});
		}
	}
		// Normalize LQ45* -> LQ45
		for (const it of items) if (it.symbol === 'LQ45*') it.symbol = 'LQ45';
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
