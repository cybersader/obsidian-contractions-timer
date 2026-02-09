import type { LaborEventType, LaborEvent } from '../types';
import { formatTimeShort } from '../utils/formatters';
import { haptic } from '../utils/dom';

/**
 * Event recording buttons (water broke, untimed contraction) displayed below the BigButton.
 */
export class EventButtons {
	private el: HTMLElement;
	private waterBtn: HTMLButtonElement;
	private undoBtn: HTMLButtonElement | null = null;
	private onEvent: (type: LaborEventType) => void;
	private onUndo: ((type: LaborEventType) => void) | null = null;
	private confirmed = false;
	private hapticEnabled: boolean;

	// Untimed contraction button
	private untimedRow: HTMLElement;
	private untimedBtn: HTMLButtonElement;
	private untimedConfirmEl: HTMLElement | null = null;
	private untimedUndoBtn: HTMLButtonElement | null = null;
	private untimedConfirmed = false;
	private onUntimedLog: (() => void) | null = null;
	private onUntimedUndo: (() => void) | null = null;
	private onUntimedIntensity: ((level: number) => void) | null = null;

	constructor(
		parent: HTMLElement,
		onEvent: (type: LaborEventType) => void,
		hapticEnabled: boolean = true
	) {
		this.onEvent = onEvent;
		this.hapticEnabled = hapticEnabled;
		this.el = parent.createDiv({ cls: 'ct-event-buttons' });

		this.waterBtn = this.el.createEl('button', {
			cls: 'ct-event-btn ct-event-btn--water-break',
		});
		this.setWaterLabel('Water broke');
		this.waterBtn.addEventListener('click', () => {
			if (this.confirmed) return;
			if (hapticEnabled) haptic(50);
			this.onEvent('water-break');
		});

		// "I had a contraction" button
		this.untimedRow = this.el.createDiv({ cls: 'ct-untimed-row' });
		this.untimedBtn = this.untimedRow.createEl('button', {
			cls: 'ct-event-btn ct-event-btn--untimed',
		});
		this.setUntimedLabel();
		this.untimedBtn.addEventListener('click', () => {
			if (this.untimedConfirmed) return;
			if (hapticEnabled) haptic(50);
			if (this.onUntimedLog) this.onUntimedLog();
		});
	}

	/** Set callbacks for untimed contraction feature. */
	setUntimedCallbacks(
		onLog: () => void,
		onUndo: () => void,
		onIntensity: (level: number) => void
	): void {
		this.onUntimedLog = onLog;
		this.onUntimedUndo = onUndo;
		this.onUntimedIntensity = onIntensity;
	}

	/** Set a callback for undoing an event. */
	setUndoCallback(onUndo: (type: LaborEventType) => void): void {
		this.onUndo = onUndo;
	}

	/** Show confirmation state after recording a water break event. */
	showConfirmation(event: LaborEvent): void {
		this.confirmed = true;
		const time = formatTimeShort(new Date(event.timestamp));
		this.setWaterLabel(`\u2713 Water broke at ${time}`);
		this.waterBtn.addClass('ct-event-btn--confirmed');
		this.waterBtn.disabled = true;

		// Add undo button if not already present
		if (!this.undoBtn) {
			this.undoBtn = this.el.createEl('button', {
				cls: 'ct-event-btn ct-event-btn--undo',
				text: 'Undo',
				title: 'If you misclicked you can use this',
			});
			this.undoBtn.addEventListener('click', () => {
				if (this.hapticEnabled) haptic(30);
				this.resetWaterButton();
				if (this.onUndo) this.onUndo('water-break');
			});
		}
	}

	/** Show confirmation after logging an untimed contraction. */
	showUntimedConfirmation(timestamp: string): void {
		this.untimedConfirmed = true;
		const time = formatTimeShort(new Date(timestamp));
		this.untimedBtn.empty();
		this.untimedBtn.createSpan({ text: `\u2713 Logged at ${time}` });
		this.untimedBtn.addClass('ct-event-btn--confirmed');
		this.untimedBtn.disabled = true;

		if (!this.untimedConfirmEl) {
			this.untimedConfirmEl = this.untimedRow.createDiv({ cls: 'ct-untimed-confirm' });

			// Inline intensity picker (3 options)
			const intensityRow = this.untimedConfirmEl.createDiv({ cls: 'ct-untimed-intensity' });
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
					if (this.onUntimedIntensity) this.onUntimedIntensity(level);
				});
			}

			// Undo button
			this.untimedUndoBtn = this.untimedConfirmEl.createEl('button', {
				cls: 'ct-event-btn ct-event-btn--undo',
				text: 'Undo',
			});
			this.untimedUndoBtn.addEventListener('click', () => {
				if (this.hapticEnabled) haptic(30);
				this.resetUntimedButton();
				if (this.onUntimedUndo) this.onUntimedUndo();
			});
		}
	}

	/** Reset the water button back to its initial state. */
	private resetWaterButton(): void {
		this.confirmed = false;
		this.setWaterLabel('Water broke');
		this.waterBtn.removeClass('ct-event-btn--confirmed');
		this.waterBtn.disabled = false;

		if (this.undoBtn) {
			this.undoBtn.remove();
			this.undoBtn = null;
		}
	}

	/** Reset the untimed button back to its initial state. */
	private resetUntimedButton(): void {
		this.untimedConfirmed = false;
		this.setUntimedLabel();
		this.untimedBtn.removeClass('ct-event-btn--confirmed');
		this.untimedBtn.disabled = false;

		if (this.untimedConfirmEl) {
			this.untimedConfirmEl.remove();
			this.untimedConfirmEl = null;
			this.untimedUndoBtn = null;
		}
	}

	/** Check if water break was already recorded and show confirmation. */
	updateFromEvents(events: LaborEvent[]): void {
		const waterBreak = events.find(e => e.type === 'water-break');
		if (waterBreak) {
			this.showConfirmation(waterBreak);
		} else {
			this.resetWaterButton();
		}
	}

	/** Set water button content with a droplet icon prefix. */
	private setWaterLabel(text: string): void {
		this.waterBtn.empty();
		this.waterBtn.createSpan({ cls: 'ct-water-icon', text: '\uD83D\uDCA7' });
		this.waterBtn.createSpan({ text: ` ${text}` });
	}

	/** Set untimed button to its default label. */
	private setUntimedLabel(): void {
		this.untimedBtn.empty();
		this.untimedBtn.createSpan({ cls: 'ct-untimed-icon', text: '\u2714' });
		const textCol = this.untimedBtn.createDiv({ cls: 'ct-untimed-label' });
		textCol.createDiv({ cls: 'ct-untimed-title', text: 'I had a contraction' });
		textCol.createDiv({ cls: 'ct-untimed-subtitle', text: "(couldn't time it)" });
	}

	/** Show/hide the untimed button based on timer phase. */
	setUntimedVisible(visible: boolean): void {
		if (visible) {
			this.untimedRow.removeClass('ct-hidden');
		} else {
			this.untimedRow.addClass('ct-hidden');
		}
	}

	show(): void {
		this.el.removeClass('ct-hidden');
	}

	hide(): void {
		this.el.addClass('ct-hidden');
	}
}
