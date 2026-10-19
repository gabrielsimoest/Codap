import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import ResizableText from "../../../components/ResizableText";
import ThemedTouchableOpacity from "../../../components/themed/ThemedTouchableOpacity";
import RowView from "../../../components/layout/RowView";
import Icon from "../../../components/Icon";
import useThemeStore from "../../../stores/ThemeStore";
import LightMode from "../../../theme/LightMode";

interface Props {
	title: string;
	onPress: () => void;
	checked?: boolean;
	/** Lição de desafio do módulo: ganha um troféu e uma borda dourada. */
	challenge?: boolean;
	/** Aula de aprofundamento já aberta: borda roxa sutil e um foguete. */
	deepening?: boolean;
	/** Aula exclusiva do baú, já revelada: borda magenta e uma caveira. */
	chest?: boolean;
	/**
	 * Aula de aprofundamento ainda bloqueada: o nível que a abre. O cartão fica
	 * apagado, tracejado, com cadeado e o nível exigido, e não responde ao toque.
	 */
	lockedLevel?: number;
}

const CHALLENGE_GOLD = "#E0B04C";
// Roxo discreto: menos chamativo que o dourado do desafio do módulo.
const DEEPENING_PURPLE = "#8E7CC3";
// Magenta: as aulas do baú são as mais difíceis, e a caveira (uma forma, não só
// uma cor) as distingue do roxo do aprofundamento mesmo para quem enxerga mal cores.
const CHEST_MAGENTA = "#D946A8";
const LOCKED_GREY = "#5b6b7a";

export default function ClassButton({
	title,
	onPress,
	checked = false,
	challenge = false,
	deepening = false,
	chest = false,
	lockedLevel,
}: Props) {
	const { t } = useTranslation();
	const theme = useThemeStore((s) => s.theme);
	const locked = lockedLevel !== undefined;

	const color = checked
		? "#637aff"
		: theme === LightMode
		? "#c1c1c1"
		: "#233648";

	return (
		<RowView
			useSize
			align="center"
			justify={"space-evenly"}
			style={{ marginBottom: 15 }}
		>
			<Icon
				type="ionicon"
				name="checkmark-circle-outline"
				color={color}
				size={30}
			/>
			<ThemedTouchableOpacity
				theme="primary"
				style={[
					styles.button,
					challenge ? styles.challenge : null,
					deepening ? styles.deepening : null,
					chest ? styles.chest : null,
					locked ? styles.locked : null,
				]}
				onPress={onPress}
				disabled={locked}
				accessibilityState={{ disabled: locked }}
			>
				{locked ? (
					<Icon
						type="ionicon"
						name="lock-closed-outline"
						color={LOCKED_GREY}
						size={22}
					/>
				) : chest ? (
					<Icon
						type="ionicon"
						name="skull-outline"
						color={CHEST_MAGENTA}
						size={22}
					/>
				) : deepening ? (
					<Icon
						type="ionicon"
						name="rocket-outline"
						color={DEEPENING_PURPLE}
						size={22}
					/>
				) : challenge ? (
					<Icon
						type="ionicon"
						name="trophy-outline"
						color={CHALLENGE_GOLD}
						size={22}
					/>
				) : null}
				<View style={styles.titleColumn}>
					<ResizableText style={[styles.text]} defaultSize={20}>
						{title}
					</ResizableText>
					{locked ? (
						<ResizableText style={styles.levelText} defaultSize={14}>
							{t("levels.requiredLevel", { level: lockedLevel })}
						</ResizableText>
					) : null}
				</View>
			</ThemedTouchableOpacity>
		</RowView>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 63,
		width: "75%",
		borderRadius: 10,
		elevation: 2,
		gap: 10,
	},
	// Respiro para o troféu e o título não encostarem na borda; com fonte
	// maior, o título quebra em vez de vazar.
	challenge: {
		borderWidth: 2,
		borderColor: CHALLENGE_GOLD,
		paddingHorizontal: 12,
	},
	deepening: {
		borderWidth: 2,
		borderColor: DEEPENING_PURPLE,
		paddingHorizontal: 12,
	},
	chest: {
		borderWidth: 2,
		borderColor: CHEST_MAGENTA,
		paddingHorizontal: 12,
	},
	// Bloqueada: apagada e tracejada. Altura mínima em vez de fixa, porque o
	// cartão ganha uma segunda linha ("Nível N") e a fonte pode estar aumentada.
	locked: {
		height: undefined,
		minHeight: 63,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: LOCKED_GREY,
		opacity: 0.55,
		elevation: 0,
	},
	titleColumn: {
		flexShrink: 1,
		alignItems: "center",
	},
	text: {
		fontFamily: "Roboto",
		flexShrink: 1,
		textAlign: "center",
	},
	levelText: {
		fontFamily: "Roboto",
		textAlign: "center",
		opacity: 0.85,
	},
});
