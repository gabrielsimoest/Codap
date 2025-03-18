import { create } from "zustand";
import { User } from "../types/entities";

interface UserStorage {
	user: User | null;
	setUser: (user: User) => void;
}

const useUserStore = create<UserStorage>((set) => ({
	user: null,
	setUser: (user) =>
		set(() => ({
			user: user,
		})),
}));

export default useUserStore;
