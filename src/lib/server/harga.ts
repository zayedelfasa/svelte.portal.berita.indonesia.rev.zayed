import { cached, TTL } from './cache';
import { fetchWithTimeout } from './http';
import type { HargaData, HargaItem } from '$lib/harian';
import { parsePaxgPrice, parsePanganPrice } from './parsers';

const fmt = (n: number) => Math.round(n).toLocaleString('id-ID');

/**
 * Harga harian — 3 grup: Emas / Sembako / BBM.
 * No-dummy: sumber gagal → harga null → card/row disembunyikan (jujur).
 * BBM = harga resmi resmi Pertamina (statis, update manual saat kebijakan berubah).
 */

/** Emas via PAXG (token 1:1 emas fisik) di CoinGecko — proksi harga emas dunia, bukan Antam resmi → estimasi */
async function fetchEmas(): Promise<{ harga: number | null; change24h: number | null }> {
	try {
		const res = await fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=idr&include_24hr_change=true', { headers: { accept: 'application/json' } }, 7000);
		if (!res.ok) throw new Error(`coingecko emas ${res.status}`);
		return parsePaxgPrice(await res.json());
	} catch {
		return { harga: null, change24h: null };
	}
}

const SEMBAKO_NAMA: Array<{ id: string; nama: string; satuan: string }> = [
	{ id: 'beras', nama: 'Beras Premium', satuan: 'kg' },
	{ id: 'gula', nama: 'Gula Pasir', satuan: 'kg' },
	{ id: 'minyak', nama: 'Minyak Goreng', satuan: 'liter' },
	{ id: 'telur', nama: 'Telur Ayam', satuan: 'kg' },
	{ id: 'ayam', nama: 'Daging Ayam', satuan: 'kg' }
];

/**
 * Sembako — API pangan.go.id sering CORS/rate-limit & panelharga butuh render JS.
 * Pendekatan jujur: jika API gagal → null (jangan tampil angka palsu).
 * Estimasi dari harga USD rata-rata BPS/panelharga TIDAK dipakai (no-dummy policy).
 */
async function fetchSembako(): Promise<Array<{ id: string; nama: string; satuan: string; harga: number | null }>> {
	try {
		const res = await fetchWithTimeout('https://api.pangan.go.id/api/harga', { headers: { accept: 'application/json' } }, 7000);
		if (!res.ok) throw new Error(`pangan ${res.status}`);
		const j = (await res.json()) as unknown;
		// Bentuk response tidak terdokumentasi stabil — validasi defensif
		const out = parsePanganPrice(j);
		if (out.length === 0) throw new Error('pangan kosong setelah parse');
		return out;
	} catch {
		// No-dummy: return baris nama dengan harga null (bukan harga palsu)
		return SEMBAKO_NAMA.map((s) => ({ id: s.id, nama: s.nama, satuan: s.satuan, harga: null }));
	}
}

const BBM: Array<{ id: string; nama: string; satuan: string; harga: number }> = [
	{ id: 'pertalite', nama: 'Pertalite', satuan: 'liter', harga: 10000 },
	{ id: 'pertamax', nama: 'Pertamax', satuan: 'liter', harga: 12900 },
	{ id: 'pertamax-turbo', nama: 'Pertamax Turbo', satuan: 'liter', harga: 14900 },
	{ id: 'solar-b35', nama: 'Solar B35', satuan: 'liter', harga: 6800 }
];

export async function fetchHarga(): Promise<HargaData> {
	return cached(
		'harga:harian',
		async () => {
			const [emasR, sembakoR] = await Promise.allSettled([fetchEmas(), fetchSembako()]);

			const items: HargaItem[] = [];

			if (emasR.status === 'fulfilled') {
				items.push({
					id: 'emas',
					nama: 'Emas (per gram)',
					grup: 'emas',
					satuan: 'gram',
					harga: emasR.value.harga,
					change24h: emasR.value.change24h,
					sumber: 'CoinGecko PAXG',
					estimasi: true
				});
			}

			if (sembakoR.status === 'fulfilled') {
				for (const s of sembakoR.value) {
					items.push({ id: s.id, nama: s.nama, grup: 'sembako', satuan: s.satuan, harga: s.harga, change24h: null, sumber: 'pangan.go.id' });
				}
			}

			for (const b of BBM) {
				items.push({ id: b.id, nama: b.nama, grup: 'bbm', satuan: b.satuan, harga: b.harga, change24h: null, sumber: 'Pertamina (resmi)' });
			}

			if (items.every((i) => i.harga == null)) throw new Error('semua sumber harga gagal');

			return { items, fetchedAt: new Date().toISOString() };
		},
		TTL.harga
	);
}

export { fmt };
