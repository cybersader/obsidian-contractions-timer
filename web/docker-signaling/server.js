#!/usr/bin/env node

/**
 * y-webrtc compatible signaling server.
 * Self-contained — no external dependencies besides 'ws'.
 *
 * Protocol (JSON over WebSocket):
 *   { type: "subscribe", topics: ["room-name"] }
 *   { type: "unsubscribe", topics: ["room-name"] }
 *   { type: "publish", topic: "room-name", ... }
 *   { type: "ping" } → { type: "pong" }
 *
 * Deploy: docker compose up  (see docker-compose.yml)
 * Local:  PORT=4444 node server.js
 */

const { WebSocketServer } = require('ws');
const http = require('http');

const port = process.env.PORT || 4444;
const pingTimeout = 30000;

/** @type {Map<string, Set<WebSocket>>} topic → subscribers */
const topics = new Map();

const server = http.createServer((_req, res) => {
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.end('y-webrtc signaling server');
});

const wss = new WebSocketServer({ noServer: true });

function send(conn, message) {
	if (conn.readyState !== 0 && conn.readyState !== 1) {
		conn.close();
		return;
	}
	try {
		conn.send(JSON.stringify(message));
	} catch {
		conn.close();
	}
}

function onConnection(conn) {
	const subscribedTopics = new Set();
	let closed = false;
	let pongReceived = true;

	const pingInterval = setInterval(() => {
		if (!pongReceived) {
			conn.close();
			clearInterval(pingInterval);
		} else {
			pongReceived = false;
			try { conn.ping(); } catch { conn.close(); }
		}
	}, pingTimeout);

	conn.on('pong', () => { pongReceived = true; });

	conn.on('close', () => {
		closed = true;
		clearInterval(pingInterval);
		for (const topicName of subscribedTopics) {
			const subs = topics.get(topicName);
			if (subs) {
				subs.delete(conn);
				if (subs.size === 0) topics.delete(topicName);
			}
		}
		subscribedTopics.clear();
	});

	conn.on('message', (raw) => {
		let message;
		try {
			message = JSON.parse(typeof raw === 'string' ? raw : raw.toString());
		} catch { return; }

		if (!message || !message.type || closed) return;

		switch (message.type) {
			case 'subscribe':
				for (const topicName of (message.topics || [])) {
					if (typeof topicName !== 'string') continue;
					let subs = topics.get(topicName);
					if (!subs) {
						subs = new Set();
						topics.set(topicName, subs);
					}
					subs.add(conn);
					subscribedTopics.add(topicName);
				}
				break;

			case 'unsubscribe':
				for (const topicName of (message.topics || [])) {
					const subs = topics.get(topicName);
					if (subs) {
						subs.delete(conn);
						if (subs.size === 0) topics.delete(topicName);
					}
					subscribedTopics.delete(topicName);
				}
				break;

			case 'publish':
				if (message.topic) {
					const receivers = topics.get(message.topic);
					if (receivers) {
						message.clients = receivers.size;
						for (const receiver of receivers) {
							send(receiver, message);
						}
					}
				}
				break;

			case 'ping':
				send(conn, { type: 'pong' });
				break;
		}
	});
}

wss.on('connection', onConnection);

server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, (ws) => {
		wss.emit('connection', ws, request);
	});
});

server.listen(port, () => {
	console.log(`y-webrtc signaling server running on port ${port}`);
});
