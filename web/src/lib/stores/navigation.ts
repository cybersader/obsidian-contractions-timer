import { writable } from 'svelte/store';

/** Set to a tab index to request navigation. App.svelte watches and clears. */
export const tabRequest = writable<number | null>(null);

/** Set to a settings section ID to open hamburger menu scrolled to that section. */
export const settingsRequest = writable<string | null>(null);

/** Set to true to open hamburger menu to the sharing tab. */
export const shareRequest = writable<boolean>(false);
