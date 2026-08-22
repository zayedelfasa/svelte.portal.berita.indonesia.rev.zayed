import { makeRssSource } from './rssSource';

/** Hanya headline umum — tidak ada feed kategori terverifikasi */
export const fetchMediaIndonesiaAdapter = makeRssSource(
	'mediaindonesia',
	'https://mediaindonesia.com/feed'
);
