import { makeAggregatorSource } from './aggSource';

export const fetchAntara = makeAggregatorSource(
	'antara',
	'/antara-news/terkini',
	'https://www.antaranews.com/rss/terkini.xml'
);
