import { StyleSheet } from "react-native";
import ResizableText from "../../../components/ResizableText";
import { useAppColors } from "../../../theme/appColors";

/**
 * Título de seção das Configurações: só texto, na cor de marca legível no tema
 * (`brandText`), sem ícone nem régua — as linhas abaixo já trazem os ícones.
 */
export default function ConfigHeading({ title }: { title: string }) {
	const app = useAppColors();

	return (
		<ResizableText
			useCustomColor
			defaultSize={18}
			style={[styles.text, { color: app.brandText }]}
		>
			{title}
		</ResizableText>
	);
}

const styles = StyleSheet.create({
	text: {
		fontFamily: "Roboto",
		fontWeight: "bold",
		marginTop: 12,
		marginLeft: 4,
	},
});
