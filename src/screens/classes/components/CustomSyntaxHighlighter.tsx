import React from "react";
import useFontSizeStore from "../../../stores/FontSizeStore";
import SyntaxHighlighter from "react-native-syntax-highlighter";
import {
	atomOneDark as LightStyle,
	atomOneLight as DarkStyle,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import useThemeStore from "../../../stores/ThemeStore";
import LightMode from "../../../theme/LightMode";

interface Props {
	defaultSize?: number;
	code: string;
	language: string;
}

function CustomSyntaxHighlighter({ defaultSize = 15, code, language }: Props) {
	const fontSize = useFontSizeStore((s) => s.fontSize);
	const theme = useThemeStore((s) => s.theme);
	return (
		<SyntaxHighlighter
			language={language}
			style={theme === LightMode ? LightStyle : DarkStyle}
			fontSize={fontSize + defaultSize}
		>
			{code}
		</SyntaxHighlighter>
	);
}

export default CustomSyntaxHighlighter;
