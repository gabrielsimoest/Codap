import { useAppColors } from "../../theme/appColors";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

import { useTheme, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Switch } from "react-native-paper";

import AppButton from "../../components/AppButton";
import TextField from "../../components/TextField";
import AuthLayout from "./components/AuthLayout";
import useNavigate from "../../hooks/useNavigate";
import isValidEmail from "../../utils/isValidEmail";
import Images from "../../utils/imageIndexer";
import useUserStore from "../../stores/UserStore";
import useAuthStore from "../../stores/AuthStore";
import useAlertStore from "../../stores/AlertStore";
import useLoginMutation from "../../hooks/queries/useLoginMutation";
import type { RootStackParamList } from "../../types/navigation";

export default function Login() {
	const setUser = useUserStore((s) => s.setUser);
	const setAuthSession = useAuthStore((s) => s.setSession);

	const theme = useTheme();
	const { t } = useTranslation();
	const app = useAppColors();
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
		<AuthLayout>
			<TextField
				label="Email"
				autoCapitalize="none"
				keyboardType="email-address"
				autoComplete="email"
				onChangeText={(value) => setEmail(value)}
				value={email}
			/>
			<TextField
				label={t("login.password")}
				autoCapitalize="none"
				revealable
				autoComplete="password"
				onChangeText={(value) => setSenha(value)}
				value={senha}
			/>
			<View style={styles.rememberMeRow}>
				<Switch
					value={rememberMe}
					onValueChange={setRememberMe}
					color={app.action}
				/>
				<Text style={[styles.rememberMeText, { color: theme.colors.text }]}>
					{t("login.rememberMe")}
				</Text>
			</View>
			<AppButton
				title="Login"
				onPress={onSubmit}
				loading={loginMutation.isPending}
			/>
			<Image style={styles.image} source={Images.codyHappy} resizeMode="contain" />
			<TouchableOpacity onPress={navigationHandler} hitSlop={14}>
				<Text style={[styles.register, { color: app.brandText }]}>
					{t("login.register")}
				</Text>
			</TouchableOpacity>
		</AuthLayout>
	);
}

const styles = StyleSheet.create({
	register: {
		textAlign: "center",
		fontSize: 16,
		fontWeight: "bold",
	},
	rememberMeRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	rememberMeText: {
		marginLeft: 8,
		fontSize: 16,
	},
	image: {
		height: 160,
		width: 96,
		alignSelf: "center",
	},
});
