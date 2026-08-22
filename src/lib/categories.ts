import type { CategoryId } from '$lib/types';

/** Kategori kanonik portal — urutan = urutan tampil di tab bar */
export const CATEGORIES: ReadonlyArray<{ id: CategoryId; label: string }> = [
	{ id: 'nasional', label: 'Nasional' },
	{ id: 'ekonomi', label: 'Ekonomi' },
	{ id: 'tekno', label: 'Tekno' },
	{ id: 'olahraga', label: 'Olahraga' },
	{ id: 'hiburan', label: 'Hiburan' },
	{ id: 'gayahidup', label: 'Gaya Hidup' }
];

export function isCategoryId(v: string | null): v is CategoryId {
	return CATEGORIES.some((c) => c.id === v);
}
