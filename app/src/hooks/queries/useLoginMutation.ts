import { useMutation } from "@tanstack/react-query";
import { login } from "../../services/AuthService";
import { flushQueue } from "../../services/SyncService";
import type { LoginBody } from "codap-api/src/types/contracts";

const useLoginMutation = () => {
	return useMutation({
		mutationFn: (body: LoginBody) => login(body),
		// Drena qualquer SyncQueue que já existisse localmente para essa conta
		// (ex.: outro usuário já usou esse aparelho antes) — useNetworkSync só
		// dispara no boot/reconexão, não a cada login dentro do app já aberto.
		onSuccess: () => {
			flushQueue();
		},
	});
};

export default useLoginMutation;
