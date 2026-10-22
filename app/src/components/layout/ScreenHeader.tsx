import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useInsets } from "../../screens/classes/components/theory/useInsets";

/** Altura da linha do título; o cabeçalho inteiro é isto mais `useHeaderTopPadding()`. */
export const HEADER_ROW_HEIGHT = 50;

/**
 * Respiro acima do título: a área da barra de status (que varia de aparelho para
 * aparelho — o A52 tem a barra mais alta que o emulador) mais 6 dp. Um valor fixo
 * deixava o título colado nas notificações em aparelhos de barra alta.
 */
export function useHeaderTopPadding() {
	return useInsets().top + 6;
}

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
	const paddingTop = useHeaderTopPadding();

	return (
		<View style={[styles.header, { backgroundColor: colors.background, paddingTop }]}>
			<View style={styles.row}>{children}</View>
			{footer}
		</View>
	);
}

const styles = StyleSheet.create({
	header: {},
	row: {
		height: HEADER_ROW_HEIGHT,
		alignItems: "center",
		justifyContent: "space-between",
		flexDirection: "row",
	},
});
