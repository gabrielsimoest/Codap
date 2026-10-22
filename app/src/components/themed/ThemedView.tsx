import { useTheme } from "@react-navigation/native";
import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface Props {
	theme?:
		| "primary"
		| "background"
		| "card"
		| "text"
		| "border"
		| "notification";
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
}

export default function ThemedView({
	theme = "background",
	children,
	style = {},
}: Props) {
	const { colors } = useTheme();

	return (
		<View style={[style, { backgroundColor: colors[theme] }]}>
			{children}
		</View>
	);
}
