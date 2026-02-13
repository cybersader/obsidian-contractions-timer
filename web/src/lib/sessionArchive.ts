import type { SessionData } from './labor-logic/types';
import { loadSession, saveSession, clearAllData } from './storage';
import { EMPTY_SESSION } from './labor-logic/types';

const ARCHIVE_PREFIX = 'ct-archive-';

export interface ArchiveEntry {
	key: string;
	date: string;
	contractionCount: number;
	summary: string;
}

export function archiveSession(): void {
	const session = loadSession();
	if (!session || session.contractions.length === 0) return;
	const now = Date.now();
	// Prevent duplicate archives within 5 seconds
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (!key?.startsWith(ARCHIVE_PREFIX)) continue;
		const ts = parseInt(key.slice(ARCHIVE_PREFIX.length), 10);
		if (now - ts < 5000) return;
	}
	const key = `${ARCHIVE_PREFIX}${now}`;
	localStorage.setItem(key, JSON.stringify(session));
}

export function listArchives(): ArchiveEntry[] {
	const entries: ArchiveEntry[] = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (!key || !key.startsWith(ARCHIVE_PREFIX)) continue;
		try {
			const raw = localStorage.getItem(key);
			if (!raw) continue;
			const data: SessionData = JSON.parse(raw);
			const ts = parseInt(key.slice(ARCHIVE_PREFIX.length), 10);
			const date = new Date(ts).toLocaleDateString(undefined, {
				month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
			});
			const count = data.contractions.filter(c => c.end !== null).length;
			entries.push({ key, date, contractionCount: count, summary: `${count} contractions` });
		} catch { /* skip corrupt entries */ }
	}
	return entries.sort((a, b) => b.key.localeCompare(a.key));
}

export function restoreArchive(key: string): SessionData | null {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const data: SessionData = JSON.parse(raw);
		saveSession(data);
		return data;
	} catch {
		return null;
	}
}

export function deleteArchive(key: string): void {
	localStorage.removeItem(key);
}

export function getArchiveCount(): number {
	let count = 0;
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.startsWith(ARCHIVE_PREFIX)) count++;
	}
	return count;
}

export function newSession(): void {
	archiveSession();
	clearAllData();
}
