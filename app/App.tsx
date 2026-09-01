import useCustomTheme from "./src/hooks/useCustomTheme";
import useLanguage from "./src/hooks/useLanguage";
import useFontSize from "./src/hooks/useFontSize";
import useAuthSession from "./src/hooks/useAuthSession";
import useNetworkSync from "./src/hooks/useNetworkSync";
import MainNavigation from "./src/routes/MainNavigation";
import useThemeStore from "./src/stores/ThemeStore";
import { useEffect, useMemo } from "react";
import * as SplashScreen from "expo-splash-screen";
import useFontSizeStore from "./src/stores/FontSizeStore";
import useLanguageStore from "./src/stores/LanguageStore";
import useAuthStore from "./src/stores/AuthStore";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-native-paper";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import queryClient from "./src/services/queryClient";
import queryPersister from "./src/services/queryPersister";
import { areasQueryOptions } from "./src/hooks/queries/useAreasQuery";
import useAlertStore from "./src/stores/AlertStore";
import ThemedAlert from "./src/components/themed/ThemedAlert";
import QueryDevTools from "./src/components/dev/QueryDevTools";
import { LogBox } from "react-native";
import * as Linking from "expo-linking";

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
	const authIsLoggedIn = useAuthStore((s) => s.isLoggedIn);
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
			setTimeout(() => SplashScreen.hide(), 100);
		}
	}, [isReady]);

	// Deep linking (teste via ADB e futuros links de e-mail/notificação) —
	// as rotas de Home só entram na config quando logado, então um deep link
	// pra uma tela protegida enquanto deslogado simplesmente não resolve (cai
	// no estado padrão, que já é mostrar Login) em vez de pular a checagem.
	// Usa a AuthStore (reativa, sincronizada por useAuthSession no boot e por
	// login/logout depois disso) em vez do `isLoggedIn` local (congelado no
	// boot, só serve pro initialRouteName do MainNavigation) — senão um
	// logout em runtime nunca reconstruiria essa config e um deep link pra
	// Home continuaria resolvendo mesmo deslogado.
	const linking = useMemo(
		() => ({
			prefixes: [Linking.createURL("/"), "codap://"],
			config: {
				// Garante que Home fique embaixo de uma tela aberta direto por
				// deep link — sem isso, fechar a lição num cold start deixaria
				// a pilha vazia em vez de cair na aba de aulas.
				initialRouteName: "Home" as const,
				screens: authIsLoggedIn
					? {
							Home: {
								path: "home",
								screens: {
									Class: "class",
									Market: "market",
									Account: "account",
									Settings: "settings",
								},
							},
							Lesson: {
								path: "lesson/:areaId/:moduleId/:lessonId",
								// Obrigatório: segmentos de URL chegam como
								// string, e um areaId string montaria a key
								// ["modules", "3", "pt"] — uma entrada de cache
								// diferente de ["modules", 3, "pt"], órfã para
								// sempre (gcTime Infinity) e com uma requisição
								// extra. Mesmo problema que useModulesQuery já
								// evita ao exigir areaId: number.
								parse: {
									areaId: Number,
									moduleId: Number,
									lessonId: Number,
								},
							},
					  }
					: {
							Login: "login", // ?email=... vira route.params.email automaticamente
							Register: "register",
					  },
			},
		}),
		[authIsLoggedIn]
	);

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
			persistOptions={{
				persister: queryPersister,
				// Descarta o cache persistido inteiro quando esta string muda.
				// **Bump obrigatório sempre que o formato da key OU do dado de
				// uma query persistida mudar**: gcTime é Infinity, então uma
				// entrada num formato que não existe mais nunca seria coletada
				// sozinha e ficaria para sempre no AsyncStorage de quem já
				// tinha o app.
				//   2 — áreas deixaram de ter idioma na key (["areas", lang]
				//       -> ["areas"]), porque GET /areas não recebe mais locale.
				//   3 — módulos deixaram de registrar entrada com areaId
				//       indefinido (ver useModulesQuery/ModuleListSkeleton).
				//   4 — GET /modules passou a devolver lessons[].activities[];
				//       uma entrada do formato antigo não tem `activities` e a
				//       lista de lições viria vazia para sempre. Primeiro bump
				//       por mudança de dado, não de key (a key não mudou).
				//   5 — as 2 lições de teste do primeiro módulo de HTML foram
				//       substituídas pelas 8 lições reais do módulo básico
				//       (mesmo formato de dado, conteúdo diferente); sem o
				//       bump, quem já tinha aberto o app ficaria preso para
				//       sempre nas lições antigas.
				//   6 — os primeiros módulos de CSS e JavaScript ganharam
				//       lições reais (antes vinham sem nenhuma); e
				//       TheoryActivityContent ganhou o campo opcional
				//       `additionalCode`, usado pelas novas lições de CSS.
				//       Sem o bump, quem já tinha aberto o app ficaria com
				//       CSS/JavaScript sem lições para sempre.
				//   7 — os segundos módulos (intermediário) de HTML, CSS e
				//       JavaScript ganharam lições reais (antes vinham sem
				//       nenhuma). Mesmo motivo do bump 5/6: mesma key, mesmo
				//       formato, conteúdo novo — sem o bump, quem já tinha
				//       aberto o app ficaria com o módulo 2 vazio para sempre.
				buster: "7",
			}}
			onSuccess={() => {
				// Prefetch do catálogo de áreas no boot, para a tela de aulas
				// já abrir com os dados em mãos em vez de disparar a busca no
				// mount. Feito no onSuccess do provider (roda depois que o
				// cache persistido termina de restaurar) e não num useEffect:
				// prefetchar antes da restauração deixaria os dois escrevendo
				// na mesma entrada de cache em ordem indefinida.
				//
				// Fire-and-forget de propósito — o retorno não é devolvido
				// para o provider não esperar a rede antes de liberar o
				// `isRestoring`. E, com staleTime infinito, isso vira no-op
				// quando as áreas já vieram do cache: só busca de fato na
				// primeira instalação.
				void queryClient.prefetchQuery(areasQueryOptions());
			}}
		>
			<NavigationContainer theme={themeStored} linking={linking}>
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
