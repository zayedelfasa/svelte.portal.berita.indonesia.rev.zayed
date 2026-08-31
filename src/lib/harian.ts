/**
 * Types Fitur Harian — dipakai server (lib/server/*.ts) & client (komponen/route).
 * Tidak boleh import apa pun dari $lib/server di sini.
 */
import type { Article } from './types';

/** Ringkasan pagi — hasil reuse pool berita (tanpa API baru) */
export interface BriefingData {
	items: Array<Article & { sourceName: string; sourceIndex: number }>;
	fetchedAt: string;
}

/** Gempa BMKG */
export interface GempaItem {
	tanggal: string;
	jam: string;
	/** ISO dari BMKG DateTime (yyyymmddHHmmss) atau null */
	isoTime: string | null;
	magnitude: number | null;
	kedalaman: string;
	wilayah: string;
	lintang: string;
	bujur: string;
	potensi: string;
}

export interface GempaData {
	items: GempaItem[];
	fetchedAt: string;
}

/** Harga harian (emas/sembako/BBM) */
export interface HargaItem {
	id: string;
	nama: string;
	grup: 'emas' | 'sembako' | 'bbm';
	satuan: string;
	/** null = sumber gagal → jangan tampil angka (no dummy) */
	harga: number | null;
	change24h: number | null;
	sumber: string;
	/** true = nilai estimasi (mis. emas via PAXG), wajib badge 'est' */
	estimasi?: boolean;
}

export interface HargaData {
	items: HargaItem[];
	fetchedAt: string;
}

/** Kalender Hijriah + hari libur terdekat */
export interface KalenderData {
	/** label siap tampil: "Jumat, 29 Agustus 2026" */
	gregorianLabel: string;
	/** label siap tampil: "12 Rabiul Awal 1447 H" */
	hijriLabel: string;
	/** libur terdekat dalam 30 hari, null jika tidak ada */
	holiday: { name: string; date: string; daysUntil: number; isLibur: boolean } | null;
}

/** Skor bola (ESPN EPL, Liga 1 Phase 2) */
export interface BolaMatch {
	id: string;
	liga: string;
	home: string;
	away: string;
	homeLogo?: string;
	awayLogo?: string;
	homeScore: number | null;
	awayScore: number | null;
	status: 'live' | 'finished' | 'scheduled';
	/** menit/detik tampil, mis. "67'" atau "HT" */
	clock?: string;
	/** ISO kickoff */
	kickoff?: string;
}

export interface BolaData {
	matches: BolaMatch[];
	fetchedAt: string;
}
