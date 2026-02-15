import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { StoragePort } from "./src/domain/ports";
import { QuizSession } from "./src/domain/quiz-session";
import { AsyncStorageAdapter } from "./src/infrastructure/async-storage-adapter";
import { AppContent } from "./src/react/AppContent";

export default function App() {
	const [ready, setReady] = useState<{
		storage: StoragePort;
		session: QuizSession;
	} | null>(null);

	useEffect(() => {
		AsyncStorageAdapter.create().then((storage) => {
			const session = new QuizSession(storage);
			session.initialize();
			setReady({ storage, session });
		});
	}, []);

	if (!ready) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size="large" />
				<StatusBar style="auto" />
			</View>
		);
	}

	return (
		<>
			<AppContent storage={ready.storage} session={ready.session} />
			<StatusBar style="auto" />
		</>
	);
}

const styles = StyleSheet.create({
	loading: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
