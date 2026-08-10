import { useState } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Icon from "../../components/Icon";
import ScreenJourney from "./components/ScreenJourney";
import ClassHeader from "./components/ClassHeader";
import { Modal, Portal } from "react-native-paper";
import ThemedText from "../../components/themed/ThemedText";
import ThemedView from "../../components/themed/ThemedView";
import ThemedTouchableOpacity from "../../components/themed/ThemedTouchableOpacity";

export default function Class() {
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
		<ThemedView style={styles.container}>
			<TouchableOpacity onPress={() => setVisibleModal(true)}>
				<ClassHeader screenName={journey} iconName={icon} />
			</TouchableOpacity>
			<Portal>
				<Modal
					visible={visibleModal}
					onDismiss={() => setVisibleModal(false)}
					dismissableBackButton
					contentContainerStyle={{
						marginBottom: "auto",
						marginTop: 39,
					}}
					theme={{
						colors: {
							backdrop: "#00000050",
						},
					}}
				>
					<TouchableWithoutFeedback
						onPress={() => setVisibleModal(false)}
						style={{ flex: 1 }}
					>
						<View>
							<ThemedTouchableOpacity
								style={styles.selector}
								onPress={onPressHtml}
								theme="card"
							>
								<Icon
									type={"fontawesome"}
									name="html5"
									size={30}
									color="#637aff"
								/>
								<ThemedText style={styles.actionText}>
									{" "}
									HTML
								</ThemedText>
							</ThemedTouchableOpacity>
							<ThemedTouchableOpacity
								style={styles.selector}
								onPress={onPressCss}
								theme="card"
							>
								<Icon
									type={"fontawesome5"}
									name="css3-alt"
									size={30}
									color="#637aff"
								/>
								<ThemedText style={styles.actionText}>
									{" "}
									CSS
								</ThemedText>
							</ThemedTouchableOpacity>

							<ThemedTouchableOpacity
								style={styles.selector}
								onPress={onPressJavascript}
								theme="card"
							>
								<Icon
									type="ionicon"
									name="logo-javascript"
									size={30}
									color="#637aff"
								/>
								<ThemedText style={styles.actionText}>
									{" "}
									JavaScript
								</ThemedText>
							</ThemedTouchableOpacity>
						</View>
					</TouchableWithoutFeedback>
				</Modal>
			</Portal>
			<View>
				<ScreenJourney screenName={journey} />
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#141f29",
		height: "100%",
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
		marginLeft: 5,
	},
});
