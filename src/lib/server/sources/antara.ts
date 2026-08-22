import { makeRssSource } from './rssSource';

/** Semua endpoint (headline + 6 kategori) terverifikasi HTTP 200 di antaranews.com/rss */
export const fetchAntaraAdapter = makeRssSource(
	'antara',
	'https://www.antaranews.com/rss/terkini.xml',
	{
		nasional: 'https://www.antaranews.com/rss/politik.xml',
		ekonomi: 'https://www.antaranews.com/rss/ekonomi.xml',
		tekno: 'https://www.antaranews.com/rss/tekno.xml',
		olahraga: 'https://www.antaranews.com/rss/olahraga.xml',
		hiburan: 'https://www.antaranews.com/rss/hiburan.xml',
		gayahidup: 'https://www.antaranews.com/rss/lifestyle.xml'
	}
);
