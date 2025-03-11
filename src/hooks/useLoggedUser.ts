import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../entities";

interface UseLoggedUserCallback {
	onLoggedCallback: (user: User) => void;
	onNotLoggedCallback: (error?: unknown) => void;
}

const useLoggedUser = async ({
	onLoggedCallback,
	onNotLoggedCallback,
}: UseLoggedUserCallback) => {
	try {
		const userFromStorage = await AsyncStorage.getItem("User");
		if (userFromStorage) {
			const user = JSON.parse(userFromStorage);
			onLoggedCallback(user);
		} else {
			onNotLoggedCallback();
		}
	} catch (error) {
		console.error(error);
		onNotLoggedCallback(error);
	}
};

export default useLoggedUser;
