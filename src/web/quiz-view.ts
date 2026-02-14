import type { QuizResult, QuizSession } from "../domain/quiz-session";

export class QuizView {
	private promptEl: HTMLElement;
	private answerEl: HTMLInputElement;
	private submitEl: HTMLButtonElement;
	private feedbackEl: HTMLElement;
	private doneEl: HTMLElement;
	private currentItem: QuizResult | null = null;

	constructor(private session: QuizSession) {
		this.promptEl = document.getElementById("quiz-prompt") as HTMLElement;
		this.answerEl = document.getElementById("quiz-answer") as HTMLInputElement;
		this.submitEl = document.getElementById("quiz-submit") as HTMLButtonElement;
		this.feedbackEl = document.getElementById("quiz-feedback") as HTMLElement;
		this.doneEl = document.getElementById("quiz-done") as HTMLElement;

		this.submitEl.addEventListener("click", () => this.handleSubmit());
		this.answerEl.addEventListener("keydown", (e) => {
			if (e.key === "Enter") this.handleSubmit();
		});
	}

	showNextItem(): void {
		this.feedbackEl.hidden = true;
		this.currentItem = this.session.getNextItem();

		if (!this.currentItem) {
			this.promptEl.textContent = "";
			this.answerEl.hidden = true;
			this.submitEl.hidden = true;
			this.doneEl.hidden = false;
			return;
		}

		this.answerEl.hidden = false;
		this.submitEl.hidden = false;
		this.doneEl.hidden = true;
		this.promptEl.textContent = this.currentItem.item.prompt;
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
