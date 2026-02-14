import type { StoragePort } from "../domain/ports";
import { deriveFamilyStats } from "../domain/quiz-engine";

export class StatsView {
	private container: HTMLElement;

	constructor(private storage: StoragePort) {
		this.container = document.getElementById("stats-content") as HTMLElement;
	}

	render(): void {
		const allAttempts = this.storage.getAllAttempts();

		// Group attempts by familyId
		const attemptsByFamily = new Map<string, typeof allAttempts>();
		for (const a of allAttempts) {
			const arr = attemptsByFamily.get(a.familyId);
			if (arr) {
				arr.push(a);
			} else {
				attemptsByFamily.set(a.familyId, [a]);
			}
		}

		let struggling = 0;
		let learning = 0;
		let mature = 0;

		for (const [, attempts] of attemptsByFamily) {
			const stats = deriveFamilyStats(attempts);
			if (stats.effectiveSuccesses === 0) {
				struggling++;
			} else if (stats.effectiveSuccesses >= 5) {
				mature++;
			} else {
				learning++;
			}
		}

		const totalReviewed = attemptsByFamily.size;

		this.container.innerHTML = `
			<article>
				<h3>Families Seen</h3>
				<p style="font-size:2rem; text-align:center;">${totalReviewed}</p>
			</article>
			<div class="grid">
				<article>
					<h4>Struggling</h4>
					<p style="font-size:1.5rem; text-align:center;">${struggling}</p>
				</article>
				<article>
					<h4>Learning</h4>
					<p style="font-size:1.5rem; text-align:center;">${learning}</p>
				</article>
				<article>
					<h4>Mature</h4>
					<p style="font-size:1.5rem; text-align:center;">${mature}</p>
				</article>
			</div>
		`;
	}
}
