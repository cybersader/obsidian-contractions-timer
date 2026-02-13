/**
 * SDP Compression for Private Connect.
 *
 * Compresses WebRTC SDP offers/answers into short codes (~100-300 chars)
 * suitable for QR codes and copy-paste exchange.
 *
 * Strategy:
 * 1. Extract only essential fields: ICE ufrag, ICE pwd, DTLS fingerprint, ICE candidates
 * 2. Binary-pack the data
 * 3. Base64url encode
 *
 * Without STUN servers, only host/local candidates are gathered (e.g., 192.168.x.x),
 * keeping codes short. Works on same WiFi network.
 */

function debug(...args: unknown[]) { console.debug('[sdp-compress]', ...args); }

/** Compressed SDP fields */
interface SDPFields {
	type: 'offer' | 'answer';
	ufrag: string;
	pwd: string;
	fingerprint: string; // hex string (SHA-256 = 64 hex chars)
	candidates: ParsedCandidate[];
}

interface ParsedCandidate {
	foundation: string;
	component: number;
	protocol: string; // 'udp' or 'tcp'
	priority: number;
	ip: string;
	port: number;
	type: string; // 'host', 'srflx', 'relay'
}

/** Extract essential fields from an SDP string */
function parseSDP(sdp: string, type: 'offer' | 'answer'): SDPFields {
	const lines = sdp.split('\r\n').length > 1 ? sdp.split('\r\n') : sdp.split('\n');

	let ufrag = '';
	let pwd = '';
	let fingerprint = '';
	const candidates: ParsedCandidate[] = [];

	for (const line of lines) {
		if (line.startsWith('a=ice-ufrag:')) {
			ufrag = line.slice('a=ice-ufrag:'.length);
		} else if (line.startsWith('a=ice-pwd:')) {
			pwd = line.slice('a=ice-pwd:'.length);
		} else if (line.startsWith('a=fingerprint:')) {
			// Format: a=fingerprint:sha-256 AA:BB:CC:...
			const parts = line.slice('a=fingerprint:'.length).split(' ');
			if (parts.length >= 2) {
				fingerprint = parts[1].replace(/:/g, '').toLowerCase();
			}
		} else if (line.startsWith('a=candidate:')) {
			const parsed = parseCandidate(line);
			if (parsed) candidates.push(parsed);
		}
	}

	debug('Parsed SDP:', { type, ufrag, pwd: pwd.length + ' chars', fingerprint: fingerprint.length + ' hex', candidates: candidates.length });

	return { type, ufrag, pwd, fingerprint, candidates };
}

function parseCandidate(line: string): ParsedCandidate | null {
	// a=candidate:foundation component protocol priority ip port typ type ...
	const match = line.match(
		/^a=candidate:(\S+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(\d+)\s+typ\s+(\S+)/
	);
	if (!match) return null;

	return {
		foundation: match[1],
		component: parseInt(match[2], 10),
		protocol: match[3].toLowerCase(),
		priority: parseInt(match[4], 10),
		ip: match[5],
		port: parseInt(match[6], 10),
		type: match[7],
	};
}

/** Reconstruct a minimal valid SDP from compressed fields */
function buildSDP(fields: SDPFields): string {
	const fp = fields.fingerprint.match(/.{2}/g)?.join(':').toUpperCase() || '';

	const lines: string[] = [
		'v=0',
		'o=- 0 0 IN IP4 0.0.0.0',
		's=-',
		't=0 0',
		// Bundle and data channel
		'a=group:BUNDLE 0',
		'a=msid-semantic: WMS',
		'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
		'c=IN IP4 0.0.0.0',
		'a=mid:0',
		'a=sctp-port:5000',
		'a=max-message-size:262144',
		`a=ice-ufrag:${fields.ufrag}`,
		`a=ice-pwd:${fields.pwd}`,
		'a=ice-options:trickle',
		`a=fingerprint:sha-256 ${fp}`,
		fields.type === 'offer' ? 'a=setup:actpass' : 'a=setup:active',
	];

	for (const c of fields.candidates) {
		lines.push(
			`a=candidate:${c.foundation} ${c.component} ${c.protocol} ${c.priority} ${c.ip} ${c.port} typ ${c.type}`
		);
	}

	return lines.join('\r\n') + '\r\n';
}

// --- Encoding / Decoding ---

/** Encode SDPFields into a compact binary format, then base64url */
function encodeFields(fields: SDPFields): string {
	const parts: string[] = [];

	// Version byte + type (1 char: 'o' or 'a')
	parts.push(fields.type === 'offer' ? '1o' : '1a');

	// Ufrag and pwd (variable length, separated by '.')
	parts.push(fields.ufrag);
	parts.push(fields.pwd);

	// Fingerprint (64 hex chars for SHA-256)
	parts.push(fields.fingerprint);

	// Candidates count
	parts.push(String(fields.candidates.length));

	// Each candidate: protocol|priority|ip|port|type
	for (const c of fields.candidates) {
		parts.push(`${c.protocol}|${c.priority}|${c.ip}|${c.port}|${c.type}`);
	}

	const raw = parts.join('\n');
	return toBase64Url(raw);
}

/** Decode base64url string back into SDPFields */
function decodeFields(code: string): SDPFields {
	const raw = fromBase64Url(code);
	const parts = raw.split('\n');

	const header = parts[0];
	const type = header.endsWith('o') ? 'offer' : 'answer';

	const ufrag = parts[1];
	const pwd = parts[2];
	const fingerprint = parts[3];
	const candidateCount = parseInt(parts[4], 10);

	const candidates: ParsedCandidate[] = [];
	for (let i = 0; i < candidateCount; i++) {
		const [protocol, priority, ip, port, ctype] = parts[5 + i].split('|');
		candidates.push({
			foundation: String(i + 1),
			component: 1,
			protocol,
			priority: parseInt(priority, 10),
			ip,
			port: parseInt(port, 10),
			type: ctype,
		});
	}

	return { type: type as 'offer' | 'answer', ufrag, pwd, fingerprint, candidates };
}

// --- Base64url helpers ---

function toBase64Url(str: string): string {
	const bytes = new TextEncoder().encode(str);
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): string {
	let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
	// Pad with '=' to make length a multiple of 4
	while (b64.length % 4) b64 += '=';
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder().decode(bytes);
}

// --- Public API ---

/** Compress an SDP offer into a short code string */
export function compressOffer(sdp: string): string {
	const fields = parseSDP(sdp, 'offer');
	const code = encodeFields(fields);
	debug('Compressed offer:', sdp.length, 'chars →', code.length, 'chars');
	return code;
}

/** Decompress an offer code back into a valid SDP string */
export function decompressOffer(code: string): string {
	const fields = decodeFields(code);
	if (fields.type !== 'offer') {
		throw new Error('Expected offer code, got answer');
	}
	return buildSDP(fields);
}

/** Compress an SDP answer into a short code string */
export function compressAnswer(sdp: string): string {
	const fields = parseSDP(sdp, 'answer');
	const code = encodeFields(fields);
	debug('Compressed answer:', sdp.length, 'chars →', code.length, 'chars');
	return code;
}

/** Decompress an answer code back into a valid SDP string */
export function decompressAnswer(code: string): string {
	const fields = decodeFields(code);
	if (fields.type !== 'answer') {
		throw new Error('Expected answer code, got offer');
	}
	return buildSDP(fields);
}
