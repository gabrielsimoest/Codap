import { ReactNode } from "react";
import { View } from "react-native";

interface Props {
	children: ReactNode;
	direction: "column" | "row";
}

export default function ColumnView({ children, direction }: Props) {
	return (
		<View
			style={{
				display: "flex",
				flexDirection: direction,
				height: "auto",
				width: "auto",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{children}
		</View>
	);
}
