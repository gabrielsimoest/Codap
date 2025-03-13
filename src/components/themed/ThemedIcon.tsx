import { StyleProp, ViewStyle } from "react-native";
import Icon, { IconType } from "../Icon";
import { useTheme } from "@react-navigation/native";

interface Props {
	type: IconType;
	name: string;
	size?: number;
	style?: StyleProp<ViewStyle>;
	theme?:
		| "primary"
		| "background"
		| "card"
		| "text"
		| "border"
		| "notification";
	backgroundTheme?:
		| "primary"
		| "background"
		| "card"
		| "text"
		| "border"
		| "notification";
	useBackground?: boolean;
}

const ThemedIcon = ({
	type,
	name,
	size = 24,
	style,
	theme = "text",
	backgroundTheme = "background",
	useBackground = false,
}: Props) => {
	const { colors } = useTheme();

	return (
		<Icon
			type={type}
			name={name}
			color={colors[theme]}
			size={size}
			style={[
				style,
				useBackground
					? { backgroundColor: colors[backgroundTheme] }
					: {},
			]}
		/>
	);
};

export default ThemedIcon;
