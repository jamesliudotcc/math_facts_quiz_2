import { StyleSheet, Text, View } from "react-native";
import type { Attempt } from "../domain/attempt";
import { deriveFamilyStats } from "../domain/quiz-engine";

type Props = {
	attempts: Attempt[];
};

export function MasteryGrid({ attempts }: Props) {
	const attemptsByFamily = new Map<string, Attempt[]>();
	for (const a of attempts) {
		const arr = attemptsByFamily.get(a.familyId);
		if (arr) {
			arr.push(a);
		} else {
			attemptsByFamily.set(a.familyId, [a]);
		}
	}

	const statsMap = new Map<string, number>();
	for (const [id, familyAttempts] of attemptsByFamily) {
		const stats = deriveFamilyStats(familyAttempts);
		statsMap.set(id, stats.effectiveSuccesses);
	}

	const rows: React.ReactNode[] = [];

	for (let r = 1; r <= 10; r++) {
		const cells: React.ReactNode[] = [];
		cells.push(
			<Text key={`rh-${r}`} style={styles.rowHeader}>
				{r}
			</Text>,
		);
		for (let c = 1; c <= r; c++) {
			const key = `${c}x${r}`;
			const es = statsMap.get(key);

			let bg: string;
			if (es === undefined) {
				bg = "#ddd";
			} else if (es === 0) {
				bg = "hsl(0, 70%, 45%)";
			} else {
				const lightness = 65 - Math.min(es, 6) * 4.5;
				bg = `hsl(120, 70%, ${lightness}%)`;
			}

			cells.push(
				<View
					key={`${c}x${r}`}
					style={[styles.cell, { backgroundColor: bg }]}
				/>,
			);
		}
		rows.push(
			<View key={`row-${r}`} style={styles.row}>
				{cells}
			</View>,
		);
	}

	// Bottom column headers
	const colHeaders: React.ReactNode[] = [];
	colHeaders.push(
		<Text key="ch-empty" style={styles.rowHeader}>
			{""}
		</Text>,
	);
	for (let c = 1; c <= 10; c++) {
		colHeaders.push(
			<Text key={`ch-${c}`} style={styles.colHeader}>
				{c}
			</Text>,
		);
	}

	return (
		<View style={styles.container}>
			{rows}
			<View style={styles.row}>{colHeaders}</View>
		</View>
	);
}

const CELL_SIZE = 28;
const GAP = 2;

const styles = StyleSheet.create({
	container: {
		alignItems: "flex-start",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	rowHeader: {
		width: CELL_SIZE,
		textAlign: "center",
		fontSize: 12,
		fontWeight: "bold",
	},
	colHeader: {
		width: CELL_SIZE + GAP,
		textAlign: "center",
		fontSize: 12,
		fontWeight: "bold",
	},
	cell: {
		width: CELL_SIZE,
		height: CELL_SIZE,
		margin: GAP / 2,
		borderRadius: 3,
	},
});
