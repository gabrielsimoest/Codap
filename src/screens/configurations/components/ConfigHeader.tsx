import React from "react";
import { View, StyleSheet } from "react-native";
import { Title } from "react-native-paper";
import { useTheme } from "@react-navigation/native";

export default function ConfigHeader({ title }: { title: string }) {
	const { colors } = useTheme();

	return (
		<View style={[styles.header, { backgroundColor: colors.background }]}>
			<Title
				style={{
					color: colors.text,
					fontFamily: "Roboto",
					marginLeft: 30,
				}}
			>
				{title}
			</Title>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingTop: 15,
		height: 60,
		elevation: 4,
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		borderWidth: 2,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#141f29",

		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 4,
	},
});
