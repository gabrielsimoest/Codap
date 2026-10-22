import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
	type ContentAnnouncement,
	getPendingAnnouncements,
	markAnnouncementsSeen,
} from "../services/ContentVersionService";
import useLanguageStore from "../stores/LanguageStore";

interface PendingAnnouncement {
	upToId: number;
	entries: ContentAnnouncement[];
}

/**
 * Aviso de "conteúdo atualizado" da aba de aulas.
 *
 * Lê as notas pendentes **só quando a tela ganha foco** — nunca em reação à
 * sincronização terminar. A atualização do conteúdo roda em segundo plano e
 * pode concluir com a pessoa no meio de uma lição ou rolando a lista; reagir a
 * ela faria o aviso surgir nesses momentos. Lendo no foco, ele aparece ao abrir
 * o app ou ao voltar de uma lição, que são pausas naturais. Se a sincronização
 * terminar com a pessoa já nesta aba, o aviso espera a próxima entrada.
 *
 * As notas já estão guardadas localmente (`refreshPendingAnnouncements`), então
 * abrir o aviso não depende de rede.
 *
 * O aviso **informa, não decide**: fechar não desfaz nada, o conteúdo já foi
 * atualizado de qualquer forma.
 */
const useContentAnnouncement = () => {
	const language = useLanguageStore((state) => state.language);
	const [pending, setPending] = useState<PendingAnnouncement | null>(null);

	useFocusEffect(
		useCallback(() => {
			let active = true;

			getPendingAnnouncements(language)
				.then((found) => {
					if (active && found !== null) {
						setPending(found);
					}
				})
				.catch(() => undefined);

			return () => {
				active = false;
			};
		}, [language])
	);

	const dismiss = useCallback(() => {
		if (pending !== null) {
			markAnnouncementsSeen(language, pending.upToId).catch(
				() => undefined
			);
		}
		setPending(null);
	}, [language, pending]);

	return { announcement: pending, dismiss };
};

export default useContentAnnouncement;
