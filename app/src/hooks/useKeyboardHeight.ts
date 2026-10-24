import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Altura do teclado em dp (0 com ele fechado).
 *
 * Existe porque o app roda de ponta a ponta no Android e a janela **não
 * redimensiona** com o teclado: sem isto, ele cobre o que está embaixo (o campo
 * "Confirmar senha" do cadastro, o campo de um modal). Quem usa reserva este
 * espaço no fim da área rolável, e o conteúdo sobe junto — em vez de ser
 * espremido para caber, como acontece quando a janela encolhe.
 */
export default function useKeyboardHeight(): number {
	const [height, setHeight] = useState(0);

	useEffect(() => {
		const showEvent = Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
		const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const show = Keyboard.addListener(showEvent, (event) => {
			setHeight(event.endCoordinates.height);
		});
		const hide = Keyboard.addListener(hideEvent, () => {
			setHeight(0);
		});

		return () => {
			show.remove();
			hide.remove();
		};
	}, []);

	return height;
}
