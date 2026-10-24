import { useRef, type ReactNode } from "react";
import {
	Image,
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
import useKeyboardHeight from "../../../hooks/useKeyboardHeight";
import useFocusScroll, { FocusScrollContext } from "../../../hooks/useFocusScroll";
import ServerWakingNotice from "../../../components/ServerWakingNotice";

/**
 * Casca do login e do cadastro: fundo da tela, marca no topo e a folha do
 * formulário. A folha tem largura máxima (440 dp) e os campos ocupam a largura
 * dela inteira, em vez de medidas fixas que quebravam em telas estreitas.
 *
 * **Teclado:** no Android a janela não redimensiona com ele, então a área da
 * rolagem é encurtada na altura do teclado (`paddingBottom`) e o campo focado é
 * levado para a parte visível. O conteúdo sobe junto, sem ser espremido — nada de
 * layout achatado. No iOS quem faz isso é o `KeyboardAvoidingView`.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
	const app = useAppColors();
	const { top, bottom } = useInsets();
	const scrollRef = useRef<ScrollView>(null);
	const keyboardHeight = useKeyboardHeight();
	const scrollToFocused = useFocusScroll(scrollRef, keyboardHeight);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={[styles.screen, { backgroundColor: app.canvas }]}
		>
			<View style={[styles.screen, { paddingBottom: Platform.OS === "android" ? keyboardHeight : 0 }]}>
				<ScrollView
					ref={scrollRef}
					contentContainerStyle={[
						styles.content,
						{ paddingTop: top + 24, paddingBottom: bottom + 24 },
					]}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.brand}>
						<Image style={styles.logo} source={Images.icon} />
						<Text style={[styles.wordmark, { color: app.authAccent }]}>Codap</Text>
					</View>
					<ServerWakingNotice />
					<FocusScrollContext.Provider value={scrollToFocused}>
						<View style={[styles.sheet, { backgroundColor: app.sheet }]}>{children}</View>
					</FocusScrollContext.Provider>
				</ScrollView>
			</View>
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
