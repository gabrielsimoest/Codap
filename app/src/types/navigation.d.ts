export type RootStackParamList = {
	Login: { email?: string } | undefined;
	Register: undefined;
	Home: undefined;
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
