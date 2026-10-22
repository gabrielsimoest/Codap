import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAreas } from "../../services/ContentService";

/**
 * Opções compartilhadas entre o hook e o prefetch do boot (App.tsx) — key e
 * queryFn ficam num lugar só, senão o prefetch popularia uma entrada de cache
 * diferente da que a tela lê.
 *
 * Sem idioma na key (ao contrário de useModulesQuery): nomes de área são
 * termos técnicos, iguais em qualquer idioma, então `GET /areas` não recebe
 * `locale` e o resultado serve para todos.
 */
export const areasQueryOptions = () =>
	queryOptions({
		queryKey: ["areas"],
		queryFn: getAreas,
		staleTime: Infinity,
	});

const useAreasQuery = () => useQuery(areasQueryOptions());

export default useAreasQuery;
