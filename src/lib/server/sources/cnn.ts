import { makeAggregatorSource } from './aggSource';

export const fetchCnnAdapter = makeAggregatorSource(
	'cnn',
	'/cnn-news/',
	{
		fallbackFeed: 'https://www.cnnindonesia.com/rss',
		categories: {
			nasional: '/cnn-news/nasional',
			ekonomi: '/cnn-news/ekonomi',
			tekno: '/cnn-news/teknologi',
			olahraga: '/cnn-news/olahraga',
			hiburan: '/cnn-news/hiburan',
			gayahidup: '/cnn-news/gaya-hidup'
		}
	}
);
