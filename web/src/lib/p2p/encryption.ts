/**
 * Password-based encryption for P2P sessions.
 * Uses Web Crypto API: PBKDF2 key derivation + AES-256-GCM.
 */

const PBKDF2_ITERATIONS = 100_000;

/** Derive a deterministic salt from the room code (so both peers get the same key). */
async function roomSalt(roomCode: string): Promise<Uint8Array> {
	const encoded = new TextEncoder().encode(roomCode);
	const hash = await crypto.subtle.digest('SHA-256', encoded);
	return new Uint8Array(hash);
}

/** Derive a 256-bit AES key from a password + room code. */
export async function deriveKey(password: string, roomCode: string): Promise<CryptoKey> {
	const salt = await roomSalt(roomCode);
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-256',
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypt a Uint8Array payload.
 * Returns: 12-byte IV + ciphertext + 16-byte auth tag (AES-GCM default).
 */
export async function encrypt(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		data
	);
	// Prepend IV to ciphertext
	const result = new Uint8Array(iv.length + ciphertext.byteLength);
	result.set(iv, 0);
	result.set(new Uint8Array(ciphertext), iv.length);
	return result;
}

/**
 * Decrypt a payload produced by encrypt().
 * Returns null if decryption fails (wrong password).
 */
export async function decrypt(key: CryptoKey, data: Uint8Array): Promise<Uint8Array | null> {
	if (data.length < 13) return null; // IV (12) + at least 1 byte
	const iv = data.slice(0, 12);
	const ciphertext = data.slice(12);
	try {
		const plaintext = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv },
			key,
			ciphertext
		);
		return new Uint8Array(plaintext);
	} catch {
		return null; // Decryption failed — wrong password
	}
}
