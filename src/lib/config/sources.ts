import type { SourceDef } from '$lib/types';
import { fetchDetik } from '$lib/server/sources/detik';
import { fetchCnn } from '$lib/server/sources/cnn';
import { fetchAntara } from '$lib/server/sources/antara';
import { fetchCnbc } from '$lib/server/sources/cnbc';
import { fetchTempo } from '$lib/server/sources/tempo';
import { fetchRepublika } from '$lib/server/sources/republika';
import { fetchOkezone } from '$lib/server/sources/okezone';
import { fetchKumparan } from '$lib/server/sources/kumparan';
import { fetchJpnn } from '$lib/server/sources/jpnn';
import { fetchMediaIndonesia } from '$lib/server/sources/mediaindonesia';
import { fetchInews } from '$lib/server/sources/inews';

/**
 * Registry 11 media lokal Indonesia.
 * Urutan = urutan tampil di halaman utama.
 *
 * Catatan riset (lihat PLAN.md):
 * - Tribun News, Jawa Pos, Suara.com dibuang karena endpoint/RSS-nya
 *   mati atau bot-block (HTTP 403/500 saat riset).
 * - Penggantinya: JPNN.com, Media Indonesia, iNews — semua RSS resmi hidup.
 */
export const SOURCES: SourceDef[] = [
	{ id: 'detik', name: 'Detik', fetchTop: fetchDetik },
	{ id: 'cnn', name: 'CNN Indonesia', fetchTop: fetchCnn },
	{ id: 'antara', name: 'Antara News', fetchTop: fetchAntara },
	{ id: 'cnbc', name: 'CNBC Indonesia', fetchTop: fetchCnbc },
	{ id: 'tempo', name: 'Tempo', fetchTop: fetchTempo },
	{ id: 'republika', name: 'Republika', fetchTop: fetchRepublika },
	{ id: 'okezone', name: 'Okezone', fetchTop: fetchOkezone },
	{ id: 'kumparan', name: 'Kumparan', fetchTop: fetchKumparan },
	{ id: 'jpnn', name: 'JPNN.com', fetchTop: fetchJpnn },
	{ id: 'mediaindonesia', name: 'Media Indonesia', fetchTop: fetchMediaIndonesia },
	{ id: 'inews', name: 'iNews', fetchTop: fetchInews }
];
