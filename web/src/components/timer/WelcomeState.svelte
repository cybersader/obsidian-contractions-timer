<script lang="ts">
	import { Timer, Activity, HeartPulse } from 'lucide-svelte';
</script>

<div class="welcome">
	<div class="welcome-icon">
		<HeartPulse size={32} />
	</div>
	<h2 class="welcome-title">Contraction Timer</h2>
	<p class="welcome-desc">Tap the button below when a contraction starts. Tap again when it ends.</p>
	<div class="welcome-features">
		<div class="feature">
			<Timer size={16} />
			<span>Track timing and intensity</span>
		</div>
		<div class="feature">
			<Activity size={16} />
			<span>See patterns emerge</span>
		</div>
	</div>
</div>

<style>
	.welcome {
		text-align: center;
		padding: var(--space-4) var(--space-4) var(--space-2);
		animation: fadeSlideIn 400ms ease-out;
	}

	.welcome-icon {
		margin: 0 auto var(--space-3);
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		background: var(--accent-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
	}

	.welcome-title {
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: var(--space-2);
	}

	.welcome-desc {
		font-size: var(--text-base);
		color: var(--text-muted);
		line-height: 1.5;
		margin-bottom: var(--space-4);
		max-width: 280px;
		margin-left: auto;
		margin-right: auto;
	}

	.welcome-features {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		align-items: center;
	}

	.feature {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--text-faint);
	}

	.feature :global(svg) {
		color: var(--text-faint);
		flex-shrink: 0;
	}

	@keyframes fadeSlideIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
