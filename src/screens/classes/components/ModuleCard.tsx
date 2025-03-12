import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Collapsible from "react-native-collapsible";
import Images from "../../../utils/imageIndexer";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

interface Props {
	imagePath: string;
	title: string;
	subtitle: string;
}

export default function ModuleCard({ imagePath, title, subtitle }: Props) {
	const { colors } = useTheme(); //Cores do tema

	const [expanded, toggleExpanded] = useState(false);

	return (
		<>
			<TouchableOpacity
				onPress={() => toggleExpanded(!expanded)}
				style={[styles.class, { backgroundColor: colors.primary }]}
			>
				<Text style={[styles.title, { color: colors.text }]}>
					{title}
				</Text>
				<Text style={[styles.text, { color: colors.text }]}>
					{subtitle}
				</Text>
				<Image style={styles.basicImg} source={require(imagePath)} />
			</TouchableOpacity>
			<Collapsible collapsed={expanded}>
				<View
					style={{
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Image
						style={styles.comingSoonImg}
						source={Images.codyBuilding}
					/>
				</View>
				<View
					style={[styles.line, { borderColor: colors.primary }]}
				></View>
			</Collapsible>
		</>
	);
}

const styles = StyleSheet.create({
	scroller: {
		marginHorizontal: 10,
		height: "81%",
	},
	container: {
		flex: 1,
		backgroundColor: "#141f29",
	},
	class: {
		height: windowHeight * 0.19,
		marginLeft: 20,
		marginRight: 20,
		marginTop: 15,
		marginBottom: 15,
		backgroundColor: "#1B2B39",
		borderRadius: 20,
		elevation: 7,
	},
	title: {
		position: "absolute",
		right: 30,
		top: 55,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 23,
	},
	text: {
		position: "absolute",
		right: 30,
		top: 85,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 15,
	},
	basicImg: {
		top: 0,
		left: windowWidth * 0.065,
		width: windowWidth * 0.185,
		height: windowHeight * 0.185,
	},
	commonImg: {
		left: windowWidth * 0.065,
		width: windowWidth * 0.189,
		height: windowHeight * 0.189,
	},
	masterImg: {
		left: windowWidth * 0.04,
		width: windowWidth * 0.25,
		height: windowHeight * 0.18,
	},
	comingSoonImg: {
		width: windowWidth * 0.25,
		height: windowHeight * 0.25,
		right: windowWidth * 0.01,
	},
	icon: {
		left: 25,
		marginRight: 20,
		top: 20,
	},
	line: {
		borderBottomWidth: 2,
		borderColor: "#1B2B39",
		margin: 20,
		marginLeft: 15,
		marginRight: 15,
	},
});
