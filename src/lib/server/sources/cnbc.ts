import { makeAggregatorSource } from './aggSource';

export const fetchCnbc = makeAggregatorSource(
	'cnbc',
	'/cnbc-news/news',
	'https://www.cnbcindonesia.com/rss'
);
