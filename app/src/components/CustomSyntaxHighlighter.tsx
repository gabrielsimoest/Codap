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
	/** Tema do highlight.js no lugar do atomOne padrão (a tela de teoria usa o dela). */
	themeStyle?: Record<string, Record<string, string | number>>;
	/** Estilo do contêiner de rolagem horizontal do código (o `pre` do react-syntax-highlighter). */
	containerStyle?: Record<string, string | number>;
}

// react-syntax-highlighter só aplica a gramática pedida se o nome bater
// exatamente (case-sensitive, sem apelido) com uma chave já registrada no
// highlight.js — e HTML é registrado sob a chave "xml" (o highlight.js trata
// "html" como apelido, que essa checagem não resolve). Sem isso, qualquer
// `codeLanguage` que não coincida cai silenciosamente em detecção automática,
// que erra fácil em trechos curtos.
// JSX também não é uma chave do highlight.js: a gramática de `javascript` já
// realça JSX (as tags viram `xml` por dentro), então "jsx" aponta para ela.
const HLJS_LANGUAGE_ALIASES: Record<string, string> = {
	html: "xml",
	jsx: "javascript",
};

function toHljsLanguage(language: string): string {
	const normalized = language.toLowerCase();
	return HLJS_LANGUAGE_ALIASES[normalized] ?? normalized;
}

function CustomSyntaxHighlighter({ defaultSize = 15, code, language, themeStyle, containerStyle }: Props) {
	const fontSize = useFontSizeStore((s) => s.fontSize);
	const theme = useThemeStore((s) => s.theme);
	return (
		<>
			<NativeSyntaxHighlighter
				language={toHljsLanguage(language)}
				style={themeStyle ?? (theme === LightMode ? LightStyle : DarkStyle)}
				customStyle={containerStyle}
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
