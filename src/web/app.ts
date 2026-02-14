import { QuizSession } from "../domain/quiz-session";
import { LocalStorageAdapter } from "../infrastructure/local-storage-adapter";
import { ConfigView } from "./config-view";
import { QuizView } from "./quiz-view";
import { StatsView } from "./stats-view";

const storage = new LocalStorageAdapter();
const session = new QuizSession(storage);
session.initialize();

const quizView = new QuizView(session);
const statsView = new StatsView(storage);
const configView = new ConfigView(storage, () => {
	session.initialize();
	statsView.render();
});

// View switching
const quizViewEl = document.getElementById("quiz-view") as HTMLElement;
const altViewsEl = document.getElementById("alt-views") as HTMLElement;
const configDetails = document.getElementById(
	"config-details",
) as HTMLDetailsElement;
const statsDetails = document.getElementById(
	"stats-details",
) as HTMLDetailsElement;
const hamburgerBtn = document.getElementById("hamburger-menu") as HTMLElement;
const backBtn = document.getElementById("close-alt-views") as HTMLElement;

function showAltViews() {
	quizViewEl.hidden = true;
	altViewsEl.hidden = false;

	// Reset details state: Settings open, Stats closed
	configDetails.open = true;
	statsDetails.open = false;

	configView.render();
	statsView.render();
}

function showQuiz() {
	altViewsEl.hidden = true;
	quizViewEl.hidden = false;
	quizView.showNextItem();
}

hamburgerBtn.addEventListener("click", () => {
	if (altViewsEl.hidden) {
		showAltViews();
	} else {
		showQuiz();
	}
});

backBtn.addEventListener("click", () => {
	showQuiz();
});

// Initial state
showQuiz();
