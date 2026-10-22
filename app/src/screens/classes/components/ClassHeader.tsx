import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "../../../components/Icon";
import ScreenHeader from "../../../components/layout/ScreenHeader";
import { useTheme } from "@react-navigation/native";

interface Props {
	screenName: string;
	iconName: string;
}

/**
 * Cabeçalho da aba Aulas: o nome da área com a seta que avisa que o título abre o
 * seletor, e o ícone da área à direita. O título fica na mesma posição dos das
 * outras abas.
 */
export default function ClassHeader({ screenName, iconName }: Props) {
	const { colors } = useTheme();

	return (
		<ScreenHeader>
			<View style={styles.titleView}>
				<Text variant="titleLarge" style={{ color: colors.text, fontFamily: "Roboto" }}>
					{screenName}
				</Text>
				<Icon name="keyboard-arrow-down" type={"material"} color={colors.text} size={26} />
			</View>
			<View style={styles.rightView}>
				<Icon name={iconName} type={"ionicon"} color="#637aff" />
			</View>
		</ScreenHeader>
	);
}

const styles = StyleSheet.create({
	titleView: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		marginLeft: 30,
	},
	rightView: {
		marginHorizontal: 16,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});
