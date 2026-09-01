/** Hari Penting Nasional per bulan — statis, kurasi dari Wikipedia Daftar hari penting di Indonesia.
 * Digabung dengan libur Nager.Date di kalender.ts → tampil per bulan di /harian.
 * Day = tanggal 1-31, month 1-12.
 */
export const HARI_PENTING: Record<number, Array<{ day: number; name: string }>> = {
	1: [
		{ day: 3, name: 'Hari Amal Bhakti Kemenag' },
		{ day: 10, name: 'Hari Gerakan Satu Juta Pohon' },
		{ day: 10, name: 'Hari Tritura' },
		{ day: 15, name: 'Hari Dharma Samudra' },
		{ day: 25, name: 'Hari Gizi Nasional' }
	],
	2: [
		{ day: 9, name: 'Hari Pers Nasional' },
		{ day: 14, name: 'Hari Peringatan PETA' },
		{ day: 21, name: 'Hari Peduli Sampah Nasional' },
		{ day: 28, name: 'Hari Gizi Nasional Indonesia' }
	],
	3: [
		{ day: 1, name: 'Hari Kehakiman Nasional' },
		{ day: 9, name: 'Hari Musik Nasional' },
		{ day: 11, name: 'Hari Supersemar' },
		{ day: 22, name: 'Hari Air Sedunia' },
		{ day: 30, name: 'Hari Film Nasional' }
	],
	4: [
		{ day: 7, name: 'Hari Kesehatan Sedunia' },
		{ day: 18, name: 'Hari Konferensi Asia-Afrika' },
		{ day: 21, name: 'Hari Kartini' },
		{ day: 22, name: 'Hari Bumi' },
		{ day: 26, name: 'Hari Kesiapsiagaan Bencana' }
	],
	5: [
		{ day: 1, name: 'Hari Buruh Internasional' },
		{ day: 2, name: 'Hari Pendidikan Nasional' },
		{ day: 17, name: 'Hari Buku Nasional' },
		{ day: 20, name: 'Hari Kebangkitan Nasional' },
		{ day: 31, name: 'Hari Tanpa Tembakau Sedunia' }
	],
	6: [
		{ day: 1, name: 'Hari Lahir Pancasila' },
		{ day: 5, name: 'Hari Lingkungan Hidup Sedunia' },
		{ day: 21, name: 'Hari Krida Pertanian' },
		{ day: 29, name: 'Hari Keluarga Nasional' }
	],
	7: [
		{ day: 5, name: 'Hari Bank Indonesia' },
		{ day: 12, name: 'Hari Koperasi Nasional' },
		{ day: 22, name: 'Hari Kejaksaan' },
		{ day: 23, name: 'Hari Anak Nasional' }
	],
	8: [
		{ day: 10, name: 'Hari Veteran Nasional' },
		{ day: 14, name: 'Hari Pramuka' },
		{ day: 17, name: 'Hari Kemerdekaan RI' },
		{ day: 21, name: 'Hari Maritim Nasional' }
	],
	9: [
		{ day: 1, name: 'Hari Polwan (Polisi Wanita)' },
		{ day: 8, name: 'Hari Aksara Internasional' },
		{ day: 9, name: 'Hari Olahraga Nasional (Haornas)' },
		{ day: 11, name: 'Hari Radio Nasional (RRI)' },
		{ day: 14, name: 'Hari Kunjung Perpustakaan' },
		{ day: 17, name: 'Hari Perhubungan Nasional' },
		{ day: 17, name: 'Hari Palang Merah Indonesia (PMI)' },
		{ day: 24, name: 'Hari Tani Nasional' },
		{ day: 26, name: 'Hari Statistik Nasional' },
		{ day: 27, name: 'Hari Pariwisata Sedunia' },
		{ day: 28, name: 'Hari Kereta Api Indonesia' },
		{ day: 30, name: 'Hari Peringatan G30S/PKI' }
	],
	10: [
		{ day: 1, name: 'Hari Kesaktian Pancasila' },
		{ day: 2, name: 'Hari Batik Nasional' },
		{ day: 5, name: 'Hari TNI' },
		{ day: 22, name: 'Hari Santri Nasional' },
		{ day: 28, name: 'Hari Sumpah Pemuda' }
	],
	11: [
		{ day: 10, name: 'Hari Pahlawan' },
		{ day: 12, name: 'Hari Kesehatan Nasional' },
		{ day: 14, name: 'Hari Brigade Mobil (Brimob)' },
		{ day: 25, name: 'Hari Guru Nasional' }
	],
	12: [
		{ day: 9, name: 'Hari Antikorupsi Sedunia' },
		{ day: 19, name: 'Hari Bela Negara' },
		{ day: 22, name: 'Hari Ibu' },
		{ day: 25, name: 'Hari Natal' }
	]
};
