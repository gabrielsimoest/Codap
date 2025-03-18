import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	View,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Pressable,
	Text,
	DimensionValue,
	LayoutChangeEvent,
} from "react-native";
/* import SaveClass from "./SaveClass";
import { TutorialTheory } from "./Tutorials"; */
import WebView from "react-native-webview";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ThemedView from "../../../components/themed/ThemedView";
import DarkMode from "../../../theme/DarkMode";
import Icon from "../../../components/Icon";
import RowView from "../../../components/layout/RowView";
import ThemedText from "../../../components/themed/ThemedText";
import CustomSyntaxHighlighter from "./CustomSyntaxHighlighter";

const textSize = 20;

interface Props {
	firstParagraph: string;
	secondParagraph: string;
	thirdParagraph: string;
	endParagraph: string;
	highlight: string[];
	codeLanguage: "HTML" | "CSS" | "JavaScript";
	code: string;
	onlyCode?: boolean;
	tutorial?: boolean;
	progress: DimensionValue;
}

export default function TheoryView({
	firstParagraph,
	secondParagraph,
	thirdParagraph,
	endParagraph,
	highlight = [""],
	codeLanguage = "HTML",
	code = `<!DOCTYPE html>
  <html>
    <head>
      <title>Minha página</title>
    </head>
    <body>
      <h1>Minha página</h1>
      <p>Esta é a minha primeira página HTML!</p>
    </body>
  </html>`,
	onlyCode = false,
	tutorial = false,
	progress,
}: Props) {
	//Constante de tradução, usar {t("CHAVE")} para tradução
	const { t } = useTranslation();

	const theme = useTheme(); //Variavel de cor do tema

	//Troca entre as abas do seletor
	const [isIndexVisible, setIndexVisible] = useState(true);
	const toggleContent = () => {
		setIndexVisible(!isIndexVisible);
	};

	//Define tutorial visivel
	const [TutorialVisible, setTutorialVisible] = useState(tutorial);

	//Obtem o tamanho do sintax highlight para aplicar no webView
	const [highlighterHeight, setHighlighterHeight] = useState(100);
	const onHighlighterLayout = (event: LayoutChangeEvent) => {
		const { height } = event.nativeEvent.layout;
		setHighlighterHeight(height);
	};

	return (
		<ThemedView theme="card" style={styles.container}>
			<View
				style={[
					styles.progressBar,
					{
						backgroundColor:
							theme == DarkMode ? "#273f55" : "#c1c1c1",
					},
				]} /*Progress Bar*/
			>
				<View
					style={[
						StyleSheet.absoluteFill,
						{ backgroundColor: "#637aff", width: progress },
					]}
				/>
			</View>
			{/*BODY*/}
			<ThemedView theme="card" style={styles.container}>
				<ScrollView style={{ marginBottom: "20%" }}>
					{/*BUTTON*/}
					<RowView>
						<TouchableOpacity
							/* onPress={() => navigation.navigate("Home")} */
							style={{ width: 60 }}
						>
							<Icon
								type="ionicon"
								name="close-outline"
								color={"#33526E"}
								size={60}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setTutorialVisible(!TutorialVisible)}
							style={{ width: 50, top: 8, marginLeft: "72%" }}
						>
							<Icon
								type="ionicon"
								name="help-circle-outline"
								color={"#33526E"}
								size={45}
							/>
						</TouchableOpacity>
					</RowView>
					{/*BUTTON_END*/}
					{/* <TutorialTheory
						visible={TutorialVisible}
						setModalVisible={setTutorialVisible}
					/> */}
					{/* <SaveClass AulaId={aulaSalvar} Salvar={Salvar} /> */}
					<ResizableHighlighter
						style={styles.text}
						highlight={highlight}
						text={firstParagraph}
						defaultSize={textSize}
					/>
					{secondParagraph !== "" ? (
						<ResizableHighlighter
							style={styles.text}
							highlight={highlight}
							text={secondParagraph}
							defaultSize={textSize}
						/>
					) : null}
					{thirdParagraph !== "" ? (
						<ResizableHighlighter
							style={styles.text}
							highlight={highlight}
							text={thirdParagraph}
							defaultSize={textSize}
						/>
					) : null}
					{/*CODE SECTION*/}
					{onlyCode ? (
						<View
							style={[
								theme == DarkMode
									? styles.codeArea
									: styles.codeAreaLight,
								{ width: "100%", marginVertical: 20 },
							]}
						>
							<CustomSyntaxHighlighter
								language={codeLanguage}
								code={code}
							/>
						</View>
					) : (
						<View>
							<View
								style={{
									flexDirection: "row",
									marginTop: "3%",
								}}
							>
								<Pressable
									style={
										isIndexVisible
											? theme == DarkMode
												? styles.buttonIndex
												: styles.LightButtonIndex
											: theme == DarkMode
											? styles.buttonIndex_deselected
											: styles.LightButtonIndex_deselected
									}
									onPress={toggleContent}
								>
									<ThemedText style={styles.textButton}>
										Index
									</ThemedText>
								</Pressable>
								<Pressable
									style={
										isIndexVisible
											? theme == DarkMode
												? styles.buttonWeb_deselected
												: styles.LightButtonWeb_deselected
											: theme == DarkMode
											? styles.buttonWeb
											: styles.LightButtonWeb
									}
									onPress={toggleContent}
								>
									<ThemedText style={styles.textButton}>
										Web
									</ThemedText>
								</Pressable>
							</View>
							<View
								style={
									theme == DarkMode
										? styles.codeArea
										: styles.codeAreaLight
								}
							>
								{/*Start code view*/}
								{isIndexVisible ? (
									<View
										style={{ width: "100%" }}
										onLayout={onHighlighterLayout}
									>
										<CustomSyntaxHighlighter
											language={codeLanguage}
											code={code}
										/>
									</View>
								) : (
									<View
										style={{
											width: "100%",
											height: highlighterHeight,
										}}
									>
										<WebView
											source={{ html: code }}
											containerStyle={{
												flex: 0,
												height: highlighterHeight,
											}}
											textZoom={220}
											nestedScrollEnabled={true}
										/>
									</View>
								)}
								{/*End code view*/}
							</View>
						</View>
					)}

					{endParagraph !== "" ? (
						<ResizableHighlighter
							style={styles.text}
							highlight={highlight}
							text={endParagraph}
							defaultSize={textSize}
						/>
					) : null}
				</ScrollView>
				<View>
					{/* <OpButton
						theme={"nextButton"}
						title={t("next")}
						onPressFunction={() => navigation.navigate(navegar)}
					/> */}
				</View>
			</ThemedView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
	},
	progressBar: {
		top: -2,
		height: 8,
		width: "100%",
		backgroundColor: "#273f55",
	},
	text: {
		fontSize: 18,
		fontFamily: "Roboto",
		margin: "2%",
		marginTop: "1%",
		marginBottom: "2%",
		textAlign: "justify",
	},
	textButton: {
		fontSize: 18,
		fontFamily: "Roboto",
	},

	//Dark button

	buttonIndex: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#304D66",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		zIndex: 99,
	},
	buttonIndex_deselected: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1B2B39",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		zIndex: 1,
	},
	buttonWeb: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#304D66",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		right: "55%",
		zIndex: 99,
	},
	buttonWeb_deselected: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1B2B39",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		right: "55%",
		zIndex: 1,
	},

	//Light button

	LightButtonIndex: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#A5A5A5",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		zIndex: 99,
	},
	LightButtonIndex_deselected: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#757575",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		zIndex: 1,
	},
	LightButtonWeb: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#A5A5A5",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		right: "55%",
		zIndex: 99,
	},
	LightButtonWeb_deselected: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#757575",
		width: "20%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		right: "55%",
		zIndex: 1,
	},

	//Code area dark

	codeArea: {
		borderWidth: 5,
		borderColor: "#304D66",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 8,
		marginBottom: "3%",
	},

	//Code area light

	codeAreaLight: {
		borderWidth: 5,
		borderColor: "#A5A5A5",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 8,
		marginBottom: "3%",
	},
});
