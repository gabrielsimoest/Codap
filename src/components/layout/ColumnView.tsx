import { ReactNode } from "react";
import { View } from "react-native";

interface Props {
	children: ReactNode;
	justify:
		| "center"
		| "space-between"
		| "space-around"
		| "space-evenly"
		| "flex-end"
		| "flex-start";
	align: "center" | "baseline" | "stretch" | "flex-end" | "flex-start";
}

export default function ColumnView({ children, justify, align }: Props) {
	return (
		<View
			style={{
				display: "flex",
				flexDirection: "column",
				flex: 1,
				justifyContent: justify,
				alignItems: align,
			}}
		>
			{children}
		</View>
	);
}
