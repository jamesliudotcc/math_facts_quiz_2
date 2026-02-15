import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StoragePort } from "../domain/ports";
import type { QuizSession } from "../domain/quiz-session";
import { AltViewsScreen } from "./AltViewsScreen";
import { QuizScreen } from "./QuizScreen";

type Props = {
	storage: StoragePort;
	session: QuizSession;
};

export function AppContent({ storage, session }: Props) {
	const [screen, setScreen] = useState<"quiz" | "alt">("quiz");
	const [quizKey, setQuizKey] = useState(0);

	function handleConfigChange() {
		session.initialize();
		setQuizKey((k) => k + 1);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Math Facts Quiz</Text>
				<Pressable
					onPress={() => setScreen(screen === "quiz" ? "alt" : "quiz")}
					style={styles.menuBtn}
				>
					<Text style={styles.menuIcon}>
						{screen === "quiz" ? "\u2630" : "\u2715"}
					</Text>
				</Pressable>
			</View>
			{screen === "quiz" ? (
				<QuizScreen key={quizKey} session={session} />
			) : (
				<AltViewsScreen
					storage={storage}
					onConfigChange={handleConfigChange}
					onBack={() => setScreen("quiz")}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 50,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	menuBtn: {
		padding: 8,
	},
	menuIcon: {
		fontSize: 24,
	},
});
