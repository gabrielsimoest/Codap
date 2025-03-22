import { useTheme } from "@react-navigation/native";
import {
	DimensionValue,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import DarkMode from "../../../theme/DarkMode";
import RowView from "../../../components/layout/RowView";
import useNavigate from "../../../hooks/useNavigate";
import Icon from "../../../components/Icon";

export function Progressbar({ progress }: { progress: DimensionValue }) {
	const theme = useTheme();

	return (
		<View
			style={{
				backgroundColor: theme == DarkMode ? "#273f55" : "#c1c1c1",
				top: -2,
				height: 8,
				width: "100%",
			}}
		>
			<View
				style={[
					StyleSheet.absoluteFill,
					{ backgroundColor: "#637aff", width: progress },
				]}
			/>
		</View>
	);
}

export function LessonHeader({
	setTutorialVisible,
}: {
	setTutorialVisible: () => void;
}) {
	const navigation = useNavigate();

	return (
		<RowView>
			<TouchableOpacity
				onPress={() => navigation.navigate("Home")}
				style={{ width: 60 }}
			>
				<Icon
					type="ionicon"
					name="close-outline"
					color={"#33526E"}
					size={60}
				/>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={setTutorialVisible}
				style={{ width: 50, top: 8, marginLeft: "72%" }}
			>
				<Icon
					type="ionicon"
					name="help-circle-outline"
					color={"#33526E"}
					size={45}
				/>
			</TouchableOpacity>
		</RowView>
	);
}
