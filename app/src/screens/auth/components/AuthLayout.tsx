import type { ReactNode } from "react";
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Images from "../../../utils/imageIndexer";
import { useAppColors } from "../../../theme/appColors";
import { useInsets } from "../../classes/components/theory/useInsets";

/**
 * Casca do login e do cadastro: fundo da tela, marca no topo e a folha do
 * formulário, que rola quando o teclado come a altura. A folha tem largura
 * máxima (440 dp) e os campos ocupam a largura dela inteira, em vez de medidas
 * fixas que quebravam em telas estreitas.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
	const app = useAppColors();
	const { top, bottom } = useInsets();

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={[styles.screen, { backgroundColor: app.canvas }]}
		>
			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingTop: top + 24, paddingBottom: bottom + 24 },
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				onScrollBeginDrag={Keyboard.dismiss}
			>
				<View style={styles.brand}>
					<Image style={styles.logo} source={Images.icon} />
					<Text style={[styles.wordmark, { color: app.authAccent }]}>Codap</Text>
				</View>
				<View style={[styles.sheet, { backgroundColor: app.sheet }]}>{children}</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
		gap: 24,
	},
	brand: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	logo: {
		width: 64,
		height: 64,
	},
	wordmark: {
		fontSize: 46,
		fontWeight: "bold",
	},
	sheet: {
		width: "100%",
		maxWidth: 440,
		padding: 24,
		borderRadius: 28,
		gap: 16,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 10,
	},
});
