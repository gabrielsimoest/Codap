import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/**
 * Persister do cache do React Query — sobrevive a um kill do processo
 * (o cache padrão do React Query é só em memória). Hoje sem efeito prático
 * (nenhuma tela ainda usa useQuery), mas já pronto para quando o catálogo de
 * aulas (areas/modules/lessons/activities) vier da API: fica em cache
 * indefinidamente (ver gcTime em queryClient.ts) e só é refeito sob demanda.
 */
const queryPersister = createAsyncStoragePersister({
	storage: AsyncStorage,
	key: "REACT_QUERY_CACHE",
});

export default queryPersister;
