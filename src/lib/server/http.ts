const DEFAULT_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** fetch dengan timeout — upstream berita kadang menggantung */
export async function fetchWithTimeout(
	url: string,
	opts: RequestInit = {},
	ms = 8000
): Promise<Response> {
	const ac = new AbortController();
	const timer = setTimeout(() => ac.abort(), ms);
	try {
		return await fetch(url, {
			...opts,
			signal: ac.signal,
			headers: { 'user-agent': DEFAULT_UA, ...(opts.headers ?? {}) },
			redirect: 'follow'
		});
	} finally {
		clearTimeout(timer);
	}
}

/** buang semua tag HTML + decode entitas umum */
export function stripHtml(html?: string | null): string {
	if (!html) return '';
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<img[^>]*>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#0?39;|&apos;/gi, "'")
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/\s+/g, ' ')
		.trim();
}

/** ambil URL gambar pertama dari potongan HTML (description RSS biasanya berisi <img>) */
export function firstImgSrc(html?: string | null): string | undefined {
	if (!html) return undefined;
	const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
	if (!m) return undefined;
	const src = m[1];
	// buang data-uri & tracking pixel 1x1
	if (src.startsWith('data:')) return undefined;
	if (/(width|height)=["']?1["']?(\s|$|&)/i.test(m[0])) return undefined;
	return src;
}
