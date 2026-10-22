import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Title } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ThemedIcon from "../../../components/themed/ThemedIcon";
import ScreenHeader from "../../../components/layout/ScreenHeader";
import useUserStore from "../../../stores/UserStore";

const MarketHeader = () => {
	const { t } = useTranslation();

	const { colors } = useTheme();

	const user = useUserStore((s) => s.user);

	return (
		<ScreenHeader>
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
			<View style={styles.rightView}>
				<Text
					style={{
						color: colors.text,
						fontFamily: "Roboto",
						fontSize: 19,
						fontWeight: "bold",
					}}
				>
					{user?.bits}{" "}
				</Text>
				<ThemedIcon type={"octicons"} name="cpu" size={21} />
			</View>
		</ScreenHeader>
	);
};

export default MarketHeader;

const styles = StyleSheet.create({
	rightView: {
		marginHorizontal: 16,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});
