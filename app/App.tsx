import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import useAuthSession from "./src/hooks/useAuthSession";
import useNetworkSync from "./src/hooks/useNetworkSync";
import MainNavigation from "./src/routes/MainNavigation";
import useThemeStore from "./src/stores/ThemeStore";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import useFontSizeStore from "./src/stores/FontSizeStore";
import useLanguageStore from "./src/stores/LanguageStore";
import useAuthStore from "./src/stores/AuthStore";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-native-paper";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import queryClient from "./src/services/queryClient";
import queryPersister from "./src/services/queryPersister";
import useAlertStore from "./src/stores/AlertStore";
import ThemedAlert from "./src/components/themed/ThemedAlert";
import QueryDevTools from "./src/components/dev/QueryDevTools";
import { LogBox } from "react-native";

//Enquanto não fizer um syntaxHighlight
/* LogBox.ignoreLogs([
	"Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead",
]);
 */
SplashScreen.preventAutoHideAsync();

export default function App() {
	const theme = useCustomTheme();
	const language = useLanguage();
	const fontSize = useFontSize();
	const isLoggedIn = useAuthSession();
	useNetworkSync();

	const setTheme = useThemeStore((s) => s.setTheme);
	const themeStored = useThemeStore((s) => s.theme);
	const setFontSize = useFontSizeStore((s) => s.setFontSize);
	const setLanguage = useLanguageStore((s) => s.setLanguage);
	const setAuthSession = useAuthStore((s) => s.setSession);
	const alertVisible = useAlertStore((S) => S.alertVisible);
	const alertMessage = useAlertStore((S) => S.alertMessage);
	const setAlertVisible = useAlertStore((S) => S.setAlertVisible);

	const isReady =
		theme !== undefined &&
		fontSize !== undefined &&
		language !== undefined &&
		isLoggedIn !== undefined;

	useEffect(() => {
		if (isReady) {
			setTheme(theme);
			setFontSize(fontSize);
			setLanguage(language);
			setAuthSession(isLoggedIn);
			setTimeout(() => SplashScreen.hide(), 100);
		}
	}, [isReady]);

	// Só monta a navegação depois que já sabemos se o usuário está logado —
	// Stack.Navigator só lê `initialRouteName` uma vez, no primeiro mount, e
	// não reage a mudanças posteriores. Montar antes disso (com isLoggedIn
	// ainda no valor padrão da store) trava a rota inicial errada mesmo que
	// a sessão exista no SecureStore. A splash nativa cobre essa espera.
	if (!isReady) {
		return null;
	}

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister: queryPersister }}
		>
			<NavigationContainer theme={themeStored}>
				<Provider>
					<MainNavigation isLoggedIn={isLoggedIn} />
					{alertVisible && (
						<ThemedAlert
							title={alertMessage.title}
							message={alertMessage.message}
							buttonText={alertMessage.buttonText}
							visible={alertVisible}
							onDismiss={() => {
								setAlertVisible(false);
							}}
						/>
					)}
				</Provider>
			</NavigationContainer>
			<QueryDevTools />
		</PersistQueryClientProvider>
	);
}
