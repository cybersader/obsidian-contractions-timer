<script lang="ts">
	import { session } from '../../lib/stores/session';
	import { settings } from '../../lib/stores/settings';
	import { List } from 'lucide-svelte';
	import { formatTime, formatDuration, formatDurationShort, formatInterval, getIntensityLabel, getLocationLabel, generateId, formatTimeShort, toTimeInputValue, applyTimeInput, parseDuration } from '../../lib/labor-logic/formatters';
	import { getDurationSeconds, getIntervalMinutes } from '../../lib/labor-logic/calculations';
	import { haptic } from '../../lib/haptic';
	import type { Contraction } from '../../lib/labor-logic/types';

	let completed = $derived($session.contractions.filter(c => c.end !== null));
	let reversed = $derived([...completed].reverse());
	let eventsList = $derived($session.events);

	let editingId: string | null = $state(null);
	let editIntensity: number | null = $state(null);
	let editLocation: string | null = $state(null);
	let editStartTime = $state('');
	let editEndTime = $state('');
	let editDuration = $state('');
	let confirmDelete = $state(false);

	function startEdit(c: Contraction) {
		if ($settings.hapticFeedback) haptic(20);
		editingId = c.id;
		editIntensity = c.intensity;
		editLocation = c.location;
		editStartTime = toTimeInputValue(new Date(c.start));
		editEndTime = c.end ? toTimeInputValue(new Date(c.end)) : '';
		editDuration = c.end ? formatDuration(getDurationSeconds(c)) : '';
		confirmDelete = false;
	}

	function syncDurationFromEnd() {
		const start = applyTimeInput(new Date(), editStartTime);
		const end = applyTimeInput(new Date(), editEndTime);
		if (start && end) {
			let diffSec = (end.getTime() - start.getTime()) / 1000;
			if (diffSec < 0) diffSec += 86400; // handle midnight crossing
			if (diffSec > 0) editDuration = formatDuration(diffSec);
		}
	}

	function syncEndFromDuration() {
		const parsed = parseDuration(editDuration);
		const start = applyTimeInput(new Date(), editStartTime);
		if (parsed !== null && parsed > 0 && start) {
			const end = new Date(start.getTime() + parsed * 1000);
			editEndTime = toTimeInputValue(end);
		}
	}

	function saveEdit() {
		if (!editingId) return;
		const id = editingId;
		session.update(s => ({
			...s,
			contractions: s.contractions.map(c => {
				if (c.id !== id) return c;
				let newStart = c.start;
				let newEnd = c.end;
				const startDate = applyTimeInput(new Date(c.start), editStartTime);
				if (startDate) newStart = startDate.toISOString();
				if (c.end) {
					const endDate = applyTimeInput(new Date(c.end), editEndTime);
					if (endDate) newEnd = endDate.toISOString();
				}
				return { ...c, start: newStart, end: newEnd, intensity: editIntensity, location: editLocation as any };
			}),
		}));
		editingId = null;
	}

	function cancelEdit() {
		editingId = null;
	}

	function deleteContraction(id: string) {
		if ($settings.hapticFeedback) haptic(30);
		session.update(s => {
			const contractions = s.contractions.filter(c => c.id !== id);
			return {
				...s,
				contractions,
				// Reset pause when no contractions remain (prevents stuck overlay)
				paused: contractions.length === 0 ? false : s.paused,
			};
		});
		editingId = null;
	}
</script>

<div class="page">
	<h2 class="page-title">History</h2>

	{#if reversed.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">
				<List size={24} aria-hidden="true" />
			</div>
			<p class="empty-state-title">No contractions yet</p>
			<p class="empty-state-hint">Your contraction history will appear here. Tap each entry to edit timing, intensity, or location.</p>
		</div>
	{:else}
		<div class="history-list">
			{#each reversed as c, i}
				{@const idx = completed.length - 1 - i}

				<!-- Interleave events that occurred between this and next contraction -->
				{#each eventsList.filter(e => {
					const et = new Date(e.timestamp).getTime();
					const ct = new Date(c.start).getTime();
					const nextC = reversed[i - 1];
					const nt = nextC ? new Date(nextC.start).getTime() : Infinity;
					return et >= ct && et < nt;
				}) as event}
					<div class="event-row event--{event.type}">
						<span class="event-icon">
							{event.type === 'water-break' ? '💧' : event.type === 'mucus-plug' ? '🔴' : event.type === 'bloody-show' ? '🩸' : '📌'}
						</span>
						<span class="event-text">
							{event.type === 'water-break' ? 'Water broke' : event.type === 'mucus-plug' ? 'Mucus plug' : event.type === 'bloody-show' ? 'Bloody show' : event.type} at {formatTime(event.timestamp)}
						</span>
					</div>
				{/each}

				{#if editingId === c.id}
					<!-- Inline editor -->
					<div class="editor-card">
						<div class="editor-header">
							<span>Editing #{idx + 1}</span>
						</div>
						<div class="editor-time-row">
							<div class="editor-field">
								<span class="editor-label">Start</span>
								<input type="time" class="editor-time-input" bind:value={editStartTime} />
							</div>
							{#if c.end}
								<div class="editor-field">
									<span class="editor-label">End</span>
									<input type="time" class="editor-time-input" bind:value={editEndTime} onchange={syncDurationFromEnd} />
								</div>
								<div class="editor-field">
									<span class="editor-label">Duration</span>
									<input type="text" class="editor-duration-input" bind:value={editDuration} placeholder="M:SS" onchange={syncEndFromDuration} />
								</div>
							{/if}
						</div>
						<div class="editor-section">
							<span class="editor-label">Intensity</span>
							<div class="editor-pills">
								{#each [1, 2, 3, 4, 5] as level}
									<button
										class="editor-pill"
										class:selected={editIntensity === level}
										style="--dot-color: var(--color-intensity-{level})"
										onclick={() => editIntensity = level}
									>
										{level}
									</button>
								{/each}
								<button class="editor-pill" class:selected={editIntensity === null} onclick={() => editIntensity = null}>
									None
								</button>
							</div>
						</div>
						<div class="editor-section">
							<span class="editor-label">Location</span>
							<div class="editor-pills">
								{#each [['front', 'Front'], ['back', 'Back'], ['wrapping', 'Wrap']] as [val, label]}
									<button
										class="editor-pill"
										class:selected={editLocation === val}
										onclick={() => editLocation = val}
									>
										{label}
									</button>
								{/each}
								<button class="editor-pill" class:selected={editLocation === null} onclick={() => editLocation = null}>
									None
								</button>
							</div>
						</div>
						<div class="editor-actions">
							<button class="editor-btn editor-btn--save" onclick={saveEdit}>Save</button>
							<button class="editor-btn" onclick={cancelEdit}>Cancel</button>
							{#if confirmDelete}
								<button class="editor-btn editor-btn--delete-confirm" onclick={() => deleteContraction(c.id)}>Confirm delete</button>
							{:else}
								<button class="editor-btn editor-btn--delete" onclick={() => confirmDelete = true}>Delete</button>
							{/if}
						</div>
					</div>
				{:else}
					<!-- Normal row -->
					<button class="history-item" onclick={() => startEdit(c)}>
						<div class="item-num">#{idx + 1}</div>
						<div class="item-details">
							<div class="item-time">{formatTime(c.start)}</div>
							<div class="item-meta">
								{#if c.untimed}
									<span>Untimed</span>
								{:else}
									<span>{formatDurationShort(getDurationSeconds(c))}</span>
								{/if}
								{#if idx > 0}
									<span class="sep">&middot;</span>
									<span>{formatInterval(getIntervalMinutes(c, completed[idx - 1]))} apart</span>
								{/if}
							</div>
						</div>
						<div class="item-rating">
							{#if c.intensity}
								<span class="intensity-dot" style="background: var(--color-intensity-{c.intensity})"></span>
								<span class="intensity-label">{getIntensityLabel(c.intensity)}</span>
							{/if}
							{#if c.location}
								<span class="location-label">{getLocationLabel(c.location)}</span>
							{/if}
						</div>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	/* empty-state styles are in app.css */

	.history-list { display: flex; flex-direction: column; gap: var(--space-1); }

	.history-item {
		display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-3);
		background: var(--bg-card); border-radius: var(--radius-md);
		border: none; width: 100%; text-align: left; cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.history-item:active { background: var(--bg-card-hover); }

	.item-num { font-size: var(--text-sm); color: var(--text-faint); min-width: 28px; font-weight: 600; }
	.item-details { flex: 1; }
	.item-time { font-size: var(--text-base); color: var(--text-primary); }
	.item-meta { font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-1); }
	.sep { margin: 0 var(--space-1); }
	.item-rating { display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs); color: var(--text-muted); }
	.intensity-dot { width: 6px; height: 6px; border-radius: var(--radius-full); }
	.intensity-label, .location-label { font-size: var(--text-xs); }

	/* Event rows */
	.event-row { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); font-size: var(--text-sm); color: var(--text-muted); }
	.event--water-break { color: var(--water); }
	.event-icon { font-size: var(--text-base); }

	/* Editor */
	.editor-card { background: var(--accent-muted); border: 1px solid var(--accent-muted); border-radius: var(--radius-md); padding: var(--space-3); }
	.editor-header { display: flex; justify-content: space-between; font-size: var(--text-base); color: var(--text-secondary); margin-bottom: var(--space-3); }
	.editor-time { color: var(--text-muted); }
	.editor-section { margin-bottom: var(--space-2); }
	.editor-label { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-1); display: block; }
	.editor-pills { display: flex; gap: var(--space-1); flex-wrap: wrap; }
	.editor-pill { padding: var(--space-1) var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--bg-card); color: var(--text-muted); font-size: var(--text-sm); cursor: pointer; }
	.editor-pill.selected { background: var(--accent-muted); border-color: var(--accent-muted); color: var(--accent); }
	.editor-actions { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
	.editor-btn { padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--input-border); background: var(--bg-card); color: var(--text-muted); font-size: var(--text-sm); cursor: pointer; }
	.editor-btn--save { background: var(--accent-muted); border-color: var(--accent-muted); color: var(--accent); font-weight: 600; }
	.editor-btn--delete { color: var(--danger); border-color: var(--danger-muted); margin-left: auto; }
	.editor-btn--delete-confirm { color: #fff; background: var(--danger); border-color: var(--danger); margin-left: auto; font-weight: 600; }

	/* Time/duration editor row */
	.editor-time-row { display: flex; gap: var(--space-2); margin-bottom: var(--space-2); }
	.editor-field { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
	.editor-time-input, .editor-duration-input {
		background: var(--input-bg); border: 1px solid var(--input-border); border-radius: var(--radius-sm);
		color: var(--text-primary); padding: var(--space-2) var(--space-2); font-size: var(--text-sm); width: 100%;
	}
</style>
