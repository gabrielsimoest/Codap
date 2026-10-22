import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import EdgeFade from "./layout/EdgeFade";
import { Modal, Portal } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";
import ResizableText from "./ResizableText";
import { useAppColors } from "../theme/appColors";

/** Altura do degradê nas pontas do corpo que rola. */
const FADE = 24;

interface Props {
	visible: boolean;
	onDismiss: () => void;
	title?: string;
	/** Sem o X do canto: para avisos que se resolvem num botão do rodapé. */
	hideClose?: boolean;
	/** O corpo rola quando passa de 82% da tela (textos longos, grades). */
	scroll?: boolean;
	/** Botão ou botões de ação, fixos embaixo do corpo. */
	footer?: ReactNode;
	children?: ReactNode;
}

/**
 * Casca dos modais do app: véu, cartão na superfície elevada (`primary`) com
 * cantos de 24, título e X no cabeçalho, corpo e rodapé. Fecha tocando fora do
 * cartão, no X ou no botão voltar. A altura vem do conteúdo — nada de altura em
 * porcentagem sobrando vazia.
 */
export default function AppModal({
	visible,
	onDismiss,
	title,
	hideClose = false,
	scroll = false,
	footer,
	children,
}: Props) {
	const { colors } = useTheme();
	const app = useAppColors();
	const { t } = useTranslation();
	// Posição da rolagem, para o degradê aparecer só do lado que ainda tem conteúdo.
	const [scrollY, setScrollY] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);
	const [viewHeight, setViewHeight] = useState(0);
	// O corpo remonta a cada abertura, já no topo: a posição guardada da vez anterior não vale.
	useEffect(() => {
		if (visible) setScrollY(0);
	}, [visible]);
	const canScrollUp = scrollY > 2;
	const canScrollDown = contentHeight - viewHeight - scrollY > 2;

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={styles.fill}
				style={{ backgroundColor: app.scrim }}
				dismissableBackButton
			>
				<View style={styles.center}>
					{/* Tocar fora do cartão fecha o modal. O fundo é um irmão do cartão, e não o
					    pai dele: com o cartão dentro de um `Pressable`, o toque era tomado por ele
					    e a rolagem do corpo (Sobre, Conquistas) não pegava no aparelho. */}
					<Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessible={false} />
					<View
						style={[
							styles.card,
							{ backgroundColor: colors.primary, borderColor: colors.border },
						]}
					>
						{title !== undefined || !hideClose ? (
							<View style={styles.header}>
								<View style={styles.titleBox}>
									{title !== undefined ? (
										<ResizableText style={styles.title} defaultSize={22}>
											{title}
										</ResizableText>
									) : null}
								</View>
								{hideClose ? null : (
									<TouchableOpacity
										onPress={onDismiss}
										hitSlop={12}
										accessibilityRole="button"
										accessibilityLabel={t("close")}
										style={styles.close}
									>
										<Icon type="ionicon" name="close" size={26} color={app.muted} />
									</TouchableOpacity>
								)}
							</View>
						) : null}
						{scroll ? (
							<View style={styles.body}>
								<ScrollView
									style={styles.scroll}
									showsVerticalScrollIndicator={false}
									nestedScrollEnabled
									// Com o teclado aberto, o primeiro toque num botão ou link do
									// corpo não pode ser gasto só para fechar o teclado.
									keyboardShouldPersistTaps="handled"
									scrollEventThrottle={16}
									onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
									onContentSizeChange={(_, height) => setContentHeight(height)}
									onLayout={(event) => setViewHeight(event.nativeEvent.layout.height)}
								>
									{children}
								</ScrollView>
								{/* O que passa por baixo do cabeçalho ou do rodapé some num degradê da cor do cartão. */}
								{canScrollUp ? <EdgeFade edge="top" height={FADE} color={colors.primary} /> : null}
								{canScrollDown ? <EdgeFade edge="bottom" height={FADE} color={colors.primary} /> : null}
							</View>
						) : (
							<View style={styles.body}>{children}</View>
						)}
						{footer ? <View style={styles.footer}>{footer}</View> : null}
					</View>
				</View>
			</Modal>
		</Portal>
	);
}

const styles = StyleSheet.create({
	fill: {
		flex: 1,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	card: {
		width: "100%",
		maxWidth: 440,
		maxHeight: "82%",
		borderRadius: 24,
		borderWidth: 1,
		padding: 20,
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 14,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 14,
		minHeight: 32,
	},
	titleBox: {
		flex: 1,
	},
	title: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	close: {
		marginLeft: 12,
	},
	body: {
		flexShrink: 1,
	},
	scroll: {
		flexShrink: 1,
	},
	footer: {
		marginTop: 18,
	},
});
