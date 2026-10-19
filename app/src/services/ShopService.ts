import { apiClient } from "./ApiClient";
import type {
	CollectionResponse,
	PurchaseResponse,
	ShopItem,
	ShopStateResponse,
	UseHintResponse,
} from "codap-api/src/types/contracts";

/*
 * Toda operação da loja exige internet e é validada no servidor (spec
 * 2026-10-19-loja-e-bau-design.md): nada aqui tem fila offline. Quem chama
 * trata a falha de rede — ver `ShopActions`.
 */

/** Preços (definidos no servidor), saldo, estoque de dicas, janela de Dobro de XP e as contagens do baú. */
export async function getShop(): Promise<ShopStateResponse> {
	const { data } = await apiClient.get<ShopStateResponse>("/shop");
	return data;
}

/** `locale` só importa para o baú: é o idioma do nome da aula revelada. */
export async function purchase(
	item: ShopItem,
	locale?: string
): Promise<PurchaseResponse> {
	const { data } = await apiClient.post<PurchaseResponse>("/shop/purchase", {
		item,
		...(locale ? { locale } : {}),
	});
	return data;
}

export async function spendInstantHint(): Promise<UseHintResponse> {
	const { data } = await apiClient.post<UseHintResponse>("/shop/use-hint");
	return data;
}

/** As aulas exclusivas do baú que o usuário já revelou (a coleção), no idioma pedido. */
export async function getCollection(language: string): Promise<CollectionResponse> {
	const { data } = await apiClient.get<CollectionResponse>("/collection", {
		params: { locale: language },
	});
	return data;
}
