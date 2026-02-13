/**
 * Human-readable room code generator.
 * Format: adjective-noun-number (e.g., "blue-tiger-42")
 * ~4 million combinations (200 x 200 x 100).
 */

const ADJECTIVES = [
	'amber', 'aqua', 'azure', 'berry', 'birch', 'blaze', 'bloom', 'blue',
	'bold', 'brave', 'breeze', 'bright', 'calm', 'cedar', 'cherry', 'clear',
	'cloud', 'coast', 'cool', 'coral', 'cozy', 'crisp', 'dawn', 'deep',
	'dream', 'dusk', 'dusty', 'early', 'fern', 'fiery', 'fleet', 'floral',
	'fresh', 'frost', 'gentle', 'glow', 'gold', 'grand', 'green', 'happy',
	'hazy', 'honey', 'ice', 'ivory', 'jade', 'keen', 'kind', 'lake',
	'late', 'leaf', 'lemon', 'light', 'lilac', 'lily', 'lime', 'linen',
	'lively', 'lunar', 'maple', 'mellow', 'mild', 'mint', 'misty', 'moon',
	'mossy', 'navy', 'neat', 'noble', 'north', 'oaken', 'olive', 'opal',
	'open', 'pale', 'palm', 'peach', 'pearl', 'pine', 'pink', 'plum',
	'polar', 'pure', 'quick', 'quiet', 'rain', 'rapid', 'rare', 'reed',
	'rich', 'river', 'rose', 'rosy', 'royal', 'ruby', 'rustic', 'sage',
	'sandy', 'satin', 'sea', 'serene', 'shore', 'silk', 'silver', 'sky',
	'slate', 'slim', 'slow', 'smoky', 'snowy', 'soft', 'solar', 'south',
	'spice', 'spring', 'star', 'steel', 'stone', 'storm', 'sunny', 'super',
	'sweet', 'swift', 'teal', 'tender', 'terra', 'tidal', 'timber', 'tiny',
	'topaz', 'trail', 'tulip', 'turbo', 'upper', 'urban', 'vast', 'velvet',
	'verde', 'vine', 'violet', 'vivid', 'warm', 'wave', 'west', 'wheat',
	'white', 'wide', 'wild', 'willow', 'wind', 'winter', 'wise', 'wood',
	'young', 'zen', 'lunar', 'flora', 'ocean', 'river', 'solar', 'frost',
	'ember', 'haven', 'crest', 'bloom', 'drift', 'gleam', 'ridge', 'brook',
	'spark', 'shade', 'bliss', 'charm', 'grace', 'peace', 'trust', 'light',
	'vapor', 'dew', 'atlas', 'aspen', 'bay', 'birch', 'cliff', 'cove',
	'dale', 'delta', 'field', 'fjord', 'glen', 'grove', 'heath', 'hill',
	'isle', 'knoll', 'marsh', 'mesa', 'peak', 'plain', 'ridge', 'vale',
];

const NOUNS = [
	'acorn', 'arch', 'arrow', 'atlas', 'aurora', 'badge', 'basin', 'beach',
	'beacon', 'bear', 'bell', 'berry', 'birch', 'bird', 'bloom', 'boat',
	'branch', 'breeze', 'bridge', 'brook', 'bunny', 'cabin', 'candle',
	'canyon', 'cave', 'charm', 'cherry', 'cliff', 'cloud', 'coast', 'comet',
	'coral', 'crane', 'creek', 'crown', 'daisy', 'dawn', 'deer', 'delta',
	'dove', 'dream', 'dune', 'eagle', 'echo', 'elm', 'ember', 'fawn',
	'feather', 'fern', 'finch', 'flame', 'flower', 'forest', 'fox', 'frost',
	'garden', 'gem', 'glade', 'glen', 'grove', 'harbor', 'hare', 'haven',
	'hawk', 'heart', 'heron', 'hill', 'holly', 'honey', 'isle', 'ivy',
	'jewel', 'kayak', 'kitten', 'lake', 'lark', 'leaf', 'light', 'lily',
	'lion', 'lotus', 'lynx', 'maple', 'marsh', 'meadow', 'mesa', 'mist',
	'moon', 'moth', 'mount', 'nest', 'north', 'ocean', 'orchid', 'otter',
	'owl', 'palm', 'panda', 'path', 'peach', 'pearl', 'pebble', 'pine',
	'plum', 'pond', 'poppy', 'prism', 'quail', 'rain', 'raven', 'reef',
	'ridge', 'river', 'robin', 'rose', 'sage', 'sand', 'seal', 'shell',
	'shore', 'sky', 'snow', 'south', 'spark', 'spring', 'star', 'stone',
	'storm', 'stream', 'sun', 'swan', 'tide', 'tiger', 'trail', 'tree',
	'tulip', 'turtle', 'vale', 'valley', 'vine', 'violet', 'wave', 'whale',
	'willow', 'wind', 'wolf', 'wren', 'aspen', 'bass', 'bluff', 'cape',
	'cedar', 'cinder', 'clover', 'crest', 'drift', 'dusk', 'field', 'finch',
	'glow', 'grain', 'heath', 'jade', 'key', 'knoll', 'linen', 'maple',
	'mango', 'oasis', 'olive', 'onyx', 'peak', 'petal', 'pixel', 'plain',
	'plume', 'quartz', 'sail', 'shade', 'slate', 'sprout', 'summit', 'surf',
	'terra', 'thistle', 'torch', 'trout', 'vista', 'wheat', 'wing', 'yarn',
	'zenith', 'zephyr', 'bloom', 'harbor', 'lantern', 'meadow', 'opal', 'pines',
];

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a human-readable room code like "blue-tiger-42" */
export function generateRoomCode(): string {
	const adj = randomItem(ADJECTIVES);
	const noun = randomItem(NOUNS);
	const num = Math.floor(Math.random() * 100);
	return `${adj}-${noun}-${num.toString().padStart(2, '0')}`;
}

/** Validate that a string looks like a valid room code */
export function isValidRoomCode(code: string): boolean {
	return /^[a-z]+-[a-z]+-\d{2}$/.test(code);
}

/** Generate a friendly display name like "Amber" or "Breeze" */
export function generateDisplayName(): string {
	const adj = randomItem(ADJECTIVES);
	return adj.charAt(0).toUpperCase() + adj.slice(1);
}

/** Generate a passphrase like "calm-ember-frost-42" */
export function generatePassphrase(): string {
	const w1 = randomItem(ADJECTIVES);
	const w2 = randomItem(NOUNS);
	const w3 = randomItem(NOUNS);
	const num = Math.floor(Math.random() * 100);
	return `${w1}-${w2}-${w3}-${num.toString().padStart(2, '0')}`;
}
