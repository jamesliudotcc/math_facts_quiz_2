import type { StoragePort } from "../domain/ports";
import { deriveFamilyStats } from "../domain/quiz-engine";

type TimeFilter = "all" | "24h";

export class StatsView {
	private container: HTMLElement;
	private timeFilter: TimeFilter = "all";

	constructor(private storage: StoragePort) {
		this.container = document.getElementById("stats-content") as HTMLElement;
	}

	render(): void {
		const allAttempts = this.storage.getAllAttempts();

		const cutoff = Date.now() - 86_400_000;
		const attempts =
			this.timeFilter === "24h"
				? allAttempts.filter((a) => a.timestamp > cutoff)
				: allAttempts;

		// Group attempts by familyId
		const attemptsByFamily = new Map<string, typeof attempts>();
		for (const a of attempts) {
			const arr = attemptsByFamily.get(a.familyId);
			if (arr) {
				arr.push(a);
			} else {
				attemptsByFamily.set(a.familyId, [a]);
			}
		}

		// Build lookup: familyId → effectiveSuccesses
		const statsMap = new Map<string, number>();
		for (const [id, familyAttempts] of attemptsByFamily) {
			const stats = deriveFamilyStats(familyAttempts);
			statsMap.set(id, stats.effectiveSuccesses);
		}

		// Build toggle buttons
		const allClass = this.timeFilter === "all" ? "" : ' class="outline"';
		const dayClass = this.timeFilter === "24h" ? "" : ' class="outline"';

		let html = `
			<div class="time-toggle">
				<button data-filter="all"${allClass}>All Time</button>
				<button data-filter="24h"${dayClass}>Last 24h</button>
			</div>
			<table class="mastery-grid"><tbody>`;

		// Rows — only cells where c ≤ r (lower triangle)
		for (let r = 1; r <= 10; r++) {
			html += `<tr><th>${r}</th>`;
			for (let c = 1; c <= r; c++) {
				const key = `${c}x${r}`;
				const es = statsMap.get(key);

				let bg: string;
				if (es === undefined) {
					bg = "#ddd";
				} else if (es === 0) {
					bg = "hsl(0, 70%, 45%)";
				} else {
					// Always green, lightness decreases as mastery grows
					const lightness = 65 - Math.min(es, 6) * 4.5;
					bg = `hsl(120, 70%, ${lightness}%)`;
				}

				html += `<td style="background:${bg}"></td>`;
			}
			html += "</tr>";
		}

		// Bottom column headers
		html += "<tr><th></th>";
		for (let c = 1; c <= 10; c++) {
			html += `<th>${c}</th>`;
		}
		html += "</tr></tbody></table>";
		this.container.innerHTML = html;

		// Attach toggle listeners
		for (const btn of this.container.querySelectorAll(".time-toggle button")) {
			btn.addEventListener("click", () => {
				this.timeFilter = (btn as HTMLElement).dataset.filter as TimeFilter;
				this.render();
			});
		}
	}
}
