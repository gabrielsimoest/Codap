import { createContext, useCallback, useEffect, type RefObject } from "react";
import { ScrollView, TextInput } from "react-native";

/**
 * Faz o campo focado aparecer dentro de uma rolagem cuja área visível já foi
 * encurtada pelo teclado (ver `useKeyboardHeight`).
 *
 * A rolagem nativa do Android tenta levar o campo focado para a tela **na hora
 * do foco**, antes de o teclado abrir e de a área visível encolher — e erra. Por
 * isso o cálculo é refeito (1) quando o teclado termina de abrir e (2) a cada
 * foco, via `FocusScrollContext`, que o `TextField` aciona.
 *
 * O campo é posicionado `TOP_MARGIN` dp abaixo do topo, o que deixa o rótulo
 * dele visível acima.
 */
const TOP_MARGIN = 96;

/** Quem tem uma rolagem com campos dentro a oferece aqui; o `TextField` a chama ao ganhar foco. */
export const FocusScrollContext = createContext<(() => void) | null>(null);

export default function useFocusScroll(
	scrollRef: RefObject<ScrollView | null>,
	keyboardHeight: number
): () => void {
	const scrollToFocused = useCallback(() => {
		const scroll = scrollRef.current;
		const input = TextInput.State.currentlyFocusedInput?.();
		// `getInnerViewRef` existe em runtime (RN 0.86), mas falta nos tipos do ScrollView.
		const inner = (scroll as unknown as { getInnerViewRef?: () => unknown } | null)?.getInnerViewRef?.();
		if (!scroll || !input || !inner) {
			return;
		}
		// `measureLayout` mede o campo em relação ao conteúdo da rolagem, que é o
		// referencial de `scrollTo`.
		input.measureLayout(
			inner as never,
			(_x: number, y: number) => {
				scroll.scrollTo({ y: Math.max(0, y - TOP_MARGIN), animated: true });
			},
			() => undefined
		);
	}, [scrollRef]);

	// O teclado acabou de abrir (ou mudou de altura): a área visível encolheu.
	useEffect(() => {
		if (keyboardHeight > 0) {
			const timer = setTimeout(scrollToFocused, 60);
			return () => clearTimeout(timer);
		}
	}, [keyboardHeight, scrollToFocused]);

	return scrollToFocused;
}
