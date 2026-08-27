/* import * as React from "react";
import { Text, TextStyle, View } from "react-native";
import Highlighter, { SyntaxHighlighterProps } from "react-syntax-highlighter";
import {
	atomOneLight as lightStyle,
	atomOneDark as darkStyle,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import LightMode from "../../../theme/LightMode";
import { useTheme } from "@react-navigation/native";

type Node = {
	children?: Node[];
	properties?: {
		className: string[];
	};
	tagName?: string;
	type: string;
	value?: string;
};

type StyleSheet = { [key: string]: TextStyle };

type RendererParams = {
	rows: Node[];
	stylesheet: StyleSheet;
};

export const SyntaxHighlighter: React.FunctionComponent<
	SyntaxHighlighterProps
> = (props) => {
	const theme = useTheme();

	const cleanStyle = (style: TextStyle) => {
		const clean: TextStyle = {
			...style,
			display: undefined,
		};
		return clean;
	};

	const stylesheet: StyleSheet = Object.fromEntries(
		Object.entries(
			(theme === LightMode ? lightStyle : darkStyle) as StyleSheet
		).map(([className, style]) => [className, cleanStyle(style)])
	);

	const renderNode = (nodes: Node[], key = "0") =>
		nodes.reduce<React.ReactNode[]>((acc, node, index) => {
			if (node.children) {
				acc.push(
					<Text
						// eslint-disable-next-line react/no-array-index-key
						key={`${key}.${index}`}
						style={[
							{
								color: stylesheet.hljs.color,
							},
							...(node.properties?.className || []).map(
								(c) => stylesheet[c]
							),
							{
								fontSize: 14,
								fontFamily: "monospace",
							},
						]}
					>
						{renderNode(node.children, `${key}.${index}`)}
					</Text>
				);
			}

			if (node.value) {
				acc.push(node.value);
			}

			return acc;
		}, []);

	const nativeRenderer = ({ rows }: RendererParams) => {
		return <View style={[stylesheet.hljs]}>{renderNode(rows)}</View>;
	};

	return (
		<Highlighter
			{...props}
			CodeTag={View}
			PreTag={View}
			renderer={nativeRenderer}
			style={stylesheet}
		/>
	);
};

export default SyntaxHighlighter;
 */

/* import React from "react";
import { Text, ScrollView, Platform } from "react-native";
import SyntaxHighlighter, {
	SyntaxHighlighterProps,
} from "react-syntax-highlighter";
//@ts-ignore
import { createStyleObject } from "react-syntax-highlighter/dist/esm/create-element";
import { defaultStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

const styleCache = new Map();

const topLevelPropertiesToRemove = [
	"color",
	"textShadow",
	"textAlign",
	"whiteSpace",
	"wordSpacing",
	"wordBreak",
	"wordWrap",
	"lineHeight",
	"MozTabSize",
	"OTabSize",
	"tabSize",
	"WebkitHyphens",
	"MozHyphens",
	"msHyphens",
	"hyphens",
	"fontFamily",
];

function generateNewStylesheet({ stylesheet, highlighter }: any) {
	if (styleCache.has(stylesheet)) {
		return styleCache.get(stylesheet);
	}
	// I don't know why, but sometimes 'stylesheet' comes as an Array
	// like this [{ stylesheet }, { opacity: 0.85 }], instead of an Object,
	// so this throws an error referenced at issue #17
	// So, this is a workaround, if the  stylesheet is an Array,
	// returns the first element, wich is the actual style object.
	stylesheet = Array.isArray(stylesheet) ? stylesheet[0] : stylesheet;
	const transformedStyle = Object.entries(stylesheet).reduce(
		(newStylesheet, [className, style]) => {
			//@ts-ignore
			newStylesheet[className] = Object.entries(style!).reduce(
				(newStyle, [key, value]) => {
					if (key === "overflowX" || key === "overflow") {
						//@ts-ignore
						newStyle.overflow = value === "auto" ? "scroll" : value;
					} else if (value.includes("em")) {
						const [num] = value.split("em");
						//@ts-ignore
						newStyle[key] = Number(num) * 16;
					} else if (key === "background") {
						//@ts-ignore
						newStyle.backgroundColor = value;
					} else if (key === "display") {
						return newStyle;
					} else {
						//@ts-ignore
						newStyle[key] = value;
					}
					return newStyle;
				},
				{}
			);
			return newStylesheet;
		},
		{}
	);
	//@ts-ignore
	const topLevel = transformedStyle.hljs;
	const defaultColor = (topLevel && topLevel.color) || "#000";
	topLevelPropertiesToRemove.forEach((property) => {
		if (topLevel[property]) {
			delete topLevel[property];
		}
	});
	if (topLevel.backgroundColor === "none") {
		delete topLevel.backgroundColor;
	}
	//@ts-ignore
	const codeLevel = transformedStyle['code[class*="language-"]'];
	if (highlighter === "prism" && !!codeLevel) {
		topLevelPropertiesToRemove.forEach((property) => {
			if (codeLevel[property]) {
				delete codeLevel[property];
			}
		});
		if (codeLevel.backgroundColor === "none") {
			delete codeLevel.backgroundColor;
		}
	}
	styleCache.set(stylesheet, { transformedStyle, defaultColor });
	return { transformedStyle, defaultColor };
}

function createChildren({ stylesheet, fontSize, fontFamily }: any) {
	let childrenCount = 0;
	return (children: any, defaultColor: any) => {
		childrenCount += 1;
		return children.map((child: any, i: any) =>
			createNativeElement({
				node: child,
				stylesheet,
				key: `code-segment-${childrenCount}-${i}`,
				defaultColor,
				fontSize,
				fontFamily,
			})
		);
	};
}

function createNativeElement({
	node,
	stylesheet,
	key,
	defaultColor,
	fontFamily,
	fontSize = 12,
}: any) {
	const { properties, type, tagName: TagName, value } = node;
	const startingStyle = { fontFamily, fontSize, height: fontSize + 5 };
	if (type === "text") {
		return (
			<Text
				key={key}
				style={Object.assign({ color: defaultColor }, startingStyle)}
			>
				{value}
			</Text>
		);
	} else if (TagName) {
		const childrenCreator = createChildren({
			stylesheet,
			fontSize,
			fontFamily,
		});
		const style = createStyleObject(
			properties.className,
			Object.assign(
				{ color: defaultColor },
				properties.style,
				startingStyle
			),
			stylesheet
		);
		const children = childrenCreator(
			node.children,
			style.color || defaultColor
		);
		return (
			<Text key={key} style={style}>
				{children}
			</Text>
		);
	}
}

function nativeRenderer({ defaultColor, fontFamily, fontSize }: any) {
	return ({ rows, stylesheet }: any) =>
		rows.map((node: any, i: any) =>
			createNativeElement({
				node,
				stylesheet,
				key: `code-segment-${i}`,
				defaultColor,
				fontFamily,
				fontSize,
			})
		);
}

interface RNSyntaxHighlighterProps
	extends Omit<
		SyntaxHighlighterProps,
		| "useInlineStyles"
		| "showLineNumbers"
		| "startingLineNumber"
		| "lineNumberContainerStyle"
		| "lineNumberStyle"
	> {
	fontFamily?: string;
	fontSize?: number;
	highlighter?: string;
}

function NativeSyntaxHighlighter({
	fontFamily = Platform.OS === "ios" ? "Menlo-Regular" : "monospace",
	fontSize = 12,
	children,
	highlighter = "highlightjs",
	style = defaultStyle,
	...rest
}: RNSyntaxHighlighterProps) {
	const { transformedStyle, defaultColor } = generateNewStylesheet({
		stylesheet: style,
		highlighter,
	});
	const Highlighter = SyntaxHighlighter;
	return (
		<Highlighter
			{...rest}
			style={transformedStyle}
			PreTag={ScrollView}
			CodeTag={ScrollView}
			horizontal={true}
			renderer={nativeRenderer({
				defaultColor,
				fontFamily,
				fontSize,
			})}
		>
			{children}
		</Highlighter>
	);
}

export default NativeSyntaxHighlighter;
 */

import React from "react";
import { Text, ScrollView, Platform, TextStyle, StyleProp } from "react-native";
import SyntaxHighlighter, {
	SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { createStyleObject } from "react-syntax-highlighter/dist/esm/create-element.js";
import { defaultStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

type StyleSheet =
	| Record<string, React.CSSProperties>
	| Array<Record<string, React.CSSProperties>>;
type TransformedStyle = Record<string, React.CSSProperties>;

interface SyntaxNode {
	type: string;
	tagName?: string;
	value?: string;
	children?: SyntaxNode[];
	properties?: {
		className?: string[];
		style?: React.CSSProperties;
	};
}

interface GenerateNewStylesheetResult {
	transformedStyle: TransformedStyle;
	defaultColor: string;
}

const styleCache = new Map<StyleSheet, GenerateNewStylesheetResult>();

const topLevelPropertiesToRemove = [
	"color",
	"textShadow",
	"textAlign",
	"whiteSpace",
	"wordSpacing",
	"wordBreak",
	"wordWrap",
	"lineHeight",
	"MozTabSize",
	"OTabSize",
	"tabSize",
	"WebkitHyphens",
	"MozHyphens",
	"msHyphens",
	"hyphens",
	"fontFamily",
];

function generateNewStylesheet(params: {
	stylesheet: StyleSheet;
	highlighter: string;
}): GenerateNewStylesheetResult {
	const { stylesheet, highlighter } = params;

	if (styleCache.has(stylesheet)) {
		return styleCache.get(stylesheet)!;
	}

	let processedStylesheet = Array.isArray(stylesheet)
		? stylesheet[0]
		: (stylesheet as Record<string, React.CSSProperties>);

	const transformedStyle = Object.entries(processedStylesheet).reduce(
		(newStylesheet, [className, style]) => {
			newStylesheet[className] = Object.entries(style).reduce(
				(newStyle, [key, value]) => {
					if (key === "overflowX" || key === "overflow") {
						newStyle.overflow = value === "auto" ? "scroll" : value;
					} else if (
						typeof value === "string" &&
						value.includes("em")
					) {
						const [num] = value.split("em");
						//@ts-ignore
						newStyle[key] = Number(num) * 16;
					} else if (key === "background") {
						newStyle.backgroundColor = value;
					} else if (key !== "display") {
						newStyle[key as keyof React.CSSProperties] = value;
					}
					return newStyle;
				},
				{} as React.CSSProperties
			);
			return newStylesheet;
		},
		{} as TransformedStyle
	);

	const topLevel = transformedStyle.hljs || {};
	const defaultColor = topLevel.color || "#000";

	topLevelPropertiesToRemove.forEach((property) => {
		delete topLevel[property as keyof React.CSSProperties];
	});

	if (topLevel.backgroundColor === "none") {
		delete topLevel.backgroundColor;
	}

	if (highlighter === "prism") {
		const codeLevel = transformedStyle['code[class*="language-"]'];
		if (codeLevel) {
			topLevelPropertiesToRemove.forEach((property) => {
				delete codeLevel[property as keyof React.CSSProperties];
			});
			if (codeLevel.backgroundColor === "none") {
				delete codeLevel.backgroundColor;
			}
		}
	}

	const result = { transformedStyle, defaultColor };
	styleCache.set(stylesheet, result);
	return result;
}

interface CreateChildrenParams {
	stylesheet: TransformedStyle;
	fontSize: number;
	fontFamily: string;
}

function createChildren({
	stylesheet,
	fontSize,
	fontFamily,
}: CreateChildrenParams) {
	let childrenCount = 0;
	return (children: SyntaxNode[], defaultColor: string) => {
		childrenCount += 1;
		return children.map((child, i) =>
			createNativeElement({
				node: child,
				stylesheet,
				key: `code-segment-${childrenCount}-${i}`,
				defaultColor,
				fontSize,
				fontFamily,
			})
		);
	};
}

interface CreateNativeElementParams {
	node: SyntaxNode;
	stylesheet: TransformedStyle;
	key: string;
	defaultColor: string;
	fontFamily: string;
	fontSize: number;
}

function createNativeElement({
	node,
	stylesheet,
	key,
	defaultColor,
	fontFamily,
	fontSize = 12,
}: CreateNativeElementParams): React.JSX.Element {
	const { properties, type, tagName: TagName, value } = node;
	const startingStyle: TextStyle = {
		fontFamily,
		fontSize,
		height: fontSize + 5,
	};

	if (type === "text") {
		return (
			<Text key={key} style={[{ color: defaultColor }, startingStyle]}>
				{value}
			</Text>
		);
	}

	if (TagName && properties) {
		const childrenCreator = createChildren({
			stylesheet,
			fontSize,
			fontFamily,
		});

		const style = createStyleObject(
			properties.className || [],
			{
				//@ts-ignore
				color: defaultColor,
				...properties.style,
				...startingStyle,
			},
			stylesheet
		);

		const children = childrenCreator(
			node.children || [],
			(style.color as string) || defaultColor
		);

		return (
			<Text key={key} style={style as StyleProp<TextStyle>}>
				{children}
			</Text>
		);
	}

	return <></>;
}

interface RendererParams {
	defaultColor: string;
	fontFamily: string;
	fontSize: number;
}

function nativeRenderer({
	defaultColor,
	fontFamily,
	fontSize,
}: RendererParams) {
	return ({
		rows,
		stylesheet,
	}: {
		rows: SyntaxNode[];
		stylesheet: TransformedStyle;
	}) =>
		rows.map((node, i) =>
			createNativeElement({
				node,
				stylesheet,
				key: `code-segment-${i}`,
				defaultColor,
				fontFamily,
				fontSize,
			})
		);
}

interface RNSyntaxHighlighterProps
	extends Omit<
		SyntaxHighlighterProps,
		| "useInlineStyles"
		| "showLineNumbers"
		| "startingLineNumber"
		| "lineNumberContainerStyle"
		| "lineNumberStyle"
	> {
	fontFamily?: string;
	fontSize?: number;
	highlighter?: "highlightjs" | "prism";
}

function NativeSyntaxHighlighter({
	fontFamily = Platform.OS === "ios" ? "Menlo-Regular" : "monospace",
	fontSize = 12,
	children,
	highlighter = "highlightjs",
	style = defaultStyle,
	...rest
}: RNSyntaxHighlighterProps) {
	const { transformedStyle, defaultColor } = generateNewStylesheet({
		stylesheet: style,
		highlighter,
	});

	return (
		<SyntaxHighlighter
			{...rest}
			style={transformedStyle}
			PreTag={ScrollView}
			CodeTag={ScrollView}
			horizontal={true}
			//@ts-ignore
			renderer={nativeRenderer({ defaultColor, fontFamily, fontSize })}
		>
			{children}
		</SyntaxHighlighter>
	);
}

export default NativeSyntaxHighlighter;
