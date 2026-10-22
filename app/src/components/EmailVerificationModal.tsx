import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppButton from "./AppButton";
import AppModal from "./AppModal";
import EmailAddress from "./EmailAddress";
import Icon from "./Icon";
import ResizableText from "./ResizableText";
import StatusLine from "./StatusLine";
import TextField from "./TextField";
import useCooldown from "../hooks/useCooldown";
import { refreshEmailStatus } from "../hooks/useEmailStatus";
import {
	changeEmail,
	classifyAccountError,
	resendVerification,
} from "../services/AccountService";
import useEmailStatusStore from "../stores/EmailStatusStore";
import useUserStore from "../stores/UserStore";
import { useAppColors } from "../theme/appColors";
import { useTheoryPalette } from "../screens/classes/components/theory/theoryTheme";
import { accountErrorMessage, type FormError } from "../utils/accountErrorText";
import isValidEmail from "../utils/isValidEmail";

/** O servidor aceita um e-mail de confirmação por minuto por conta. */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Modal único de confirmação de e-mail, montado uma vez no app
 * (`EmailVerification`) e aberto pela `EmailStatusStore`: no aviso da abertura,
 * no botão do Perfil e quando a pessoa tenta alterar a senha sem ter confirmado.
 *
 * Três estados: **info** (o endereço, "reenviar" e "corrigir"), **fix** (campo
 * para digitar o endereço certo — só existe enquanto o e-mail não está
 * confirmado, que é exatamente o caso do erro de digitação) e **confirmado**
 * (quando a confirmação feita no navegador chega ao app com este modal aberto).
 * Fechar nunca é um beco sem saída: o botão do Perfil reabre.
 */
export default function EmailVerificationModal() {
	const { t } = useTranslation();
	const app = useAppColors();
	const palette = useTheoryPalette();
	const cooldown = useCooldown();

	const user = useUserStore((s) => s.user);
	const setUser = useUserStore((s) => s.setUser);
	const { email, verified, modalOpen, modalReason } = useEmailStatusStore();
	const closeModal = useEmailStatusStore((s) => s.closeModal);
	const setAccount = useEmailStatusStore((s) => s.setAccount);

	const [mode, setMode] = useState<"info" | "fix">("info");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<FormError | null>(null);
	const [newEmail, setNewEmail] = useState("");

	const shownEmail = email ?? user?.email ?? "";

	// Cada abertura começa limpa: sem o "enviado" nem o erro da vez anterior.
	useEffect(() => {
		if (modalOpen) {
			setMode("info");
			setSent(false);
			setError(null);
		}
	}, [modalOpen]);

	const resend = async () => {
		setSending(true);
		setError(null);
		try {
			await resendVerification();
			setSent(true);
			cooldown.start(RESEND_COOLDOWN_SECONDS);
		} catch (failure) {
			const classified = classifyAccountError(failure);
			if (classified.kind === "taken") {
				// 409: o e-mail já está confirmado (foi no navegador); relê o estado.
				void refreshEmailStatus();
			} else {
				setSent(false);
				setError(classified);
			}
		} finally {
			setSending(false);
		}
	};

	const openFix = () => {
		setNewEmail(shownEmail);
		setError(null);
		setSent(false);
		setMode("fix");
	};

	const saveEmail = async () => {
		const candidate = newEmail.trim();
		if (!isValidEmail(candidate)) {
			setError({ kind: "invalid" });
			return;
		}
		if (candidate.toLowerCase() === shownEmail.toLowerCase()) {
			setError({ kind: "same" });
			return;
		}
		if (!user?.remoteId) {
			setError({ kind: "unexpected" });
			return;
		}

		setSending(true);
		setError(null);
		try {
			const account = await changeEmail(user.remoteId, candidate);
			setAccount(account);
			setUser({ ...user, email: account.email });
			setMode("info");
			setSent(true);
			cooldown.start(RESEND_COOLDOWN_SECONDS);
		} catch (failure) {
			const classified = classifyAccountError(failure);
			if (classified.kind === "forbidden") {
				// 403: o e-mail já foi confirmado e não pode mais ser trocado por aqui.
				void refreshEmailStatus();
			} else {
				setError(classified);
			}
		} finally {
			setSending(false);
		}
	};

	if (verified === true) {
		return (
			<AppModal
				visible={modalOpen}
				onDismiss={closeModal}
				title={t("emailStatus.confirmedTitle")}
				hideClose
				footer={<AppButton title={t("emailStatus.done")} onPress={closeModal} />}
			>
				<View style={styles.body}>
					<View style={styles.celebration}>
						<Icon type="ionicon" name="checkmark-circle" size={56} color={palette.success} />
					</View>
					<ResizableText style={styles.text} defaultSize={17}>
						{t("emailStatus.confirmedMessage")}
					</ResizableText>
				</View>
			</AppModal>
		);
	}

	if (mode === "fix") {
		return (
			<AppModal
				visible={modalOpen}
				onDismiss={closeModal}
				title={t("emailStatus.fixTitle")}
				scroll
				footer={
					<View style={styles.actions}>
						<AppButton
							title={t("emailStatus.save")}
							onPress={saveEmail}
							loading={sending}
						/>
						<AppButton
							title={t("emailStatus.cancel")}
							variant="secondary"
							onPress={() => {
								setError(null);
								setMode("info");
							}}
							disabled={sending}
						/>
					</View>
				}
			>
				<View style={styles.body}>
					<ResizableText style={styles.text} defaultSize={17}>
						{t("emailStatus.fixHint")}
					</ResizableText>
					<TextField
						label={t("emailStatus.newEmail")}
						value={newEmail}
						onChangeText={(value) => {
							setNewEmail(value);
							setError(null);
						}}
						error={error !== null}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="email-address"
						autoComplete="email"
						returnKeyType="done"
						onSubmitEditing={saveEmail}
					/>
					{error ? (
						<View style={styles.feedback}>
							<StatusLine kind="error">{accountErrorMessage(t, error)}</StatusLine>
							{error.kind === "typo" && error.suggestion ? (
								<TouchableOpacity
									onPress={() => {
										setNewEmail(error.suggestion ?? "");
										setError(null);
									}}
									hitSlop={10}
									accessibilityRole="button"
									style={styles.suggestion}
								>
									<ResizableText
										useCustomColor
										style={[styles.suggestionText, { color: app.brandText }]}
										defaultSize={16}
									>
										{t("emailStatus.useSuggestion", { email: error.suggestion })}
									</ResizableText>
								</TouchableOpacity>
							) : null}
						</View>
					) : null}
				</View>
			</AppModal>
		);
	}

	const waiting = cooldown.remaining > 0;

	return (
		<AppModal
			visible={modalOpen}
			onDismiss={closeModal}
			title={t("emailStatus.title")}
			scroll
			footer={
				<View style={styles.actions}>
					<AppButton
						title={
							waiting
								? t("emailStatus.resendIn", { seconds: cooldown.remaining })
								: t("emailStatus.resend")
						}
						onPress={resend}
						loading={sending}
						disabled={waiting}
						style={waiting ? styles.counting : undefined}
					/>
					<AppButton
						title={t("emailStatus.fix")}
						variant="secondary"
						onPress={openFix}
						disabled={sending}
					/>
				</View>
			}
		>
			<View style={styles.body}>
				<ResizableText style={styles.text} defaultSize={17}>
					{modalReason === "passwordChange"
						? t("emailStatus.introPasswordChange")
						: t("emailStatus.intro")}
				</ResizableText>
				<EmailAddress email={shownEmail} />
				{/* Na troca de senha a introdução já diz isso. */}
				{modalReason === "prompt" ? (
					<ResizableText
						useCustomColor
						style={[styles.text, { color: app.muted }]}
						defaultSize={15}
					>
						{t("emailStatus.why")}
					</ResizableText>
				) : null}
				{error ? (
					<StatusLine kind="error">{accountErrorMessage(t, error)}</StatusLine>
				) : sent ? (
					<StatusLine kind="success">{t("emailStatus.sent")}</StatusLine>
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
	},
	celebration: {
		alignItems: "center",
	},
	actions: {
		gap: 10,
	},
	// O botão desabilitado já perde metade da opacidade; durante a contagem o texto
	// é a única informação ("Reenviar em 42s"), então fica um pouco mais legível.
	counting: {
		opacity: 0.75,
	},
	feedback: {
		gap: 8,
	},
	suggestion: {
		alignSelf: "flex-start",
		minHeight: 32,
		justifyContent: "center",
	},
	suggestionText: {
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
});
