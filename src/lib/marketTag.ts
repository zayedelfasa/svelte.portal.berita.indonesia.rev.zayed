import type { Article } from './types';
import { slugify } from './marketSlug';

/** Keyword → symbol market untuk auto-tag berita. \b = whole-word biar tidak false-positive. */
const KEYWORDS: { pattern: RegExp; symbol: string }[] = [
	{ pattern: /\b(bitcoin|btc)\b/i, symbol: 'BTC' },
	{ pattern: /\b(ethereum|eth)\b/i, symbol: 'ETH' },
	{ pattern: /\b(solana)\b|\bsol\b/i, symbol: 'SOL' },
	{ pattern: /\b(binance coin|bnb)\b/i, symbol: 'BNB' },
	{ pattern: /\b(tether|usdt)\b/i, symbol: 'USDT' },
	{ pattern: /\bihsg\b/i, symbol: 'IHSG' },
	{ pattern: /\blq45\b/i, symbol: 'LQ45' },
	{ pattern: /\b(usd\/idr|kurs rupiah|kurs dolar)\b/i, symbol: 'USD/IDR' }
];

export interface MarketTag {
	symbol: string;
	slug: string;
}

/**
 * Tag artikel dengan simbol market yang muncul di judul/summary.
 * Hanya simbol yang ada di `items` (market aktif) yang dipakai → tidak tautan mati.
 */
export function tagArticle(article: Article, items: { symbol: string }[]): MarketTag[] {
	const text = `${article.title} ${article.summary ?? ''}`;
	const available = new Set(items.map((i) => i.symbol));
	const seen = new Set<string>();
	const tags: MarketTag[] = [];
	for (const { pattern, symbol } of KEYWORDS) {
		if (seen.has(symbol) || !available.has(symbol)) continue;
		if (pattern.test(text)) {
			seen.add(symbol);
			tags.push({ symbol, slug: slugify(symbol) });
		}
	}
	return tags;
}
