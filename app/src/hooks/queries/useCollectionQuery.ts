import { useQuery } from "@tanstack/react-query";
import { getCollection } from "../../services/ShopService";

/**
 * A coleção de aulas exclusivas do baú que o usuário já revelou, no idioma
 * atual. A chave leva o usuário (a coleção é de uma conta) e o idioma (as aulas
 * são traduzidas), nessa ordem: a regra de `useContentVersionSync` lê o idioma
 * na terceira posição.
 *
 * `staleTime` infinito e cache persistido, como o catálogo: ela só muda quando
 * uma aula é revelada (a compra invalida a chave) ou quando uma versão de
 * conteúdo nova do idioma sai. Sem conexão, a lista guardada continua valendo.
 */
const useCollectionQuery = (remoteId: string | undefined, language: string) => {
	return useQuery({
		queryKey: ["collection", remoteId ?? "none", language],
		queryFn: () => getCollection(language),
		enabled: remoteId !== undefined,
		staleTime: Infinity,
	});
};

export default useCollectionQuery;
