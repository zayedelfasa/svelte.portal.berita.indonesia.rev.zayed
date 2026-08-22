import { makeAggregatorSource } from './aggSource';

export const fetchTempoAdapter = makeAggregatorSource('tempo', '/tempo-news/nasional', {
	categories: {
		nasional: '/tempo-news/nasional',
		ekonomi: '/tempo-news/bisnis',
		tekno: '/tempo-news/tekno',
		olahraga: '/tempo-news/sport',
		gayahidup: '/tempo-news/cantik'
	}
});
