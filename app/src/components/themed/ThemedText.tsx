import { Text, StyleProp, TextStyle } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";

interface Props {
	children: string | string[];
	style?: StyleProp<TextStyle>;
}

export default function ThemedText({ children, style }: Props) {
	const { colors } = useTheme();

	return <Text style={[style, { color: colors.text }]}>{children}</Text>;
}
