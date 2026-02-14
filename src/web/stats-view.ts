import type { StoragePort } from "../domain/ports";

export class StatsView {
	private container: HTMLElement;

	constructor(private storage: StoragePort) {
		this.container = document.getElementById("stats-content") as HTMLElement;
	}

	render(): void {
		const records = this.storage.getAllReviewRecords();

		let struggling = 0;
		let learning = 0;
		let mature = 0;

		for (const r of records) {
			if (r.consecutiveSuccesses === 0) {
				struggling++;
			} else if (r.consecutiveSuccesses >= 5) {
				mature++;
			} else {
				learning++;
			}
		}

		const totalReviewed = records.length;

		this.container.innerHTML = `
			<article>
				<h3>Items Seen</h3>
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
