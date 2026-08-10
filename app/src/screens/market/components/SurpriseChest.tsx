import { Image, StyleSheet, Text } from "react-native";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import { useTranslation } from "react-i18next";
import Images from "../../../utils/imageIndexer";
import ThemedView from "../../../components/themed/ThemedView";
import Icon from "../../../components/Icon";
import ColumnView from "../../../components/layout/ColumnView";
import MarketButton from "./MarketButton";
import MarketModal from "./MarketModal";
import { useState } from "react";
import ComingSoon from "../../../components/ComingSoon";

const TextSize = 20;

export default function SurpiseChest() {
	const { t } = useTranslation();

	const [visible, setVisible] = useState(false);
	const [visibleComingSoon, setVisibleComingSoon] = useState(false);

	return (
		<>
			<ThemedView theme="primary" style={styles.card}>
				<RowView>
					<ColumnView style={{ height: "100%", padding: 5 }}>
						<ResizableText
							style={styles.title}
							defaultSize={TextSize}
						>
							{t("surprise chest")}
						</ResizableText>
						<RowView
							align="center"
							useSize
							style={{ alignSelf: "flex-start", marginTop: 2 }}
						>
							<Icon
								color="#637aff"
								type={"octicons"}
								name="dependabot"
								size={20}
							/>
							<Text style={styles.price}> 500</Text>
						</RowView>
						<MarketButton
							reversed
							title={t("buy")}
							onPress={() => setVisible(true)}
						/>
					</ColumnView>
					<Image
						style={styles.chestImage}
						source={Images.surpriseChest}
					/>
				</RowView>
			</ThemedView>
			<MarketModal
				visible={visible}
				onDismiss={() => setVisible(false)}
				onBuy={() => {
					setVisible(false);
					setVisibleComingSoon(true);
				}}
				title={t("buy surprise chest")}
				price={500}
				image={Images.surpriseChest}
			/>
			<ComingSoon
				visible={visibleComingSoon}
				onDismiss={() => setVisibleComingSoon(false)}
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
	button: {
		left: "8%",
		top: "25%",
	},
	chestImage: {
		width: 180,
		height: 150,
		marginRight: -10,
	},
	title: {
		fontWeight: "bold",
		fontFamily: "Roboto",
		textAlign: "center",
	},
	price: {
		color: "#637aff",
		fontSize: 20,
		fontWeight: "bold",
		fontFamily: "Roboto",
	},
});
