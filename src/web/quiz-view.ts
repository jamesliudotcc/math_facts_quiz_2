import confetti from "canvas-confetti";
import type { QuizResult, QuizSession } from "../domain/quiz-session";

export class QuizView {
	private beforeEl: HTMLElement;
	private afterEl: HTMLElement;
	private answerEl: HTMLInputElement;
	private submitEl: HTMLButtonElement;
	private feedbackEl: HTMLElement;
	private currentItem: QuizResult | null = null;
	private streak = 0;

	constructor(private session: QuizSession) {
		this.beforeEl = document.getElementById("quiz-before") as HTMLElement;
		this.afterEl = document.getElementById("quiz-after") as HTMLElement;
		this.answerEl = document.getElementById("quiz-answer") as HTMLInputElement;
		this.submitEl = document.getElementById("quiz-submit") as HTMLButtonElement;
		this.feedbackEl = document.getElementById("quiz-feedback") as HTMLElement;

		const attempts = this.session.getAllAttempts();
		for (let i = attempts.length - 1; i >= 0; i--) {
			if (!attempts[i].correct) break;
			this.streak++;
		}

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
		const wasFirstEverCorrect =
			correct && !this.session.getAllAttempts().some((a) => a.correct);
		this.session.submitAnswer(
			this.currentItem.familyId,
			this.currentItem.format,
			correct,
		);

		if (correct) {
			this.streak++;
			if (wasFirstEverCorrect || this.streak % 10 === 0) {
				confetti();
				document.dispatchEvent(new CustomEvent("confetti-fired"));
			}
		} else {
			this.streak = 0;
		}

		this.feedbackEl.hidden = false;
		this.feedbackEl.className = `feedback ${correct ? "correct" : "incorrect"}`;
		this.feedbackEl.textContent = correct
			? "Correct!"
			: `Incorrect. The answer is ${this.currentItem.item.answer}.`;

		setTimeout(() => this.showNextItem(), correct ? 800 : 2000);
	}
}
