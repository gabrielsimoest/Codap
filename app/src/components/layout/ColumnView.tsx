import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface Props {
	children: ReactNode;
	justify?:
		| "center"
		| "space-between"
		| "space-around"
		| "space-evenly"
		| "flex-end"
		| "flex-start";
	align?: "center" | "baseline" | "stretch" | "flex-end" | "flex-start";
	style?: StyleProp<ViewStyle>;
	reversed?: boolean;
}

export default function ColumnView({
	children,
	justify = "flex-start",
	align = "flex-start",
	style = {},
	reversed = false,
}: Props) {
	return (
		<View
			style={[
				style,
				{
					display: "flex",
					flexDirection: reversed ? "column-reverse" : "column",
					flex: 1,
					justifyContent: justify,
					alignItems: align,
				},
			]}
		>
			{children}
		</View>
	);
}
