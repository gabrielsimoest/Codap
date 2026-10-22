import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
	children: ReactNode;
	/** Linha extra sob o título (o nível do perfil). Quem a usa cuida do próprio espaçamento lateral. */
	footer?: ReactNode;
}

/**
 * Cabeçalho das abas: chapado, na cor da tela, sem borda nem sombra. A separação
 * do conteúdo é o degradê (`EdgeFade`) que a tela põe logo abaixo.
 */
export default function ScreenHeader({ children, footer }: Props) {
	const { colors } = useTheme();

	return (
		<View style={[styles.header, { backgroundColor: colors.background }]}>
			<View style={styles.row}>{children}</View>
			{footer}
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingTop: 20,
	},
	row: {
		height: 50,
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: "row",
	},
});
