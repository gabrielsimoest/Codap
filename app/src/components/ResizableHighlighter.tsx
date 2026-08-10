import React from "react";
import { StyleProp, TextStyle } from "react-native";
import ThemedHighlighter from "./themed/ThemedHighlighter";
import useFontSizeStore from "../stores/FontSizeStore";

interface Props {
	text: string;
	highlight: string[];
	style?: StyleProp<TextStyle>;
	defaultSize?: number;
}

function ResizableHighlighter({
	style = {},
	highlight,
	text,
	defaultSize = 20,
}: Props) {
	const fontSize = useFontSizeStore((s) => s.fontSize);

	return (
		<ThemedHighlighter
			style={[style, { fontSize: fontSize + defaultSize }]}
			highlight={highlight}
			text={text}
		/>
	);
}

export default ResizableHighlighter;
