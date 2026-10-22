import useAlertStore from "../stores/AlertStore";

/**
 * Mostra o alerta global (`ThemedAlert`, montado uma vez em `App.tsx`). Fora de
 * um componente também funciona: usa o `getState` da store, não um hook.
 */
export function showAlert(title: string, message: string): void {
	const { setAlertMessage, setAlertVisible } = useAlertStore.getState();
	setAlertMessage({ title, message, buttonText: "ok" });
	setAlertVisible(true);
}
