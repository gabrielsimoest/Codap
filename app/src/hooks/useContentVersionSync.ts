import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import {
	getRemoteContentVersion,
	getStoredContentVersion,
	saveStoredContentVersion,
} from "../services/ContentVersionService";
import useLanguageStore from "../stores/LanguageStore";

/**
 * Atualização de conteúdo sob demanda.
 *
 * O catálogo fica em cache por tempo indeterminado (`staleTime`/`gcTime`
 * infinitos, persistido em AsyncStorage). Quem decide que ele envelheceu é a
 * tabela `content_version`: o app pergunta a versão publicada do **seu idioma**,
 * compara com a que já baixou e, se divergir, rebusca.
 *
 * Antes disso, a única forma de invalidar o cache era bumpar o `buster` em
 * `App.tsx` — ou seja, mudar uma lição exigia publicar uma versão do app.
 *
 * Roda no boot, ao recuperar conectividade e ao trocar de idioma. Tudo
 * fire-and-forget: nunca bloqueia a UI, nunca mostra erro, e sem rede
 * simplesmente não faz nada — o usuário continua fazendo aula offline.
 *
 * **Precisa rodar dentro do `PersistQueryClientProvider` e só depois que a
 * restauração terminar** (`useIsRestoring`). Invalidar enquanto o cache
 * persistido ainda está sendo restaurado é uma corrida: os dois escreveriam na
 * mesma entrada em ordem indefinida, e a restauração poderia trazer de volta o
 * conteúdo velho já marcado como fresco. É o mesmo motivo pelo qual o prefetch
 * de áreas em `App.tsx` mora no `onSuccess` do provider.
 */
/**
 * Decide se uma entrada de cache precisa ser rebuscada quando a versão de
 * `language` muda.
 *
 * Só o idioma publicado é afetado — é o ponto de versionar por idioma: um
 * idioma com suporte parcial (espanhol, por exemplo) não deve rebuscar porque o
 * português mudou.
 *
 * As áreas vão junto de qualquer publicação porque a chave `["areas"]` não tem
 * idioma. Não é preguiça: uma área nova pode ter conteúdo só no idioma
 * publicado, e mostrá-la antes disso renderizaria nomes vazios (`?? ''` no
 * backend). Prender as áreas ao idioma ativo é a semântica correta.
 *
 * Exportada para poder ser verificada isoladamente — é a regra mais fácil de
 * quebrar sem ninguém perceber.
 */
export function isStaleForLanguage(
	queryKey: readonly unknown[],
	language: string
): boolean {
	const [entity, , queryLanguage] = queryKey;

	if (entity === "areas") {
		return true;
	}

	return entity === "modules" && queryLanguage === language;
}

const useContentVersionSync = () => {
	const queryClient = useQueryClient();
	const isRestoring = useIsRestoring();
	const language = useLanguageStore((state) => state.language);

	useEffect(() => {
		if (isRestoring) {
			return;
		}

		let cancelled = false;

		const syncContentVersion = async () => {
			const remote = await getRemoteContentVersion(language);
			// Sem rede, ou idioma sem nenhuma versão publicada: não há o que
			// comparar. Mantém o cache.
			if (!remote || cancelled) {
				return;
			}

			const stored = await getStoredContentVersion(language);
			// Compara por DIFERENÇA, não por "maior": cobre rollback e evita
			// comparação semver no cliente ("0.0.10" > "0.0.9" é falso como
			// string).
			if (stored === remote.version || cancelled) {
				return;
			}

			await queryClient.invalidateQueries({
				predicate: (query) =>
					isStaleForLanguage(query.queryKey, language),
			});

			if (cancelled) {
				return;
			}

			// A versão só é gravada DEPOIS do refetch terminar.
			//
			// Gravar antes seria uma falha permanente e silenciosa: se a rede
			// caísse no meio, o app ficaria com versão nova e conteúdo velho, a
			// comparação seguinte daria "igual" e ele nunca mais se corrigiria.
			// Falhando aqui, a versão guardada continua a antiga e o próximo
			// boot tenta de novo.
			await saveStoredContentVersion(language, remote.version);
		};

		// Uma falha em qualquer etapa não pode escapar para o boot do app.
		const run = () => {
			syncContentVersion().catch(() => undefined);
		};

		let wasConnected: boolean | null = null;
		const unsubscribe = NetInfo.addEventListener((state) => {
			const isConnected = Boolean(
				state.isConnected && state.isInternetReachable
			);

			if (isConnected && wasConnected === false) {
				run();
			}

			wasConnected = isConnected;
		});

		run();

		return () => {
			cancelled = true;
			unsubscribe();
		};
	}, [isRestoring, language, queryClient]);
};

export default useContentVersionSync;
