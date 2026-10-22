import { create } from "zustand";

interface AlertMessage {
	title: string;
	message: string;
	buttonText: string;
}

interface AlertStore {
	alertMessage: AlertMessage;
	setAlertMessage: (alertMessage: AlertMessage) => void;
	alertVisible: boolean;
	setAlertVisible: (visible: boolean) => void;
}

const useAlertStore = create<AlertStore>((set) => ({
	alertMessage: {
		title: "",
		message: "",
		buttonText: "",
	},
	setAlertMessage: (alertMessage) => {
		set(() => ({ alertMessage: alertMessage }));
	},
	alertVisible: false,
	setAlertVisible: (visible) => {
		set(() => ({ alertVisible: visible }));
	},
}));

export default useAlertStore;
