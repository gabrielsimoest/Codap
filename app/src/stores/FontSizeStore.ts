import { create } from "zustand";

interface FontSizeStore {
	fontSize: number;
	increment: () => void;
	decrement: () => void;
	setFontSize: (fontSize: number) => void;
}

const useFontSizeStore = create<FontSizeStore>((set) => ({
	fontSize: 0,
	increment: () =>
		set((store) => {
			const incremented = store.fontSize + 1;
			if (incremented > 5) {
				return { fontSize: store.fontSize };
			} else {
				return { fontSize: incremented };
			}
		}),
	decrement: () =>
		set((store) => {
			const decremented = store.fontSize - 1;
			if (decremented < 0) {
				return { fontSize: store.fontSize };
			} else {
				return { fontSize: decremented };
			}
		}),
	setFontSize: (fontSize) => set(() => ({ fontSize: fontSize })),
}));

export default useFontSizeStore;
