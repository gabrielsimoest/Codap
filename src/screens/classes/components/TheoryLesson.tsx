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
	secondParagraph?: string;
	thirdParagraph?: string;
	endParagraph?: string;
	highlight: string[];
	codeLanguage: "HTML" | "CSS" | "JavaScript";
	code: string;
	onlyCode?: boolean;
	tutorial?: boolean;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
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
	onProceed,
	onClose,
}: Props) {
	const [isTutorialVisible, setTutorialVisible] = useState(tutorial);

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<Progressbar progress={progress} />
				<ThemedView theme="card" style={styles.container}>
					<ScrollView style={{ marginBottom: "25%" }}>
						<LessonHeader
							onClose={onClose}
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
						{secondParagraph !== undefined ? (
							<ResizableHighlighter
								style={styles.text}
								highlight={highlight}
								text={secondParagraph}
								defaultSize={textSize}
							/>
						) : null}
						{thirdParagraph !== undefined ? (
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

						{endParagraph !== undefined ? (
							<ResizableHighlighter
								style={styles.text}
								highlight={highlight}
								text={endParagraph}
								defaultSize={textSize}
							/>
						) : null}
					</ScrollView>
					<NextButton onPress={onProceed} />
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
		marginHorizontal: "3%",
		marginVertical: "4%",
		textAlign: "justify",
	},
});
