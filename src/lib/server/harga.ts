import { cached, TTL } from './cache';
import { fetchWithTimeout } from './http';
import type { HargaData, HargaItem } from '$lib/harian';
import { parseLogamPrice } from './parsers';

const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');

/**
 * Harga harian — 3 grup: Logam (PAXG+KAG) / Tren (embed, no fetch) / BBM+LPG statis.
 * No-dummy: sumber gagal → harga null → card/row disembunyikan (jujur).
 * BBM+LPG = harga resmi Pertamina statis (update manual saat kebijakan berubah).
 * pangan.go.id DIHAPUS 2026-09-01 — jangan kembalikan (95% null + timeout).
 */

/** Logam via CoinGecko: pax-gold (emas) + kinesis-silver (perak) → proksi dunia, bukan Antam → estimasi */
async function fetchLogam(): Promise<{
	emas: { harga: number | null; change24h: number | null };
	perak: { harga: number | null; change24h: number | null };
}> {
	try {
		const res = await fetchWithTimeout(
			'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold,kinesis-silver&vs_currencies=idr&include_24hr_change=true',
			{ headers: { accept: 'application/json' } },
			7000
		);
		if (!res.ok) throw new Error(`coingecko logam ${res.status}`);
		return parseLogamPrice(await res.json());
	} catch {
		return {
			emas: { harga: null, change24h: null },
			perak: { harga: null, change24h: null }
		};
	}
}

const BBM: Array<{ id: string; nama: string; satuan: string; harga: number; catatan?: string }> = [
	{ id: 'pertalite', nama: 'Pertalite', satuan: 'liter', harga: 10000 },
	{ id: 'pertamax', nama: 'Pertamax', satuan: 'liter', harga: 12900 },
	{ id: 'pertamax-turbo', nama: 'Pertamax Turbo', satuan: 'liter', harga: 14900 },
	{ id: 'solar-b35', nama: 'Solar B35', satuan: 'liter', harga: 6800 },
	{ id: 'lpg-3kg', nama: 'LPG 3kg (subsidi HET)', satuan: 'tabung', harga: 16000, catatan: 'HET subsidi ±16k, beda provinsi — cek pangkalan setempat' },
	{ id: 'lpg-12kg', nama: 'Bright Gas 12kg', satuan: 'tabung', harga: 192000 }
];

export async function fetchHarga(): Promise<HargaData> {
	return cached(
		'harga:harian',
		async () => {
			const logamR = await fetchLogam();

			const items: HargaItem[] = [];

			// Logam Mulia — 2 row
			items.push({
				id: 'emas',
				nama: 'Emas (per gram)',
				grup: 'logam',
				satuan: 'gram',
				harga: logamR.emas.harga,
				change24h: logamR.emas.change24h,
				sumber: 'CoinGecko PAXG',
				estimasi: true
			});
			items.push({
				id: 'perak',
				nama: 'Perak (per gram)',
				grup: 'logam',
				satuan: 'gram',
				harga: logamR.perak.harga,
				change24h: logamR.perak.change24h,
				sumber: 'CoinGecko KAG',
				estimasi: true
			});

			// BBM & LPG — 6 row statis
			for (const b of BBM) {
				items.push({
					id: b.id,
					nama: b.nama,
					grup: 'bbm',
					satuan: b.satuan,
					harga: b.harga,
					change24h: null,
					sumber: 'Pertamina (resmi)'
				});
			}

			// Tren sembako tidak masuk items server (embed client B1) — jangan push grup 'tren' di sini

			if (items.every((i) => i.harga == null)) throw new Error('semua sumber harga gagal');

			return { items, fetchedAt: new Date().toISOString() };
		},
		TTL.harga
	);
}

export { fmt };
