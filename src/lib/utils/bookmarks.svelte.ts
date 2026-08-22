import { browser } from '$app/environment';
import type { Article } from '$lib/types';

const KEY = 'bookmarks';

function load(): Article[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as Article[]) : [];
	} catch {
		return [];
	}
}

function save(items: Article[]) {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(items));
	} catch {
		// quota exceeded — ignore
	}
}

/** state reaktif tunggal — dipakai di NewsItem, ArticleView, Header */
export const bookmarks = $state<Article[]>(browser ? load() : []);

/** sinkron awal saat client hydrate (SSR → browser) */
if (browser) {
	// pastikan state sinkron dengan storage jika ada perubahan antar-tab
	window.addEventListener('storage', (e) => {
		if (e.key === KEY && e.newValue) {
			try {
				const next = JSON.parse(e.newValue) as Article[];
				bookmarks.length = 0;
				bookmarks.push(...next);
			} catch {}
		}
	});
}

export function isBookmarked(url: string): boolean {
	return bookmarks.some((b) => b.url === url);
}

export function toggleBookmark(article: Article): boolean {
	const idx = bookmarks.findIndex((b) => b.url === article.url);
	let added: boolean;
	if (idx >= 0) {
		bookmarks.splice(idx, 1);
		added = false;
	} else {
		// simpan snapshot lengkap (hindari reference)
		bookmarks.push({ ...article });
		added = true;
	}
	save([...bookmarks]);
	return added;
}

export function removeBookmark(url: string): void {
	const idx = bookmarks.findIndex((b) => b.url === url);
	if (idx >= 0) {
		bookmarks.splice(idx, 1);
		save([...bookmarks]);
	}
}
