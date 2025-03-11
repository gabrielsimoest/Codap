import { StyleProp, Text, TextStyle } from "react-native";
import ThemedText from "./themed/ThemedText";
import useFontSizeStore from "../stores/FontSizeStore";

interface Props {
	children: string;
	defaultSize?: number;
	useCustomColor?: boolean;
	style?: StyleProp<TextStyle>;
}

export default function ResizableText({
	children,
	style,
	useCustomColor = false,
	defaultSize = 25,
}: Props) {
	const fontSize = useFontSizeStore((s) => s.fontSize);

	if (useCustomColor) {
		return (
			<Text style={[style, { fontSize: defaultSize + fontSize }]}>
				{children}
			</Text>
		);
	} else {
		return (
			<ThemedText style={[style, { fontSize: defaultSize + fontSize }]}>
				{children}
			</ThemedText>
		);
	}
}
