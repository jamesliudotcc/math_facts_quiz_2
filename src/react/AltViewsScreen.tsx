import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import type { StoragePort } from "../domain/ports";
import { CollapsibleSection } from "./CollapsibleSection";
import { SettingsPanel } from "./SettingsPanel";
import { StatsPanel } from "./StatsPanel";

type Props = {
	storage: StoragePort;
	onConfigChange: () => void;
	onBack: () => void;
};

export function AltViewsScreen({ storage, onConfigChange, onBack }: Props) {
	return (
		<ScrollView style={styles.container}>
			<Pressable style={styles.backBtn} onPress={onBack}>
				<Text style={styles.backText}>Back to Quiz</Text>
			</Pressable>

			<CollapsibleSection title="Settings" defaultOpen>
				<SettingsPanel storage={storage} onConfigChange={onConfigChange} />
			</CollapsibleSection>

			<CollapsibleSection title="Statistics">
				<StatsPanel storage={storage} />
			</CollapsibleSection>

			<CollapsibleSection title="About">
				<Text style={styles.about}>
					Math Facts Quiz helps you master multiplication and division facts
					using spaced repetition. Practice regularly for best results!
				</Text>
			</CollapsibleSection>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	backBtn: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#666",
		alignSelf: "flex-start",
		marginBottom: 16,
	},
	backText: {
		fontSize: 16,
	},
	about: {
		fontSize: 15,
		lineHeight: 22,
		color: "#444",
	},
});
