import { useContext } from "react";
import { StatusBar } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

/**
 * Margens de área segura. Lê o contexto em vez de usar `useSafeAreaInsets`, que
 * lança fora de um `SafeAreaProvider` — e a galeria de atividades abre dentro
 * do `Portal` do Paper, que está fora dos navegadores. Sem provider, cai num
 * valor aproximado: a altura da barra de status no topo e a da barra de gestos
 * embaixo (o Android desenha de ponta a ponta).
 */
export function useInsets() {
	const insets = useContext(SafeAreaInsetsContext);
	return insets ?? { top: StatusBar.currentHeight ?? 0, bottom: 24, left: 0, right: 0 };
}
