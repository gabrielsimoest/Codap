import { Image, ImageSourcePropType, StyleSheet, Text } from "react-native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import ColumnView from "../../../components/layout/ColumnView";
import ThemedView from "../../../components/themed/ThemedView";
import ThemedText from "../../../components/themed/ThemedText";
import Icon from "../../../components/Icon";
import MarketButton from "./MarketButton";

const TextSize = 20;
const BITS_COLOR = "#637aff";

interface Props {
	title: string;
	price: number;
	image: ImageSourcePropType;
	/** Texto de estado no canto do cartão ("Ativo até 14:32", "Você tem 2"). */
	status?: string;
	buyLabel: string;
	onBuy: () => void;
	/** De que lado fica a imagem. O baú sempre ficou à direita; os outros, à esquerda. */
	imageSide?: "left" | "right";
}

/**
 * Cartão de um item da loja. Os três itens (Dobro de XP, Dica Instantânea,
 * Baú Surpresa) tinham cada um o seu componente, idênticos a menos da imagem e
 * do texto — agora é um só.
 */
export default function ShopItemCard({
	title,
	price,
	image,
	status,
	buyLabel,
	onBuy,
	imageSide = "left",
}: Props) {
	const picture = (
		<Image
			style={[styles.image, imageSide === "right" ? styles.imageRight : null]}
			source={image}
		/>
	);

	return (
		<ThemedView theme="primary" style={styles.card}>
			{status ? <ThemedText style={styles.status}>{status}</ThemedText> : null}
			<RowView>
				{imageSide === "left" ? picture : null}
				{/* Com a imagem à direita o título começa no canto onde fica o status (que é
				    absoluto): sem esta folga os dois se encostam. */}
				<ColumnView
					style={{
						height: "100%",
						padding: 5,
						paddingTop: status && imageSide === "right" ? 22 : 5,
					}}
				>
					<ResizableText
						style={[styles.title, imageSide === "right" ? styles.titleRight : null]}
						defaultSize={TextSize}
					>
						{title}
					</ResizableText>
					<RowView
						align="center"
						useSize
						style={{
							alignSelf: imageSide === "right" ? "flex-start" : "flex-end",
							marginTop: 2,
						}}
					>
						<Icon color={BITS_COLOR} type="octicons" name="cpu" size={20} />
						<Text style={styles.price}> {price}</Text>
					</RowView>
					<MarketButton
						title={buyLabel}
						reversed={imageSide === "right"}
						onPress={onBuy}
					/>
				</ColumnView>
				{imageSide === "right" ? picture : null}
			</RowView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 10,
		height: 170,
		margin: 10,
		elevation: 3,
		padding: 10,
	},
	image: {
		width: 150,
		height: 120,
		alignSelf: "center",
	},
	imageRight: {
		width: 180,
		height: 150,
		marginRight: -10,
	},
	title: {
		alignSelf: "flex-end",
		fontWeight: "bold",
		fontFamily: "Roboto",
		textAlign: "center",
	},
	titleRight: {
		alignSelf: "flex-start",
	},
	price: {
		color: BITS_COLOR,
		fontWeight: "bold",
		fontFamily: "Roboto",
		fontSize: 20,
	},
	status: {
		position: "absolute",
		top: "3%",
		left: "4%",
	},
});
