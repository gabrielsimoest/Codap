import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "../../../components/Icon";
import ScreenHeader from "../../../components/layout/ScreenHeader";
import { useTheme } from "@react-navigation/native";

interface Props {
	screenName: string;
	iconName: string;
}

export default function ClassHeader({ screenName, iconName }: Props) {
	const { colors } = useTheme();

	return (
		<ScreenHeader>
			<View style={styles.view}>
				<Icon
					name="keyboard-arrow-down"
					type={"material"}
					color={colors.text}
				/>
			</View>
			<View style={styles.titleView}>
				<Text variant="titleLarge" style={{ color: colors.text, fontFamily: "Roboto" }}>
					{screenName}
				</Text>
			</View>
			<View style={[styles.view, styles.rightView]}>
				<Icon name={iconName} type={"ionicon"} color="#637aff" />
			</View>
		</ScreenHeader>
	);
}

const styles = StyleSheet.create({
	view: {
		marginHorizontal: 16,
		alignItems: "center",
		flexDirection: "row",
	},
	titleView: {
		flex: 1,
	},
	rightView: {
		justifyContent: "flex-end",
	},
});
