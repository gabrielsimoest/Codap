import { create } from "zustand";
import { User } from "../entities";

interface UserStorage {
	user: User | null;
	setUser: (user: User) => void;
}

const useUserStorage = create<UserStorage>((set) => ({
	user: null,
	setUser: (user) =>
		set(() => ({
			user: user,
		})),
}));

export default useUserStorage;
