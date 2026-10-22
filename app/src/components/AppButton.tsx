import { ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import ResizableText from "./ResizableText";
import { useAppColors } from "../theme/appColors";

interface Props {
	title: string;
	onPress: () => void;
	/** `primary`: ação principal, cor de ação. `secondary`: ação de apoio, superfície rebaixada com texto de marca. */
	variant?: "primary" | "secondary";
	disabled?: boolean;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
}

/**
 * Botão do app: 50 dp de altura e cantos de 20, o mesmo dos botões do Mercado.
 * Texto sobre a cor de ação usa `onBrand` (branco no claro) para manter o
 * contraste nos dois temas.
 */
export default function AppButton({
	title,
	onPress,
	variant = "primary",
	disabled = false,
	loading = false,
	style,
}: Props) {
	const { colors } = useTheme();
	const app = useAppColors();
	const primary = variant === "primary";
	const textColor = primary ? app.onBrand : app.brandText;

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled || loading}
			activeOpacity={0.8}
			accessibilityRole="button"
			accessibilityState={{ disabled: disabled || loading }}
			style={[
				styles.button,
				{ backgroundColor: primary ? app.action : colors.card },
				disabled || loading ? styles.disabled : null,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator color={textColor} />
			) : (
				<ResizableText
					useCustomColor
					style={[styles.text, { color: textColor }]}
					defaultSize={19}
				>
					{title}
				</ResizableText>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: 50,
		borderRadius: 20,
		paddingHorizontal: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		textAlign: "center",
	},
	disabled: {
		opacity: 0.5,
	},
});
