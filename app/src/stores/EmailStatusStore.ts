import { create } from "zustand";
import type { AccountEmail } from "../services/AccountService";

/**
 * Por que o modal de confirmação está aberto: `prompt` é o aviso da abertura do
 * app (ou do botão do Perfil); `passwordChange` é a pessoa que tentou alterar a
 * senha sem ter confirmado o e-mail.
 */
export type EmailModalReason = "prompt" | "passwordChange";

interface EmailStatusStorage {
	/** E-mail da conta segundo o servidor, ou `null` enquanto não se sabe. */
	email: string | null;
	/** `null` = ainda não sabemos (sem rede desde que entrou). Nunca vem do cache local. */
	verified: boolean | null;
	modalOpen: boolean;
	modalReason: EmailModalReason;
	/**
	 * O aviso automático já apareceu nesta sessão? Fica só em memória de propósito:
	 * uma nova abertura do app (ou um novo login) mostra de novo, como combinado.
	 */
	autoPrompted: boolean;
	setAccount: (account: AccountEmail) => void;
	openModal: (reason?: EmailModalReason) => void;
	closeModal: () => void;
	markAutoPrompted: () => void;
	reset: () => void;
}

const INITIAL = {
	email: null,
	verified: null,
	modalOpen: false,
	modalReason: "prompt" as EmailModalReason,
	autoPrompted: false,
};

/**
 * Estado do e-mail da conta logada. Fonte única para o aviso da abertura, a
 * linha do Perfil e a decisão de "Alterar senha": quem confirma é o servidor,
 * então nada aqui é gravado no aparelho.
 */
const useEmailStatusStore = create<EmailStatusStorage>((set) => ({
	...INITIAL,
	setAccount: ({ email, verified }) => set(() => ({ email, verified })),
	openModal: (reason = "prompt") =>
		set(() => ({ modalOpen: true, modalReason: reason })),
	closeModal: () => set(() => ({ modalOpen: false })),
	markAutoPrompted: () => set(() => ({ autoPrompted: true })),
	reset: () => set(() => ({ ...INITIAL })),
}));

export default useEmailStatusStore;
