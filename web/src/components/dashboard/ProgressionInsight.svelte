<script lang="ts">
	import { session } from '../../lib/stores/session';
	import { settings } from '../../lib/stores/settings';
	import { getDurationSeconds, getSessionFilteredIntervals, getLatestSession, getTrend, estimateTimeTo511 } from '../../lib/labor-logic/calculations';
	import { formatDurationShort, formatInterval } from '../../lib/labor-logic/formatters';

	let gapMin = $derived($settings.chartGapThresholdMin);
	let thresholdVal = $derived($settings.threshold);

	let allCompleted = $derived($session.contractions.filter(c => c.end !== null));
	let completed = $derived(gapMin > 0 ? getLatestSession(allCompleted, gapMin) : allCompleted);
	let hasEnough = $derived(completed.length >= 4);

	let durations = $derived(completed.map(getDurationSeconds));
	let intervals = $derived.by(() => {
		if (gapMin > 0) return getSessionFilteredIntervals(completed, gapMin);
		return completed.slice(1).map((c, i) =>
			(new Date(c.start).getTime() - new Date(completed[i].start).getTime()) / 60000
		);
	});

	let durationTrend = $derived(hasEnough ? getTrend(durations) : null);
	let intervalTrend = $derived(hasEnough && intervals.length >= 3 ? getTrend(intervals) : null);
	let estimate = $derived(hasEnough ? estimateTimeTo511(completed, thresholdVal, gapMin) : null);
</script>

<div class="insight">
	{#if !hasEnough}
		<div class="placeholder">Need 4+ contractions to analyze trends</div>
	{:else}
		<div class="section-label">Trends</div>

		{#if intervalTrend}
			<div class="insight-row">
				<span class="label">Gap between:</span>
				<span class="value value--{intervalTrend.direction}">
					{formatInterval(intervalTrend.firstValue)} → {formatInterval(intervalTrend.lastValue)}
					({intervalTrend.direction === 'decreasing' ? 'getting closer' : intervalTrend.direction === 'increasing' ? 'spreading apart' : 'stable'}
					{intervalTrend.direction === 'decreasing' ? '↓' : intervalTrend.direction === 'increasing' ? '↑' : '↔'})
				</span>
			</div>
		{/if}

		{#if durationTrend}
			<div class="insight-row">
				<span class="label">Each contraction:</span>
				<span class="value value--{durationTrend.direction === 'increasing' ? 'decreasing' : durationTrend.direction === 'decreasing' ? 'increasing' : 'stable'}">
					{formatDurationShort(durationTrend.firstValue)} → {formatDurationShort(durationTrend.lastValue)}
					({durationTrend.direction === 'increasing' ? 'lasting longer' : durationTrend.direction === 'decreasing' ? 'getting shorter' : 'stable'}
					{durationTrend.direction === 'increasing' ? '↑' : durationTrend.direction === 'decreasing' ? '↓' : '↔'})
				</span>
			</div>
		{/if}

		{#if estimate !== null}
			<div class="estimate">
				{#if estimate === 0}
					{thresholdVal.intervalMinutes}-1-1 criteria currently met
				{:else}
					At this pace, may reach {thresholdVal.intervalMinutes}-1-1 in ~{estimate} min
				{/if}
			</div>
			<div class="disclaimer">Based on last {intervals.length} interval{intervals.length !== 1 ? 's' : ''} (this session)</div>
		{/if}
	{/if}
</div>

<style>
	.placeholder {
		text-align: center;
		padding: var(--space-4);
		color: var(--text-faint);
		font-size: var(--text-sm);
	}

	.section-label {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: var(--space-2);
	}

	.insight-row {
		margin-bottom: var(--space-2);
	}

	.label {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	.value {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.value--decreasing { color: var(--success); }
	.value--increasing { color: var(--danger); }
	.value--stable { color: var(--text-muted); }

	.estimate {
		margin-top: var(--space-3);
		padding: var(--space-2) var(--space-3);
		background: var(--accent-muted);
		border: 1px solid var(--accent-muted);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--accent);
	}

	.disclaimer {
		font-size: var(--text-xs);
		color: var(--text-faint);
		margin-top: var(--space-1);
		text-align: center;
	}
</style>
