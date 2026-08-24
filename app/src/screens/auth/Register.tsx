import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
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
import AuthButton from "./components/AuthButton";
import ThemedAlert from "../../components/themed/ThemedAlert";
import useNavigate from "../../hooks/useNavigate";
import isValidEmail from "../../utils/isValidEmail";
import CenterView from "../../components/layout/CenterView";
import Images from "../../utils/imageIndexer";
import useRegisterMutation from "../../hooks/queries/useRegisterMutation";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function Register() {
	const theme = useTheme(); //Variavel de cor do tema

	const { t } = useTranslation();

	const navigation = useNavigate();

	const registerMutation = useRegisterMutation();

	const [alertVisible, setAlertVisible] = useState(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertMessage, setAlertMessage] = useState("");
	const [pendingLoginRedirect, setPendingLoginRedirect] = useState(false);
	const [name, setName] = useState("");
	const [senha, setSenha] = useState("");
	const [email, setEmail] = useState("");
	const [passwordMatch, setPasswordMatch] = useState(true);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const setData = () => {
		if (name.length == 0 || senha.length == 0 || email.length == 0) {
			setAlertTitle(t("register.alert.empty.title"));
			setAlertMessage(t("register.alert.empty.message"));
			setAlertVisible(true);
		} else if (!isValidEmail(email)) {
			setAlertTitle(t("register.alert.invalid.title"));
			setAlertMessage(t("register.alert.invalid.message"));
			setAlertVisible(true);
		} else if (senha.length < 8) {
			setAlertTitle(t("register.alert.shortPassword.title"));
			setAlertMessage(t("register.alert.shortPassword.message"));
			setAlertVisible(true);
		} else {
			registerMutation.mutate(
				{ name, email, password: senha },
				{
					onSuccess: () => {
						// Não faz login automático de propósito — o usuário volta para a
						// tela de Login (com o e-mail preenchido) para escolher "lembrar-me".
						setAlertTitle(t("register.alert.success.title"));
						setAlertMessage(t("register.alert.success.message"));
						setPendingLoginRedirect(true);
						setAlertVisible(true);
					},
					onError: (error) => {
						console.error("Erro ao registrar:", error);
						if (axios.isAxiosError(error) && error.response?.status === 409) {
							setAlertTitle(t("register.alert.duplicate.title"));
							setAlertMessage(t("register.alert.duplicate.message"));
						} else if (axios.isAxiosError(error) && !error.response) {
							// Sem resposta nenhuma do servidor = falha de rede/conexão
							// (API fora do ar, URL errada, sem internet), não um dado inválido.
							setAlertTitle(t("register.alert.network.title"));
							setAlertMessage(t("register.alert.network.message"));
						} else if (axios.isAxiosError(error) && error.response?.status === 400) {
							// Validação rejeitada pelo servidor (formato de e-mail mais
							// estrito, nome/senha fora do padrão, etc.) — não presume que o
							// problema é especificamente o e-mail, já que pode ser qualquer campo.
							setAlertTitle(t("register.alert.serverValidation.title"));
							setAlertMessage(t("register.alert.serverValidation.message"));
						} else {
							// Erro inesperado (5xx do servidor, ou uma exceção local — ex.:
							// no cache SQLite do perfil) — não é um problema com os dados digitados.
							setAlertTitle(t("register.alert.unexpected.title"));
							setAlertMessage(t("register.alert.unexpected.message"));
						}
						setAlertVisible(true);
					},
				}
			);
		}
	};

	const onChangePassword = (value: string) => {
		setPassword(value);
	};

	const onChangeConfirmPassword = (value: string) => {
		setConfirmPassword(value);
		if (value != password) {
			setPasswordMatch(false);
		} else {
			setPasswordMatch(true);
			setSenha(value);
		}
	};

	const register = () => {
		if (!passwordMatch) {
			setAlertTitle(t("register.alert.not match.title"));
			setAlertMessage(t("register.alert.not match.message"));
			setAlertVisible(true);
		} else {
			setData();
		}
	};

	const navigationHandler = () => {
		navigation.navigate("Login");
	};

	const onPressAlertHandler = () => {
		setAlertVisible(false);
		if (pendingLoginRedirect) {
			setPendingLoginRedirect(false);
			navigation.navigate("Login", { email });
		}
	};

	return (
		<CenterView
			style={{
				backgroundColor: theme == DarkMode ? "#0b1016" : "#b2b1b1",
			}}
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
								source={Images.icon}
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
									onChangePassword(value)
								}
								secureTextEntry={true}
							/>
							<Text
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
									onChangeConfirmPassword(value)
								}
								secureTextEntry={true}
								value={confirmPassword}
							/>
							<AuthButton
								title={t("register.register")}
								color="#7977FD"
								onPress={register}
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
				<ThemedAlert
					visible={alertVisible}
					onDismiss={onPressAlertHandler}
					title={alertTitle}
					message={alertMessage}
					buttonText="OK"
				/>
			</TouchableWithoutFeedback>
		</CenterView>
	);
}

const styles = StyleSheet.create({
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
	text: {
		color: "white",
		left: "4%",
	},
});
