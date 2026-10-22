import { useEffect } from "react";
import { AppState } from "react-native";
import { fetchAccountEmail } from "../services/AccountService";
import useAuthStore from "../stores/AuthStore";
import useEmailStatusStore from "../stores/EmailStatusStore";

/**
 * Pergunta ao servidor se o e-mail da conta está confirmado e atualiza a
 * `EmailStatusStore`. Sem rede, nada acontece: o aviso só aparece com a resposta
 * do servidor, nunca por um dado antigo guardado no aparelho.
 *
 * Na primeira resposta "não confirmado" da sessão abre o modal
 * (`autoPrompted`). Chamadas seguintes só atualizam o estado — fechar o app e
 * abrir outra vez, ou entrar de novo, é que mostra o aviso de novo.
 */
export async function refreshEmailStatus(): Promise<void> {
	try {
		const account = await fetchAccountEmail();
		const store = useEmailStatusStore.getState();
		store.setAccount(account);

		if (!account.verified && !store.autoPrompted) {
			store.markAutoPrompted();
			store.openModal("prompt");
		}
	} catch {
		// Offline ou API fora do ar: segue com o que já se sabe.
	}
}

/**
 * Mantém a `EmailStatusStore` em dia. Montado uma vez (`EmailVerification`,
 * dentro dos providers).
 *
 * Pergunta ao entrar (abrir o app logado ou fazer login) e sempre que o app volta
 * ao primeiro plano — é assim que a confirmação feita no navegador chega ao app,
 * que não tem como ser avisado. Ao sair da conta, esquece tudo.
 */
const useEmailStatus = () => {
	const loggedIn = useAuthStore((s) => s.isLoggedIn);

	useEffect(() => {
		if (!loggedIn) {
			useEmailStatusStore.getState().reset();
			return;
		}

		void refreshEmailStatus();
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				void refreshEmailStatus();
			}
		});
		return () => subscription.remove();
	}, [loggedIn]);
};

export default useEmailStatus;
