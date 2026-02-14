/**
 * Dynamic Google Font loader — injects <link> elements on first use.
 * Fonts are loaded lazily when a "unique" (mid-tone) theme is selected.
 */

const loaded = new Set<string>();

const FONT_URLS: Record<string, string> = {
	'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
	'IBM Plex Mono': 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap',
	'Cinzel': 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap',
	'Quicksand': 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
	'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
	'Space Mono': 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
	'DM Sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
	'Space Grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
	'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap',
	'Fredoka': 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap',
};

export function loadFont(name: string): void {
	if (loaded.has(name) || !FONT_URLS[name]) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = FONT_URLS[name];
	document.head.appendChild(link);
	loaded.add(name);
}
