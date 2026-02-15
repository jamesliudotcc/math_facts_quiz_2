import Checkbox from "expo-checkbox";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StoragePort } from "../domain/ports";
import { ALL_QUIZ_FORMATS, type QuizFormat } from "../domain/quiz-format";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

const FORMAT_LABELS: Record<string, string> = {
	mul: "a \u00d7 b = ?",
	mul_miss: "a \u00d7 ? = p",
	div: "p \u00f7 a = ?",
	div_miss_divisor: "p \u00f7 ? = a",
	div_miss_dividend: "? \u00f7 a = b",
};

type Props = {
	storage: StoragePort;
	onConfigChange: () => void;
};

export function SettingsPanel({ storage, onConfigChange }: Props) {
	const config = storage.getUserConfig();

	function toggleTable(t: number) {
		const tables = new Set(config.selectedTables);
		if (tables.has(t)) {
			tables.delete(t);
		} else {
			tables.add(t);
		}
		storage.saveUserConfig({ ...config, selectedTables: tables });
		onConfigChange();
	}

	function toggleFormat(fmt: QuizFormat) {
		const formats = new Set(config.enabledFormats);
		if (formats.has(fmt)) {
			formats.delete(fmt);
		} else {
			formats.add(fmt);
		}
		storage.saveUserConfig({ ...config, enabledFormats: formats });
		onConfigChange();
	}

	function resetToDefaults() {
		storage.saveUserConfig(DEFAULT_USER_CONFIG);
		onConfigChange();
	}

	function clearHistory() {
		storage.clearAllAttempts();
		onConfigChange();
	}

	return (
		<View>
			<Text style={styles.sectionLabel}>Tables</Text>
			<View style={styles.tableGrid}>
				{Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
					<View key={t} style={styles.checkRow}>
						<Checkbox
							value={config.selectedTables.has(t)}
							onValueChange={() => toggleTable(t)}
						/>
						<Text style={styles.checkLabel}>{t}</Text>
					</View>
				))}
			</View>

			<Text style={styles.sectionLabel}>Formats</Text>
			{ALL_QUIZ_FORMATS.map((fmt) => (
				<View key={fmt} style={styles.checkRow}>
					<Checkbox
						value={config.enabledFormats.has(fmt)}
						onValueChange={() => toggleFormat(fmt)}
					/>
					<Text style={styles.checkLabel}>{FORMAT_LABELS[fmt]}</Text>
				</View>
			))}

			<View style={styles.buttons}>
				<Pressable style={styles.btn} onPress={resetToDefaults}>
					<Text style={styles.btnText}>Reset to Defaults</Text>
				</Pressable>
				<Pressable
					style={[styles.btn, styles.dangerBtn]}
					onPress={clearHistory}
				>
					<Text style={[styles.btnText, styles.dangerText]}>Clear History</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	sectionLabel: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 12,
	},
	tableGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	checkRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
		marginRight: 12,
	},
	checkLabel: {
		marginLeft: 6,
		fontSize: 15,
	},
	buttons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 20,
	},
	btn: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#666",
	},
	btnText: {
		fontSize: 14,
	},
	dangerBtn: {
		borderColor: "#c00",
	},
	dangerText: {
		color: "#c00",
	},
});
