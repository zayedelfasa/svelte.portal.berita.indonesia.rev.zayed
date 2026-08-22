import { makeRssSource } from './rssSource';

/** Hanya headline umum — tidak ada feed kategori terverifikasi */
export const fetchJpnnAdapter = makeRssSource('jpnn', 'https://www.jpnn.com/rss');
