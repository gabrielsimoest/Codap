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

// react-syntax-highlighter só aplica a gramática pedida se o nome bater
// exatamente (case-sensitive, sem apelido) com uma chave já registrada no
// highlight.js — e HTML é registrado sob a chave "xml" (o highlight.js trata
// "html" como apelido, que essa checagem não resolve). Sem isso, qualquer
// `codeLanguage` que não coincida cai silenciosamente em detecção automática,
// que erra fácil em trechos curtos.
const HLJS_LANGUAGE_ALIASES: Record<string, string> = {
	html: "xml",
};

function toHljsLanguage(language: string): string {
	const normalized = language.toLowerCase();
	return HLJS_LANGUAGE_ALIASES[normalized] ?? normalized;
}

function CustomSyntaxHighlighter({ defaultSize = 15, code, language }: Props) {
	const fontSize = useFontSizeStore((s) => s.fontSize);
	const theme = useThemeStore((s) => s.theme);
	return (
		<>
			<NativeSyntaxHighlighter
				language={toHljsLanguage(language)}
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
