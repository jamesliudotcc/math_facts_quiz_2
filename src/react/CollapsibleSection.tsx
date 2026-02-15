import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
};

export function CollapsibleSection({
	title,
	defaultOpen = false,
	children,
}: Props) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<View style={styles.container}>
			<Pressable onPress={() => setOpen(!open)} style={styles.header}>
				<Text style={styles.arrow}>{open ? "▼" : "▶"}</Text>
				<Text style={styles.title}>{title}</Text>
			</Pressable>
			{open && <View style={styles.body}>{children}</View>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 8,
		backgroundColor: "#f0f0f0",
		borderRadius: 6,
	},
	arrow: {
		fontSize: 14,
		marginRight: 8,
		width: 20,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	body: {
		paddingHorizontal: 8,
		paddingTop: 12,
	},
});
