import { writable } from 'svelte/store';
import type { SessionData, ContractionTimerSettings } from './labor-logic/types';

const SESSION_KEY = 'contractions-timer-data';
const SETTINGS_KEY = 'contractions-timer-settings';

/** Reactive store for storage errors. Components can subscribe to show warnings. */
export const storageError = writable<string | null>(null);

let errorTimeout: ReturnType<typeof setTimeout> | undefined;

function setStorageError(msg: string) {
	storageError.set(msg);
	clearTimeout(errorTimeout);
	errorTimeout = setTimeout(() => storageError.set(null), 5000);
}

export function loadSession(): SessionData | null {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as SessionData;
	} catch {
		return null;
	}
}

export function saveSession(data: SessionData): void {
	try {
		localStorage.setItem(SESSION_KEY, JSON.stringify(data));
	} catch (e) {
		setStorageError('Could not save session — storage may be full');
	}
}

export function loadSettings(): Partial<ContractionTimerSettings> | null {
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function saveSettings(s: ContractionTimerSettings): void {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
	} catch (e) {
		setStorageError('Could not save settings — storage may be full');
	}
}

export function clearAllData(): void {
	localStorage.removeItem(SESSION_KEY);
	localStorage.removeItem(SETTINGS_KEY);
	localStorage.removeItem('ct-dismissed-tips');
}

export function exportData(): string {
	const session = loadSession();
	const settings = loadSettings();
	return JSON.stringify({ session, settings }, null, 2);
}

export function importData(json: string): SessionData {
	const parsed = JSON.parse(json);
	if (!parsed.session || typeof parsed.session !== 'object') {
		throw new Error('Invalid data: missing session object');
	}
	if (!Array.isArray(parsed.session.contractions)) {
		throw new Error('Invalid data: session.contractions must be an array');
	}
	if (!Array.isArray(parsed.session.events)) {
		throw new Error('Invalid data: session.events must be an array');
	}
	saveSession(parsed.session);
	return parsed.session;
}
