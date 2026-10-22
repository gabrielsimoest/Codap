import { useAppColors } from "../../theme/appColors";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppButton from "../../components/AppButton";
import TextField from "../../components/TextField";
import AuthLayout from "./components/AuthLayout";
import { useTheoryPalette } from "../classes/components/theory/theoryTheme";
import ThemedAlert from "../../components/themed/ThemedAlert";
import useNavigate from "../../hooks/useNavigate";
import isValidEmail from "../../utils/isValidEmail";
import useRegisterMutation from "../../hooks/queries/useRegisterMutation";
import { classifyAccountError } from "../../services/AccountService";

export default function Register() {
	const palette = useTheoryPalette();
	const { t } = useTranslation();
	const app = useAppColors();

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
						const classified = classifyAccountError(error);
						if (classified.kind === "typo") {
							// Domínio com cara de erro de digitação (gmial.com): o servidor
							// manda o e-mail corrigido, e o texto é do idioma do app.
							setAlertTitle(t("register.alert.typo.title"));
							setAlertMessage(
								t("register.alert.typo.message", { email: classified.suggestion })
							);
						} else if (axios.isAxiosError(error) && error.response?.status === 409) {
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
		<>
			<AuthLayout>
				<TextField
					label={t("register.name")}
					autoCapitalize="words"
					autoComplete="name"
					onChangeText={(value) => setName(value)}
				/>
				<TextField
					label="Email"
					autoCapitalize="none"
					keyboardType="email-address"
					autoComplete="email"
					onChangeText={(value) => setEmail(value)}
				/>
				<TextField
					label={t("register.password")}
					autoCapitalize="none"
					revealable
					onChangeText={(value) => onChangePassword(value)}
				/>
				<View>
					<TextField
						label={t("register.confirm password")}
						autoCapitalize="none"
						revealable
						error={!passwordMatch}
						onChangeText={(value) => onChangeConfirmPassword(value)}
						value={confirmPassword}
					/>
					{passwordMatch ? null : (
						<Text style={[styles.error, { color: palette.danger }]}>
							{t("register.invalid password")}
						</Text>
					)}
				</View>
				<AppButton
					title={t("register.register")}
					onPress={register}
					loading={registerMutation.isPending}
				/>
				<TouchableOpacity onPress={navigationHandler} hitSlop={14}>
					<Text style={[styles.login, { color: app.brandText }]}>
						{t("register.login")}
					</Text>
				</TouchableOpacity>
			</AuthLayout>
			<ThemedAlert
				visible={alertVisible}
				onDismiss={onPressAlertHandler}
				title={alertTitle}
				message={alertMessage}
				buttonText="OK"
			/>
		</>
	);
}

const styles = StyleSheet.create({
	login: {
		textAlign: "center",
		fontSize: 16,
		fontWeight: "bold",
	},
	error: {
		marginTop: 6,
		fontSize: 14,
	},
});
