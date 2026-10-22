import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface Props {
	children: ReactNode;
	direction?: "column" | "row";
	style?: StyleProp<ViewStyle>;
	useSize?: boolean;
}

export default function CenterView({
	children,
	direction = "column",
	style = {},
	useSize = false,
}: Props) {
	return (
		<View
			style={[
				style,
				{
					display: "flex",
					flexDirection: direction,
					justifyContent: "center",
					alignItems: "center",
				},
				useSize ? {} : { flex: 1 },
			]}
		>
			{children}
		</View>
	);
}
