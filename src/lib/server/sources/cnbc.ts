import { makeAggregatorSource } from './aggSource';

export const fetchCnbcAdapter = makeAggregatorSource('cnbc', '/cnbc-news/news', {
	fallbackFeed: 'https://www.cnbcindonesia.com/rss',
	categories: {
		nasional: '/cnbc-news/news',
		ekonomi: '/cnbc-news/market',
		tekno: '/cnbc-news/tech',
		gayahidup: '/cnbc-news/lifestyle'
	}
});
