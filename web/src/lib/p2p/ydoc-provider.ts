/**
 * Minimal Y.js sync provider over an RTCDataChannel.
 *
 * Handles:
 * - Initial sync (sync step 1 + step 2 exchange on channel open)
 * - Incremental updates (Y.Doc update → send over channel)
 * - Incoming updates (channel message → apply to Y.Doc)
 *
 * Works for both Quick and Private connect modes — any reliable
 * ordered channel can be used.
 */

import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

// Always log — P2P events are infrequent and critical for debugging
function debug(...args: unknown[]) { console.debug('[ydoc-provider]', ...args); }

/** Message types sent over the data channel */
const MSG_SYNC = 0;
const MSG_UPDATE = 1;

export class DataChannelProvider {
	private doc: Y.Doc;
	private channel: RTCDataChannel;
	private synced = false;
	private updateHandler: (update: Uint8Array, origin: unknown) => void;
	private messageHandler: (event: MessageEvent) => void;
	private destroyed = false;

	constructor(doc: Y.Doc, channel: RTCDataChannel) {
		this.doc = doc;
		this.channel = channel;

		// Send local Y.Doc updates to remote
		this.updateHandler = (update: Uint8Array, origin: unknown) => {
			if (origin === this || this.destroyed) return;
			this.sendUpdate(update);
		};
		doc.on('update', this.updateHandler);

		// Receive messages from remote
		this.messageHandler = (event: MessageEvent) => {
			if (this.destroyed) return;
			this.handleMessage(event.data);
		};
		channel.binaryType = 'arraybuffer';
		channel.addEventListener('message', this.messageHandler);

		// Start sync if channel is already open
		if (channel.readyState === 'open') {
			this.startSync();
		} else {
			channel.addEventListener('open', () => this.startSync(), { once: true });
		}

		debug('DataChannelProvider created');
	}

	/** Initiate Y.js sync protocol */
	private startSync(): void {
		debug('Starting Y.js sync...');
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, MSG_SYNC);
		syncProtocol.writeSyncStep1(encoder, this.doc);
		this.send(encoding.toUint8Array(encoder));
	}

	/** Handle incoming message from remote */
	private handleMessage(data: ArrayBuffer | Uint8Array): void {
		const buf = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
		const decoder = decoding.createDecoder(buf);
		const msgType = decoding.readVarUint(decoder);

		switch (msgType) {
			case MSG_SYNC: {
				const encoder = encoding.createEncoder();
				encoding.writeVarUint(encoder, MSG_SYNC);
				const syncMessageType = syncProtocol.readSyncMessage(
					decoder, encoder, this.doc, this
				);
				if (encoding.length(encoder) > 1) {
					this.send(encoding.toUint8Array(encoder));
				}
				if (syncMessageType === 0 /* SyncStep1 */) {
					debug('Received SyncStep1, sent SyncStep2');
				} else if (syncMessageType === 1 /* SyncStep2 */) {
					if (!this.synced) {
						this.synced = true;
						debug('Initial sync complete');
					}
				}
				break;
			}
			case MSG_UPDATE: {
				const update = decoding.readVarUint8Array(decoder);
				Y.applyUpdate(this.doc, update, this);
				debug('Applied remote update,', update.length, 'bytes');
				break;
			}
			default:
				debug('Unknown message type:', msgType);
		}
	}

	/** Send a Y.Doc update to remote */
	private sendUpdate(update: Uint8Array): void {
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, MSG_UPDATE);
		encoding.writeVarUint8Array(encoder, update);
		this.send(encoding.toUint8Array(encoder));
	}

	/** Send raw bytes over the data channel */
	private send(data: Uint8Array): void {
		if (this.channel.readyState !== 'open') {
			debug('Cannot send — channel not open');
			return;
		}
		try {
			this.channel.send(data);
		} catch (e) {
			debug('Send failed:', e);
		}
	}

	/** Clean up listeners */
	destroy(): void {
		if (this.destroyed) return;
		this.destroyed = true;
		this.doc.off('update', this.updateHandler);
		this.channel.removeEventListener('message', this.messageHandler);
		debug('DataChannelProvider destroyed');
	}
}
