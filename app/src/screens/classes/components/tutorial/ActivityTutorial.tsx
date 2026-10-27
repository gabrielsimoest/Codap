import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AppButton from "../../../../components/AppButton";
import AppModal from "../../../../components/AppModal";
import ResizableText from "../../../../components/ResizableText";
import type { TheoryPalette } from "../theory/theoryTheme";
import { TUTORIALS, type TutorialType } from "./tutorials";

interface Props {
	visible: boolean;
	onClose: () => void;
	type: TutorialType;
	palette: TheoryPalette;
}

/**
 * Tutorial de uma atividade, aberto pelo "?" do cabeçalho: alguns passos, cada um com
 * uma ilustração animada de como se faz e um texto curto. Navega com Voltar/Próximo (ou
 * tocando nos pontos) e fecha em "Entendi", no X, fora do cartão ou no voltar do Android.
 */
export default function ActivityTutorial({ visible, onClose, type, palette }: Props) {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const steps = TUTORIALS[type];
	const [index, setIndex] = useState(0);

	// Cada abertura começa do primeiro passo.
	useEffect(() => {
		if (visible) setIndex(0);
	}, [visible]);

	const step = steps[Math.min(index, steps.length - 1)];
	const last = index >= steps.length - 1;
	const base = `tutorial.${type}.${step.key}`;

	return (
		<AppModal
			visible={visible}
			onDismiss={onClose}
			title={t(`tutorial.titles.${type}`)}
			scroll
			footer={
				<View style={styles.buttons}>
					<View style={styles.button}>
						<AppButton
							variant="secondary"
							title={t("tutorial.back")}
							onPress={() => setIndex(index - 1)}
							disabled={index === 0}
						/>
					</View>
					<View style={styles.button}>
						<AppButton
							title={last ? t("tutorial.done") : t("tutorial.next")}
							onPress={last ? onClose : () => setIndex(index + 1)}
						/>
					</View>
				</View>
			}
		>
			{/* A ilustração é decoração: quem usa leitor de tela ouve o texto do passo. */}
			<View
				accessible={false}
				importantForAccessibility="no-hide-descendants"
				accessibilityElementsHidden
			>
				{/* A chave remonta a cena a cada passo, reiniciando o laço da animação. */}
				<View key={`${type}-${step.key}`}>{visible ? step.scene(palette) : null}</View>
			</View>

			<ResizableText style={[styles.title, { color: colors.text }]} defaultSize={18} useCustomColor>
				{t(`${base}.title`)}
			</ResizableText>
			<ResizableText style={[styles.text, { color: colors.text }]} defaultSize={15} useCustomColor>
				{t(`${base}.text`)}
			</ResizableText>

			<View style={styles.dots} accessibilityLabel={t("theory.progress", { current: index + 1, total: steps.length })}>
				{steps.map((item, i) => (
					<TouchableOpacity
						key={item.key}
						hitSlop={8}
						onPress={() => setIndex(i)}
						accessibilityRole="button"
						accessibilityLabel={t("theory.progress", { current: i + 1, total: steps.length })}
						style={[
							styles.dot,
							{ backgroundColor: i === index ? palette.accent : colors.border, width: i === index ? 22 : 8 }
						]}
					/>
				))}
			</View>
		</AppModal>
	);
}

const styles = StyleSheet.create({
	title: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: 16,
	},
	text: {
		fontFamily: "Roboto",
		marginTop: 6,
		lineHeight: 22,
	},
	dots: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 6,
		marginTop: 18,
	},
	dot: {
		height: 8,
		borderRadius: 4,
	},
	buttons: {
		flexDirection: "row",
		gap: 12,
	},
	button: {
		flex: 1,
	},
});
