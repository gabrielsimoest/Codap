import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface Props {
	children: ReactNode;
	direction?: "column" | "row";
	style?: StyleProp<ViewStyle>;
}

export default function CenterView({
	children,
	direction = "column",
	style = {},
}: Props) {
	return (
		<View
			style={[
				style,
				{
					display: "flex",
					flexDirection: direction,
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				},
			]}
		>
			{children}
		</View>
	);
}
