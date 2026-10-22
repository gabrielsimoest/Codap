import { DimensionValue, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/Icon";
import GradientBar from "./GradientBar";
import { FIXED_UI, type TheoryPalette } from "./theoryTheme";
import { useInsets } from "./useInsets";

interface Props {
	palette: TheoryPalette;
	/** Título da atividade (o da lição). Ausente = só a barra de progresso. */
	title?: string;
	/** Progresso real da lição, como porcentagem (`"40%"`). */
	progress: DimensionValue;
	/** Posição da atividade na sessão (1-based) e tamanho da sessão. */
	step: number;
	total: number;
	onClose: () => void;
	onHelp: () => void;
}

/**
 * Cabeçalho compacto da teoria: fechar, título, barra de progresso com "2 de 5"
 * e ajuda, sobre o gradiente do design e com uma linha na base. **Nada aqui
 * acompanha o tamanho de fonte do app** (são `Text` com tamanho fixo, não
 * `ResizableText`): é cromo da interface, e um cabeçalho que crescesse com a
 * fonte comeria a tela. O progresso é o real (`step` / `total` / `progress`
 * vêm do `ActivityPlayer`). A barra ocupa ~2/3 da coluna e o contador fica
 * logo depois dela, como no Figma.
 */
export default function TheoryHeader({ palette, title, progress, step, total, onClose, onHelp }: Props) {
	const { t } = useTranslation();
	const { top } = useInsets();

	return (
		<View style={[styles.container, { paddingTop: top + 8, borderBottomColor: palette.border, backgroundColor: palette.gradientTo }]}>
			<GradientBar from={palette.gradientFrom} to={palette.gradientTo} />
			<View style={styles.row}>
				<TouchableOpacity
					onPress={onClose}
					hitSlop={12}
					accessibilityRole="button"
					accessibilityLabel={t("close")}
				>
					<Icon type="ionicon" name="close-outline" color={palette.icon} size={36} />
				</TouchableOpacity>

				<View style={styles.center}>
					{title ? (
						<Text
							numberOfLines={1}
							style={[styles.title, { color: palette.text, fontSize: FIXED_UI.headerTitle }]}
						>
							{title}
						</Text>
					) : null}
					<View style={styles.progressRow}>
						<View style={[styles.track, { backgroundColor: palette.border }]}>
							<View style={[styles.fill, { backgroundColor: palette.accent, width: progress }]} />
						</View>
						<Text style={[styles.progressText, { color: palette.icon, fontSize: FIXED_UI.progressText }]}>
							{t("theory.progress", { current: step, total })}
						</Text>
					</View>
				</View>

				<TouchableOpacity
					onPress={onHelp}
					hitSlop={12}
					accessibilityRole="button"
					accessibilityLabel={t("theory.help")}
				>
					<Icon type="ionicon" name="help-circle-outline" color={palette.icon} size={36} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingBottom: 10,
		// Sombra por cima do texto que rola embaixo: precisa de `zIndex` (o
		// ScrollView vem depois na árvore), de fundo próprio (o `elevation` do
		// Android só projeta sombra de uma view com fundo; o gradiente é filho) e
		// de uma cor que contraste com o fundo da tela — nunca a cor dele.
		zIndex: 1,
		shadowColor: "#000",
		paddingHorizontal: 14,
		borderBottomWidth: 2,
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.34,
		shadowRadius: 6.27,

		elevation: 10,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	center: {
		flex: 1,
		marginHorizontal: 14,
		gap: 5,
	},
	title: {
		fontFamily: "Roboto",
		fontWeight: "500",
	},
	progressRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	track: {
		width: "66%",
		height: 8,
		borderRadius: 6,
		overflow: "hidden",
	},
	fill: {
		height: "100%",
		borderRadius: 3,
	},
	progressText: {
		fontFamily: "Roboto",
		fontWeight: "500",
		verticalAlign: "middle"
	},
});
