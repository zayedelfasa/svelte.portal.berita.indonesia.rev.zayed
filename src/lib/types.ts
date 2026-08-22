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

export interface SourceDef {
	id: string;
	name: string;
	/** ambil N artikel teratas (sudah lewat cache) */
	fetchTop: (limit: number) => Promise<Article[]>;
}

/** hasil fetch satu sumber untuk UI */
export interface SourceResult {
	sourceId: string;
	name: string;
	ok: boolean;
	articles: Article[];
	error?: string;
}
