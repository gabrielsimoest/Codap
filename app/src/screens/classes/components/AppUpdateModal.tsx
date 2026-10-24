import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import type { PendingAppUpdate } from "../../../services/AppVersionService";
import { useAppColors } from "../../../theme/appColors";
import { useTheoryPalette } from "./theory/theoryTheme";

/** Quantas versões o aviso detalha; as outras viram "e mais N". */
const MAX_LISTED = 3;

interface Props {
	update: PendingAppUpdate;
	onUpdate: () => void;
	onLater: () => void;
}

/**
 * Aviso de nova versão do app. Informa e deixa a escolha com a pessoa: "Atualizar"
 * abre a página oficial de download, "Agora não" fecha e segue o uso normal. Uma
 * atualização importante muda o título e acrescenta uma nota, mas continua
 * podendo ser dispensada — o app nunca é bloqueado.
 */
export default function AppUpdateModal({ update, onUpdate, onLater }: Props) {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const app = useAppColors();
	const palette = useTheoryPalette();

	const listed = update.newer.slice(0, MAX_LISTED);
	const hidden = update.newer.length - listed.length;

	return (
		<AppModal
			visible
			onDismiss={onLater}
			title={update.important ? t("appUpdate.titleImportant") : t("appUpdate.title")}
			scroll
			footer={
				<View style={styles.actions}>
					<AppButton title={t("appUpdate.update")} onPress={onUpdate} />
					<AppButton title={t("appUpdate.later")} variant="secondary" onPress={onLater} />
				</View>
			}
		>
			<View style={styles.body}>
				<ResizableText style={styles.text} defaultSize={17}>
					{t("appUpdate.message", { installed: update.installed, latest: update.latest.version })}
				</ResizableText>

				{update.important ? (
					<View style={[styles.note, { backgroundColor: colors.card, borderColor: palette.warning }]}>
						<Icon type="ionicon" name="alert-circle-outline" size={22} color={palette.warning} />
						<ResizableText useCustomColor style={[styles.noteText, { color: colors.text }]} defaultSize={15}>
							{t("appUpdate.importantNote")}
						</ResizableText>
					</View>
				) : null}

				{listed.map((entry) => (
					<View key={entry.id} style={styles.entry}>
						<ResizableText
							useCustomColor
							style={[styles.entryVersion, { color: app.brandText }]}
							defaultSize={14}
						>
							{t("appUpdate.version", { version: entry.version })}
						</ResizableText>
						<ResizableText style={styles.text} defaultSize={16}>
							{entry.changelog}
						</ResizableText>
					</View>
				))}

				{hidden > 0 ? (
					<ResizableText useCustomColor style={[styles.more, { color: app.muted }]} defaultSize={14}>
						{hidden === 1 ? t("appUpdate.moreOne") : t("appUpdate.moreMany", { count: hidden })}
					</ResizableText>
				) : null}
			</View>
		</AppModal>
	);
}

const styles = StyleSheet.create({
	body: {
		gap: 14,
	},
	text: {
		fontFamily: "Roboto",
		lineHeight: 24,
	},
	note: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
		padding: 12,
		borderRadius: 14,
		borderWidth: 1,
	},
	noteText: {
		flex: 1,
		fontFamily: "Roboto",
		lineHeight: 21,
	},
	entry: {
		gap: 4,
	},
	entryVersion: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	more: {
		fontFamily: "Roboto",
	},
	actions: {
		gap: 10,
	},
});
