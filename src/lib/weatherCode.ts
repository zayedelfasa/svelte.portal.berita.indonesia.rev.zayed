/**
 * WMO Weather Code -> label Indonesia + emoji icon
 * Sumber: https://open-meteo.com/en/docs#weathervariables
 */
export interface WeatherCodeInfo {
	label: string;
	icon: string;
}

const CODE_MAP: Record<number, WeatherCodeInfo> = {
	0: { label: 'Cerah', icon: '☀️' },
	1: { label: 'Cerah Berawan', icon: '🌤️' },
	2: { label: 'Berawan', icon: '⛅' },
	3: { label: 'Mendung', icon: '☁️' },
	45: { label: 'Kabut', icon: '🌫️' },
	48: { label: 'Kabut Es', icon: '🌫️' },
	51: { label: 'Gerimis Ringan', icon: '🌦️' },
	53: { label: 'Gerimis', icon: '🌦️' },
	55: { label: 'Gerimis Lebat', icon: '🌧️' },
	56: { label: 'Gerimis Beku Ringan', icon: '🌧️' },
	57: { label: 'Gerimis Beku Lebat', icon: '🌧️' },
	61: { label: 'Hujan Ringan', icon: '🌧️' },
	63: { label: 'Hujan', icon: '🌧️' },
	65: { label: 'Hujan Lebat', icon: '🌧️' },
	66: { label: 'Hujan Beku Ringan', icon: '🌧️' },
	67: { label: 'Hujan Beku Lebat', icon: '🌧️' },
	71: { label: 'Salju Ringan', icon: '🌨️' },
	73: { label: 'Salju', icon: '🌨️' },
	75: { label: 'Salju Lebat', icon: '🌨️' },
	77: { label: 'Butiran Salju', icon: '🌨️' },
	80: { label: 'Hujan Rintik Ringan', icon: '🌦️' },
	81: { label: 'Hujan Rintik', icon: '🌧️' },
	82: { label: 'Hujan Rintik Lebat', icon: '⛈️' },
	85: { label: 'Hujan Salju Ringan', icon: '🌨️' },
	86: { label: 'Hujan Salju Lebat', icon: '🌨️' },
	95: { label: 'Petir', icon: '⛈️' },
	96: { label: 'Petir + Hujan Ringan', icon: '⛈️' },
	99: { label: 'Petir + Hujan Lebat', icon: '⛈️' }
};

export function getWeatherCodeInfo(code: number | null | undefined): WeatherCodeInfo {
	if (code == null || Number.isNaN(code)) return { label: '—', icon: '❓' };
	return CODE_MAP[code] ?? { label: `Kode ${code}`, icon: '🌡️' };
}
