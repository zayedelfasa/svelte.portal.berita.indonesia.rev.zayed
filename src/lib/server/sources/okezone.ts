import { makeAggregatorSource } from './aggSource';

export const fetchOkezoneAdapter = makeAggregatorSource('okezone', '/okezone-news/breaking', {
	categories: {
		nasional: '/okezone-news/breaking',
		ekonomi: '/okezone-news/economy',
		tekno: '/okezone-news/techno',
		olahraga: '/okezone-news/sport',
		hiburan: '/okezone-news/celebrity',
		gayahidup: '/okezone-news/lifestyle'
	}
});
