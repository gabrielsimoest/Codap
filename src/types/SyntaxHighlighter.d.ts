declare module "react-native-syntax-highlighter" {
	import React from "react";
	import { SyntaxHighlighterProps } from "react-syntax-highlighter";

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

	export default class SyntaxHighlighter extends React.Component<RNSyntaxHighlighterProps> {}
}

declare module "react-syntax-highlighter/dist/esm/create-element.js" {
	import type { CSSProperties } from "react";

	export function createStyleObject(
		classNames: string[],
		elementStyle: CSSProperties,
		stylesheet: Record<string, CSSProperties>
	): CSSProperties;
}
