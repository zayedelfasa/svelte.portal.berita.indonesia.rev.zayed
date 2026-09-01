import type { BolaMatch, GempaItem } from '../harian';

export function parseBmkgGempa(payload: unknown): GempaItem[] {
	const raw = (payload as { Infogempa?: { gempa?: unknown[] | unknown } })?.Infogempa?.gempa;
	const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : [];
	return list.map((row) => {
		const g = (row ?? {}) as Record<string, unknown>;
		const magnitude = Number(String(g.Magnitude ?? '').replace(',', '.'));
		return {
			tanggal: String(g.Tanggal ?? '').trim(),
			jam: String(g.Jam ?? '').trim(),
			isoTime: bmkgDateToIso(String(g.DateTime ?? '')),
			magnitude: Number.isFinite(magnitude) ? magnitude : null,
			kedalaman: String(g.Kedalaman ?? '').trim(),
			wilayah: String(g.Wilayah ?? '').trim(),
			lintang: String(g.Lintang ?? '').trim(),
			bujur: String(g.Bujur ?? '').trim(),
			potensi: String(g.Potensi ?? '').trim()
		};
	});
}

export function bmkgDateToIso(dt: string): string | null {
	if (!/^\d{14}$/.test(dt)) return null;
	const value = new Date(`${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T${dt.slice(8, 10)}:${dt.slice(10, 12)}:${dt.slice(12, 14)}+07:00`);
	return Number.isFinite(value.getTime()) ? value.toISOString() : null;
}

export function parseEspnScoreboard(payload: unknown, league = 'Premier League'): BolaMatch[] {
	const events = (payload as { events?: unknown[] })?.events;
	if (!Array.isArray(events)) return [];
	const out: BolaMatch[] = [];
	for (const event of events) {
		const ev = event as { id?: string; date?: string; competitions?: Array<{ competitors?: unknown[]; status?: { type?: { state?: string; displayClock?: string } } }> };
		const comp = ev.competitions?.[0];
		const competitors = comp?.competitors ?? [];
		const home = competitors.find((c) => (c as { homeAway?: string }).homeAway === 'home') as { team?: { displayName?: string; logo?: string }; score?: string } | undefined;
		const away = competitors.find((c) => (c as { homeAway?: string }).homeAway === 'away') as { team?: { displayName?: string; logo?: string }; score?: string } | undefined;
		if (!home?.team?.displayName || !away?.team?.displayName) continue;
		const state = comp?.status?.type?.state;
		const status: BolaMatch['status'] = state === 'in' ? 'live' : state === 'post' ? 'finished' : 'scheduled';
		const score = (value: string | undefined) => {
			const n = Number(value);
			return value != null && value !== '' && Number.isFinite(n) ? n : null;
		};
		out.push({
			id: ev.id ?? `${ev.date ?? ''}-${home.team.displayName}`,
			liga: league,
			home: home.team.displayName,
			away: away.team.displayName,
			homeLogo: home.team.logo,
			awayLogo: away.team.logo,
			homeScore: score(home.score),
			awayScore: score(away.score),
			status,
			clock: status === 'live' ? comp?.status?.type?.displayClock : undefined,
			kickoff: ev.date
		});
	}
	return out;
}

export function parsePaxgPrice(payload: unknown): { harga: number | null; change24h: number | null } {
	const r = parseLogamPrice(payload);
	return r.emas;
}

export function parseLogamPrice(payload: unknown): {
	emas: { harga: number | null; change24h: number | null };
	perak: { harga: number | null; change24h: number | null };
} {
	const j = (payload ?? {}) as Record<string, { idr?: number; idr_24h_change?: number }>;
	const toGram = (v?: number) => (Number.isFinite(v) ? (v as number) / 31.1034768 : null);
	const gold = j['pax-gold'];
	const silver = j['kinesis-silver'] ?? j['tether-silver'] ?? j['silver-token'];
	return {
		emas: {
			harga: gold && Number.isFinite(gold.idr) ? toGram(gold.idr) : null,
			change24h: gold && Number.isFinite(gold.idr_24h_change) ? gold.idr_24h_change! : null
		},
		perak: {
			harga: silver && Number.isFinite(silver.idr) ? toGram(silver.idr) : null,
			change24h: silver && Number.isFinite(silver.idr_24h_change) ? silver.idr_24h_change! : null
		}
	};
}

export function parseTheSportsDb(payload: unknown, league = 'Liga 1'): BolaMatch[] {
	const events = (payload as { events?: unknown[] })?.events;
	if (!Array.isArray(events)) return [];
	return events.flatMap((row) => {
		const e = row as { idEvent?: string; strHomeTeam?: string; strAwayTeam?: string; strHomeTeamBadge?: string; strAwayTeamBadge?: string; intHomeScore?: string | null; intAwayScore?: string | null; strTimestamp?: string; dateEvent?: string; strTime?: string; strStatus?: string };
		if (!e.strHomeTeam || !e.strAwayTeam) return [];
		const homeScore = e.intHomeScore != null && String(e.intHomeScore).trim() !== '' ? Number(e.intHomeScore) : null;
		const awayScore = e.intAwayScore != null && String(e.intAwayScore).trim() !== '' ? Number(e.intAwayScore) : null;
		const status: BolaMatch['status'] = homeScore == null && awayScore == null ? 'scheduled' : 'finished';
		const kickoff = e.strTimestamp ? new Date(e.strTimestamp).toISOString() : e.dateEvent && e.strTime ? new Date(`${e.dateEvent}T${e.strTime}Z`).toISOString() : undefined;
		return [{ id: e.idEvent ?? `${e.strHomeTeam}-${e.strAwayTeam}-${e.strTimestamp}`, liga: league, home: e.strHomeTeam, away: e.strAwayTeam, homeLogo: e.strHomeTeamBadge, awayLogo: e.strAwayTeamBadge, homeScore, awayScore, status, kickoff }];
	});
}

/** @deprecated pangan.go.id dihapus 2026-09-01 — pertahankan stub agar test lama tidak crash, jangan dipakai lagi. */
export function parsePanganPrice(payload: unknown): Array<{ id: string; nama: string; satuan: string; harga: number }> {
	if (!Array.isArray(payload)) return [];
	return payload.flatMap((row) => {
		const r = (row ?? {}) as Record<string, unknown>;
		const nama = String(r.komoditas ?? r.nama ?? '').trim();
		const harga = Number(r.harga ?? r.harga_konsumen ?? NaN);
		if (!nama || !Number.isFinite(harga)) return [];
		return [{ id: nama.toLowerCase().replace(/\s+/g, '-'), nama, satuan: String(r.satuan ?? 'kg'), harga }];
	}).slice(0, 8);
}
