/**
 * Y.js document structure mapping SessionData to CRDT types.
 *
 * Y.Doc
 * ├── Y.Array<Y.Map> "contractions"
 * ├── Y.Array<Y.Map> "events"
 * └── Y.Map "meta"  (sessionStartedAt, paused, layout)
 */

import * as Y from 'yjs';
import type { SessionData, Contraction, LaborEvent, SectionId } from '../labor-logic/types';

/** Initialize a Y.Doc from existing SessionData */
export function createYDoc(data: SessionData): Y.Doc {
	const doc = new Y.Doc();
	const contractions = doc.getArray<Y.Map<unknown>>('contractions');
	const events = doc.getArray<Y.Map<unknown>>('events');
	const meta = doc.getMap('meta');

	doc.transact(() => {
		for (const c of data.contractions) {
			contractions.push([contractionToYMap(doc, c)]);
		}
		for (const e of data.events) {
			events.push([eventToYMap(doc, e)]);
		}
		meta.set('sessionStartedAt', data.sessionStartedAt);
		meta.set('paused', data.paused);
		meta.set('layout', data.layout);
	});

	return doc;
}

/** Convert Y.Doc back to SessionData */
export function yDocToSession(doc: Y.Doc): SessionData {
	const contractions = doc.getArray<Y.Map<unknown>>('contractions');
	const events = doc.getArray<Y.Map<unknown>>('events');
	const meta = doc.getMap('meta');

	return {
		contractions: contractions.toArray().map(yMapToContraction),
		events: events.toArray().map(yMapToEvent),
		sessionStartedAt: (meta.get('sessionStartedAt') as string | null) ?? null,
		paused: (meta.get('paused') as boolean) ?? false,
		layout: (meta.get('layout') as SectionId[]) ?? [],
	};
}

/**
 * Diff oldSession vs newSession and apply changes to Y.Doc.
 * Used for local → remote sync.
 */
export function applySessionDelta(
	doc: Y.Doc,
	oldSession: SessionData,
	newSession: SessionData
): void {
	const yContractions = doc.getArray<Y.Map<unknown>>('contractions');
	const yEvents = doc.getArray<Y.Map<unknown>>('events');
	const meta = doc.getMap('meta');

	doc.transact(() => {
		// Sync contractions
		syncArray(
			doc,
			yContractions,
			oldSession.contractions,
			newSession.contractions,
			(c) => c.id,
			contractionToYMap,
			applyContractionDelta
		);

		// Sync events
		syncArray(
			doc,
			yEvents,
			oldSession.events,
			newSession.events,
			(e) => e.id,
			eventToYMap,
			applyEventDelta
		);

		// Sync meta
		if (newSession.sessionStartedAt !== oldSession.sessionStartedAt) {
			meta.set('sessionStartedAt', newSession.sessionStartedAt);
		}
		if (newSession.paused !== oldSession.paused) {
			meta.set('paused', newSession.paused);
		}
		if (JSON.stringify(newSession.layout) !== JSON.stringify(oldSession.layout)) {
			meta.set('layout', newSession.layout);
		}
	});
}

/** Watch for remote Y.Doc changes and invoke callback with new SessionData */
export function observeYDoc(doc: Y.Doc, callback: (data: SessionData) => void): () => void {
	const handler = () => {
		callback(yDocToSession(doc));
	};

	const contractions = doc.getArray('contractions');
	const events = doc.getArray('events');
	const meta = doc.getMap('meta');

	contractions.observeDeep(handler);
	events.observeDeep(handler);
	meta.observeDeep(handler);

	return () => {
		contractions.unobserveDeep(handler);
		events.unobserveDeep(handler);
		meta.unobserveDeep(handler);
	};
}

// --- Helpers ---

function contractionToYMap(doc: Y.Doc, c: Contraction): Y.Map<unknown> {
	const m = new Y.Map<unknown>();
	m.set('id', c.id);
	m.set('start', c.start);
	m.set('end', c.end);
	m.set('intensity', c.intensity);
	m.set('location', c.location);
	m.set('notes', c.notes);
	if (c.untimed) m.set('untimed', true);
	if (c.ratingDismissed) m.set('ratingDismissed', true);
	if (c.phases) m.set('phases', c.phases);
	return m;
}

function yMapToContraction(m: Y.Map<unknown>): Contraction {
	return {
		id: m.get('id') as string,
		start: m.get('start') as string,
		end: (m.get('end') as string | null) ?? null,
		intensity: (m.get('intensity') as number | null) ?? null,
		location: (m.get('location') as Contraction['location']) ?? null,
		notes: (m.get('notes') as string) ?? '',
		untimed: (m.get('untimed') as boolean) ?? undefined,
		ratingDismissed: (m.get('ratingDismissed') as boolean) ?? undefined,
		phases: (m.get('phases') as Contraction['phases']) ?? undefined,
	};
}

function eventToYMap(doc: Y.Doc, e: LaborEvent): Y.Map<unknown> {
	const m = new Y.Map<unknown>();
	m.set('id', e.id);
	m.set('type', e.type);
	m.set('timestamp', e.timestamp);
	m.set('notes', e.notes);
	return m;
}

function yMapToEvent(m: Y.Map<unknown>): LaborEvent {
	return {
		id: m.get('id') as string,
		type: m.get('type') as LaborEvent['type'],
		timestamp: m.get('timestamp') as string,
		notes: (m.get('notes') as string) ?? '',
	};
}

function applyContractionDelta(yMap: Y.Map<unknown>, oldC: Contraction, newC: Contraction): void {
	if (newC.start !== oldC.start) yMap.set('start', newC.start);
	if (newC.end !== oldC.end) yMap.set('end', newC.end);
	if (newC.intensity !== oldC.intensity) yMap.set('intensity', newC.intensity);
	if (newC.location !== oldC.location) yMap.set('location', newC.location);
	if (newC.notes !== oldC.notes) yMap.set('notes', newC.notes);
	if (newC.untimed !== oldC.untimed) yMap.set('untimed', newC.untimed ?? false);
	if (newC.ratingDismissed !== oldC.ratingDismissed) yMap.set('ratingDismissed', newC.ratingDismissed ?? false);
	if (JSON.stringify(newC.phases) !== JSON.stringify(oldC.phases)) yMap.set('phases', newC.phases ?? null);
}

function applyEventDelta(yMap: Y.Map<unknown>, oldE: LaborEvent, newE: LaborEvent): void {
	if (newE.timestamp !== oldE.timestamp) yMap.set('timestamp', newE.timestamp);
	if (newE.notes !== oldE.notes) yMap.set('notes', newE.notes);
	if (newE.type !== oldE.type) yMap.set('type', newE.type);
}

/**
 * Generic array sync: handles additions, removals, and in-place updates.
 * Matches items by their ID field.
 */
function syncArray<T>(
	doc: Y.Doc,
	yArr: Y.Array<Y.Map<unknown>>,
	oldItems: T[],
	newItems: T[],
	getId: (item: T) => string,
	toYMap: (doc: Y.Doc, item: T) => Y.Map<unknown>,
	applyDelta: (yMap: Y.Map<unknown>, oldItem: T, newItem: T) => void
): void {
	const oldIds = oldItems.map(getId);
	const newIds = newItems.map(getId);
	const oldMap = new Map(oldItems.map(item => [getId(item), item]));

	// Remove items no longer present (iterate backwards to keep indices stable)
	for (let i = oldIds.length - 1; i >= 0; i--) {
		if (!newIds.includes(oldIds[i])) {
			yArr.delete(i, 1);
		}
	}

	// Build index of current Y.Array items after removals
	const currentYIds: string[] = [];
	for (let i = 0; i < yArr.length; i++) {
		currentYIds.push(yArr.get(i).get('id') as string);
	}

	// Update existing and add new items
	for (let i = 0; i < newItems.length; i++) {
		const id = newIds[i];
		const yIdx = currentYIds.indexOf(id);

		if (yIdx >= 0) {
			// Item exists — apply field-level delta
			const oldItem = oldMap.get(id);
			if (oldItem) {
				applyDelta(yArr.get(yIdx), oldItem, newItems[i]);
			}
		} else {
			// New item — insert at correct position
			const yMap = toYMap(doc, newItems[i]);
			if (i >= yArr.length) {
				yArr.push([yMap]);
			} else {
				yArr.insert(i, [yMap]);
			}
			currentYIds.splice(i, 0, id);
		}
	}
}
