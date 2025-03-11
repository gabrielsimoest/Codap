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
}

export default function RowView({
	children,
	justify = "flex-start",
	align = "flex-start",
	style = {},
}: Props) {
	return (
		<View
			style={[
				style,
				{
					display: "flex",
					flexDirection: "row",
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
