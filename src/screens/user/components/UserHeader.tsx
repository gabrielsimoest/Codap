import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Title } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import useUserStore from "../../../stores/UserStore";
import ThemedText from "../../../components/themed/ThemedText";

function UserHeader() {
	const { colors } = useTheme();

	const { t } = useTranslation();

	const user = useUserStore((s) => s.user);

	const XP = user?.XP || 0;

	return (
		<View style={[styles.header, { backgroundColor: colors.background }]}>
			<Title
				style={{
					color: colors.text,
					fontFamily: "Roboto",
					marginLeft: 30,
				}}
			>
				{t("account")}
			</Title>
			<View style={styles.xpStyle}>
				<ThemedText style={styles.textXP}>
					XP: {XP.toString()}
				</ThemedText>
			</View>
		</View>
	);
}

export default UserHeader;

const styles = StyleSheet.create({
	header: {
		paddingTop: 15,
		height: 60,
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: "row",
		borderWidth: 2,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#141f29",
		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 4,
		shadowOpacity: 0.28,
		shadowRadius: 4,
	},
	textXP: {
		color: "#fff",
		fontSize: 15,
		fontWeight: "bold",
		verticalAlign: "middle",
	},
	xpStyle: {
		paddingLeft: 15,
		borderColor: "#627bff",
		borderWidth: 2,
		borderRadius: 50,
		height: "60%",
		width: "35%",
		marginRight: "3%",
	},
});
