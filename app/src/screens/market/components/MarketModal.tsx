import { useAppColors } from "../../../theme/appColors";
import {
	Image,
	ImageSourcePropType,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import Icon from "../../../components/Icon";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import ThemedText from "../../../components/themed/ThemedText";
import ThemedIcon from "../../../components/themed/ThemedIcon";
import { Portal, Modal } from "react-native-paper";

const size2 = 23;

interface Props {
	visible: boolean;
	onDismiss: () => void;
	onBuy: () => void;
	title: string;
	price: number;
	image: ImageSourcePropType;
	/** Detalhes entre a imagem e o preço (no baú, a contagem de aulas por área). */
	children?: ReactNode;
	/** Compra em andamento: o botão fica travado, para um toque duplo não comprar duas vezes. */
	loading?: boolean;
}

export default function MarketModal({
	visible = false,
	onDismiss,
	onBuy,
	title,
	price,
	image,
	children,
	loading = false,
}: Props) {
	const { t } = useTranslation();
	const app = useAppColors();

	return (
		<Portal>
			<Modal
				visible={visible}
				onDismiss={onDismiss}
				contentContainerStyle={{ flex: 1 }}
				style={{ backgroundColor: app.scrim }}
				dismissableBackButton
			>
				<CenterView
					style={{
						backgroundColor: app.scrimInner,
					}}
				>
					<ThemedView style={styles.modal}>
						<TouchableOpacity onPress={onDismiss}>
							<Icon
								type={"ionicon"}
								name="close-outline"
								color={"#33526E"}
								size={60}
								style={styles.icon}
							/>
						</TouchableOpacity>
						<ResizableText style={styles.title} defaultSize={size2}>
							{title}
						</ResizableText>
						<Image style={styles.imageModal} source={image} />
						{children}
						<RowView
							useSize
							align="center"
							justify="center"
							style={{ marginTop: 6 }}
						>
							<ThemedText style={styles.price}>
								{price.toString()}{" "}
							</ThemedText>
							<ThemedIcon
								type={"octicons"}
								name="cpu"
								size={25}
							/>
						</RowView>
						<TouchableOpacity
							style={[
								styles.button,
								{ backgroundColor: app.action },
								loading ? styles.buttonLoading : null,
							]}
							onPress={onBuy}
							disabled={loading}
						>
							<ResizableText
								useCustomColor
								style={[styles.buttonText, { color: app.onBrand }]}
								defaultSize={20}
							>
								{t("buy")}
							</ResizableText>
						</TouchableOpacity>
					</ThemedView>
				</CenterView>
			</Modal>
		</Portal>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#637aff",
		flexDirection: "row",
		marginTop: 20,
		marginBottom: 5,
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "center",
		width: "92%",
		height: 50,
		borderRadius: 20,
	},
	modal: {
		opacity: 0.99,
		zIndex: 99,
		padding: 20,
		borderRadius: 30,
		height: "76%",
		width: "90%",
	},
	title: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: -10,
		textAlign: "center",
		marginBottom: 8,
	},
	imageModal: {
		width: 265,
		height: 220,
		// Com detalhes embaixo (baú) a imagem cede espaço em vez de espremer o resto.
		flexShrink: 1,
		resizeMode: "contain",
		marginHorizontal: "auto",
		marginVertical: "auto",
	},
	icon: {
		alignSelf: "flex-end",
		marginTop: -20,
		marginRight: -15,
	},
	price: {
		fontFamily: "Roboto",
		color: "white",
		fontSize: 25,
		fontWeight: "bold",
	},
	buttonLoading: {
		opacity: 0.5,
	},
	buttonText: {
		fontFamily: "Roboto",
	},
});
