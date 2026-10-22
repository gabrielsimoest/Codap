import type { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import Icon, { IconType } from "./Icon";
import ResizableText from "./ResizableText";
import { useAppColors } from "../theme/appColors";
import { useTheoryPalette } from "../screens/classes/components/theory/theoryTheme";

interface Props {
	title: string;
	onPress: () => void;
	/** Ícone à esquerda, num quadrado tingido com a marca. */
	icon?: { type: IconType; name: string };
	/** Elemento próprio à esquerda no lugar do ícone (a bandeira do idioma). */
	leading?: ReactNode;
	/** Controle à direita (um `Switch`). Sem ele, uma seta indica que o toque abre algo. */
	right?: ReactNode;
	/** Esconde a seta (linha que age na hora, sem abrir nada). */
	noChevron?: boolean;
	/** Opção escolhida de uma lista: borda e marca de seleção na cor de ação. */
	selected?: boolean;
	/** Ação destrutiva (sair da conta): texto e ícone em vermelho. */
	danger?: boolean;
	disabled?: boolean;
	onLongPress?: () => void;
	/** Quanto tempo segurando até `onLongPress`. Política de quem usa, não da linha. */
	delayLongPress?: number;
	/** O dedo encostou / saiu da linha (inclusive quando o toque é cancelado). */
	onPressIn?: () => void;
	onPressOut?: () => void;
}

/**
 * Linha de lista do Perfil e das Configurações, no padrão de cartão de Aulas e
 * Mercado: superfície elevada (`primary`), cantos arredondados, elevação leve e
 * nada de brilho colorido. Cada linha é um alvo de toque inteiro com no mínimo
 * 60 dp.
 */
export default function ListRow({
	title,
	onPress,
	icon,
	leading,
	right,
	noChevron = false,
	selected = false,
	danger = false,
	disabled = false,
	onLongPress,
	delayLongPress,
	onPressIn,
	onPressOut,
}: Props) {
	const { colors } = useTheme();
	const app = useAppColors();
	const palette = useTheoryPalette();
	const accent = danger ? palette.danger : app.tabActive;

	return (
		<TouchableOpacity
			onPress={onPress}
			onLongPress={onLongPress}
			delayLongPress={delayLongPress}
			onPressIn={onPressIn}
			onPressOut={onPressOut}
			disabled={disabled}
			activeOpacity={0.8}
			accessibilityRole="button"
			accessibilityState={{ selected, disabled }}
			style={[
				styles.row,
				{
					backgroundColor: colors.primary,
					borderColor: selected ? app.action : "transparent",
				},
			]}
		>
			{leading ?? null}
			{icon && leading === undefined ? (
				<View
					style={[
						styles.tile,
						{
							backgroundColor: danger
								? palette.dangerBg
								: app.isDark
								? "rgba(99,122,255,0.16)"
								: "rgba(84,105,211,0.10)",
						},
					]}
				>
					<Icon type={icon.type} name={icon.name} size={22} color={accent} />
				</View>
			) : null}
			<ResizableText
				useCustomColor
				style={[styles.title, { color: danger ? palette.danger : colors.text }]}
				defaultSize={18}
			>
				{title}
			</ResizableText>
			{right ??
				(selected ? (
					<Icon type="ionicon" name="checkmark-circle" size={24} color={app.action} />
				) : noChevron ? null : (
					<Icon type="ionicon" name="chevron-forward" size={20} color={app.muted} />
				))}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 60,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 16,
		borderWidth: 2,
		gap: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
	},
	tile: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		flex: 1,
		fontFamily: "Roboto",
	},
});
