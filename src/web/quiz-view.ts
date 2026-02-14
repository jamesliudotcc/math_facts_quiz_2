import type { QuizResult, QuizSession } from "../domain/quiz-session";

export class QuizView {
	private beforeEl: HTMLElement;
	private afterEl: HTMLElement;
	private answerEl: HTMLInputElement;
	private submitEl: HTMLButtonElement;
	private feedbackEl: HTMLElement;
	private currentItem: QuizResult | null = null;

	constructor(private session: QuizSession) {
		this.beforeEl = document.getElementById("quiz-before") as HTMLElement;
		this.afterEl = document.getElementById("quiz-after") as HTMLElement;
		this.answerEl = document.getElementById("quiz-answer") as HTMLInputElement;
		this.submitEl = document.getElementById("quiz-submit") as HTMLButtonElement;
		this.feedbackEl = document.getElementById("quiz-feedback") as HTMLElement;

		this.submitEl.addEventListener("click", () => this.handleSubmit());
		this.answerEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter") this.handleSubmit();
		});
	}

	showNextItem(): void {
		this.feedbackEl.hidden = true;
		this.currentItem = this.session.getNextItem();

		if (!this.currentItem) return;

		const [before, after] = this.currentItem.item.prompt.split("?");
		this.beforeEl.textContent = before;
		this.afterEl.textContent = after;
		this.answerEl.value = "";
		this.answerEl.focus();
	}

	private handleSubmit(): void {
		if (!this.currentItem) return;

		const userAnswer = Number.parseInt(this.answerEl.value, 10);
		if (Number.isNaN(userAnswer)) return;

		const correct = userAnswer === this.currentItem.item.answer;
		this.session.submitAnswer(this.currentItem.itemId, correct);

		this.feedbackEl.hidden = false;
		this.feedbackEl.className = `feedback ${correct ? "correct" : "incorrect"}`;
		this.feedbackEl.textContent = correct
			? "Correct!"
			: `Incorrect. The answer is ${this.currentItem.item.answer}.`;

		setTimeout(() => this.showNextItem(), correct ? 800 : 2000);
	}
}
