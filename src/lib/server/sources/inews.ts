import { makeRssSource } from './rssSource';

export const fetchInewsAdapter = makeRssSource(
	'inews',
	'https://www.inews.id/feed',
	{
		nasional: 'https://www.inews.id/feed/nasional',
		ekonomi: 'https://www.inews.id/feed/ekonomi',
		tekno: 'https://www.inews.id/feed/tekno',
		olahraga: 'https://www.inews.id/feed/sport',
		hiburan: 'https://www.inews.id/feed/hiburan',
		gayahidup: 'https://www.inews.id/feed/lifestyle'
	}
);
