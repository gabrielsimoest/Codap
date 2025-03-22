import React, { useState } from "react";
import { View, StyleSheet, ScrollView, DimensionValue } from "react-native";
/* import SaveClass from "./SaveClass";
import { TutorialTheory } from "./Tutorials"; */
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ThemedView from "../../../components/themed/ThemedView";
import CodeSection from "./CodeSection";
import { LessonHeader, Progressbar } from "./LessonHeader";
import NextButton from "./NextButton";

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
	const [isTutorialVisible, setTutorialVisible] = useState(tutorial);

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<Progressbar progress={progress} />
				<ThemedView theme="card" style={styles.container}>
					<ScrollView style={{ marginBottom: "20%" }}>
						<LessonHeader
							setTutorialVisible={() =>
								setTutorialVisible(!isTutorialVisible)
							}
						/>
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

						<CodeSection
							onlyCode={onlyCode}
							codeLanguage={codeLanguage}
							code={code}
						/>

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
						<NextButton onPress={() => console.log("")} />
					</View>
				</ThemedView>
			</ThemedView>
			{/* <TutorialTheory
						visible={TutorialVisible}
						setModalVisible={setTutorialVisible}
					/> */}
			{/* <SaveClass AulaId={aulaSalvar} Salvar={Salvar} /> */}
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		height: "100%",
	},
	text: {
		fontSize: 18,
		fontFamily: "Roboto",
		margin: "2%",
		marginTop: "1%",
		marginBottom: "2%",
		textAlign: "justify",
	},
});
