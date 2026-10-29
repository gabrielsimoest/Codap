import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppButton from "../../../components/AppButton";
import AppModal from "../../../components/AppModal";
import ResizableText from "../../../components/ResizableText";

interface Props {
	visible: boolean;
	/** Fecha sem sair. Ignorado enquanto a saída está em andamento. */
	onDismiss: () => void;
	onConfirm: () => void;
	/** A saída está em andamento: o botão mostra o carregamento e nada mais responde. */
	loading: boolean;
}

/**
 * Confirmação do "Sair". Sair apaga a sessão do aparelho, então pede um segundo
 * toque; e, como revogar a sessão no servidor pode demorar (ele dorme e acorda),
 * enquanto isso o botão mostra o carregamento e o modal não fecha nem aceita
 * um segundo toque.
 */
export default function LogoutConfirmModal({ visible, onDismiss, onConfirm, loading }: Props) {
	const { t } = useTranslation();

	return (
		<AppModal
			visible={visible}
			onDismiss={loading ? () => {} : onDismiss}
			title={t("logout.title")}
			hideClose
			footer={
				<View style={styles.actions}>
					<AppButton title={t("logout.confirm")} onPress={onConfirm} loading={loading} />
					<AppButton
						title={t("logout.cancel")}
						variant="secondary"
						onPress={onDismiss}
						disabled={loading}
					/>
				</View>
			}
		>
			<ResizableText style={styles.text} defaultSize={17}>
				{t("logout.message")}
			</ResizableText>
		</AppModal>
	);
}

const styles = StyleSheet.create({
	text: {
		fontFamily: "Roboto",
		lineHeight: 24,
	},
	actions: {
		gap: 10,
	},
});
