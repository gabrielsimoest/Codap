import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import Images from "../../../../utils/imageIndexer";
import ClassList from "../../components/ClassList";
import ModuleCard from "../../components/ModuleCard";
import ThemedLine from "../../../../components/themed/ThemedLine";
import ThemedView from "../../../../components/themed/ThemedView";

export default function Html() {
	//Salvar aulas
	const [AulasSalvas, setAulasSalvas] = useState<string[]>([""]);

	useFocusEffect(
		React.useCallback(() => {
			getDoneLessons();
		}, [])
	);

	const getDoneLessons = async () => {
		const storageAulasSalvas = await AsyncStorage.getItem("Aulas");
		if (storageAulasSalvas) setAulasSalvas(JSON.parse(storageAulasSalvas));
	};

	//Constante de tradução, usar {t("CHAVE")} para tradução
	const { t } = useTranslation();

	return (
		<ScrollView style={styles.scroller}>
			<ThemedView style={styles.container}>
				{/*******************BASIC***********************/}
				<ModuleCard
					image={Images.codyLearning}
					title={t("module1c")}
					subtitle={t("concepts of html")}
				>
					<ClassList topic="HTML" moduleType="basic" />
					<ThemedLine
						height={2}
						theme="primary"
						style={styles.line}
					/>
				</ModuleCard>
				{/*******************INTER***********************/}
				<ModuleCard
					image={Images.codyThinking}
					title={t("module2c")}
					subtitle={t("intermediate html")}
				>
					<ClassList topic="HTML" moduleType="inter" />
					<ThemedLine
						height={2}
						theme="primary"
						style={styles.line}
					/>
				</ModuleCard>
				{/*******************ADVANCED***********************/}
				<ModuleCard
					image={Images.codyHappy}
					title={t("module3c")}
					subtitle={t("advanced html")}
				>
					<ClassList topic="HTML" moduleType="advanced" />
					<ThemedLine
						height={2}
						theme="primary"
						style={styles.line}
					/>
				</ModuleCard>
				{/*******************MASTERY***********************/}
				<ModuleCard
					image={Images.codyMaster}
					title={t("module4c")}
					subtitle={t("mastery in html")}
				>
					<ClassList topic="HTML" moduleType="master" />
					<ThemedLine
						height={2}
						theme="primary"
						style={styles.line}
					/>
				</ModuleCard>
			</ThemedView>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scroller: {
		marginHorizontal: 10,
		height: "81%",
	},
	container: {
		flex: 1,
		backgroundColor: "#141f29",
	},
	text: {
		position: "absolute",
		right: 30,
		top: 85,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 15,
	},
	line: {
		marginTop: 10,
		marginBottom: 10,
		marginHorizontal: 15,
	},
});
