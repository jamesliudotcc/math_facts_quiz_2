import { QuizSession } from "../domain/quiz-session";
import { LocalStorageAdapter } from "../infrastructure/local-storage-adapter";
import { ConfigView } from "./config-view";
import { QuizView } from "./quiz-view";
import { StatsView } from "./stats-view";

const storage = new LocalStorageAdapter();
const session = new QuizSession(storage);
session.initialize();

const quizView = new QuizView(session);
const configView = new ConfigView(storage, () => {
	session.initialize();
	quizView.showNextItem();
});
const statsView = new StatsView(storage);

// View switching
const views: Record<string, HTMLElement> = {
	quiz: document.getElementById("quiz-view") as HTMLElement,
	config: document.getElementById("config-view") as HTMLElement,
	stats: document.getElementById("stats-view") as HTMLElement,
};

function showView(name: "quiz" | "config" | "stats") {
	for (const [key, el] of Object.entries(views)) {
		el.hidden = key !== name;
	}
	for (const link of document.querySelectorAll("[data-view]")) {
		const el = link as HTMLElement;
		if (el.dataset.view === name) {
			el.setAttribute("aria-current", "page");
		} else {
			el.removeAttribute("aria-current");
		}
	}
	if (name === "quiz") quizView.showNextItem();
	if (name === "config") configView.render();
	if (name === "stats") statsView.render();
}

// Nav click handlers
for (const link of document.querySelectorAll("[data-view]")) {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		showView((link as HTMLElement).dataset.view as "quiz" | "config" | "stats");
	});
}

// Initial view
showView("quiz");
