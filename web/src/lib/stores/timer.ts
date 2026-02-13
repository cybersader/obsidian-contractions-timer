import { writable, derived } from 'svelte/store';
import type { TimerPhase } from '../labor-logic/types';
export type { TimerPhase };
import { isContractionActive } from '../labor-logic/calculations';
import { session } from './session';

/** Tick counter — incremented every 200ms by App.svelte's $effect */
export const tick = writable(0);

/** Start the global tick interval. Returns cleanup function. */
export function startTick(): () => void {
	const id = setInterval(() => {
		tick.update(n => n + 1);
	}, 200);
	return () => clearInterval(id);
}

/** Current timer phase derived from session state */
export const timerPhase = derived(session, ($s): TimerPhase => {
	if ($s.contractions.some(c => isContractionActive(c))) return 'contracting';
	if ($s.contractions.length > 0) return 'resting';
	return 'idle';
});
