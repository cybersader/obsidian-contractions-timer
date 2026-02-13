export type ThemePalette = 'clinical' | 'soft' | 'warm' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'midnight' | 'sky' | 'blush';
export type ThemeMode = 'light' | 'dark';
export type ThemeId = `${ThemePalette}-${ThemeMode}`;

export interface ThemeInfo {
	id: ThemeId;
	palette: ThemePalette;
	mode: ThemeMode;
	label: string;
	metaColor: string; // for <meta name="theme-color">
}

export const THEMES: ThemeInfo[] = [
	{ id: 'clinical-dark', palette: 'clinical', mode: 'dark', label: 'Clinical', metaColor: '#0f172a' },
	{ id: 'clinical-light', palette: 'clinical', mode: 'light', label: 'Clinical', metaColor: '#f0f4f8' },
	{ id: 'soft-dark', palette: 'soft', mode: 'dark', label: 'Soft', metaColor: '#1a1625' },
	{ id: 'soft-light', palette: 'soft', mode: 'light', label: 'Soft', metaColor: '#f5f3ff' },
	{ id: 'warm-dark', palette: 'warm', mode: 'dark', label: 'Warm', metaColor: '#1c1917' },
	{ id: 'warm-light', palette: 'warm', mode: 'light', label: 'Warm', metaColor: '#fefce8' },
	{ id: 'ocean-dark', palette: 'ocean', mode: 'dark', label: 'Ocean', metaColor: '#0c1b2a' },
	{ id: 'ocean-light', palette: 'ocean', mode: 'light', label: 'Ocean', metaColor: '#e8f4f7' },
	{ id: 'forest-dark', palette: 'forest', mode: 'dark', label: 'Forest', metaColor: '#101a14' },
	{ id: 'forest-light', palette: 'forest', mode: 'light', label: 'Forest', metaColor: '#eef5e8' },
	{ id: 'sunset-dark', palette: 'sunset', mode: 'dark', label: 'Sunset', metaColor: '#1a1210' },
	{ id: 'sunset-light', palette: 'sunset', mode: 'light', label: 'Sunset', metaColor: '#fff7ed' },
	{ id: 'lavender-dark', palette: 'lavender', mode: 'dark', label: 'Lavender', metaColor: '#16101f' },
	{ id: 'lavender-light', palette: 'lavender', mode: 'light', label: 'Lavender', metaColor: '#faf5ff' },
	{ id: 'midnight-dark', palette: 'midnight', mode: 'dark', label: 'Midnight', metaColor: '#080d18' },
	{ id: 'midnight-light', palette: 'midnight', mode: 'light', label: 'Midnight', metaColor: '#eef2ff' },
	{ id: 'sky-dark', palette: 'sky', mode: 'dark', label: 'Sky', metaColor: '#0c1929' },
	{ id: 'sky-light', palette: 'sky', mode: 'light', label: 'Sky', metaColor: '#e8f4fd' },
	{ id: 'blush-dark', palette: 'blush', mode: 'dark', label: 'Blush', metaColor: '#1a0b14' },
	{ id: 'blush-light', palette: 'blush', mode: 'light', label: 'Blush', metaColor: '#fdf2f8' },
];

/** All palette names in display order */
export const PALETTES: ThemePalette[] = ['soft', 'clinical', 'warm', 'ocean', 'forest', 'sunset', 'lavender', 'midnight', 'sky', 'blush'];

const THEME_STORAGE_KEY = 'ct-theme';

export function getStoredTheme(): ThemeId {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored && THEMES.some(t => t.id === stored)) return stored as ThemeId;
	} catch { /* ignore */ }

	// Default: detect system preference, use soft palette
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'soft-dark' : 'soft-light';
}

export function setTheme(id: ThemeId): void {
	const theme = THEMES.find(t => t.id === id);
	if (!theme) return;

	document.documentElement.setAttribute('data-theme', id);
	localStorage.setItem(THEME_STORAGE_KEY, id);

	// Update meta theme-color
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) meta.setAttribute('content', theme.metaColor);
}

export function getThemeInfo(id: ThemeId): ThemeInfo | undefined {
	return THEMES.find(t => t.id === id);
}

/** Palette preview colors for the theme picker */
export const PALETTE_PREVIEWS: Record<ThemePalette, { primary: string; accent: string; bg: string; bgLight: string }> = {
	clinical: { primary: '#3b82f6', accent: '#0ea5e9', bg: '#0f172a', bgLight: '#f0f4f8' },
	soft: { primary: '#818cf8', accent: '#a78bfa', bg: '#1a1625', bgLight: '#f5f3ff' },
	warm: { primary: '#d97706', accent: '#ea580c', bg: '#1c1917', bgLight: '#fefce8' },
	ocean: { primary: '#2dd4bf', accent: '#14b8a6', bg: '#0c1b2a', bgLight: '#e8f4f7' },
	forest: { primary: '#86efac', accent: '#4ade80', bg: '#101a14', bgLight: '#eef5e8' },
	sunset: { primary: '#fb923c', accent: '#f97316', bg: '#1a1210', bgLight: '#fff7ed' },
	lavender: { primary: '#c084fc', accent: '#a855f7', bg: '#16101f', bgLight: '#faf5ff' },
	midnight: { primary: '#60a5fa', accent: '#3b82f6', bg: '#080d18', bgLight: '#eef2ff' },
	sky: { primary: '#38bdf8', accent: '#0284c7', bg: '#0c1929', bgLight: '#e8f4fd' },
	blush: { primary: '#f472b6', accent: '#db2777', bg: '#1a0b14', bgLight: '#fdf2f8' },
};
