import { fetchWithTimeout, firstImgSrc, stripHtml } from './http';
import { parseRss } from './rss';
import type { Article } from '$lib/types';

const BASE = 'https://berita-indo-api.vercel.app/v1';

interface AggregatorItem {
	title?: string;
	link?: string;
	description?: string;
	isoDate?: string;
	pubDate?: string;
	image?: string;
	enclosure?: { url?: string };
	'content:encodedSnippet'?: string;
	'content:encoded'?: string;
}

/** fetch satu endpoint aggregator → Article[] mentah (belum di-cache) */
export async function fetchAggregator(apiPath: string, sourceId: string): Promise<Article[]> {
	const res = await fetchWithTimeout(`${BASE}${apiPath}`);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const json = (await res.json()) as { data?: AggregatorItem[] };
	const data = Array.isArray(json.data) ? json.data : [];

	return data
		.map((d): Article => {
			const dRaw = new Date(d.isoDate ?? d.pubDate ?? '');
			return {
				source: sourceId,
				title: stripHtml(d.title),
				url: String(d.link ?? '').trim(),
				publishedAt: Number.isFinite(dRaw.getTime()) ? dRaw.toISOString() : new Date().toISOString(),
				summary: stripHtml(d['content:encodedSnippet'] || d['content:encoded'] || d.description).slice(0, 400),
				image: d.image || d.enclosure?.url || firstImgSrc(d.description) || undefined
			};
		})
		.filter((a) => a.title && a.url);
}
