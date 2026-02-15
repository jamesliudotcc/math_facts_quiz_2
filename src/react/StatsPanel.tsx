import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StoragePort } from "../domain/ports";
import { MasteryGrid } from "./MasteryGrid";

type TimeFilter = "all" | "24h";

type Props = {
	storage: StoragePort;
};

export function StatsPanel({ storage }: Props) {
	const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

	const allAttempts = storage.getAllAttempts();
	const cutoff = Date.now() - 86_400_000;
	const attempts =
		timeFilter === "24h"
			? allAttempts.filter((a) => a.timestamp > cutoff)
			: allAttempts;

	return (
		<View>
			<View style={styles.toggle}>
				<Pressable
					onPress={() => setTimeFilter("all")}
					style={[styles.btn, timeFilter === "all" && styles.btnActive]}
				>
					<Text
						style={[
							styles.btnText,
							timeFilter === "all" && styles.btnTextActive,
						]}
					>
						All Time
					</Text>
				</Pressable>
				<Pressable
					onPress={() => setTimeFilter("24h")}
					style={[styles.btn, timeFilter === "24h" && styles.btnActive]}
				>
					<Text
						style={[
							styles.btnText,
							timeFilter === "24h" && styles.btnTextActive,
						]}
					>
						Last 24h
					</Text>
				</Pressable>
			</View>
			<MasteryGrid attempts={attempts} />
		</View>
	);
}

const styles = StyleSheet.create({
	toggle: {
		flexDirection: "row",
		marginBottom: 12,
		gap: 8,
	},
	btn: {
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#666",
	},
	btnActive: {
		backgroundColor: "#333",
		borderColor: "#333",
	},
	btnText: {
		fontSize: 14,
		color: "#333",
	},
	btnTextActive: {
		color: "#fff",
	},
});
