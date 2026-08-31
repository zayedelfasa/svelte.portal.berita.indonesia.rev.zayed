import { cached, TTL } from './cache';
import { fetchWithTimeout } from './http';
import type { KalenderData } from '$lib/harian';

const JAKARTA_TZ = 'Asia/Jakarta';

function ymdJakarta(d: Date): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: JAKARTA_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function labelGregorian(d: Date): string {
	return new Intl.DateTimeFormat('id-ID', { timeZone: JAKARTA_TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** Aladhan gToH — Gregorian → Hijri, gratis tanpa key */
async function fetchHijri(dateJakarta: string): Promise<string> {
	const [y, m, d] = dateJakarta.split('-');
	const res = await fetchWithTimeout(`https://api.aladhan.com/v1/gToH?date=${d}-${m}-${y}`, { headers: { accept: 'application/json' } }, 7000);
	if (!res.ok) throw new Error(`aladhan gToH ${res.status}`);
	const j = (await res.json()) as {
		data?: { hijri?: { day?: string; year?: string; month?: { en?: string; number?: number } } };
	};
	const h = j.data?.hijri;
	const day = (h?.day ?? '').replace(/^0/, '');
	const monthEn = h?.month?.en ?? '';
	const monthId = h?.month?.number != null ? HIJRI_ID_BY_NUM[h.month.number] ?? monthEn : monthEn;
	if (!day || !monthId || !h?.year) throw new Error('aladhan hijri tak lengkap');
	return `${day} ${monthId} ${h.year} H`;
}

const HIJRI_ID_BY_NUM: Record<number, string> = {
	1: 'Muharram', 2: 'Safar', 3: 'Rabiul Awal', 4: 'Rabiul Akhir',
	5: 'Jumadil Awal', 6: 'Jumadil Akhir', 7: 'Rajab', 8: 'Sya’ban',
	9: 'Ramadan', 10: 'Syawal', 11: 'Zulkaidah', 12: 'Zulhijah'
};

/** Hari libur Indonesia — Nager.Date (gratis, aktif); fallback api-harilibur jika hidup lagi */
async function fetchHolidays(year: number): Promise<Array<{ name: string; date: string; isLibur: boolean }>> {
	const out: Array<{ name: string; date: string; isLibur: boolean }> = [];
	const seen = new Set<string>();

	const [a, b] = await Promise.allSettled([
		fetchWithTimeout(`https://date.nager.at/api/v3/publicholidays/${year}/ID`, { headers: { accept: 'application/json' } }, 7000),
		fetchWithTimeout(`https://dayoffapi.vercel.app/api?year=${year}`, { headers: { accept: 'application/json' } }, 7000)
	]);

	if (a.status === 'fulfilled' && a.value.ok) {
		try {
			const j = (await a.value.json()) as Array<{ date?: string; name?: string; localName?: string; types?: string[] }>;
			for (const h of j) {
				if (!h.date || !h.name) continue;
				const key = `${h.date}|${h.name}`;
				if (seen.has(key)) continue;
				seen.add(key);
				const isPublic = !h.types || h.types.includes('Public');
				out.push({ name: h.localName || h.name, date: h.date, isLibur: isPublic });
			}
		} catch {}
	}
	if (b.status === 'fulfilled' && b.value.ok) {
		try {
			const j = (await b.value.json()) as Array<{ tanggal?: string; keterangan?: string; is_cuti?: boolean }>;
			for (const h of j) {
				if (!h.tanggal || !h.keterangan) continue;
				const key = `${h.tanggal}|${h.keterangan}`;
				if (seen.has(key)) continue;
				seen.add(key);
				out.push({ name: h.keterangan, date: h.tanggal, isLibur: h.is_cuti !== false });
			}
		} catch {}
	}
	return out;
}

/** Kalender harian: label Masehi + Hijriah + libur terdekat ≤30 hari. Gagal sebagian → tetap return (label Masehi selalu ada). */
export async function fetchKalender(): Promise<KalenderData> {
	const now = new Date();
	const dateKey = ymdJakarta(now);
	return cached(
		`kalender:${dateKey}`,
		async () => {
			const data: KalenderData = { gregorianLabel: labelGregorian(now), hijriLabel: '', holiday: null };

			const [hijriR, liburR] = await Promise.allSettled([fetchHijri(dateKey), fetchHolidays(now.getFullYear())]);

			if (hijriR.status === 'fulfilled') data.hijriLabel = hijriR.value;

			if (liburR.status === 'fulfilled' && liburR.value.length > 0) {
				const today = dateKey;
				const upcoming = liburR.value
					.filter((h) => h.date >= today)
					.sort((x, y) => x.date.localeCompare(y.date))
					.slice(0, 1);
				const h = upcoming[0];
				if (h) {
					const daysUntil = Math.max(0, Math.round((new Date(`${h.date}T00:00:00+07:00`).getTime() - new Date(`${today}T00:00:00+07:00`).getTime()) / 86400000));
					if (daysUntil <= 30) data.holiday = { name: h.name, date: h.date, daysUntil, isLibur: h.isLibur };
				}
			}

			if (!data.hijriLabel && !data.holiday) throw new Error('kalender: hijri & libur sama-sama gagal');
			return data;
		},
		TTL.hijri
	);
}
