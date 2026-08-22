import { browser } from '$app/environment';

const KEY = 'thumb';

/** default OFF sesuai keputusan awal teks-saja */
export const thumbState = $state<{ enabled: boolean }>({
	enabled: browser ? localStorage.getItem(KEY) === '1' : false
});

export function toggleThumb(): void {
	thumbState.enabled = !thumbState.enabled;
	if (!browser) return;
	try {
		localStorage.setItem(KEY, thumbState.enabled ? '1' : '0');
	} catch {}
}
