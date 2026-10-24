import { useCallback, useMemo } from "react";
import { Linking } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import {
	APP_DOWNLOAD_URL,
	findPendingUpdate,
	getInstalledVersion,
	markAppVersionSeen,
	type PendingAppUpdate,
} from "../services/AppVersionService";
import useAppUpdateStore from "../stores/AppUpdateStore";

/**
 * Aviso de nova versão do app, na aba de aulas (junto do de "conteúdo atualizado").
 *
 * **Informa, não impõe.** Nunca bloqueia o uso, e quem decide atualizar é a
 * pessoa. Só a ênfase muda:
 *
 * - versão recomendada (`needUpdate` falso): aparece **uma vez** por versão — se
 *   dispensar, não volta até sair outra;
 * - versão importante (`needUpdate` verdadeiro: traz algo sem o qual o app pode
 *   não funcionar direito): aparece **a cada abertura** do app até atualizar,
 *   mas uma vez por abertura, e é igualmente dispensável.
 *
 * Só aparece com a aba em foco (`useIsFocused`): uma lição aberta por cima a
 * esconde, então a atualização do histórico em segundo plano nunca interrompe
 * ninguém no meio de uma aula.
 */
const useAppUpdateNotice = () => {
	const focused = useIsFocused();
	const history = useAppUpdateStore((state) => state.history);
	const seenVersion = useAppUpdateStore((state) => state.seenVersion);
	const dismissedThisSession = useAppUpdateStore((state) => state.dismissedThisSession);

	const pending: PendingAppUpdate | null = useMemo(
		() => findPendingUpdate(history, getInstalledVersion()),
		[history]
	);

	const visible =
		focused &&
		pending !== null &&
		!dismissedThisSession &&
		(pending.important || seenVersion !== pending.latest.version);

	const dismiss = useCallback(() => {
		const store = useAppUpdateStore.getState();
		store.dismissForSession();
		if (pending !== null && !pending.important) {
			store.setSeenVersion(pending.latest.version);
			void markAppVersionSeen(pending.latest.version);
		}
	}, [pending]);

	const openDownload = useCallback(() => {
		void Linking.openURL(APP_DOWNLOAD_URL).catch(() => undefined);
		dismiss();
	}, [dismiss]);

	return { notice: visible ? pending : null, dismiss, openDownload };
};

export default useAppUpdateNotice;
