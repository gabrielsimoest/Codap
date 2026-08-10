import { create } from "zustand";
import i18n from "../translations/i18n/i18n";

interface LanguageStore {
	language: string;
	setLanguage: (language: string) => void;
}

const useLanguageStore = create<LanguageStore>((set) => ({
	language: "pt",
	setLanguage: (language: string) => {
		i18n.changeLanguage(language);
		set(() => ({ language: language }));
	},
}));

export default useLanguageStore;
