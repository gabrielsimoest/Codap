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
	useSize?: boolean;
}

export default function RowView({
	children,
	justify = "flex-start",
	align = "flex-start",
	style = {},
	reversed = false,
	useSize = false,
}: Props) {
	return (
		<View
			style={[
				style,
				{
					display: "flex",
					flexDirection: reversed ? "row-reverse" : "row",
					justifyContent: justify,
					alignItems: align,
				},
				useSize ? {} : { flex: 1 },
			]}
		>
			{children}
		</View>
	);
}
