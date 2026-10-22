import { Pressable, StyleSheet, View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import type { AreaResponse } from "codap-api/src/types/contracts";
import Icon from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import { useAppColors } from "../../../theme/appColors";
import areaMetadata from "../areaMetadata";

/** Onde o cartão começa: logo abaixo do cabeçalho das abas (20 dp de respiro + 50 dp de linha). */
const CARD_TOP = 66;

interface Props {
	visible: boolean;
	areas: AreaResponse[] | undefined;
	selectedId: number | undefined;
	onSelect: (areaId: number) => void;
	onDismiss: () => void;
}

/**
 * Seletor de área (HTML, CSS, JavaScript): um cartão que desce do cabeçalho,
 * com uma linha por área — ícone, nome e a marca de seleção na atual. Fecha
 * tocando fora, escolhendo uma área ou no botão voltar.
 */
export default function AreaSelector({ visible, areas, selectedId, onSelect, onDismiss }: Props) {
	const { colors } = useTheme();
	const app = useAppColors();

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={styles.fill}
				style={{ backgroundColor: app.scrim }}
				dismissableBackButton
			>
				<Pressable style={styles.fill} onPress={onDismiss} accessible={false}>
					<Pressable
						accessible={false}
						style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.border }]}
					>
						{areas?.map((area, index) => {
							const metadata = areaMetadata[index];
							if (!metadata) return null;
							const selected = area.id === selectedId;

							return (
								<Pressable
									key={area.id}
									onPress={() => onSelect(area.id)}
									accessibilityRole="button"
									accessibilityState={{ selected }}
									style={({ pressed }) => [
										styles.row,
										selected && {
											backgroundColor: app.isDark ? "rgba(99,122,255,0.16)" : "rgba(84,105,211,0.10)",
										},
										pressed && styles.pressed,
									]}
								>
									<View style={styles.icon}>
										<Icon
											type={metadata.icon.type}
											name={metadata.icon.name}
											size={30}
											color={metadata.color}
										/>
									</View>
									<ResizableText
										useCustomColor
										style={[styles.name, { color: colors.text }]}
										defaultSize={20}
									>
										{area.name}
									</ResizableText>
									{selected ? (
										<Icon type="ionicon" name="checkmark-circle" size={24} color={app.action} />
									) : null}
								</Pressable>
							);
						})}
					</Pressable>
				</Pressable>
			</Modal>
		</Portal>
	);
}

const styles = StyleSheet.create({
	fill: {
		flex: 1,
	},
	card: {
		marginTop: CARD_TOP,
		marginHorizontal: 16,
		padding: 8,
		gap: 4,
		borderRadius: 24,
		borderWidth: 1,
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 14,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		minHeight: 64,
		paddingHorizontal: 14,
		borderRadius: 16,
		gap: 14,
	},
	pressed: {
		opacity: 0.7,
	},
	icon: {
		width: 36,
		alignItems: "center",
	},
	name: {
		flex: 1,
		fontFamily: "Roboto",
		fontWeight: "bold",
	},
});
