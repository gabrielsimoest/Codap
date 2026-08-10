import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";

const NotificationSwitcher = () => {
	const theme = useTheme();
	const { t } = useTranslation();
	const [isSwitchOn, setIsSwitchOn] = useState(false);

	return (
		<TouchableOpacity
			style={[
				styles.button,
				{ backgroundColor: theme.colors.background },
			]}
			onPress={() => setIsSwitchOn(!isSwitchOn)}
		>
			<RowView align="center" justify="space-between">
				<ResizableText defaultSize={20}>
					{t("notifications")}
				</ResizableText>
				<Switch
					style={{ marginTop: 5 }}
					value={isSwitchOn}
					color={"#5469D3"}
					onChange={() => console.log("Notification")}
				/>
			</RowView>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 60,
		padding: 10,
		marginLeft: 5,
		marginRight: 5,
		marginTop: 10,
		marginBottom: 15,
		borderRadius: 10,
		shadowColor: "#637aff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.28,
		shadowRadius: 7.0,
		elevation: 2,
	},
});

export default NotificationSwitcher;
