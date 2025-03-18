import * as React from "react";
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
