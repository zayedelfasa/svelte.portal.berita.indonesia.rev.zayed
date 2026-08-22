import type { SourceDef } from '$lib/types';
import { fetchDetikAdapter } from '$lib/server/sources/detik';
import { fetchCnnAdapter } from '$lib/server/sources/cnn';
import { fetchAntaraAdapter } from '$lib/server/sources/antara';
import { fetchCnbcAdapter } from '$lib/server/sources/cnbc';
import { fetchTempoAdapter } from '$lib/server/sources/tempo';
import { fetchRepublikaAdapter } from '$lib/server/sources/republika';
import { fetchOkezoneAdapter } from '$lib/server/sources/okezone';
import { fetchKumparanAdapter } from '$lib/server/sources/kumparan';
import { fetchJpnnAdapter } from '$lib/server/sources/jpnn';
import { fetchMediaIndonesiaAdapter } from '$lib/server/sources/mediaindonesia';
import { fetchInewsAdapter } from '$lib/server/sources/inews';

/**
 * Registry 11 media lokal Indonesia.
 * — Media dengan kategori lengkap: Antara, CNN, Detik, Okezone, iNews (6 kategori)
 * — Sebagian: Tempo 5, CNBBC 4, Republika 4
 * — Hanya headline: Kumparan, JPNN, Media Indonesia
 * Lihat PLAN_TIER_1.md untuk tabel verifikasi.
 */
export const SOURCES: SourceDef[] = [
	{ id: 'detik', name: 'Detik', ...fetchDetikAdapter },
	{ id: 'cnn', name: 'CNN Indonesia', ...fetchCnnAdapter },
	{ id: 'antara', name: 'Antara News', ...fetchAntaraAdapter },
	{ id: 'cnbc', name: 'CNBC Indonesia', ...fetchCnbcAdapter },
	{ id: 'tempo', name: 'Tempo', ...fetchTempoAdapter },
	{ id: 'republika', name: 'Republika', ...fetchRepublikaAdapter },
	{ id: 'okezone', name: 'Okezone', ...fetchOkezoneAdapter },
	{ id: 'kumparan', name: 'Kumparan', ...fetchKumparanAdapter },
	{ id: 'jpnn', name: 'JPNN.com', ...fetchJpnnAdapter },
	{ id: 'mediaindonesia', name: 'Media Indonesia', ...fetchMediaIndonesiaAdapter },
	{ id: 'inews', name: 'iNews', ...fetchInewsAdapter }
];
