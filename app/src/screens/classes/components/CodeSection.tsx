import {
	LayoutChangeEvent,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import CustomSyntaxHighlighter from "../../../components/CustomSyntaxHighlighter";
import ThemedText from "../../../components/themed/ThemedText";
import RowView from "../../../components/layout/RowView";
import DarkMode from "../../../theme/DarkMode";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import WebView from "react-native-webview";

interface Props {
	onlyCode: boolean;
	codeLanguage: "HTML" | "CSS" | "JavaScript";
	code: string;
}

export default function CodeSection({ onlyCode, codeLanguage, code }: Props) {
	const theme = useTheme();

	const isDarkMode = theme === DarkMode;

	if (onlyCode)
		return (
			<View
				style={[
					isDarkMode ? styles.codeArea : styles.codeAreaLight,
					{ width: "100%", marginVertical: 20 },
				]}
			>
				<ScrollView style={{ width: "100%" }}>
					<CustomSyntaxHighlighter language={codeLanguage} code={code} />
				</ScrollView>
			</View>
		);

	const [isIndexVisible, setIndexVisible] = useState(true);
	const toggleContent = () => {
		setIndexVisible(!isIndexVisible);
	};

	const [highlighterHeight, setHighlighterHeight] = useState(100);
	const onHighlighterLayout = (event: LayoutChangeEvent) => {
		const { height } = event.nativeEvent.layout;
		setHighlighterHeight(height);
	};

	return (
		<View>
			<RowView style={{ marginTop: 10 }}>
				<Pressable
					style={[
						styles.button,
						styles[isDarkMode ? "buttonDark" : "buttonLight"],
						isIndexVisible
							? styles[
									theme === DarkMode
										? "selectedDark"
										: "selectedLight"
							  ]
							: null,
					]}
					onPress={toggleContent}
				>
					<ThemedText style={styles.textButton}>Index</ThemedText>
				</Pressable>
				<Pressable
					style={[
						styles.button,
						styles[isDarkMode ? "buttonDark" : "buttonLight"],
						!isIndexVisible
							? styles[
									theme === DarkMode
										? "selectedDark"
										: "selectedLight"
							  ]
							: null,
						{ marginLeft: -15 },
					]}
					onPress={toggleContent}
				>
					<ThemedText style={styles.textButton}>Web</ThemedText>
				</Pressable>
			</RowView>
			<View style={isDarkMode ? styles.codeArea : styles.codeAreaLight}>
				{isIndexVisible ? (
					<ScrollView
						style={{ width: "100%" }}
						onLayout={onHighlighterLayout}
					>
						<CustomSyntaxHighlighter
							language={codeLanguage}
							code={code}
						/>
					</ScrollView>
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
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	textButton: {
		paddingHorizontal: 5,
		fontSize: 18,
		fontFamily: "Roboto",
	},

	button: {
		alignItems: "center",
		justifyContent: "center",
		width: "25%",
		borderTopStartRadius: 5,
		borderTopEndRadius: 30,
		zIndex: 1,
	},

	buttonDark: {
		backgroundColor: "#1B2B39",
	},

	buttonLight: {
		backgroundColor: "#757575",
	},

	selectedDark: {
		backgroundColor: "#304D66",
		zIndex: 99,
	},

	selectedLight: {
		backgroundColor: "#A5A5A5",
		zIndex: 99,
	},

	//Code area dark

	codeArea: {
		height: 300,
		// Mesmo valor de "background" do tema atomOneDark (hljs) usado no
		// syntax highlighter — sem isso, o espaço da caixa que sobra abaixo
		// do código mostra a cor de fundo do card por trás, criando uma
		// emenda visível de cor diferente.
		backgroundColor: "#282c34",
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
		height: 300,
		// Mesmo valor de "background" do tema atomOneLight (hljs) — ver
		// comentário equivalente em codeArea.
		backgroundColor: "#fafafa",
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
