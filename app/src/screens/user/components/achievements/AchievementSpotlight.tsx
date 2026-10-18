import { useEffect, useRef } from "react";
import {
	AccessibilityInfo,
	Animated,
	Easing,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
} from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useTranslation } from "react-i18next";
import AchievementEmblem from "./AchievementEmblem";
import type { AchievementDisplay } from "./achievementCatalog";
import useFontSizeStore from "../../../../stores/FontSizeStore";

interface Props {
	achievement: AchievementDisplay | null;
	onClose: () => void;
}

/**
 * Visão expandida de uma conquista obtida: fundo quase preto, o emblema
 * grande no centro e um brilho suave pulsando atrás dele. Qualquer toque —
 * no emblema ou fora dele — fecha, assim como o botão voltar do Android:
 * não existe um jeito de ficar preso aqui.
 */
export default function AchievementSpotlight({ achievement, onClose }: Props) {
	const { t } = useTranslation();
	const { width, height } = useWindowDimensions();
	const fontSize = useFontSizeStore((s) => s.fontSize);

	const entrance = useRef(new Animated.Value(0)).current;
	const pulse = useRef(new Animated.Value(0)).current;

	const visible = achievement !== null;

	// Ao fechar, `achievement` vira null na hora, mas o Modal ainda faz o fade
	// de saída — sem guardar a última, o emblema sumiria antes do fundo.
	const lastShown = useRef<AchievementDisplay | null>(null);
	if (achievement) lastShown.current = achievement;
	const shown = lastShown.current;

	useEffect(() => {
		if (!visible) return;

		entrance.setValue(0);
		pulse.setValue(0);
		Animated.spring(entrance, {
			toValue: 1,
			friction: 7,
			tension: 60,
			useNativeDriver: true,
		}).start();

		let loop: Animated.CompositeAnimation | null = null;
		let cancelled = false;
		AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
			if (cancelled || reduceMotion) return;
			loop = Animated.loop(
				Animated.sequence([
					Animated.timing(pulse, {
						toValue: 1,
						duration: 1800,
						easing: Easing.inOut(Easing.sin),
						useNativeDriver: true,
					}),
					Animated.timing(pulse, {
						toValue: 0,
						duration: 1800,
						easing: Easing.inOut(Easing.sin),
						useNativeDriver: true,
					}),
				])
			);
			loop.start();
		});

		return () => {
			cancelled = true;
			loop?.stop();
		};
	}, [visible]);

	const emblemSize = Math.min(width * 0.78, height * 0.5, 380);
	const glowSize = emblemSize * 1.6;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<Pressable
				style={styles.backdrop}
				onPress={onClose}
				accessibilityRole="button"
				accessibilityLabel={t("achievement.close")}
			>
				{shown && (
					<>
						<Animated.View
							pointerEvents="none"
							style={{
								width: glowSize,
								height: glowSize,
								position: "absolute",
								opacity: pulse.interpolate({
									inputRange: [0, 1],
									outputRange: [0.65, 1],
								}),
								transform: [
									{
										scale: pulse.interpolate({
											inputRange: [0, 1],
											outputRange: [0.94, 1.04],
										}),
									},
								],
							}}
						>
							<Svg width={glowSize} height={glowSize}>
								<Defs>
									<RadialGradient id="glow" cx="50%" cy="50%" r="50%">
										<Stop offset="0" stopColor="#5fb8ff" stopOpacity={0.42} />
										<Stop offset="0.45" stopColor="#5469D3" stopOpacity={0.2} />
										<Stop offset="1" stopColor="#5469D3" stopOpacity={0} />
									</RadialGradient>
								</Defs>
								<Circle
									cx={glowSize / 2}
									cy={glowSize / 2}
									r={glowSize / 2}
									fill="url(#glow)"
								/>
							</Svg>
						</Animated.View>

						<Animated.View
							style={{
								alignItems: "center",
								opacity: entrance,
								transform: [
									{
										scale: entrance.interpolate({
											inputRange: [0, 1],
											outputRange: [0.8, 1],
										}),
									},
								],
							}}
						>
							<AchievementEmblem
								source={shown.image}
								size={emblemSize}
								unlocked
							/>
							<Text style={[styles.name, { fontSize: 24 + fontSize }]}>
								{t(`achievement.${shown.key}.name`)}
							</Text>
							<Text
								style={[styles.description, { fontSize: 15 + fontSize }]}
							>
								{t(`achievement.${shown.key}.description`)}
							</Text>
						</Animated.View>

						<Text style={[styles.hint, { fontSize: 13 + fontSize }]}>
							{t("achievement.tapToClose")}
						</Text>
					</>
				)}
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(3, 7, 12, 0.93)",
		paddingHorizontal: 24,
	},
	name: {
		color: "#F1F1F1",
		fontWeight: "bold",
		marginTop: 12,
		textAlign: "center",
	},
	description: {
		color: "#9fb0c3",
		marginTop: 6,
		textAlign: "center",
		maxWidth: 320,
	},
	hint: {
		position: "absolute",
		bottom: 48,
		color: "rgba(241, 241, 241, 0.45)",
	},
});
