import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TextInput,
	TouchableOpacity,
	Keyboard,
	Dimensions,
	Button,
} from "react-native";

import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import DarkMode from "../../theme/DarkMode";
import AuthButton from "../../components/AuthButton";
import ThemedAlert from "../../components/themed/ThemedAlert";
import useNavigate from "../../hooks/useNavigate";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function Login() {
	const theme = useTheme();
	const { t } = useTranslation();

	const navigation = useNavigate();

	const [senha, setSenha] = useState("");
	const [email, setEmail] = useState("");

	const onSubmit = () => {
		console.log("oi");
	};

	const navigationHandler = () => {
		navigation.navigate("Register");
	};

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: theme == DarkMode ? "#0b1016" : "#b2b1b1" },
			]}
		>
			<TouchableWithoutFeedback
				onPress={Keyboard.dismiss}
				accessible={false}
			>
				<View style={styles.shade}>
					<View
						style={[
							styles.box,
							,
							{
								backgroundColor:
									theme == DarkMode ? "#141f29" : "#f2f2f2",
							},
						]}
					>
						<View style={styles.header}>
							<Image
								style={styles.tinyLogo}
								source={require("../../../assets/code.png")}
							/>
							<Text style={styles.title}>Codap</Text>
						</View>
						<View>
							<TextInput
								autoCapitalize="none"
								keyboardType="email-address"
								style={[
									styles.input,
									{
										backgroundColor:
											theme.colors.background,
										color: theme.colors.text,
									},
								]}
								placeholder="Email"
								placeholderTextColor={"#7977FD"}
								onChangeText={(value) => setEmail(value)}
								value={email}
							/>
							<TextInput
								autoCapitalize="none"
								style={[
									styles.input,
									{
										backgroundColor:
											theme.colors.background,
										color: theme.colors.text,
									},
								]}
								placeholder={t("login.password")}
								placeholderTextColor={"#7977FD"}
								onChangeText={(value) => setSenha(value)}
								secureTextEntry={true}
								value={senha}
							/>
							<AuthButton
								title="Login"
								color="#7977FD"
								onPress={onSubmit}
							/>
							<Image
								style={styles.image}
								source={require("../../../assets/Robo_feliz.png")}
							/>
							<TouchableOpacity onPress={navigationHandler}>
								<Text
									style={[
										styles.register,
										{ color: theme.colors.text },
									]}
								>
									{t("login.register")}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				{/*                 <ThemedAlert
                    visible={alertVisible}
                    onDismiss={() => setAlertVisible(false)}
                    title={alertTitle}
                    message={alertMessage}
                    buttonText="OK"
                /> */}
			</TouchableWithoutFeedback>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0b1016",
		alignItems: "center",
		justifyContent: "center",
	},
	register: {
		color: "white",
		textAlign: "center",
		marginTop: 10,
		fontSize: 17,
	},
	button: {
		marginLeft: 50,
		alignItems: "center",
		marginTop: 30,
		width: 170,
		backgroundColor: "#7977FD",
		padding: 10,
		borderRadius: 5,
	},
	buttonText: {
		fontSize: 15,
		color: "#fff",
	},
	input: {
		borderColor: "#7977FD",
		backgroundColor: "#141f29",
		borderRadius: 10,
		height: 50,
		color: "#fff",
		width: 300,
		margin: 12,
		borderWidth: 1.5,
		padding: 10,
		fontSize: 20,
	},
	header: {
		marginTop: 20,
		marginBottom: 30,
		flexWrap: "wrap",
		alignItems: "flex-start",
		flexDirection: "row",
	},
	tinyLogo: {
		width: 70,
		height: 70,
	},
	title: {
		marginLeft: 10,
		marginTop: 3,
		fontSize: 50,
		fontWeight: "bold",
		color: "#7977FD",
	},
	box: {
		backgroundColor: "#141f29",
		borderRadius: 25,
		height: windowHeight * 0.945, //710
		width: windowWidth * 0.942, //370
		alignItems: "center",
		justifyContent: "center",
		elevation: 2,
	},
	shade: {
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 25,
		height: windowHeight * 0.95, //713
		width: windowWidth * 0.95, //373
	},
	image: {
		height: 250,
		width: 150,
		left: 80,
	},
});
