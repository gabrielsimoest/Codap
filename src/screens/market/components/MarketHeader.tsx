import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Surface, Title } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ThemedIcon from "../../../components/themed/ThemedIcon";
import useUserStore from "../../../stores/UserStore";

const MarketHeader = () => {
	const { t } = useTranslation();

	const { colors } = useTheme();

	const user = useUserStore((s) => s.user);

	const TitleView = () => (
		<View>
			<Title
				style={{
					color: colors.text,
					fontFamily: "Roboto",
					marginLeft: 30,
				}}
			>
				{t("market")}
			</Title>
		</View>
	);
	const RightView = () => (
		<View style={[styles.view, styles.rightView]}>
			<Text
				style={{
					color: colors.text,
					fontFamily: "Roboto",
					fontSize: 19,
					fontWeight: "bold",
				}}
			>
				{user?.dependaBots}{" "}
			</Text>
			<ThemedIcon type={"octicons"} name="dependabot" size={21} />
		</View>
	);
	return (
		<Surface
			style={[styles.header, { backgroundColor: colors.background }]}
		>
			<TitleView />
			<RightView />
		</Surface>
	);
};

export default MarketHeader;

const styles = StyleSheet.create({
	header: {
		paddingTop: 15,
		height: 60,
		elevation: 4,
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: "row",
		borderWidth: 2,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#141f20",

		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},

		shadowOpacity: 0.28,
		shadowRadius: 4,
	},
	view: {
		marginHorizontal: 16,
		alignItems: "center",
		flexDirection: "row",
	},
	titleView: {
		color: "white",
	},
	rightView: {
		justifyContent: "flex-end",
	},
	rowView: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 10,
	},
});
