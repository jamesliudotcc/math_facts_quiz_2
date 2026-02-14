import type { StoragePort } from "../domain/ports";
import { ALL_QUIZ_FORMATS, type QuizFormat } from "../domain/quiz-format";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

const FORMAT_LABELS: Record<string, string> = {
	mul: "a × b = ?",
	mul_miss: "a × ? = p",
	div: "p ÷ a = ?",
	div_miss_divisor: "p ÷ ? = a",
	div_miss_dividend: "? ÷ a = b",
};

export class ConfigView {
	private tableContainer: HTMLElement;
	private formatContainer: HTMLElement;

	constructor(
		private storage: StoragePort,
		private onConfigChange: () => void,
	) {
		this.tableContainer = document.getElementById(
			"table-checkboxes",
		) as HTMLElement;
		this.formatContainer = document.getElementById(
			"format-checkboxes",
		) as HTMLElement;

		this.render();

		document
			.getElementById("reset-settings")
			?.addEventListener("click", () => this.resetToDefaults());

		document
			.getElementById("clear-history")
			?.addEventListener("click", () => this.clearHistory());
	}

	private resetToDefaults(): void {
		this.storage.saveUserConfig(DEFAULT_USER_CONFIG);
		this.render();
		this.onConfigChange();
	}

	private clearHistory(): void {
		this.storage.clearAllAttempts();
		this.onConfigChange();
	}

	render(): void {
		const config = this.storage.getUserConfig();

		// Table checkboxes
		this.tableContainer.innerHTML = "";
		for (let t = 1; t <= 10; t++) {
			const label = document.createElement("label");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.checked = config.selectedTables.has(t);
			cb.addEventListener("change", () => this.saveConfig());
			label.appendChild(cb);
			label.appendChild(document.createTextNode(` ${t}`));
			this.tableContainer.appendChild(label);
		}

		// Format checkboxes
		this.formatContainer.innerHTML = "";
		for (const fmt of ALL_QUIZ_FORMATS) {
			const label = document.createElement("label");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.dataset.format = fmt;
			cb.checked = config.enabledFormats.has(fmt);
			cb.addEventListener("change", () => this.saveConfig());
			label.appendChild(cb);
			label.appendChild(document.createTextNode(` ${FORMAT_LABELS[fmt]}`));
			this.formatContainer.appendChild(label);
		}
	}

	private saveConfig(): void {
		const selectedTables = new Set<number>();
		const tableCbs = this.tableContainer.querySelectorAll("input");
		tableCbs.forEach((cb, i) => {
			if (cb.checked) selectedTables.add(i + 1);
		});

		const enabledFormats = new Set<QuizFormat>();
		const formatCbs = this.formatContainer.querySelectorAll("input");
		for (const cb of formatCbs) {
			if ((cb as HTMLInputElement).checked) {
				enabledFormats.add(
					(cb as HTMLInputElement).dataset.format as QuizFormat,
				);
			}
		}

		this.storage.saveUserConfig({
			selectedTables,
			enabledFormats,
		});
		this.onConfigChange();
	}
}
