import { useEffect, useMemo, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import ListRow from "../../../components/ListRow";
import ResizableText from "../../../components/ResizableText";
import {
	APP_DOWNLOAD_URL,
	fetchAppVersionHistory,
	findPendingUpdate,
	getInstalledVersion,
} from "../../../services/AppVersionService";
import useAppUpdateStore from "../../../stores/AppUpdateStore";
import useLanguageStore from "../../../stores/LanguageStore";
import { useAppColors } from "../../../theme/appColors";
import { useTheoryPalette } from "../../classes/components/theory/theoryTheme";

/**
 * Versão do aplicativo: a versão instalada, se há uma mais nova e o histórico de
 * novidades de cada versão. Tudo vem do que o app guardou (`useAppVersionSync`),
 * então abre na hora e funciona offline com a última vez que houve rede; ao abrir,
 * com rede, reconsulta para trazer o que saiu desde então.
 */
const VersionInfo = () => {
	const [modalVisible, setModalVisible] = useState(false);

	const { t } = useTranslation();
	const { colors } = useTheme();
	const app = useAppColors();
	const palette = useTheoryPalette();
	const language = useLanguageStore((state) => state.language);
	const history = useAppUpdateStore((state) => state.history);

	const installed = getInstalledVersion();
	const pending = useMemo(() => findPendingUpdate(history, installed), [history, installed]);

	useEffect(() => {
		if (!modalVisible) {
			return;
		}
		let cancelled = false;
		void fetchAppVersionHistory(language).then((fresh) => {
			if (fresh !== null && !cancelled) {
				useAppUpdateStore.getState().setHistory(fresh);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [modalVisible, language]);

	const openDownload = () => {
		void Linking.openURL(APP_DOWNLOAD_URL).catch(() => undefined);
	};

	return (
		<>
			<AppModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				title={t("version")}
				scroll
			>
				<View style={styles.body}>
					<View>
						<ResizableText useCustomColor style={[styles.label, { color: app.muted }]} defaultSize={14}>
							{t("appUpdate.installed")}
						</ResizableText>
						<ResizableText style={styles.installed} defaultSize={28}>
							{installed}
						</ResizableText>
					</View>

					{pending !== null ? (
						<View style={[styles.available, { backgroundColor: colors.card, borderColor: palette.warning }]}>
							<ResizableText style={styles.availableText} defaultSize={16}>
								{t("appUpdate.available", { latest: pending.latest.version })}
							</ResizableText>
							<AppButton title={t("appUpdate.update")} onPress={openDownload} />
						</View>
					) : (
						<ResizableText useCustomColor style={{ color: app.muted, fontFamily: "Roboto" }} defaultSize={16}>
							{history.length > 0 ? t("appUpdate.upToDate") : t("appUpdate.unknown")}
						</ResizableText>
					)}

					<ResizableText
						useCustomColor
						style={[styles.heading, { color: app.brandText }]}
						defaultSize={18}
					>
						{t("appUpdate.whatsNew")}
					</ResizableText>

					{history.length === 0 ? (
						<ResizableText useCustomColor style={{ color: app.muted, fontFamily: "Roboto" }} defaultSize={16}>
							{t("appUpdate.empty")}
						</ResizableText>
					) : (
						history.map((entry) => (
							<View key={entry.id} style={styles.entry}>
								<ResizableText style={styles.entryVersion} defaultSize={16}>
									{`${t("appUpdate.version", { version: entry.version })} · ${entry.releasedAt}`}
								</ResizableText>
								<ResizableText style={styles.text} defaultSize={16}>
									{entry.changelog}
								</ResizableText>
							</View>
						))
					)}
				</View>
			</AppModal>
			<ListRow
				title={t("version")}
				icon={{ type: "ionicon", name: "pricetag-outline" }}
				onPress={() => setModalVisible(true)}
			/>
		</>
	);
};

export default VersionInfo;

const styles = StyleSheet.create({
	body: {
		gap: 14,
	},
	label: {
		fontFamily: "Roboto",
	},
	installed: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	available: {
		gap: 12,
		padding: 14,
		borderRadius: 16,
		borderWidth: 1,
	},
	availableText: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	heading: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: 6,
	},
	entry: {
		gap: 4,
	},
	entryVersion: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
	text: {
		fontFamily: "Roboto",
		lineHeight: 22,
	},
});
