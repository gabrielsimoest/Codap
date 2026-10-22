import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";
import ListRow from "../../../components/ListRow";
import ResizableText from "../../../components/ResizableText";
import useEmailStatusStore from "../../../stores/EmailStatusStore";
import { useAppColors } from "../../../theme/appColors";
import { useTheoryPalette } from "../../classes/components/theory/theoryTheme";

/**
 * Linha "Confirmar e-mail" do Perfil. Só existe enquanto o servidor diz que o
 * e-mail não está confirmado — é a saída para quem fechou o aviso da abertura do
 * app e quer resolver depois. O selo "Pendente" é âmbar (atenção, não erro) e o
 * texto fica na cor do estado, sem depender só dela: a palavra diz o mesmo.
 */
export default function ConfirmEmail() {
	const { t } = useTranslation();
	const app = useAppColors();
	const palette = useTheoryPalette();
	const verified = useEmailStatusStore((s) => s.verified);
	const openModal = useEmailStatusStore((s) => s.openModal);

	if (verified !== false) {
		return null;
	}

	return (
		<ListRow
			title={t("emailStatus.row")}
			icon={{ type: "ionicon", name: "mail-unread-outline" }}
			onPress={() => openModal("prompt")}
			right={
				<View style={styles.right}>
					<View
						style={[
							styles.pill,
							{
								backgroundColor: app.isDark
									? "rgba(224,165,82,0.16)"
									: palette.goldBg,
							},
						]}
					>
						<ResizableText
							useCustomColor
							style={[styles.pillText, { color: palette.warning }]}
							defaultSize={13}
						>
							{t("emailStatus.pending")}
						</ResizableText>
					</View>
					<Icon type="ionicon" name="chevron-forward" size={20} color={app.muted} />
				</View>
			}
		/>
	);
}

const styles = StyleSheet.create({
	right: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	pill: {
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 999,
	},
	pillText: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
});
