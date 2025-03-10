import { StyleProp, StyleSheet, View } from "react-native";
import { Surface, Title } from "react-native-paper";
import Icon from "../../../components/Icon";
import { useTheme } from "@react-navigation/native";

interface Props {
	screenName: string;
	iconName: string;
	style?: StyleProp<any>;
}

export default function Header({ screenName, iconName, style }: Props) {
	const { colors } = useTheme();

	return (
		<Surface
			style={[
				styles.header,
				style,
				{ backgroundColor: colors.background },
			]}
		>
			<View style={[styles.view, { backgroundColor: colors.background }]}>
				<Icon
					name="keyboard-arrow-down"
					type={"material"}
					color={colors.text}
				/>
			</View>
			<View
				style={[
					styles.titleView,
					{
						/* color: colors.background */
					},
				]}
			>
				<Title style={{ color: colors.text, fontFamily: "Roboto" }}>
					{screenName}
				</Title>
			</View>
			<View style={[styles.view, styles.rightView]}>
				<Icon name={iconName} type={"ionicon"} color="#637aff" />
			</View>
		</Surface>
	);
}

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
		flex: 1,
	},
	rightView: {
		justifyContent: "flex-end",
	},
});
