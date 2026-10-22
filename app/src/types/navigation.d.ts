export type RootStackParamList = {
	Login: { email?: string } | undefined;
	Register: undefined;
	Home: undefined;
	// Só ids: a tela redescobre a lição pelo cache de `useModulesQuery`, em vez
	// de receber o objeto pronto. É o que permite abrir por deep link (params de
	// URL só carregam primitivos) e o que mantém o conteúdo no idioma certo se
	// o usuário trocar de idioma com a tela na pilha.
	Lesson: { areaId: number; moduleId: number; lessonId: number };
};

export type MainTabParamList = {
	Class: undefined;
	Market: undefined;
	Account: undefined;
	Settings: undefined;
};

// Faz useNavigation()/useRoute() inferirem RootStackParamList automaticamente
// em qualquer lugar do app, sem precisar passar o genérico manualmente.
declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
