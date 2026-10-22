import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import EmailAddress from "../../../components/EmailAddress";
import Icon from "../../../components/Icon";
import ListRow from "../../../components/ListRow";
import ResizableText from "../../../components/ResizableText";
import StatusLine from "../../../components/StatusLine";
import {
	classifyAccountError,
	requestPasswordChange,
} from "../../../services/AccountService";
import useEmailStatusStore from "../../../stores/EmailStatusStore";
import useUserStore from "../../../stores/UserStore";
import { useAppColors } from "../../../theme/appColors";
import { useTheoryPalette } from "../../classes/components/theory/theoryTheme";
import { accountErrorMessage, type FormError } from "../../../utils/accountErrorText";

interface ModalProps {
	visible: boolean;
	onDismiss: () => void;
}

/**
 * Alterar a senha é provar, pelo e-mail, que a conta é sua: o app manda um link
 * para o endereço da conta e a senha nova é criada numa página segura. Duas
 * etapas — confirmar (mostra para onde o link vai e avisa que a pessoa será
 * desconectada) e "link enviado".
 */
function ChangePasswordModal({ visible, onDismiss }: ModalProps) {
	const { t } = useTranslation();
	const app = useAppColors();
	const palette = useTheoryPalette();

	const user = useUserStore((s) => s.user);
	const email = useEmailStatusStore((s) => s.email) ?? user?.email ?? "";
	const openEmailModal = useEmailStatusStore((s) => s.openModal);

	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<FormError | null>(null);

	// Cada abertura começa na etapa de confirmar, sem o erro da vez anterior.
	useEffect(() => {
		if (visible) {
			setSent(false);
			setError(null);
		}
	}, [visible]);

	const send = async () => {
		setSending(true);
		setError(null);
		try {
			await requestPasswordChange();
			setSent(true);
		} catch (failure) {
			const classified = classifyAccountError(failure);
			if (classified.kind === "forbidden") {
				// 403: o e-mail não está confirmado (o app ainda não sabia). Passa para a confirmação.
				onDismiss();
				openEmailModal("passwordChange");
			} else {
				setError(classified);
			}
		} finally {
			setSending(false);
		}
	};

	if (sent) {
		return (
			<AppModal
				visible={visible}
				onDismiss={onDismiss}
				title={t("passwordChange.sentTitle")}
				hideClose
				footer={<AppButton title={t("passwordChange.done")} onPress={onDismiss} />}
			>
				<View style={styles.body}>
					<View style={styles.celebration}>
						<Icon type="ionicon" name="mail-open-outline" size={52} color={palette.success} />
					</View>
					<ResizableText style={styles.text} defaultSize={17}>
						{t("passwordChange.sentMessage")}
					</ResizableText>
				</View>
			</AppModal>
		);
	}

	return (
		<AppModal
			visible={visible}
			onDismiss={onDismiss}
			title={t("passwordChange.title")}
			scroll
			footer={
				<View style={styles.actions}>
					<AppButton
						title={t("passwordChange.send")}
						onPress={send}
						loading={sending}
					/>
					<AppButton
						title={t("passwordChange.cancel")}
						variant="secondary"
						onPress={onDismiss}
						disabled={sending}
					/>
				</View>
			}
		>
			<View style={styles.body}>
				<ResizableText style={styles.text} defaultSize={17}>
					{t("passwordChange.intro")}
				</ResizableText>
				<EmailAddress email={email} />
				<ResizableText
					useCustomColor
					style={[styles.text, { color: app.muted }]}
					defaultSize={15}
				>
					{t("passwordChange.note")}
				</ResizableText>
				{error ? (
					<StatusLine kind="error">{accountErrorMessage(t, error)}</StatusLine>
				) : null}
			</View>
		</AppModal>
	);
}

/**
 * Linha "Alterar senha" do Perfil. Sem e-mail confirmado não há troca (um
 * endereço não confirmado pode não ser da pessoa): se o app já sabe disso,
 * abre direto a confirmação; se ainda não sabe (sem rede desde que entrou), pede
 * ao servidor, que decide — e um 403 leva à mesma confirmação.
 */
export default function ChangePassword() {
	const { t } = useTranslation();
	const [visible, setVisible] = useState(false);
	const verified = useEmailStatusStore((s) => s.verified);
	const openEmailModal = useEmailStatusStore((s) => s.openModal);

	const onPress = () => {
		if (verified === false) {
			openEmailModal("passwordChange");
		} else {
			setVisible(true);
		}
	};

	return (
		<>
			<ListRow
				title={t("change password")}
				icon={{ type: "ionicon", name: "key-outline" }}
				onPress={onPress}
			/>
			<ChangePasswordModal visible={visible} onDismiss={() => setVisible(false)} />
		</>
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
});
