import useContentVersionSync from "../hooks/useContentVersionSync";

/**
 * Componente sem UI, só para rodar `useContentVersionSync` **dentro** do
 * `PersistQueryClientProvider`.
 *
 * Os demais hooks de boot (`useNetworkSync` etc.) são chamados direto no corpo
 * de `App`, que fica fora do provider — ali `useQueryClient`/`useIsRestoring`
 * não existem. Daí este invólucro, montado junto com a navegação.
 */
function ContentVersionSync() {
	useContentVersionSync();
	return null;
}

export default ContentVersionSync;
