import React from "react";
import HighlightText from "@sanar/react-native-highlight-text";
import { StyleProp, TextStyle } from "react-native";

interface Props {
	text: string;
	highlight: string[];
	style?: StyleProp<TextStyle>;
}

function ThemedHighlighter({ style = {}, highlight, text }: Props) {
	const patterns = highlight.map(
		(word) => `\\b${word}\\b|(?<=<)${word}(?=>)`
	);
	return (
		<HighlightText
			style={style}
			highlightStyle={{ color: "#637aff" }}
			searchWords={patterns}
			textToHighlight={text}
		/>
	);
}

export default ThemedHighlighter;
