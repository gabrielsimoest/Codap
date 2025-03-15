import { Image, StyleSheet, View } from "react-native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import ThemedIcon from "../../../components/themed/ThemedIcon";
import { useTranslation } from "react-i18next";
import Images from "../../../utils/imageIndexer";
import ThemedView from "../../../components/themed/ThemedView";
import ThemedText from "../../../components/themed/ThemedText";
import useUserStore from "../../../stores/UserStore";

const TextSize = 20;

export default function DoubleTime() {
	const { t } = useTranslation();

	const user = useUserStore((s) => s.user);

	return (
		<ThemedView theme="primary" style={styles.list}>
			<ThemedText style={styles.Double}>
				{user?.doubleTime === 1 ? "Ativo" : "Inativo"}
			</ThemedText>
			<Image style={styles.timeImage} source={Images.doubleTime} />
			<ResizableText style={styles.textL} defaultSize={TextSize}>
				{t("double time")}
			</ResizableText>
			<RowView>
				<ResizableText style={styles.textLD3} defaultSize={TextSize}>
					300{" "}
				</ResizableText>
				<ThemedIcon type={"octicons"} name="dependabot" size={21} />
			</RowView>

			<View style={styles.button}>
				{/* <OpButton
									theme={"marketButton"}
									title={t("buy")}
									onPressFunction={() => setVisibleModal3(true)}
								/> */}
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#141f29",
		height: "100%",
	},
	headert: {
		margin: 10,
		fontSize: 25,
		color: "white",
		fontWeight: "bold",
		fontFamily: "Roboto",
		textAlign: "center",
	},
	list: {
		backgroundColor: "#1B2B39",
		borderRadius: 10,
		height: 170,
		margin: 10,
		elevation: 7,
	},
	button: {
		left: "8%",
		top: "25%",
	},
	xpImage: {
		top: 30,
		margin: 5,
		width: 150,
		height: 120,
	},
	chestImage: {
		position: "absolute",
		right: -5,
		bottom: 0,
		width: 180,
		height: 180,
	},
	timeImage: {
		top: 15,
		margin: 5,
		width: 160,
		height: 130,
	},
	textL: {
		color: "#fff",
		position: "absolute",
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: "Roboto",
		right: 37,
		top: 10,
	},
	textL2: {
		color: "#fff",
		fontWeight: "bold",
		position: "absolute",
		fontFamily: "Roboto",
		fontSize: 20,
		left: 35,
		top: 10,
	},
	textL3: {
		color: "#fff",
		position: "absolute",
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: "Roboto",
		right: 60,
		top: 38,
	},
	textLD: {
		color: "#637aff",
		position: "absolute",
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: "Roboto",
		right: 40,
		top: 38,
	},
	textLD2: {
		color: "#637aff",
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: "Roboto",
	},
	textLD3: {
		color: "#637aff",
		position: "absolute",
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: "Roboto",
		right: 40,
		top: 38,
	},
	contant: {
		opacity: 0.99,
		margin: 20,
		marginTop: 130,
		zIndex: 99,
		padding: 20,
		borderRadius: 30,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#141f29",

		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 5,
		shadowOpacity: 0.28,
		shadowRadius: 4,
	},
	textModal: {
		flexGrow: 1,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 23,
		fontWeight: "bold",
		marginTop: -40,
	},
	xpImageModal: {
		right: 70,
		margin: 10,
		width: 265,
		height: 220,
		marginLeft: "28%",
	},
	chestImageModal: {
		right: 30,
		width: 350,
		height: 350,
		margin: 10,
	},
	timeImageModal: {
		right: 70,
		margin: 10,
		width: 265,
		height: 220,
		marginLeft: "28%",
	},
	icon: {
		marginLeft: 260,
		top: -15,
	},
	text: {
		flexGrow: 1,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 30,
		fontWeight: "bold",
		marginLeft: "35%",
	},
	Double: {
		position: "absolute",
		top: "3%",
		left: "4%",
	},
	centeredView: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.85)",
	},
});
