import EmailVerificationModal from "./EmailVerificationModal";
import useEmailStatus from "../hooks/useEmailStatus";
import useAuthStore from "../stores/AuthStore";

/**
 * Liga o acompanhamento do e-mail da conta (`useEmailStatus`) e monta o modal de
 * confirmação, uma única vez para o app inteiro. O Perfil e a tela de senha só
 * pedem para abri-lo pela `EmailStatusStore`. Fica dentro do `Provider` do Paper
 * porque o modal usa `Portal`.
 */
export default function EmailVerification() {
	useEmailStatus();
	const loggedIn = useAuthStore((s) => s.isLoggedIn);

	return loggedIn ? <EmailVerificationModal /> : null;
}
