import { DevToolsBubble } from "react-native-react-query-devtools";
import * as Clipboard from "expo-clipboard";
import queryClient from "../../services/queryClient";

const onCopy = async (text: string) => {
	try {
		await Clipboard.setStringAsync(text);
		return true;
	} catch {
		return false;
	}
};

/** Bolha flutuante do devtools do React Query — só existe em build de desenvolvimento. */
export default function QueryDevTools() {
	if (!__DEV__) {
		return null;
	}

	return <DevToolsBubble queryClient={queryClient} onCopy={onCopy} />;
}
