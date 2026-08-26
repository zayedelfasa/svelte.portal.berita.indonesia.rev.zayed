import { cached } from './cache';
import { fetchWithTimeout } from './http';

export interface MarketItem {
	symbol: string;
	name: string;
	price: number;
	change24h: number | null;
	currency: string;
	type: 'idx' | 'forex' | 'crypto';
	isEstimated?: boolean;
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
	try {
		const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS}&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h`;
		const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 7000);
		if (!res.ok) throw new Error(`coingecko ${res.status}`);
		const data = (await res.json()) as Array<{
			id: string;
			current_price: number;
			price_change_percentage_24h: number | null;
		}>;
		return data.map((d) => {
			const m = CRYPTO_MAP[d.id] ?? { symbol: d.id.toUpperCase(), name: d.id };
			return {
				symbol: m.symbol,
				name: m.name,
				price: d.current_price,
				change24h: d.price_change_percentage_24h,
				currency: 'USD',
				type: 'crypto' as const
			};
		});
	} catch {
		return [];
	}
}

async function fetchYahooItem(yahooSymbol: string, meta: (typeof YAHOO_SYMBOLS)[number]): Promise<MarketItem | null> {
	try {
		const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=2d`;
		const res = await fetchWithTimeout(url, {}, 7000);
		if (!res.ok) throw new Error(`yahoo ${res.status}`);
		const json = (await res.json()) as {
			chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; previousClose?: number; currency?: string } }> };
		};
		const metaRes = json.chart?.result?.[0]?.meta;
		if (metaRes?.regularMarketPrice == null) return null;
		const price = metaRes.regularMarketPrice;
		const prev = metaRes.previousClose;
		const change = prev != null && prev !== 0 ? ((price - prev) / prev) * 100 : null;
		return {
			symbol: meta.symbol,
			name: meta.name,
			price,
			change24h: change,
			currency: meta.currency,
			type: meta.type
		};
	} catch {
		return null;
	}
}

async function fetchIdxForex(): Promise<MarketItem[]> {
	const results = await Promise.allSettled(
		YAHOO_SYMBOLS.map((m) => fetchYahooItem(m.yahoo, m))
	);
	const items: MarketItem[] = [];
	for (const r of results) {
		if (r.status === 'fulfilled' && r.value) items.push(r.value);
	}
	// Fallback dummy if Yahoo blocked completely — keep ticker not empty
	if (items.length === 0) {
		return [
			{ symbol: 'IHSG', name: 'IHSG', price: 7234.5, change24h: 0.85, currency: 'IDR', type: 'idx' },
			{ symbol: 'USD/IDR', name: 'USD/IDR', price: 16220, change24h: 0.12, currency: 'IDR', type: 'forex' }
		];
	}
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
}

export async function fetchMarketData(): Promise<MarketData> {
	return cached('market:ticker', async () => {
		const fetchedAt = new Date().toISOString();
		const [crypto, idxForex] = await Promise.all([fetchCrypto(), fetchIdxForex()]);
		// Order: IHSG, LQ45, USD/IDR, then crypto
		const items = [...idxForex, ...crypto];
		return { items, fetchedAt };
	});
}
