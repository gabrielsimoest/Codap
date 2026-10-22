import type { TFunction } from "i18next";
import type { AccountError } from "../services/AccountService";

/** Os erros de conta mais o "mesmo e-mail", que a tela decide sozinha antes de chamar o servidor. */
export type FormError =
	| AccountError
	| { kind: "same"; suggestion?: undefined };

/**
 * Texto de cada causa de falha das chamadas de conta, no idioma do app. Quem
 * chama trata `forbidden` (o sentido dele depende da chamada); o que sobrar aqui
 * cai na mensagem genérica.
 */
export function accountErrorMessage(t: TFunction, error: FormError): string {
	switch (error.kind) {
		case "offline":
			return t("accountErrors.offline");
		case "rate":
			return t("accountErrors.rate");
		case "unavailable":
			return t("accountErrors.unavailable");
		case "taken":
			return t("accountErrors.taken");
		case "invalid":
			return t("accountErrors.invalid");
		case "same":
			return t("accountErrors.same");
		case "typo":
			return t("accountErrors.typo", { email: error.suggestion });
		default:
			return t("accountErrors.unexpected");
	}
}
