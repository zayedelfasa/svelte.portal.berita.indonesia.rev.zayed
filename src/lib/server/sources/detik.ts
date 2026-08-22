import { makeRssSource } from './rssSource';

/** Kanal Detik — semua RSS kanal terverifikasi HTTP 200 */
export const fetchDetikAdapter = makeRssSource(
	'detik',
	'https://news.detik.com/rss',
	{
		nasional: 'https://news.detik.com/rss',
		ekonomi: 'https://finance.detik.com/rss',
		tekno: 'https://inet.detik.com/rss',
		olahraga: 'https://sport.detik.com/rss',
		hiburan: 'https://hot.detik.com/rss',
		gayahidup: 'https://travel.detik.com/rss'
	}
);
