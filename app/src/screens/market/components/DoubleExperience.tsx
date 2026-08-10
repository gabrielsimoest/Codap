import { Image, StyleSheet, Text } from "react-native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import { useTranslation } from "react-i18next";
import Images from "../../../utils/imageIndexer";
import ThemedView from "../../../components/themed/ThemedView";
import ThemedText from "../../../components/themed/ThemedText";
import Icon from "../../../components/Icon";
import useUserStore from "../../../stores/UserStore";
import MarketButton from "./MarketButton";
import ColumnView from "../../../components/layout/ColumnView";
import MarketModal from "./MarketModal";
import { useState } from "react";

const TextSize = 20;

export default function DoubleExperience() {
	const { t } = useTranslation();

	const user = useUserStore((s) => s.user);

	const [visible, setVisible] = useState(false);

	return (
		<>
			<ThemedView theme="primary" style={styles.card}>
				<ThemedText style={styles.Double}>
					{user?.doubleXp === 1 ? "Ativo" : "Inativo"}
				</ThemedText>
				<RowView>
					<Image style={styles.image} source={Images.doubleXP} />
					<ColumnView style={{ height: "100%", padding: 5 }}>
						<ResizableText
							style={styles.title}
							defaultSize={TextSize}
						>
							{t("double experience")}
						</ResizableText>
						<RowView
							align="center"
							useSize
							style={{ alignSelf: "flex-end", marginTop: 2 }}
						>
							<Text style={styles.price}>200 </Text>
							<Icon
								color="#637aff"
								type={"octicons"}
								name="dependabot"
								size={20}
							/>
						</RowView>
						<MarketButton
							title={t("buy")}
							onPress={() => setVisible(true)}
						/>
					</ColumnView>
				</RowView>
			</ThemedView>
			<MarketModal
				visible={visible}
				onDismiss={() => setVisible(false)}
				onBuy={() => console.log("")}
				title={t("buy double experience")}
				price={300}
				image={Images.doubleXP}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 10,
		height: 170,
		margin: 10,
		elevation: 3,
		padding: 10,
	},
	image: {
		width: 150,
		height: 120,
		alignSelf: "center",
	},
	title: {
		alignSelf: "flex-end",
		fontWeight: "bold",
		fontFamily: "Roboto",
		textAlign: "center",
	},
	price: {
		color: "#637aff",
		fontWeight: "bold",
		fontFamily: "Roboto",
		fontSize: 20,
	},
	Double: {
		position: "absolute",
		top: "3%",
		left: "4%",
	},
});
