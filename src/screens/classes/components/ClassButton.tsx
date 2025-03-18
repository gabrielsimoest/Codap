import { StyleSheet } from "react-native";
import ResizableText from "../../../components/ResizableText";
import ThemedTouchableOpacity from "../../../components/themed/ThemedTouchableOpacity";
import RowView from "../../../components/layout/RowView";
import Icon from "../../../components/Icon";
import useThemeStore from "../../../stores/ThemeStore";
import LightMode from "../../../theme/LightMode";

interface Props {
	title: string;
	onPress: () => void;
	checked?: boolean;
}

export default function ClassButton({
	title,
	onPress,
	checked = false,
}: Props) {
	const theme = useThemeStore((s) => s.theme);

	const color = checked
		? "#637aff"
		: theme === LightMode
		? "#c1c1c1"
		: "#233648";

	return (
		<RowView
			useSize
			align="center"
			justify={"space-evenly"}
			style={{ marginBottom: 15 }}
		>
			<Icon
				type="ionicon"
				name="checkmark-circle-outline"
				color={color}
				size={30}
			/>
			<ThemedTouchableOpacity
				theme="primary"
				style={styles.button}
				onPress={onPress}
			>
				<ResizableText style={[styles.text]} defaultSize={20}>
					{title}
				</ResizableText>
			</ThemedTouchableOpacity>
		</RowView>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 63,
		width: "75%",
		borderRadius: 10,
		elevation: 2,
	},
	text: {
		fontFamily: "Roboto",
	},
});
