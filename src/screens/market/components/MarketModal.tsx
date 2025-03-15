import {
	Image,
	ImageSourcePropType,
	Modal,
	StyleSheet,
	TouchableOpacity,
} from "react-native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import Icon from "../../../components/Icon";
import CenterView from "../../../components/layout/CenterView";
import ThemedView from "../../../components/themed/ThemedView";
import { useTranslation } from "react-i18next";
import ThemedText from "../../../components/themed/ThemedText";
import ThemedIcon from "../../../components/themed/ThemedIcon";

const size2 = 23;

interface Props {
	visible: boolean;
	onDismiss: () => void;
	onBuy: () => void;
	title: string;
	price: number;
	image: ImageSourcePropType;
}

export default function MarketModal({
	visible = false,
	onDismiss,
	onBuy,
	title,
	price,
	image,
}: Props) {
	const { t } = useTranslation();

	return (
		<Modal animationType="fade" visible={visible} transparent={true}>
			<CenterView
				style={{
					backgroundColor: "rgba(0, 0, 0, 0.85)",
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
					<RowView
						useSize
						align="center"
						justify="center"
						style={{ marginTop: 2 }}
					>
						<ThemedText style={styles.price}>
							{price.toString()}{" "}
						</ThemedText>
						<ThemedIcon
							type={"octicons"}
							name="dependabot"
							size={25}
						/>
					</RowView>
					<TouchableOpacity style={[styles.button]} onPress={onBuy}>
						<ResizableText
							style={styles.buttonText}
							defaultSize={20}
						>
							{t("buy")}
						</ResizableText>
					</TouchableOpacity>
				</ThemedView>
			</CenterView>
		</Modal>
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
		height: "72%",
		width: "90%",
	},
	title: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: -10,
		textAlign: "center",
	},
	imageModal: {
		width: 265,
		height: 220,
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
	buttonText: {
		fontFamily: "Roboto",
	},
});
