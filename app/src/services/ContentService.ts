import { apiClient } from "./ApiClient";
import type { AreaResponse, ModuleResponse } from "codap-api/src/types/contracts";

// Sem `locale`: nomes de área são termos técnicos (HTML, CSS, JavaScript),
// iguais em qualquer idioma — só módulos/lições são traduzidos.
export async function getAreas(): Promise<AreaResponse[]> {
	const { data } = await apiClient.get<AreaResponse[]>("/areas");
	return data;
}

export async function getModules(
	areaId: number,
	locale: string
): Promise<ModuleResponse[]> {
	const { data } = await apiClient.get<ModuleResponse[]>("/modules", {
		params: { areaId, locale },
	});
	return data;
}
