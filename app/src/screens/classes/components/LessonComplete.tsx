import { useEffect, useRef, useState } from "react";
import {
	AccessibilityInfo,
	Animated,
	Easing,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";
import LevelBar from "../../../components/LevelBar";
import ResizableText from "../../../components/ResizableText";
import RowView from "../../../components/layout/RowView";
import ThemedView from "../../../components/themed/ThemedView";
import { progressInLevel } from "../../../utils/levels";
import type { LessonCompletionResult } from "../../../types/entities";

interface Props {
	result: LessonCompletionResult;
	onContinue: () => void;
}

const FILL_MS = 700;
const BITS_COLOR = "#637aff";

/**
 * Tela mostrada ao terminar a última atividade de uma lição: o que ela rendeu
 * (XP) e, se subiu de nível, o aviso com os Bits ganhos. A barra anima do
 * progresso anterior ao novo; numa subida de nível ela enche, recomeça e segue
 * até o novo valor. Com "reduzir movimento" ligado, mostra direto o estado
 * final. Refazer uma lição já concluída não rende nada e só avisa isso.
 */
export default function LessonComplete({ result, onContinue }: Props) {
	const { t } = useTranslation();

	const before = progressInLevel(result.xpBefore);
	const after = progressInLevel(result.xpAfter);
	const leveledUp = result.levelAfter > result.levelBefore;

	const fill = useRef(
		new Animated.Value(result.firstTime ? before.fraction : after.fraction)
	).current;
	const popup = useRef(new Animated.Value(0)).current;
	const [shownLevel, setShownLevel] = useState(
		result.firstTime ? result.levelBefore : result.levelAfter
	);
	const [showLevelUp, setShowLevelUp] = useState(false);

	useEffect(() => {
		if (!result.firstTime) return;

		let cancelled = false;
		const timing = (toValue: number, duration: number) =>
			Animated.timing(fill, {
				toValue,
				duration,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: false,
			});

		AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			if (cancelled) return;

			if (reduceMotion) {
				fill.setValue(after.fraction);
				popup.setValue(1);
				setShownLevel(result.levelAfter);
				setShowLevelUp(leveledUp);
				return;
			}

			if (!leveledUp) {
				timing(after.fraction, FILL_MS).start();
				return;
			}

			timing(1, FILL_MS * 0.8).start(({ finished }) => {
				if (!finished || cancelled) return;
				setShownLevel(result.levelAfter);
				setShowLevelUp(true);
				fill.setValue(0);
				Animated.parallel([
					Animated.spring(popup, {
						toValue: 1,
						friction: 5,
						tension: 80,
						useNativeDriver: true,
					}),
					timing(after.fraction, FILL_MS),
				]).start();
			});
		});

		return () => {
			cancelled = true;
			fill.stopAnimation();
			popup.stopAnimation();
		};
	}, []);

	return (
		<ThemedView style={styles.container}>
			<View style={styles.content}>
				<ResizableText style={styles.title} defaultSize={28}>
					{t("levels.complete.title")}
				</ResizableText>

				{result.firstTime ? (
					<>
						<ResizableText
							style={styles.xpGained}
							defaultSize={34}
							useCustomColor
						>
							{t("levels.complete.xpGained", { xp: result.xpGained })}
						</ResizableText>
						{result.boosted ? (
							<ResizableText style={styles.boosted} defaultSize={16} useCustomColor>
								{t("levels.complete.boosted")}
							</ResizableText>
						) : null}
						<ResizableText style={styles.level} defaultSize={20}>
							{t("levels.level", { level: shownLevel })}
						</ResizableText>
						<LevelBar fill={fill} style={styles.bar} />
						<ResizableText style={styles.progressText} defaultSize={16}>
							{after.isMax
								? t("levels.maxLevel")
								: t("levels.xpProgress", {
										current: after.xpIntoLevel,
										needed: after.xpForNextLevel,
								  })}
						</ResizableText>

						{showLevelUp && (
							<Animated.View
								style={[
									styles.levelUp,
									{
										opacity: popup,
										transform: [
											{
												scale: popup.interpolate({
													inputRange: [0, 1],
													outputRange: [0.6, 1],
												}),
											},
										],
									},
								]}
							>
								<ResizableText style={styles.levelUpText} defaultSize={30}>
									{t("levels.complete.levelUp", { level: result.levelAfter })}
								</ResizableText>
								{result.bitsGained > 0 && (
									<RowView useSize align="center" justify="center">
										<ResizableText
											style={styles.bitsText}
											defaultSize={22}
											useCustomColor
										>
											{t("levels.complete.bitsGained", {
												bits: result.bitsGained,
											})}{" "}
										</ResizableText>
										<Icon
											color={BITS_COLOR}
											type="octicons"
											name="cpu"
											size={24}
										/>
									</RowView>
								)}
							</Animated.View>
						)}
					</>
				) : (
					<ResizableText style={styles.message} defaultSize={20}>
						{t("levels.complete.alreadyDone")}
					</ResizableText>
				)}
			</View>

			<TouchableOpacity style={styles.button} onPress={onContinue}>
				<ResizableText
					style={styles.buttonText}
					defaultSize={20}
					useCustomColor
				>
					{t("continue")}
				</ResizableText>
			</TouchableOpacity>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
		paddingBottom: 32,
	},
	content: {
		flex: 1,
		justifyContent: "center",
	},
	title: {
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 12,
	},
	xpGained: {
		fontWeight: "bold",
		textAlign: "center",
		color: "#5469D3",
		marginBottom: 28,
	},
	boosted: {
		fontWeight: "bold",
		textAlign: "center",
		color: "#E0B04C",
		marginTop: -20,
		marginBottom: 20,
	},
	level: {
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 8,
	},
	bar: {
		marginHorizontal: 8,
	},
	progressText: {
		textAlign: "center",
		marginTop: 8,
		opacity: 0.8,
	},
	message: {
		textAlign: "center",
		marginTop: 12,
	},
	levelUp: {
		alignItems: "center",
		marginTop: 32,
	},
	levelUpText: {
		fontWeight: "bold",
		textAlign: "center",
	},
	bitsText: {
		fontWeight: "bold",
		color: BITS_COLOR,
	},
	button: {
		backgroundColor: "#637aff",
		height: 50,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
