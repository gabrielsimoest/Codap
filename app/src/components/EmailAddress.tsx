import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import Icon from "./Icon";
import ResizableText from "./ResizableText";
import { useAppColors } from "../theme/appColors";

interface Props {
	email: string;
}

/**
 * O endereço de e-mail como dado em destaque dentro de um modal: uma placa
 * rebaixada (superfície `card`) com o envelope e o endereço em negrito. É o que
 * a pessoa precisa conferir — e, no caso de um erro de digitação, perceber —, por
 * isso não fica solto no meio de uma frase.
 */
export default function EmailAddress({ email }: Props) {
	const { colors } = useTheme();
	const app = useAppColors();
	// Um endereço comprido sem espaços quebrava no meio de uma palavra. O espaço
	// de largura zero (invisível) antes de `@`, `.`, `_` e `-` dá à linha onde
	// quebrar de forma legível; o rótulo de acessibilidade continua o e-mail limpo.
	const breakable = email.replace(/([@._-])/g, "\u200b$1");

	return (
		<View
			style={[styles.plate, { backgroundColor: colors.card }]}
			accessible
			accessibilityRole="text"
			accessibilityLabel={email}
		>
			<Icon type="ionicon" name="mail-outline" size={22} color={app.muted} />
			<View style={styles.address}>
				<ResizableText style={styles.text} defaultSize={16}>
					{breakable}
				</ResizableText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	plate: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		minHeight: 52,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 14,
	},
	address: {
		flex: 1,
	},
	text: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
});
