import { makeAggregatorSource } from './aggSource';

export const fetchRepublikaAdapter = makeAggregatorSource('republika', '/republika-news/news', {
	categories: {
		nasional: '/republika-news/nusantara',
		ekonomi: '/republika-news/ekonomi',
		olahraga: '/republika-news/sepakbola',
		gayahidup: '/republika-news/leisure'
	}
});
