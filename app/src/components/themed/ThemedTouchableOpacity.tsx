import { useTheme } from "@react-navigation/native";
import {
	StyleProp,
	TouchableOpacity,
	TouchableOpacityProps,
	ViewStyle,
} from "react-native";

interface Props extends TouchableOpacityProps {
	theme?:
		| "primary"
		| "background"
		| "card"
		| "text"
		| "border"
		| "notification";
}

export default function ThemedTouchableOpacity({
	theme = "background",
	onPress,
	children,
	style = {} as StyleProp<ViewStyle>,
	...defaultProps
}: Props) {
	const { colors } = useTheme();

	return (
		<TouchableOpacity
			style={[style, { backgroundColor: colors[theme] }]}
			onPress={onPress}
			{...defaultProps}
		>
			{children}
		</TouchableOpacity>
	);
}
