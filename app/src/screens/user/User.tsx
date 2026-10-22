import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import UserHeader from "./components/UserHeader";
import { useTranslation } from "react-i18next";
import EdgeFade, { HEADER_FADE } from "../../components/layout/EdgeFade";
import { TAB_BAR_CLEARANCE } from "../../components/layout/tabBarMetrics";
import Icon from "../../components/Icon";
import ListRow from "../../components/ListRow";
import ResizableText from "../../components/ResizableText";
import ThemedView from "../../components/themed/ThemedView";
import useUserStore from "../../stores/UserStore";
import useAuthStore from "../../stores/AuthStore";
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";
import ConfirmEmail from "./components/ConfirmEmail";
import { refreshEmailStatus } from "../../hooks/useEmailStatus";
import useEmailStatusStore from "../../stores/EmailStatusStore";
import { useTheoryPalette } from "../classes/components/theory/theoryTheme";
import * as AuthService from "../../services/AuthService";
import useNavigate from "../../hooks/useNavigate";
import { User as UserEntity } from "../../types/entities";
import AchievementsModal from "./components/achievements/AchievementsModal";
import { useAppColors } from "../../theme/appColors";
import { useCallback, useState } from "react";

export default function User() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const app = useAppColors();
	const palette = useTheoryPalette();
	const emailVerified = useEmailStatusStore((s) => s.verified);

	// A confirmação do e-mail acontece no navegador: ao voltar para o Perfil o app
	// pergunta de novo, para a linha "Confirmar e-mail" sumir assim que for resolvida.
	useFocusEffect(
		useCallback(() => {
			void refreshEmailStatus();
		}, [])
	);

	const navigation = useNavigate();

	const { user, setUser } = useUserStore();
	const clearAuthSession = useAuthStore((s) => s.clearSession);

	const logout = async () => {
		await AuthService.logout();
		clearAuthSession();
		setUser({} as UserEntity);
		navigation.navigate("Login");
	};

	const [visible, setVisible] = useState(false);

	return (
		<>
			<ThemedView style={{ height: "100%" }}>
				<UserHeader />
				<View style={styles.body}>
					{/* A rolagem vai até a borda da tela: é por trás da barra de abas que o
					    degradê de baixo (em TabNavigation) faz o conteúdo sumir. */}
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.content}
					>
						<ThemedView theme="primary" style={styles.identity}>
							<View style={[styles.avatar, { backgroundColor: colors.notification }]}>
								<Icon type="ionicon" name="person" size={44} color={app.muted} />
							</View>
							<View style={styles.identityText}>
								<ResizableText useCustomColor style={[styles.label, { color: app.muted }]} defaultSize={14}>
									{t("name")}
								</ResizableText>
								<Text
									style={[styles.value, { color: colors.text }]}
									adjustsFontSizeToFit
									numberOfLines={1}
								>
									{user?.name}
								</Text>
								<View style={[styles.labelRow, styles.labelGap]}>
									<ResizableText useCustomColor style={[styles.label, { color: app.muted }]} defaultSize={14}>
										{t("email")}
									</ResizableText>
									{emailVerified === true ? (
										<View
											accessible
											accessibilityRole="image"
											accessibilityLabel={t("emailStatus.verifiedLabel")}
										>
											<Icon type="ionicon" name="checkmark-circle" size={16} color={palette.success} />
										</View>
									) : null}
								</View>
								<Text
									style={[styles.value, { color: colors.text }]}
									adjustsFontSizeToFit
									numberOfLines={1}
								>
									{user?.email}
								</Text>
							</View>
						</ThemedView>

						<View style={styles.rows}>
							<ConfirmEmail />
							<EditProfile />
							<ChangePassword />
							<ListRow
								title={t("achievements")}
								icon={{ type: "ionicon", name: "trophy-outline" }}
								onPress={() => setVisible(true)}
							/>
							<ListRow
								title={t("exit")}
								icon={{ type: "ionicon", name: "log-out-outline" }}
								danger
								noChevron
								onPress={logout}
							/>
						</View>
					</ScrollView>
					<EdgeFade edge="top" height={HEADER_FADE} />
				</View>
			</ThemedView>
			<AchievementsModal
				visible={visible}
				onDismiss={() => setVisible(false)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	body: {
		flex: 1,
	},
	content: {
		paddingTop: HEADER_FADE,
		paddingHorizontal: 20,
		paddingBottom: TAB_BAR_CLEARANCE,
		gap: 16,
	},
	identity: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		padding: 18,
		borderRadius: 20,
		elevation: 2,
	},
	avatar: {
		width: 84,
		height: 84,
		borderRadius: 42,
		alignItems: "center",
		justifyContent: "center",
	},
	identityText: {
		flex: 1,
	},
	label: {
		fontFamily: "Roboto",
	},
	labelGap: {
		marginTop: 10,
	},
	labelRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	value: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		fontSize: 19,
	},
	rows: {
		gap: 12,
	},
});
