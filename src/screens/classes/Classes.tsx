import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import {
	Modal,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Header from "./components/Header";
import Icon from "../../components/Icon";
import ScreenJourney from "./components/ScreenJourney";

export default function Class() {
	const { colors } = useTheme(); //Variavel de cor do tema

	const [visibleModal, setVisibleModal] = useState(false);
	const [journey, setJourney] = useState("Html");
	const [icon, setIcon] = useState("logo-html5");

	const onPressCss = () => {
		setJourney("Css");
		setVisibleModal(false);
		setIcon("logo-css3");
	};
	const onPressJavascript = () => {
		setJourney("Javascript");
		setVisibleModal(false);
		setIcon("logo-javascript");
	};
	const onPressHtml = () => {
		setJourney("Html");
		setVisibleModal(false);
		setIcon("logo-html5");
	};
	return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<TouchableOpacity onPress={() => setVisibleModal(true)}>
				<Header screenName={journey} iconName={icon} />
			</TouchableOpacity>

			<Modal
				visible={visibleModal}
				transparent={true}
				onRequestClose={() => setVisibleModal(false)}
			>
				<TouchableWithoutFeedback
					onPress={() => setVisibleModal(false)}
					style={{ flex: 1 }}
				>
					<SafeAreaView style={{ height: 1000 }}>
						<View style={styles.selectionList}>
							<TouchableOpacity
								style={[
									styles.selector,
									{ backgroundColor: colors.card },
								]}
								onPress={onPressHtml}
							>
								<Icon
									type={"fontawesome"}
									name="html5"
									size={30}
									color="#637aff"
								/>
								<Text
									style={[
										styles.actionText,
										{ color: colors.text },
									]}
								>
									{" "}
									HTML
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.selector,
									{ backgroundColor: colors.card },
								]}
								onPress={onPressCss}
							>
								<Icon
									type={"fontawesome5"}
									name="css3-alt"
									size={30}
									color="#637aff"
								/>
								<Text
									style={[
										styles.actionText,
										{ color: colors.text },
									]}
								>
									{" "}
									CSS
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.selector,
									{ backgroundColor: colors.card },
								]}
								onPress={onPressJavascript}
							>
								<Icon
									type="ionicon"
									name="logo-javascript"
									size={30}
									color="#637aff"
								/>
								<Text
									style={[
										styles.actionText,
										{ color: colors.text },
									]}
								>
									{" "}
									JavaScript
								</Text>
							</TouchableOpacity>
						</View>
					</SafeAreaView>
				</TouchableWithoutFeedback>
			</Modal>
			<View>
				<ScreenJourney screenName={journey} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#141f29",
		height: "100%",
	},
	selectionList: {
		marginTop: 34,
	},
	selector: {
		zIndex: 99,
		padding: 20,
		borderWidth: 1,
		borderColor: "rgba(0,0,0, 0.2)",
		backgroundColor: "#0E151C",
		shadowColor: "rgba(0,0,0, 0.3)",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		elevation: 5,
		shadowOpacity: 0.28,
		shadowRadius: 4,
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	actionText: {
		fontFamily: "Roboto",
		color: "white",
		textAlign: "center",
		fontSize: 20,
	},
});
