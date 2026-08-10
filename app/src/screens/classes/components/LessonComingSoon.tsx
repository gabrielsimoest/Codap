import { Dimensions, Image, StyleSheet, View } from "react-native";
import ThemedText from "../../../components/themed/ThemedText";
import Images from "../../../utils/imageIndexer";
import { useTranslation } from "react-i18next";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export default function LessonComingSoon() {
	const { t } = useTranslation();

	return (
		<>
			<ThemedText
				style={[
					{
						fontSize: 20,
						margin: 20,
						textAlign: "center",
					},
				]}
			>
				{t("Oops")}
			</ThemedText>
			<View
				style={{
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Image
					style={styles.comingSoonImg}
					source={Images.codyBuilding}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	comingSoonImg: {
		width: windowWidth * 0.25,
		height: windowHeight * 0.25,
		right: windowWidth * 0.01,
	},
});
