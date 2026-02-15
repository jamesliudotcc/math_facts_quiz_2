import { useCallback, useEffect, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import type { QuizResult, QuizSession } from "../domain/quiz-session";

type Props = {
	session: QuizSession;
};

export function QuizScreen({ session }: Props) {
	const [currentItem, setCurrentItem] = useState<QuizResult | null>(null);
	const [feedback, setFeedback] = useState<{
		correct: boolean;
		message: string;
	} | null>(null);
	const [userAnswer, setUserAnswer] = useState("");
	const [streak, setStreak] = useState(() => {
		const attempts = session.getAllAttempts();
		let s = 0;
		for (let i = attempts.length - 1; i >= 0; i--) {
			if (!attempts[i].correct) break;
			s++;
		}
		return s;
	});
	const inputRef = useRef<TextInput>(null);

	const showNext = useCallback(() => {
		setFeedback(null);
		setUserAnswer("");
		const next = session.getNextItem();
		setCurrentItem(next);
		setTimeout(() => inputRef.current?.focus(), 100);
	}, [session]);

	useEffect(() => {
		showNext();
	}, [showNext]);

	function handleSubmit() {
		if (!currentItem) return;

		const parsed = Number.parseInt(userAnswer, 10);
		if (Number.isNaN(parsed)) return;

		const correct = parsed === currentItem.item.answer;
		session.submitAnswer(currentItem.familyId, currentItem.format, correct);

		if (correct) {
			setStreak((s) => s + 1);
			setFeedback({ correct: true, message: "Correct!" });
		} else {
			setStreak(0);
			setFeedback({
				correct: false,
				message: `Incorrect. The answer is ${currentItem.item.answer}.`,
			});
		}

		setTimeout(() => showNext(), correct ? 800 : 2000);
	}

	if (!currentItem) {
		return (
			<View style={styles.container}>
				<Text style={styles.prompt}>No items available</Text>
			</View>
		);
	}

	const [before, after] = currentItem.item.prompt.split("?");

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			{streak > 0 && <Text style={styles.streak}>Streak: {streak}</Text>}
			<View style={styles.promptRow}>
				<Text style={styles.prompt}>{before}</Text>
				<TextInput
					ref={inputRef}
					style={styles.input}
					value={userAnswer}
					onChangeText={setUserAnswer}
					keyboardType="number-pad"
					onSubmitEditing={handleSubmit}
					editable={feedback === null}
				/>
				<Text style={styles.prompt}>{after}</Text>
			</View>
			<Pressable
				style={styles.submitBtn}
				onPress={handleSubmit}
				disabled={feedback !== null}
			>
				<Text style={styles.submitText}>Submit</Text>
			</Pressable>
			{feedback && (
				<View
					style={[
						styles.feedback,
						feedback.correct
							? styles.feedbackCorrect
							: styles.feedbackIncorrect,
					]}
				>
					<Text style={styles.feedbackText}>{feedback.message}</Text>
				</View>
			)}
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	streak: {
		fontSize: 16,
		color: "#666",
		marginBottom: 12,
	},
	promptRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	prompt: {
		fontSize: 32,
	},
	input: {
		fontSize: 32,
		width: 80,
		textAlign: "center",
		borderWidth: 1,
		borderColor: "#999",
		borderRadius: 6,
		paddingVertical: 4,
		paddingHorizontal: 8,
		marginHorizontal: 4,
	},
	submitBtn: {
		backgroundColor: "#333",
		paddingVertical: 10,
		paddingHorizontal: 32,
		borderRadius: 6,
		marginBottom: 20,
	},
	submitText: {
		color: "#fff",
		fontSize: 18,
	},
	feedback: {
		width: "100%",
		padding: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	feedbackCorrect: {
		backgroundColor: "#4caf50",
	},
	feedbackIncorrect: {
		backgroundColor: "#e53935",
	},
	feedbackText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});
