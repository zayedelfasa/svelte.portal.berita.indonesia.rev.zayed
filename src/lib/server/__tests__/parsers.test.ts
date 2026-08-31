import { describe, expect, it } from 'vitest';
import { parseBmkgGempa, parseEspnScoreboard, parsePaxgPrice, parsePanganPrice } from '../parsers';

describe('BMKG parser', () => {
	it('normalizes valid earthquake payload', () => {
		const [item] = parseBmkgGempa({ Infogempa: { gempa: [{ Tanggal: '31 Agustus 2026', Jam: '12:00:00 WIB', DateTime: '20260831120000', Magnitude: '5,2', Kedalaman: '10 km', Wilayah: 'Jawa', Lintang: '6.2 LS', Bujur: '106.8 BT', Potensi: 'Tidak berpotensi tsunami' }] } });
		expect(item.magnitude).toBe(5.2);
		expect(item.isoTime).toBe('2026-08-31T05:00:00.000Z');
		expect(item.wilayah).toBe('Jawa');
	});

	it('supports single object and safe missing fields', () => {
		const [item] = parseBmkgGempa({ Infogempa: { gempa: { Magnitude: 'bad' } } });
		expect(item.magnitude).toBeNull();
		expect(item.isoTime).toBeNull();
		expect(parseBmkgGempa({})).toEqual([]);
	});
});

describe('ESPN parser', () => {
	const event = (state: string, score = true) => ({ events: [{ id: '1', date: '2026-08-31T12:00:00Z', competitions: [{ competitors: [{ homeAway: 'home', team: { displayName: 'Home' }, ...(score ? { score: '2' } : {}) }, { homeAway: 'away', team: { displayName: 'Away' }, ...(score ? { score: '1' } : {}) }], status: { type: { state, displayClock: "67'" } } }] }] });

	it('maps pre/in/post to scheduled/live/finished', () => {
		expect(parseEspnScoreboard(event('pre'))[0].status).toBe('scheduled');
		expect(parseEspnScoreboard(event('in'))[0]).toMatchObject({ status: 'live', homeScore: 2, awayScore: 1, clock: "67'" });
		expect(parseEspnScoreboard(event('post'))[0].status).toBe('finished');
	});

	it('skips malformed competitors', () => {
		expect(parseEspnScoreboard({ events: [{ competitions: [{ competitors: [] }] }] })).toEqual([]);
	});
});

describe('Harga parser', () => {
	it('converts PAXG ounce to gram', () => {
		const result = parsePaxgPrice({ 'pax-gold': { idr: 31_103_476.8, idr_24h_change: 1.5 } });
		expect(result.harga).toBeCloseTo(1_000_000);
		expect(result.change24h).toBe(1.5);
	});

	it('rejects malformed PAXG and pangan payloads', () => {
		expect(parsePaxgPrice({}).harga).toBeNull();
		expect(parsePanganPrice({ data: [] })).toEqual([]);
		expect(parsePanganPrice([{ nama: 'Beras', harga: '13200', satuan: 'kg' }])).toEqual([{ id: 'beras', nama: 'Beras', harga: 13200, satuan: 'kg' }]);
	});
});
