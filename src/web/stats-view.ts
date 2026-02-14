import type { StoragePort } from "../domain/ports";

export class StatsView {
	private container: HTMLElement;

	constructor(private storage: StoragePort) {
		this.container = document.getElementById("stats-content") as HTMLElement;
	}

	render(): void {
		const records = this.storage.getAllReviewRecords();
		const today = new Date().toISOString().slice(0, 10);

		let dueToday = 0;
		let learning = 0;
		let mature = 0;

		for (const r of records) {
			if (r.repetitions === 0) {
				learning++;
			} else if (r.interval >= 21) {
				mature++;
			} else {
				learning++;
			}
			if (r.nextReviewDate <= today) {
				dueToday++;
			}
		}

		const totalReviewed = records.length;

		this.container.innerHTML = `
			<article>
				<h3>Due Today</h3>
				<p style="font-size:2rem; text-align:center;">${dueToday}</p>
			</article>
			<div class="grid">
				<article>
					<h4>Total Reviewed</h4>
					<p style="font-size:1.5rem; text-align:center;">${totalReviewed}</p>
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
