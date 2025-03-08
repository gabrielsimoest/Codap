import { useTheme } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Dimensions,
	Image,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import DarkMode from "../../theme/DarkMode";
import AuthButton from "../../components/AuthButton";
import ThemedAlert from "../../components/themed/ThemedAlert";
import useNavigate from "../../hooks/useNavigate";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function Register() {
	const theme = useTheme(); //Variavel de cor do tema

	const { t, i18n } = useTranslation();

	const navigation = useNavigate();

	const [name, setName] = useState("");
	const [senha, setSenha] = useState("");
	const [email, setEmail] = useState("");
	const [passwordMatch, setPasswordMatch] = useState(true);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const navigationHandler = () => {
		navigation.navigate("Login");
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
								autoCapitalize="words"
								style={[
									styles.input,
									{
										backgroundColor:
											theme.colors.background,
										color: theme.colors.text,
									},
								]}
								placeholder={t("register.name")}
								placeholderTextColor={"#7977FD"}
								onChangeText={(value) => setName(value)}
							/>
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
							/>
							{
								<Text
									/* defaultSize={20} */ style={styles.text}
								>
									Senha
								</Text>
							}
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
								placeholder={t("register.password")}
								placeholderTextColor={"#7977FD"}
								onChangeText={(value) =>
									/* onChangePassword(value) */
									console.log("oi")
								}
								secureTextEntry={true}
							/>
							<Text
								/* defaultSize={20} */
								style={[
									styles.text,
									{
										color: passwordMatch
											? theme.colors.text
											: "red",
									},
								]}
							>
								{t("register.confirm password")}
							</Text>
							<TextInput
								autoCapitalize="none"
								style={[
									styles.input,
									{
										backgroundColor:
											theme.colors.background,
										borderColor: passwordMatch
											? "#7977FD"
											: "red",
										color: passwordMatch
											? theme.colors.text
											: "red",
									},
								]}
								placeholder={
									passwordMatch
										? t("register.password")
										: t("register.invalid password")
								}
								placeholderTextColor={
									passwordMatch ? "#7977FD" : "red"
								}
								onChangeText={(value) =>
									/* onChangeConfirmPassword(value) */
									console.log("oi")
								}
								secureTextEntry={true}
								value={confirmPassword}
							/>
							<AuthButton
								title={t("register.register")}
								color="#7977FD"
								onPress={/* register */ () => console.log("oi")}
							/>
							{/* <Image style={styles.image} source={require('../../assets/Robo_feliz_centralizado.png')} /> */}
							<TouchableOpacity
								onPress={navigationHandler}
								style={{ alignItems: "center" }}
							>
								<Text
									style={[
										styles.register,
										{ color: theme.colors.text },
									]}
								>
									{t("register.login")}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				{/* <ThemedAlert
					visible={alertVisible}
					onDismiss={onPressAlertHandler}
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
		marginTop: 30,
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
	inputError: {
		borderColor: "red",
		backgroundColor: "#141f29",
		borderRadius: 10,
		height: 50,
		color: "red",
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
	text: {
		color: "white",
		left: "4%",
	},
});
