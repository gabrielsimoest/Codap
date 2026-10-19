import { create } from "zustand";
import type { ShopStateResponse } from "codap-api/src/types/contracts";

type Patch = Partial<
	Pick<ShopStateResponse, "bits" | "instantHints" | "doubleXpEndsAt">
>;

interface ShopStorage {
	/** De quem é o estado: uma conta nova no mesmo aparelho nunca herda o da anterior. */
	userId: string | null;
	state: ShopStateResponse | null;
	setState: (userId: string, state: ShopStateResponse) => void;
	/** Atualiza só saldo/estoque/janela (o que uma compra ou o uso de uma dica muda). Sem estado carregado, não faz nada. */
	patch: (patch: Patch) => void;
	reset: () => void;
}

/** O estado da loja em memória: vem de `GET /shop`, que a tela da loja e o desafio recarregam. */
const useShopStore = create<ShopStorage>((set) => ({
	userId: null,
	state: null,
	setState: (userId, state) => set({ userId, state }),
	patch: (patch) =>
		set((current) =>
			current.state ? { state: { ...current.state, ...patch } } : current
		),
	reset: () => set({ userId: null, state: null }),
}));

export default useShopStore;
