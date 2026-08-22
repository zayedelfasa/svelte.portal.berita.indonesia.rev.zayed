import { XMLParser } from 'fast-xml-parser';
import { firstImgSrc, stripHtml } from './http';
import type { Article } from '$lib/types';

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	removeNSPrefix: true // `content:encoded` → `encoded`, `media:content` → `content`
});

interface RawItem {
	title?: string | { '#text'?: string };
	link?: string;
	pubDate?: string;
	description?: string;
	encoded?: string; // content:encoded setelah removeNSPrefix
	enclosure?: { '@_url'?: string; '@_type'?: string };
}

function text(v: unknown): string {
	if (typeof v === 'string') return v;
	if (v && typeof v === 'object') return String((v as Record<string, unknown>)['#text'] ?? '');
	return '';
}

function pickImage(item: RawItem): string | undefined {
	const enc = item.enclosure?.['@_url'];
	if (enc && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(enc)) return enc;
	// beberapa feed set type image tapi tanpa ekstensi
	if (enc && item.enclosure?.['@_type']?.startsWith('image/')) return enc;
	return (
		firstImgSrc(item.encoded) ??
		firstImgSrc(item.description) ??
		undefined
	);
}

/** Parse RSS/Atom-ish XML standar 2.0 → Article[] */
export function parseRss(xml: string, sourceId: string): Article[] {
	const doc = parser.parse(xml) as {
		rss?: { channel?: { item?: RawItem | RawItem[] } };
	};
	let items = doc.rss?.channel?.item ?? [];
	if (!Array.isArray(items)) items = [items];

	const now = new Date().toISOString();
	return items
		.map((item): Article => {
			const title = stripHtml(text(item.title));
			const url = String(item.link ?? '').trim();
			const summary = stripHtml(item.encoded || item.description).slice(0, 400);
			const d = new Date(text(item.pubDate));
			return {
				source: sourceId,
				title,
				url,
				publishedAt: Number.isFinite(d.getTime()) ? d.toISOString() : now,
				summary,
				image: pickImage(item)
			};
		})
		.filter((a) => a.title && a.url);
}
