import React from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Modal, Portal } from "react-native-paper";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import { useTheme } from "@react-navigation/native";
import { useAppColors } from "../../../theme/appColors";
import ThemedView from "../../../components/themed/ThemedView";
import type { ContentAnnouncement } from "../../../services/ContentVersionService";
import Images from "../../../utils/imageIndexer";

/**
 * Quantas notas anteriores à mais recente o aviso mostra. O resto vira "e mais
 * N". O conteúdo é publicado com frequência (várias vezes no mesmo dia, às
 * vezes), e quem fica uma semana sem abrir volta com dezenas — listar todas
 * transformaria o aviso numa parede de texto.
 */
const MAX_EARLIER = 2;

/**
 * Separa a nota em destaque das anteriores. `entries` chega da mais nova para
 * a mais antiga (ordem da API).
 */
export function splitAnnouncements(
	entries: ContentAnnouncement[],
	maxEarlier = MAX_EARLIER
) {
	const [latest, ...rest] = entries;
	return {
		latest,
		earlier: rest.slice(0, maxEarlier),
		hiddenCount: Math.max(0, rest.length - maxEarlier),
	};
}

interface Props {
	entries: ContentAnnouncement[];
	onDismiss: () => void;
}

/**
 * Aviso de "conteúdo atualizado".
 *
 * Só informa: o conteúdo já foi atualizado quando isto aparece, e não há
 * escolha a fazer — daí um único botão e nenhum "deseja atualizar?".
 */
const ContentUpdateModal = ({ entries, onDismiss }: Props) => {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const app = useAppColors();
	const { latest, earlier, hiddenCount } = splitAnnouncements(entries);

	if (latest === undefined) {
		return null;
	}

	return (
		<Portal>
			{/* Sem `contentContainerStyle={{ flex: 1 }}`, como no
			    ValidationModal: assim o fundo recebe o toque e fecha o aviso. */}
			<Modal
				visible
				onDismiss={onDismiss}
				dismissableBackButton
				style={{ backgroundColor: app.isDark ? "rgba(0,0,0,0.6)" : app.scrim }}
			>
				<ThemedView style={styles.modalView}>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={onDismiss}
						hitSlop={16}
						accessibilityRole="button"
						accessibilityLabel={t("close")}
					>
						<Icon
							type="ionicon"
							name="close-outline"
							color={"#33526E"}
							size={50}
						/>
					</TouchableOpacity>

					<Image style={styles.figure} source={Images.codyHappy} />

					<ResizableText style={styles.title} defaultSize={24}>
						{t("contentUpdate.title")}
					</ResizableText>
					<ResizableText style={styles.version} defaultSize={14}>
						{t("contentUpdate.version", { version: latest.version })}
					</ResizableText>

					{/* Rola por dentro: com a fonte aumentada nas configurações,
					    notas longas passariam da altura da tela. */}
					<ScrollView
						style={styles.scroll}
						contentContainerStyle={styles.scrollContent}
					>
						<ResizableText style={styles.latest} defaultSize={17}>
							{latest.changelog}
						</ResizableText>

						{earlier.length > 0 ? (
							<View style={styles.earlier}>
								<ResizableText
									style={styles.earlierTitle}
									defaultSize={15}
								>
									{t("contentUpdate.earlier")}
								</ResizableText>
								{earlier.map((entry) => (
									<View key={entry.id} style={styles.entry}>
										<ResizableText
											style={styles.entryVersion}
											defaultSize={13}
										>
											{t("contentUpdate.version", {
												version: entry.version,
											})}
										</ResizableText>
										<ResizableText defaultSize={15}>
											{entry.changelog}
										</ResizableText>
									</View>
								))}
							</View>
						) : null}

						{hiddenCount > 0 ? (
							<ResizableText style={styles.more} defaultSize={14}>
								{hiddenCount === 1
									? t("contentUpdate.moreOne")
									: t("contentUpdate.moreMany", { count: hiddenCount })}
							</ResizableText>
						) : null}
					</ScrollView>

					{/* No claro `primary` é branco: o botão vira de ação (índigo, texto branco). */}
					<TouchableOpacity
						style={[
							styles.okButton,
							{ backgroundColor: app.isDark ? colors.primary : app.action },
						]}
						onPress={onDismiss}
					>
						<ResizableText
							useCustomColor
							style={[styles.okText, { color: app.onBrand }]}
							defaultSize={20}
						>
							{t("contentUpdate.ok")}
						</ResizableText>
					</TouchableOpacity>
				</ThemedView>
			</Modal>
		</Portal>
	);
};

const styles = StyleSheet.create({
	modalView: {
		margin: 20,
		borderRadius: 20,
		paddingBottom: 25,
		paddingHorizontal: 20,
		alignItems: "center",
	},
	// Alvo de toque com tamanho próprio e `hitSlop`, igual ao ValidationModal:
	// só o ícone empurrado por margem falhava às vezes.
	closeButton: {
		alignSelf: "flex-end",
		width: 50,
		height: 50,
		marginTop: 8,
		marginRight: -8,
		alignItems: "center",
		justifyContent: "center",
	},
	figure: {
		height: 130,
		width: 85,
		marginTop: -20,
		marginBottom: 10,
	},
	title: {
		fontWeight: "bold",
		textAlign: "center",
	},
	version: {
		opacity: 0.6,
		marginTop: 2,
		marginBottom: 12,
		textAlign: "center",
	},
	scroll: {
		maxHeight: 260,
		alignSelf: "stretch",
	},
	scrollContent: {
		paddingBottom: 4,
	},
	// Sem `lineHeight` fixo: o ResizableText soma a preferência de fonte ao
	// tamanho, e uma altura de linha fixa sobreporia as linhas na fonte grande.
	latest: {
		textAlign: "center",
	},
	earlier: {
		marginTop: 18,
	},
	earlierTitle: {
		fontWeight: "bold",
		marginBottom: 6,
	},
	entry: {
		marginBottom: 10,
	},
	entryVersion: {
		opacity: 0.6,
	},
	more: {
		fontStyle: "italic",
		opacity: 0.7,
		marginTop: 2,
	},
	okButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: "80%",
		height: 50,
		borderRadius: 20,
		marginTop: 20,
	},
	okText: {
		fontFamily: "Roboto",
	},
});

export default ContentUpdateModal;
