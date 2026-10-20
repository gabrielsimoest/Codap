import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import type { ChestOutcome, ShopItem } from "codap-api/src/types/contracts";
import MarketHeader from "./components/MarketHeader";
import MarketModal from "./components/MarketModal";
import ShopItemCard from "./components/ShopItemCard";
import ThemedView from "../../components/themed/ThemedView";
import ThemedText from "../../components/themed/ThemedText";
import useAreasQuery from "../../hooks/queries/useAreasQuery";
import Images from "../../utils/imageIndexer";
import { showAlert } from "../../utils/showAlert";
import { buyItem, refreshShop, type BuyResult } from "../../services/ShopActions";
import useLanguageStore from "../../stores/LanguageStore";
import useShopStore from "../../stores/ShopStore";
import useUserStore from "../../stores/UserStore";

/**
 * Só para exibir enquanto o estado da loja não chegou (sem conexão): os preços
 * de verdade moram no servidor e `GET /shop` os devolve — comprar sem ter o
 * estado nem é oferecido.
 */
const FALLBACK_PRICES = { double_xp: 200, instant_hint: 300, chest: 500 };

/** Hora no idioma do app, não no do aparelho (o pt mostra 24 h, o en, AM/PM). */
const formatTime = (iso: string, language: string) =>
	new Date(iso).toLocaleTimeString(language === "pt" ? "pt-BR" : "en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

export default function Market() {
	const { t } = useTranslation();

	const remoteId = useUserStore((s) => s.user?.remoteId);
	const language = useLanguageStore((s) => s.language);
	const { data: areas } = useAreasQuery();
	// O estado da loja é de uma conta: outra conta no mesmo aparelho nunca o herda.
	const shop = useShopStore((s) => (s.userId === remoteId ? s.state : null));

	const [confirming, setConfirming] = useState<ShopItem | null>(null);
	const [busy, setBusy] = useState(false);

	useFocusEffect(
		useCallback(() => {
			refreshShop();
		}, [remoteId])
	);

	// O rótulo "ativo" é calculado a cada renderização; sem isto ele só sumiria
	// quando algo mais re-renderizasse a tela depois do fim da janela.
	const [, setClock] = useState(0);
	const boostEndsAt = shop?.doubleXpEndsAt ?? null;
	useEffect(() => {
		if (!boostEndsAt) return;
		const remaining = new Date(boostEndsAt).getTime() - Date.now();
		if (remaining <= 0) return;
		const id = setTimeout(() => setClock((tick) => tick + 1), remaining + 250);
		return () => clearTimeout(id);
	}, [boostEndsAt]);

	const prices = shop?.prices ?? FALLBACK_PRICES;
	const boostActive =
		shop?.doubleXpEndsAt != null &&
		new Date(shop.doubleXpEndsAt).getTime() > Date.now();

	const ask = (item: ShopItem) => {
		if (!shop) {
			showAlert(t("alert.market.title"), t("shop.errors.offline"));
			return;
		}
		setConfirming(item);
	};

	const announce = (item: ShopItem, result: BuyResult) => {
		const title = t("alert.market.title");
		if (result.ok) {
			showAlert(t("shop.success"), successMessage(item, result.response.chest));
			return;
		}
		switch (result.reason) {
			case "offline":
				showAlert(title, t("shop.errors.offline"));
				break;
			case "pending_sync":
				showAlert(title, t("shop.errors.pendingSync"));
				break;
			case "insufficient_bits":
				showAlert(title, t("shop.errors.insufficient", { bits: result.bits ?? 0 }));
				break;
			case "boost_active":
				showAlert(title, t("shop.errors.boostActive"));
				break;
			default:
				showAlert(title, t("shop.errors.generic"));
		}
	};

	/** O que o baú entregou, ou a mensagem fixa dos outros itens. */
	const successMessage = (item: ShopItem, chest?: ChestOutcome): string => {
		if (item !== "chest" || !chest) return t(`shop.${item}.bought`);
		switch (chest.kind) {
			case "lesson":
				return t("shop.chest.lesson", { name: chest.lesson.name });
			case "instant_hint":
				return t("shop.chest.hint");
			case "double_xp":
				return t("shop.chest.boost");
			default:
				return t("shop.chest.bits", { amount: chest.amount });
		}
	};

	const chestAreas = shop?.chest.areas ?? [];
	const chestTotal = chestAreas.reduce((sum, area) => sum + area.total, 0);
	const chestRevealed = chestAreas.reduce((sum, area) => sum + area.revealed, 0);

	const confirm = async () => {
		if (!confirming || busy) return;
		const item = confirming;
		setBusy(true);
		const result = await buyItem(item, language);
		setBusy(false);
		setConfirming(null);
		announce(item, result);
	};

	return (
		<ThemedView style={styles.container}>
			<MarketHeader />
			<ThemedText style={styles.headert}>{t("buy using bits")}</ThemedText>
			<ScrollView style={{ marginBottom: "18.2%" }}>
				<ShopItemCard
					title={t("double experience")}
					price={prices.double_xp}
					image={Images.doubleXP}
					status={
						boostActive
							? t("shop.double_xp.active", { time: formatTime(shop!.doubleXpEndsAt!, language) })
							: t("inactive")
					}
					buyLabel={t("buy")}
					onBuy={() => ask("double_xp")}
				/>
				<ShopItemCard
					title={t("surprise chest")}
					price={prices.chest}
					image={Images.surpriseChest}
					imageSide="right"
					status={
						shop && chestTotal > 0
							? t("shop.chest.collection", { revealed: chestRevealed, total: chestTotal })
							: undefined
					}
					buyLabel={t("buy")}
					onBuy={() => ask("chest")}
				/>
				<ShopItemCard
					title={t("instant hint")}
					price={prices.instant_hint}
					image={Images.doubleTime}
					status={shop ? t("shop.instant_hint.owned", { count: shop.instantHints }) : undefined}
					buyLabel={t("buy")}
					onBuy={() => ask("instant_hint")}
				/>
			</ScrollView>

			<MarketModal
				visible={confirming === "double_xp"}
				onDismiss={() => setConfirming(null)}
				onBuy={confirm}
				loading={busy}
				title={t("shop.double_xp.confirm")}
				price={prices.double_xp}
				image={Images.doubleXP}
			/>
			<MarketModal
				visible={confirming === "chest"}
				onDismiss={() => setConfirming(null)}
				onBuy={confirm}
				loading={busy}
				title={t("shop.chest.confirm")}
				price={prices.chest}
				image={Images.surpriseChest}
			>
				{/* Quantas aulas exclusivas cada área tem e quantas já são suas —
				    nunca quais são: a surpresa é parte do baú. */}
				<ThemedView style={styles.chestInfo}>
					{chestAreas.length === 0 ? (
						<ThemedText style={styles.chestInfoText}>{t("shop.chest.empty")}</ThemedText>
					) : (
						chestAreas.map((area) => (
							<ThemedView key={area.areaId} theme="background" style={styles.chestChip}>
								<ThemedText style={styles.chestChipArea}>
									{areas?.find((item) => item.id === area.areaId)?.name ?? ""}
								</ThemedText>
								<ThemedText style={styles.chestInfoText}>
									{t("shop.chest.areaCount", {
										revealed: area.revealed,
										total: area.total,
									})}
								</ThemedText>
							</ThemedView>
						))
					)}
				</ThemedView>
			</MarketModal>
			<MarketModal
				visible={confirming === "instant_hint"}
				onDismiss={() => setConfirming(null)}
				onBuy={confirm}
				loading={busy}
				title={t("shop.instant_hint.confirm")}
				price={prices.instant_hint}
				image={Images.doubleTime}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#141f29",
		height: "100%",
	},
	// As contagens por área viram três "fichas" lado a lado (e quebram de linha se a
	// fonte do app estiver grande): três linhas empilhadas deixavam o modal apertado.
	chestInfo: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		marginTop: 8,
		marginBottom: 14,
	},
	chestChip: {
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 12,
	},
	chestChipArea: {
		fontFamily: "Roboto",
		fontSize: 13,
		opacity: 0.7,
		textAlign: "center",
	},
	chestInfoText: {
		fontFamily: "Roboto",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	headert: {
		margin: 10,
		fontSize: 25,
		color: "white",
		fontWeight: "bold",
		fontFamily: "Roboto",
		textAlign: "center",
	},
});
