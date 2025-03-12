import { create } from "zustand";
import { User } from "../entities";

interface UserStorage {
	user: User;
	setUser: (user: User) => void;
}

const useUserStorage = create<UserStorage>((set) => ({
	user: {} as User,
	setUser: (user) =>
		set(() => ({
			user: user,
		})),
}));

export default useUserStorage;
