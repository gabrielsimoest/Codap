import { useState } from "react";
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";
import { useAppColors } from "../theme/appColors";
import { useTheoryPalette } from "../screens/classes/components/theory/theoryTheme";

interface Props extends TextInputProps {
	/** Rótulo fixo acima do campo: o placeholder some ao digitar, o rótulo não. */
	label?: string;
	/** Marca o campo como inválido (borda e rótulo em vermelho). */
	error?: boolean;
	/** Campo de senha com o olho que mostra ou oculta o texto (começa oculto). Ignora `secureTextEntry`. */
	revealable?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Campo de texto do app: 52 dp, cantos de 14, contorno de 1,5 dp que vira cor de
 * ação em foco e vermelho em erro. Fundo e contorno vêm de `appColors` (o
 * contorno tem 3:1 contra a superfície, exigência de contraste para campos).
 */
export default function TextField({ label, error = false, revealable = false, containerStyle, style, ...input }: Props) {
	const { colors } = useTheme();
	const app = useAppColors();
	const palette = useTheoryPalette();
	const { t } = useTranslation();
	const [focused, setFocused] = useState(false);
	const [hidden, setHidden] = useState(true);

	const border = error ? palette.danger : focused ? app.action : app.fieldBorder;

	return (
		<View style={containerStyle}>
			{label ? (
				<Text style={[styles.label, { color: error ? palette.danger : colors.text }]}>{label}</Text>
			) : null}
			<View>
				<TextInput
					placeholderTextColor={app.muted}
					{...input}
					secureTextEntry={revealable ? hidden : input.secureTextEntry}
					onFocus={(event) => {
						setFocused(true);
						input.onFocus?.(event);
					}}
					onBlur={(event) => {
						setFocused(false);
						input.onBlur?.(event);
					}}
					style={[
						styles.input,
						{
							backgroundColor: app.fieldBackground,
							color: error ? palette.danger : app.fieldText,
							borderColor: border,
						},
						revealable ? styles.withEye : null,
						style,
					]}
				/>
				{revealable ? (
					<TouchableOpacity
						onPress={() => setHidden((value) => !value)}
						accessibilityRole="button"
						accessibilityLabel={hidden ? t("showPassword") : t("hidePassword")}
						style={styles.eye}
					>
						<Icon type="ionicon" name={hidden ? "eye-outline" : "eye-off-outline"} size={24} color={app.muted} />
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		fontFamily: "Roboto",
		fontSize: 15,
		fontWeight: "bold",
		marginBottom: 8,
	},
	withEye: {
		paddingRight: 52,
	},
	// 52 dp quadrados na ponta do campo: o alvo de toque do olho tem a altura inteira dele.
	eye: {
		position: "absolute",
		right: 0,
		top: 0,
		width: 52,
		height: 52,
		alignItems: "center",
		justifyContent: "center",
	},
	input: {
		height: 52,
		borderRadius: 14,
		borderWidth: 1.5,
		paddingHorizontal: 14,
		fontSize: 18,
	},
});
