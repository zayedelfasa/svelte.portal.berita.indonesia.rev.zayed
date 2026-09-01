import { cached, TTL } from './cache';
import { fetchWithTimeout } from './http';
import type { BolaData, BolaMatch } from '$lib/harian';
import { parseEspnScoreboard, parseTheSportsDb } from './parsers';

/**
 * Skor bola — ESPN (overseas) + TheSportsDB fallback domestic.
 * ESPN WAF block Mozilla UA → pakai UA axios/Go yang lolos.
 */
const ESPN_UA = 'axios/1.7.0';

export const LEAGUES = [
	{ slug: 'idn.1', label: 'Liga 1', group: 'domestic' as const, fallbackDbId: '4790' },
	{ slug: 'eng.1', label: 'Premier League', group: 'overseas' as const },
	{ slug: 'esp.1', label: 'La Liga', group: 'overseas' as const },
	{ slug: 'ita.1', label: 'Serie A', group: 'overseas' as const },
	{ slug: 'ger.1', label: 'Bundesliga', group: 'overseas' as const },
	{ slug: 'fra.1', label: 'Ligue 1', group: 'overseas' as const },
	{ slug: 'uefa.champions', label: 'Champions League', group: 'overseas' as const }
];

function weekDatesJakarta(): string[] {
	const now = new Date();
	// Monday-Sunday minggu ini (Asia/Jakarta)
	const j = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
	const day = j.getDay(); // 0 Sun
	const mondayOffset = day === 0 ? -6 : 1 - day;
	const monday = new Date(j);
	monday.setDate(j.getDate() + mondayOffset);
	const out: string[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		out.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`);
	}
	return out;
}

function todayYmdJakarta(): string {
	const j = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
	return `${j.getFullYear()}${String(j.getMonth() + 1).padStart(2, '0')}${String(j.getDate()).padStart(2, '0')}`;
}

export async function fetchBola(opts: { week?: boolean } = {}): Promise<BolaData> {
	const week = !!opts.week;
	const cacheKey = week ? 'bola:scoreboard:week' : 'bola:scoreboard';
	return cached(
		cacheKey,
		async () => {
			const dates = week ? weekDatesJakarta() : [todayYmdJakarta()];
			// For week, fetch per-league per-date; for single, per-league single date
			const tasks: Promise<BolaMatch[]>[] = [];
			for (const l of LEAGUES) {
				if (week) {
					for (const d of dates) tasks.push(fetchEspnLeague(l.slug, l.label, d).catch(() => []));
					// domestic fallback additional
					if (l.fallbackDbId) tasks.push(fetchDbLeague(l.fallbackDbId, l.label).catch(() => []));
				} else {
					tasks.push(fetchEspnLeague(l.slug, l.label, dates[0]).catch(() => []));
					if (l.fallbackDbId) tasks.push(fetchDbLeague(l.fallbackDbId, l.label).catch(() => []));
				}
			}
			const results = await Promise.allSettled(tasks);
			const map = new Map<string, BolaMatch>();
			for (const r of results) if (r.status === 'fulfilled') for (const m of r.value) if (!map.has(m.id)) map.set(m.id, m);
			const matches = [...map.values()];
			if (matches.length === 0) throw new Error('espn/db scoreboard gagal semua liga');

			const rank = { live: 0, scheduled: 1, finished: 2 } as const;
			matches.sort((a, b) => {
				const ra = rank[a.status] - rank[b.status];
				if (ra !== 0) return ra;
				return (a.kickoff ? new Date(a.kickoff).getTime() : 0) - (b.kickoff ? new Date(b.kickoff).getTime() : 0);
			});
			return { matches: matches.slice(0, week ? 30 : 20), fetchedAt: new Date().toISOString() };
		},
		TTL.bola
	);
}

async function fetchEspnLeague(slug: string, label: string, ymd?: string): Promise<BolaMatch[]> {
	const url = ymd ? `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${ymd}` : `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard`;
	const res = await fetchWithTimeout(url, { headers: { accept: 'application/json', 'user-agent': ESPN_UA } }, 7000);
	if (!res.ok) throw new Error(`espn ${slug} ${res.status}`);
	return parseEspnScoreboard(await res.json(), label);
}

async function fetchDbLeague(dbId: string, label: string): Promise<BolaMatch[]> {
	const res = await fetchWithTimeout(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${dbId}`, { headers: { accept: 'application/json' } }, 7000);
	if (!res.ok) throw new Error(`thesportsdb ${dbId} ${res.status}`);
	return parseTheSportsDb(await res.json(), label);
}
