/** Artikel hasil normalisasi — bentuk sama dari semua sumber (RSS / aggregator) */
export interface Article {
	/** id media, mis. 'detik' */
	source: string;
	title: string;
	/** URL artikel asli */
	url: string;
	/** ISO date string */
	publishedAt: string;
	/** ringkasan bersih (HTML sudah di-strip) */
	summary: string;
	/** gambar utama (dari enclosure/image) — dipakai halaman detail */
	image?: string;
}

export type CategoryId =
	| 'nasional'
	| 'ekonomi'
	| 'tekno'
	| 'olahraga'
	| 'hiburan'
	| 'gayahidup';

/** Adapter satu media — hasil factory makeRssSource / makeAggregatorSource */
export interface SourceAdapter {
	fetchTop: (limit: number) => Promise<Article[]>;
	/** hanya ada jika media mendukung kategori */
	fetchCategory?: (cat: CategoryId, limit: number) => Promise<Article[]>;
	/** daftar kategori yang didukung (pendamping fetchCategory) */
	supportedCategories?: readonly CategoryId[];
}

export interface SourceDef {
	id: string;
	name: string;
	/** ambil N artikel teratas (sudah lewat cache) */
	fetchTop: (limit: number) => Promise<Article[]>;
	fetchCategory?: (cat: CategoryId, limit: number) => Promise<Article[]>;
	supportedCategories?: readonly CategoryId[];
}

/** hasil fetch satu sumber untuk UI */
export interface SourceResult {
	sourceId: string;
	name: string;
	ok: boolean;
	articles: Article[];
	error?: string;
}
