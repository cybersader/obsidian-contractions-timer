<script lang="ts">
	import type { TimerPhase } from '../../lib/stores/timer';
	import type { LaborStage } from '../../lib/labor-logic/types';
	import { ChevronRight } from 'lucide-svelte';

	interface Props {
		phase: TimerPhase;
		laborStage: LaborStage | null;
		avgIntervalMin: number;
		avgDurationSec: number;
		waterBroke: boolean;
		paused: boolean;
		onNavigate?: () => void;
	}
	let { phase, laborStage, avgIntervalMin, avgDurationSec, waterBroke, paused, onNavigate } = $props<Props>();

	let showCta = $derived(
		phase !== 'contracting' && !paused &&
		(laborStage === 'active' || laborStage === 'transition' || waterBroke)
	);

	const STAGE_ACTIONS: Record<string, string> = {
		'pre-labor': 'Continue normal activities',
		early: 'Rest and hydrate — stay home',
		active: 'Head to hospital soon',
		transition: 'You should be at the hospital',
	};

	const CONTRACTION_MESSAGES: Record<string, string> = {
		'pre-labor': 'Stay relaxed...',
		early: 'Nice and easy...',
		active: 'Breathe through it...',
		transition: "One at a time — you've got this",
	};

	let actionText = $derived.by(() => {
		if (paused) return 'Paused';
		if (phase === 'idle') return 'Tap start when a contraction begins';
		if (phase === 'contracting') {
			return CONTRACTION_MESSAGES[laborStage ?? ''] ?? 'Breathe through it...';
		}
		// Resting phase
		if (waterBroke) {
			if (laborStage === 'active') return 'Water broke + active labor — head to hospital';
			if (laborStage === 'transition') return 'You should be at the hospital';
			return 'Water broke — call your provider';
		}
		return STAGE_ACTIONS[laborStage ?? ''] ?? 'Keep tracking...';
	});

	let stageClass = $derived(
		phase === 'contracting' ? 'contracting' :
		phase === 'idle' ? 'idle' :
		waterBroke ? 'water-broke' :
		laborStage ?? 'idle'
	);

	let detail = $derived(
		avgIntervalMin > 0
			? `~${avgIntervalMin.toFixed(0)} min apart · ~${Math.round(avgDurationSec)}s avg`
			: ''
	);
</script>

{#if showCta && onNavigate}
	<button class="hero-action hero-action--tappable" class:paused data-stage={stageClass} onclick={onNavigate}>
		<div class="hero-action-body">
			<div class="action-text">{actionText}</div>
			{#if detail && !paused}
				<div class="action-detail">{detail}</div>
			{/if}
		</div>
		<div class="hero-cta">
			<ChevronRight size={16} />
		</div>
	</button>
{:else}
	<div class="hero-action" class:paused data-stage={stageClass}>
		<div class="action-text">{actionText}</div>
		{#if detail && !paused}
			<div class="action-detail">{detail}</div>
		{/if}
	</div>
{/if}

<style>
	.hero-action {
		text-align: center;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background: var(--bg-card);
		border: 1px solid var(--border);
		margin-bottom: var(--space-2);
		transition: all var(--transition-base);
	}

	.hero-action.paused {
		opacity: 0.6;
	}

	.action-text {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--text-secondary);
		line-height: 1.3;
	}

	[data-stage="contracting"] .action-text { color: var(--danger); }
	[data-stage="idle"] .action-text { color: var(--text-muted); }
	[data-stage="pre-labor"] .action-text { color: var(--text-secondary); }
	[data-stage="early"] .action-text { color: var(--success); }
	[data-stage="active"] .action-text { color: var(--warning); }
	[data-stage="transition"] .action-text { color: var(--danger); }
	[data-stage="water-broke"] .action-text { color: var(--water, var(--accent)); }

	[data-stage="contracting"] { border-color: var(--danger-muted); background: var(--danger-muted); }
	[data-stage="water-broke"] { border-color: var(--water-muted, var(--accent-muted)); }

	.action-detail {
		font-size: var(--text-sm);
		color: var(--text-faint);
		margin-top: var(--space-1);
	}

	.hero-action--tappable {
		display: flex;
		align-items: center;
		width: 100%;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.hero-action--tappable:active {
		transform: scale(0.98);
	}

	.hero-action-body {
		flex: 1;
		min-width: 0;
	}

	.hero-cta {
		flex-shrink: 0;
		color: var(--text-faint);
		margin-left: var(--space-2);
	}
</style>
