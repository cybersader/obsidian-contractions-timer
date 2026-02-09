import { formatTimeShort } from '../utils/formatters';
import { haptic } from '../utils/dom';

/**
 * "Had one" button + time-ago picker + confirmation.
 * Lives inline in the button row next to the BigButton.
 *
 * States:
 * - idle: Compact "Had one" button visible
 * - picking: Time-ago pills replace the BigButton
 * - confirmed: Confirmation + intensity picker appears above button row
 */
export class UntimedPicker {
	private hadOneBtn: HTMLButtonElement;
	private pillsRow: HTMLElement;
	private confirmEl: HTMLElement;
	private state: 'idle' | 'picking' | 'confirmed' = 'idle';
	private hapticEnabled: boolean;

	private onLog: (minutesAgo: number) => void;
	private onUndo: () => void;
	private onIntensity: (level: number) => void;
	private onStateChange: (state: 'idle' | 'picking' | 'confirmed') => void;

	constructor(
		buttonRow: HTMLElement,
		confirmParent: HTMLElement,
		callbacks: {
			onLog: (minutesAgo: number) => void;
			onUndo: () => void;
			onIntensity: (level: number) => void;
			onStateChange: (state: 'idle' | 'picking' | 'confirmed') => void;
		},
		hapticEnabled = true
	) {
		this.onLog = callbacks.onLog;
		this.onUndo = callbacks.onUndo;
		this.onIntensity = callbacks.onIntensity;
		this.onStateChange = callbacks.onStateChange;
		this.hapticEnabled = hapticEnabled;

		// "Had one" button (compact, appears left of BigButton)
		this.hadOneBtn = buttonRow.createEl('button', {
			cls: 'ct-had-one-btn',
		});
		this.hadOneBtn.createDiv({ cls: 'ct-had-one-main', text: 'Had one' });
		this.hadOneBtn.createDiv({ cls: 'ct-had-one-sub', text: 'Log missed' });
		this.hadOneBtn.addEventListener('click', () => this.enterPicking());

		// Time-ago pills (hidden initially, replaces BigButton in button row)
		this.pillsRow = buttonRow.createDiv({ cls: 'ct-time-pills ct-hidden' });

		const header = this.pillsRow.createDiv({ cls: 'ct-time-pills-header' });
		header.createSpan({ text: 'How long ago?' });
		const cancelBtn = header.createEl('button', {
			cls: 'ct-time-pill-cancel',
			text: '\u2715',
		});
		cancelBtn.addEventListener('click', () => this.cancel());

		const pillsGrid = this.pillsRow.createDiv({ cls: 'ct-time-pills-grid' });
		const times = [
			{ label: 'Just now', minutes: 0 },
			{ label: '~5 min ago', minutes: 5 },
			{ label: '~15 min ago', minutes: 15 },
			{ label: '~30 min ago', minutes: 30 },
		];
		for (const t of times) {
			const pill = pillsGrid.createEl('button', {
				cls: 'ct-time-pill',
				text: t.label,
			});
			pill.addEventListener('click', () => {
				if (hapticEnabled) haptic(30);
				this.pickTime(t.minutes);
			});
		}

		// Confirmation area (hidden initially, shown above button row)
		this.confirmEl = confirmParent.createDiv({ cls: 'ct-untimed-confirm ct-hidden' });
	}

	private enterPicking(): void {
		if (this.hapticEnabled) haptic(50);
		this.state = 'picking';
		this.hadOneBtn.addClass('ct-hidden');
		this.pillsRow.removeClass('ct-hidden');
		this.onStateChange('picking');
	}

	private cancel(): void {
		this.state = 'idle';
		this.pillsRow.addClass('ct-hidden');
		this.hadOneBtn.removeClass('ct-hidden');
		this.onStateChange('idle');
	}

	private pickTime(minutesAgo: number): void {
		this.state = 'confirmed';
		this.pillsRow.addClass('ct-hidden');
		this.hadOneBtn.removeClass('ct-hidden');
		this.onLog(minutesAgo);
		this.onStateChange('confirmed');
	}

	/** Show confirmation with timestamp, intensity picker, and undo. */
	showConfirmation(timestamp: string): void {
		this.confirmEl.empty();
		this.confirmEl.removeClass('ct-hidden');

		const time = formatTimeShort(new Date(timestamp));
		this.confirmEl.createDiv({
			cls: 'ct-untimed-confirm-header',
			text: `\u2713 Logged at ${time}`,
		});

		// Intensity picker row
		const intensityRow = this.confirmEl.createDiv({ cls: 'ct-untimed-intensity' });
		intensityRow.createSpan({ cls: 'ct-untimed-intensity-label', text: 'How strong?' });
		const btnRow = intensityRow.createDiv({ cls: 'ct-untimed-intensity-btns' });

		const levels = [
			{ level: 1, label: 'Mild' },
			{ level: 3, label: 'Moderate' },
			{ level: 5, label: 'Strong' },
		];
		for (const { level, label } of levels) {
			const btn = btnRow.createEl('button', {
				cls: `ct-intensity-btn ct-intensity-btn--${level}`,
				text: label,
			});
			btn.addEventListener('click', () => {
				if (this.hapticEnabled) haptic(30);
				btnRow.querySelectorAll('.ct-intensity-btn').forEach(b =>
					(b as HTMLElement).removeClass('ct-intensity-btn--selected'));
				btn.addClass('ct-intensity-btn--selected');
				this.onIntensity(level);
			});
		}

		// Undo button
		const undoBtn = this.confirmEl.createEl('button', {
			cls: 'ct-untimed-undo',
			text: 'Undo',
		});
		undoBtn.addEventListener('click', () => {
			if (this.hapticEnabled) haptic(30);
			this.reset();
			this.onUndo();
		});
	}

	/** Reset to idle state, clearing confirmation. */
	reset(): void {
		this.state = 'idle';
		this.confirmEl.addClass('ct-hidden');
		this.confirmEl.empty();
		this.pillsRow.addClass('ct-hidden');
		this.hadOneBtn.removeClass('ct-hidden');
	}

	/** Show/hide based on timer phase (hidden during contracting). */
	setVisible(visible: boolean): void {
		if (visible) {
			this.hadOneBtn.removeClass('ct-hidden');
		} else {
			this.hadOneBtn.addClass('ct-hidden');
			if (this.state === 'picking') {
				this.cancel();
			}
		}
	}
}
