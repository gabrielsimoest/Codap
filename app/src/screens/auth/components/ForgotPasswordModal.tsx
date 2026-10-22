import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import StatusLine from "../../../components/StatusLine";
import TextField from "../../../components/TextField";
import { classifyAccountError, forgotPassword } from "../../../services/AccountService";
import { useTheoryPalette } from "../../classes/components/theory/theoryTheme";
import { accountErrorMessage, type FormError } from "../../../utils/accountErrorText";
import isValidEmail from "../../../utils/isValidEmail";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	/** O que a pessoa já digitou no campo de e-mail do login. */
	initialEmail: string;
}

/**
 * "Esqueci minha senha": pede o e-mail da conta e manda o link para criar uma
 * nova senha. A resposta é sempre a mesma — exista a conta e esteja o e-mail
 * confirmado ou não —, então a tela também não diz nada além de "se estiver
 * cadastrado e confirmado, o link está a caminho". A regra (só e-mail confirmado)
 * está dita antes de enviar, para quem não tem esse caminho não esperar um e-mail
 * que não vem.
 */
export default function ForgotPasswordModal({ visible, onDismiss, initialEmail }: Props) {
	const { t } = useTranslation();
	const palette = useTheoryPalette();

	const [email, setEmail] = useState(initialEmail);
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<FormError | null>(null);

	// Cada abertura começa com o e-mail que já estava no login e sem o resultado anterior.
	useEffect(() => {
		if (visible) {
			setEmail(initialEmail);
			setSent(false);
			setError(null);
		}
	}, [visible]);

	const send = async () => {
		const candidate = email.trim();
		if (!isValidEmail(candidate)) {
			setError({ kind: "invalid" });
			return;
		}

		setSending(true);
		setError(null);
		try {
			await forgotPassword(candidate);
			setSent(true);
		} catch (failure) {
			setError(classifyAccountError(failure));
		} finally {
			setSending(false);
		}
	};

	if (sent) {
		return (
			<AppModal
				visible={visible}
				onDismiss={onDismiss}
				title={t("forgotPassword.sentTitle")}
				hideClose
				footer={<AppButton title={t("forgotPassword.done")} onPress={onDismiss} />}
			>
				<View style={styles.body}>
					<View style={styles.celebration}>
						<Icon type="ionicon" name="mail-open-outline" size={52} color={palette.success} />
					</View>
					<ResizableText style={styles.text} defaultSize={17}>
						{t("forgotPassword.sentMessage")}
					</ResizableText>
				</View>
			</AppModal>
		);
	}

	return (
		<AppModal
			visible={visible}
			onDismiss={onDismiss}
			title={t("forgotPassword.title")}
			scroll
			footer={
				<AppButton title={t("forgotPassword.send")} onPress={send} loading={sending} />
			}
		>
			<View style={styles.body}>
				<ResizableText style={styles.text} defaultSize={17}>
					{t("forgotPassword.intro")}
				</ResizableText>
				<TextField
					label="Email"
					value={email}
					onChangeText={(value) => {
						setEmail(value);
						setError(null);
					}}
					error={error !== null}
					autoCapitalize="none"
					autoCorrect={false}
					keyboardType="email-address"
					autoComplete="email"
					returnKeyType="send"
					onSubmitEditing={send}
				/>
				{error ? (
					<StatusLine kind="error">{accountErrorMessage(t, error)}</StatusLine>
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
});
