/** Pemetaan symbol market ↔ slug URL (lowercase, aman untuk route `[symbol]`). */
const symbolToSlug: Record<string, string> = {
	BTC: 'btc',
	ETH: 'eth',
	SOL: 'sol',
	BNB: 'bnb',
	USDT: 'usdt',
	IHSG: 'ihsg',
	LQ45: 'lq45',
	'USD/IDR': 'usd-idr'
};

const slugToSymbol: Record<string, string> = Object.fromEntries(
	Object.entries(symbolToSlug).map(([sym, slug]) => [slug, sym])
);

export function slugify(symbol: string): string {
	return symbolToSlug[symbol] ?? symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function symbolFromSlug(slug: string): string | undefined {
	return slugToSymbol[slug];
}
