import { useQuery } from "@tanstack/react-query";
import { getModules } from "../../services/ContentService";

/**
 * `areaId` é obrigatório (não aceita `undefined`) de propósito: uma query
 * habilitada condicionalmente ainda registra a entrada no cache, então chamar
 * isto com um id indefinido deixava um `["modules", undefined, <lang>]` órfão
 * para sempre (gcTime é Infinity). Quem ainda não resolveu a área deve
 * renderizar `ModuleListSkeleton` em vez de montar o componente que chama este
 * hook — ver `Classes.tsx`.
 *
 * Ao contrário de `useAreasQuery`, a key inclui o idioma: módulos são
 * traduzidos (`GET /modules?locale=`), áreas não.
 */
const useModulesQuery = (areaId: number, language: string) => {
	return useQuery({
		queryKey: ["modules", areaId, language],
		queryFn: () => getModules(areaId, language),
		staleTime: Infinity,
	});
};

export default useModulesQuery;
