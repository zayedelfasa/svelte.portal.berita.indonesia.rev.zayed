/**
 * Cache memori sederhana per-instance serverless.
 * TTL 10 menit — supaya tidak menembak API publik terus-menerus.
 * (CDN Vercel juga ikut cache via header `s-maxage` di route.)
 */

interface Entry<T> {
	value: T;
	expires: number;
}

const store = new Map<string, Entry<unknown>>();
const TTL_MS = 10 * 60 * 1000;

export function invalidateCache(prefix: string) {
	for (const k of [...store.keys()]) if (k === prefix || k.startsWith(prefix + ':') || k.startsWith(prefix + '/')) store.delete(k);
}

export async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
	const hit = store.get(key);
	if (hit && hit.expires > Date.now()) return hit.value as T;

	const value = await fn();
	store.set(key, { value, expires: Date.now() + TTL_MS });

	// buang entri kadaluarsa biar map tidak bengkak
	if (store.size > 200) {
		const now = Date.now();
		for (const [k, v] of store) if (v.expires <= now) store.delete(k);
	}
	return value;
}
