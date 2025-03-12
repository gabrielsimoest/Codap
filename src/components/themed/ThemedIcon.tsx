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
}

const ThemedIcon = ({
	type,
	name,
	size = 24,
	style,
	theme = "text",
}: Props) => {
	const { colors } = useTheme();

	return (
		<Icon
			type={type}
			name={name}
			color={colors[theme]}
			size={size}
			style={style}
		/>
	);
};

export default ThemedIcon;
