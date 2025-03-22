import React from "react";
import useFontSizeStore from "../stores/FontSizeStore";
/* import SyntaxHighlighter from "react-native-syntax-highlighter"; */
import {
	atomOneLight as LightStyle,
	atomOneDark as DarkStyle,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import useThemeStore from "../stores/ThemeStore";
import LightMode from "../theme/LightMode";
import NativeSyntaxHighlighter from "./NativeSyntaxHighlighter";
/* import CodeHighlighter from "react-native-code-highlighter"; */

interface Props {
	defaultSize?: number;
	code: string;
	language: string;
}

function CustomSyntaxHighlighter({ defaultSize = 15, code, language }: Props) {
	const fontSize = useFontSizeStore((s) => s.fontSize);
	const theme = useThemeStore((s) => s.theme);
	return (
		<>
			<NativeSyntaxHighlighter
				language={language}
				style={theme === LightMode ? LightStyle : DarkStyle}
				fontSize={fontSize + defaultSize}
			>
				{code}
			</NativeSyntaxHighlighter>
			{/* <CodeHighlighter
				hljsStyle={theme === LightMode ? LightStyle : DarkStyle}
				language={language}
				textStyle={{ fontSize: fontSize + defaultSize }}
				containerStyle={{
					width: "100%",
					padding: 10,
					overflow: "scroll",
				}}
			>
				{code}
			</CodeHighlighter> */}
		</>
	);
}

export default CustomSyntaxHighlighter;
