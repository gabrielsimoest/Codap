import React, { useEffect, useState } from "react";
import axios from "axios";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	Dimensions,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";

import { useTheme, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";

import DarkMode from "../../theme/DarkMode";
import AuthButton from "./components/AuthButton";
import useNavigate from "../../hooks/useNavigate";
import isValidEmail from "../../utils/isValidEmail";
import Images from "../../utils/imageIndexer";
import useUserStore from "../../stores/UserStore";
import useAuthStore from "../../stores/AuthStore";
import useAlertStore from "../../stores/AlertStore";
import useLoginMutation from "../../hooks/queries/useLoginMutation";
import type { RootStackParamList } from "../../types/navigation";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function Login() {
	const setUser = useUserStore((s) => s.setUser);
	const setAuthSession = useAuthStore((s) => s.setSession);

	const theme = useTheme();
	const { t } = useTranslation();
	const route = useRoute<RouteProp<RootStackParamList, "Login">>();

	const navigation = useNavigate();

	const [senha, setSenha] = useState("");
	const [email, setEmail] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	useEffect(() => {
		// Preenche o e-mail quando chega aqui vindo do registro (navigation.navigate("Login", { email })).
		const routeEmail = route.params?.email;
		if (routeEmail) {
			setEmail(routeEmail);
		}
	}, [route.params]);

	const loginMutation = useLoginMutation();

	const setAlertMessage = useAlertStore((s) => s.setAlertMessage);
	const setAlertVisible = useAlertStore((s) => s.setAlertVisible);

	const showAlert = (title: string, message: string) => {
		setAlertMessage({
			title: title,
			message: message,
			buttonText: "ok",
		});
		setAlertVisible(true);
	};

	const onSubmit = () => {
		if (email.length == 0 || senha.length == 0 || !isValidEmail(email)) {
			showAlert(
				t("login.alert.invalid.title"),
				t("login.alert.invalid.message")
			);
			return;
		}

		loginMutation.mutate(
			{ email, password: senha, rememberMe },
			{
				onSuccess: (user) => {
					setUser(user);
					setAuthSession(true);
					navigation.navigate("Home");
				},
				onError: (error) => {
					console.error("Erro ao fazer login:", error);
					if (axios.isAxiosError(error) && !error.response) {
						// Sem resposta nenhuma do servidor = falha de rede/conexão
						// (API fora do ar, URL errada, sem internet), não credenciais erradas.
						showAlert(
							t("login.alert.network.title"),
							t("login.alert.network.message")
						);
					} else if (
						axios.isAxiosError(error) &&
						error.response?.status === 401
					) {
						showAlert(
							t("login.alert.invalid.title"),
							t("login.alert.invalid.message")
						);
					} else {
						// Erro inesperado (5xx do servidor, ou uma exceção local — ex.:
						// no cache SQLite do perfil) — não são credenciais erradas.
						showAlert(
							t("login.alert.unexpected.title"),
							t("login.alert.unexpected.message")
						);
					}
				},
			}
		);
	};

	const navigationHandler = () => {
		navigation.navigate("Register");
	};

	return (
		<View
			style={[
				styles.outerContainer,
				{
					backgroundColor: theme == DarkMode ? "#0b1016" : "#b2b1b1",
				},
			]}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.keyboardAvoiding}
			>
				<TouchableWithoutFeedback
					onPress={Keyboard.dismiss}
					accessible={false}
				>
					<View style={styles.shade}>
					<View
						style={[
							styles.box,
							{
								backgroundColor:
									theme == DarkMode ? "#141f29" : "#f2f2f2",
							},
						]}
					>
						<ScrollView
							style={styles.boxScroll}
							contentContainerStyle={styles.boxContent}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
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
							<View style={styles.rememberMeRow}>
								<Switch
									value={rememberMe}
									onValueChange={setRememberMe}
									color="#7977FD"
								/>
								<Text
									style={[
										styles.rememberMeText,
										{ color: theme.colors.text },
									]}
								>
									{t("login.rememberMe")}
								</Text>
							</View>
							<AuthButton
								title="Login"
								color="#7977FD"
								onPress={onSubmit}
							/>
							<Image
								style={styles.image}
								source={Images.codyHappy}
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
						</ScrollView>
					</View>
				</View>
			</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
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
	rememberMeRow: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 12,
	},
	rememberMeText: {
		marginLeft: 8,
		fontSize: 16,
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
		maxHeight: windowHeight * 0.945, //710
		width: windowWidth * 0.942, //370
		elevation: 2,
		overflow: "hidden",
		flex: 1,
	},
	boxScroll: {
		flex: 1,
		width: "100%",
	},
	boxContent: {
		flexGrow: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 20,
	},
	outerContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		paddingTop: windowHeight * 0.025,
	},
	keyboardAvoiding: {
		width: "100%",
		alignItems: "center",
		flex: 1,
	},
	shade: {
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 25,
		maxHeight: windowHeight * 0.95, //713
		width: windowWidth * 0.95, //373
		flex: 1,
	},
	image: {
		height: 250,
		width: 150,
		left: 80,
	},
});
