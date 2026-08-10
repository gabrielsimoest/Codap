import React from "react";
import HighlightText from "@sanar/react-native-highlight-text";
import { StyleProp, TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
	text: string;
	highlight: string[];
	style?: StyleProp<TextStyle>;
}

function ThemedHighlighter({ style = {}, highlight, text }: Props) {
	const { colors } = useTheme();

	const patterns = highlight.map(
		(word) => `\\b${word}\\b|(?<=<)${word}(?=>)`
	);
	return (
		<HighlightText
			style={[style, { color: colors.text }]}
			highlightStyle={{ color: "#637aff" }}
			searchWords={patterns}
			textToHighlight={text}
		/>
	);
}

export default ThemedHighlighter;
