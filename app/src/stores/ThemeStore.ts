import { Theme } from "@react-navigation/native";
import { create } from "zustand";
import LightMode from "../theme/LightMode";
import DarkMode from "../theme/DarkMode";

interface ThemeStore {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const useThemeStore = create<ThemeStore>((set) => ({
	theme: LightMode,
	toggleTheme: () => {
		set((store) => {
			const newTheme = store.theme === LightMode ? DarkMode : LightMode;
			return {
				theme: newTheme,
			};
		});
	},
	setTheme: (theme) => {
		set(() => ({ theme: theme }));
	},
}));

export default useThemeStore;
