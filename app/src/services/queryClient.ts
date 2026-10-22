import { QueryClient } from "@tanstack/react-query";

// networkMode: "always" em todas as mutations — a detecção de conectividade
// e o retry já são responsabilidade do par NetInfo + SyncQueue (useNetworkSync/
// SyncService); deixar o React Query pausar/retentar por conta própria
// duplicaria essa lógica e poderia divergir dela.
// gcTime: Infinity nas queries — cache persistente por tempo indeterminado
// (ver queryPersister.ts), sincronizado sob demanda em vez de expirar sozinho.
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: Infinity,
		},
		mutations: {
			networkMode: "always",
			retry: false,
		},
	},
});

export default queryClient;
