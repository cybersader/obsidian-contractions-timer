<script lang="ts">
	import { Clock, BarChart3, List, Stethoscope } from 'lucide-svelte';

	interface Props {
		activeIndex: number;
		onTabClick: (index: number) => void;
	}
	let { activeIndex, onTabClick } = $props<Props>();

	const tabs = [
		{ label: 'Timer', icon: Clock },
		{ label: 'Dashboard', icon: BarChart3 },
		{ label: 'History', icon: List },
		{ label: 'Advisor', icon: Stethoscope },
	];
</script>

<nav class="bottom-nav" role="tablist" aria-label="Main navigation">
	{#each tabs as tab, i}
		<button
			class="nav-tab"
			class:active={activeIndex === i}
			onclick={() => onTabClick(i)}
			role="tab"
			aria-selected={activeIndex === i}
			aria-label={tab.label}
		>
			<tab.icon size={20} strokeWidth={1.5} aria-hidden="true" />
			<span class="nav-label">{tab.label}</span>
		</button>
	{/each}
</nav>

<style>
	.nav-label {
		font-size: var(--text-xs);
	}
</style>
