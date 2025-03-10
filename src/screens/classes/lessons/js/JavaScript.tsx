import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	useFocusEffect,
	useNavigation,
	useTheme,
} from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Dimensions,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Collapsible from "react-native-collapsible";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function JavaScript() {
	//Salvar aulas
	const [AulasSalvas, setAulasSalvas] = useState("");

	useFocusEffect(
		React.useCallback(() => {
			getUser();
		}, [])
	);

	const getUser = async () => {
		const storageAulasSalvas = await AsyncStorage.getItem("Aulas");
		setAulasSalvas(storageAulasSalvas || "");
	};

	//Constante de tradução, usar {t("CHAVE")} para tradução
	const { t, i18n } = useTranslation();

	const { colors } = useTheme(); //Cores do tema

	const navigation = useNavigation();

	var [collapsed1, setState] = useState(true);
	var [collapsed2, setState2] = useState(true);
	var [collapsed3, setState3] = useState(true);
	var [collapsed4, setState4] = useState(true);

	var toggleExpanded = () => {
		setState((collapsed1 = !collapsed1));
	};
	var toggleExpanded2 = () => {
		setState2((collapsed2 = !collapsed2));
	};
	var toggleExpanded3 = () => {
		setState3((collapsed3 = !collapsed3));
	};
	var toggleExpanded4 = () => {
		setState4((collapsed4 = !collapsed4));
	};

	return (
		<ScrollView style={styles.scroller}>
			<View
				style={[
					styles.container,
					{ backgroundColor: colors.background },
				]}
			>
				{/*******************BASIC***********************/}
				<TouchableOpacity
					onPress={toggleExpanded}
					style={[styles.class, { backgroundColor: colors.primary }]}
				>
					<Text style={[styles.title, { color: colors.text }]}>
						{t("module1c")}
					</Text>
					<Text style={[styles.text, { color: colors.text }]}>
						{t("concepts of JavaScript")}
					</Text>
					<Image
						style={styles.basicImg}
						source={require("../../../../../assets/Robo_basics.png")}
					/>
				</TouchableOpacity>
				<Collapsible collapsed={collapsed1}>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Image
							style={styles.comingSoonImg}
							source={require("../../../../../assets/Robo_construcao.png")}
						/>
					</View>
					<View
						style={[styles.line, { borderColor: colors.primary }]}
					></View>
				</Collapsible>
				{/*******************INTER***********************/}
				<TouchableOpacity
					onPress={toggleExpanded2}
					style={[styles.class, { backgroundColor: colors.primary }]}
				>
					<Text style={[styles.title, { color: colors.text }]}>
						{t("module2c")}
					</Text>
					<Text style={[styles.text, { color: colors.text }]}>
						{t("intermediate JavaScript")}
					</Text>
					<Image
						style={styles.commonImg}
						source={require("../../../../../assets/Robo_pensativo.png")}
					/>
				</TouchableOpacity>
				<Collapsible collapsed={collapsed2}>
					<Text
						style={[
							{
								color: colors.text,
								fontSize: 20,
								margin: 20,
								textAlign: "center",
							},
						]}
					>
						{t("Oops")}
					</Text>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Image
							style={styles.comingSoonImg}
							source={require("../../../../../assets/Robo_construcao.png")}
						/>
					</View>
					<View
						style={[styles.line, { borderColor: colors.primary }]}
					></View>
				</Collapsible>
				{/*******************ADVANCED***********************/}
				<TouchableOpacity
					onPress={toggleExpanded3}
					style={[styles.class, { backgroundColor: colors.primary }]}
				>
					<Text style={[styles.title, { color: colors.text }]}>
						{t("module3c")}
					</Text>
					<Text style={[styles.text, { color: colors.text }]}>
						{t("advanced JavaScript")}
					</Text>
					<Image
						style={styles.commonImg}
						source={require("../../../../../assets/Robo_feliz.png")}
					/>
				</TouchableOpacity>
				<Collapsible collapsed={collapsed3}>
					<Text
						style={[
							{
								color: colors.text,
								fontSize: 20,
								margin: 20,
								textAlign: "center",
							},
						]}
					>
						{t("Oops")}
					</Text>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Image
							style={styles.comingSoonImg}
							source={require("../../../../../assets/Robo_construcao.png")}
						/>
					</View>
					<View
						style={[styles.line, { borderColor: colors.primary }]}
					></View>
				</Collapsible>
				{/*******************MASTERY***********************/}
				<TouchableOpacity
					onPress={toggleExpanded4}
					style={[styles.class, { backgroundColor: colors.primary }]}
				>
					<Text style={[styles.title, { color: colors.text }]}>
						{t("module4c")}
					</Text>
					<Text style={[styles.text, { color: colors.text }]}>
						{t("mastery in JavaScript")}
					</Text>
					<Image
						style={styles.masterImg}
						source={require("../../../../../assets/Robo_master.png")}
					/>
				</TouchableOpacity>
				<Collapsible collapsed={collapsed4}>
					<Text
						style={[
							{
								color: colors.text,
								fontSize: 20,
								margin: 20,
								textAlign: "center",
							},
						]}
					>
						{t("Oops")}
					</Text>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Image
							style={styles.comingSoonImg}
							source={require("../../../../../assets/Robo_construcao.png")}
						/>
					</View>
					<View
						style={[styles.line, { borderColor: colors.primary }]}
					></View>
				</Collapsible>
			</View>
		</ScrollView>
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
