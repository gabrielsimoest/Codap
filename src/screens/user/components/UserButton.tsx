import {
	StyleProp,
	StyleSheet,
	TextStyle,
	TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import ResizableText from "../../../components/ResizableText";
import { ReactNode } from "react";
import RowView from "../../../components/layout/RowView";

interface Props {
	title: string;
	onPress: () => void;
	textStyle?: StyleProp<TextStyle>;
	icon?: ReactNode;
}

export default function UserButton({ title, onPress, textStyle, icon }: Props) {
	const { colors } = useTheme();

	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor: colors.background }]}
			onPress={onPress}
		>
			<RowView justify="center" align="center">
				{icon !== undefined ? icon : null}
				<ResizableText
					useCustomColor={textStyle !== undefined}
					style={[styles.text, textStyle]}
					defaultSize={20}
				>
					{title}
				</ResizableText>
			</RowView>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 80,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 10,
		marginBottom: 15,
		borderRadius: 20,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 3,
	},
	text: {
		fontFamily: "Roboto",
	},
});
