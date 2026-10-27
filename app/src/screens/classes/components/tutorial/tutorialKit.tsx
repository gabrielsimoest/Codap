import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { TheoryPalette } from "../theory/theoryTheme";

/** Tamanho fixo da "tela" de cada ilustração: todas as coordenadas das cenas partem daqui. */
export const CANVAS_W = 230;
export const CANVAS_H = 150;

/** Há uma preferência do sistema por menos movimento? Sem ela, as cenas animam em laço. */
export function useReduceMotion(): boolean {
	const [reduce, setReduce] = useState(false);
	useEffect(() => {
		let alive = true;
		AccessibilityInfo.isReduceMotionEnabled().then((value) => {
			if (alive) setReduce(value);
		});
		return () => {
			alive = false;
		};
	}, []);
	return reduce;
}

/**
 * Relógio de quadros de uma cena: devolve o índice do quadro atual e passa para o
 * próximo depois de `durations[i]` ms, em laço. Com "reduzir movimento" fica parado no
 * **último** quadro, que toda cena desenha como o estado final já resolvido.
 */
export function useFrame(durations: number[]): number {
	const reduce = useReduceMotion();
	const [frame, setFrame] = useState(0);
	const last = durations.length - 1;

	useEffect(() => {
		if (reduce) {
			setFrame(last);
			return;
		}
		const timer = setTimeout(() => setFrame((current) => (current + 1) % durations.length), durations[frame]);
		return () => clearTimeout(timer);
		// `durations` é uma constante de módulo em cada cena.
	}, [frame, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

	return reduce ? last : frame;
}

interface CanvasProps {
	palette: TheoryPalette;
	children: ReactNode;
}

/** Moldura da ilustração: um quadro na cor da tela, com a área de desenho de tamanho fixo no centro. */
export function Canvas({ palette, children }: CanvasProps) {
	return (
		<View style={[styles.stage, { backgroundColor: palette.screen, borderColor: palette.border }]}>
			<View style={styles.canvas}>{children}</View>
		</View>
	);
}

interface BoxProps {
	x: number;
	y: number;
	w: number;
	h: number;
	bg?: string;
	border?: string;
	radius?: number;
	borderWidth?: number;
	opacity?: number;
	style?: StyleProp<ViewStyle>;
	children?: ReactNode;
}

/** Retângulo posicionado dentro da área de desenho. */
export function Box({ x, y, w, h, bg, border, radius = 8, borderWidth = 1, opacity = 1, style, children }: BoxProps) {
	return (
		<View
			style={[
				{
					position: "absolute",
					left: x,
					top: y,
					width: w,
					height: h,
					backgroundColor: bg,
					borderColor: border,
					borderWidth: border ? borderWidth : 0,
					borderRadius: radius,
					opacity,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}

/** Barra que representa uma linha de texto que ainda não importa ler. */
export function Bar({ x, y, w, color, h = 5, opacity = 1 }: { x: number; y: number; w: number; color: string; h?: number; opacity?: number }) {
	return <Box x={x} y={y} w={w} h={h} bg={color} radius={h / 2} opacity={opacity} />;
}

interface MonoProps {
	x: number;
	y: number;
	color: string;
	size?: number;
	bold?: boolean;
	/** Largura máxima do texto: além dela ele quebra de linha em vez de vazar do desenho. */
	w?: number;
	children: ReactNode;
}

/** Texto pequeno da ilustração: tamanho fixo, não acompanha a escala de fonte do app. */
export function Mono({ x, y, color, size = 11, bold = false, children }: MonoProps) {
	return (
		<Text
			allowFontScaling={false}
			style={{
				position: "absolute",
				left: x,
				top: y,
				color,
				fontSize: size,
				fontFamily: "monospace",
				fontWeight: bold ? "bold" : "normal",
			}}
		>
			{children}
		</Text>
	);
}

/** Trecho colorido dentro de um `Mono` (texto em linha, sem posição própria). */
export function Span({ color, children }: { color: string; children: ReactNode }) {
	return <Text style={{ color }}>{children}</Text>;
}

/** Texto comum (não monoespaçado) da ilustração. */
export function Label({ x, y, color, size = 11, bold = false, w, children }: MonoProps) {
	return (
		<Text
			allowFontScaling={false}
			style={{
				position: "absolute",
				left: x,
				top: y,
				width: w,
				color,
				fontSize: size,
				fontWeight: bold ? "bold" : "normal",
			}}
		>
			{children}
		</Text>
	);
}

/** O disco do dedo fica um pouco à direita e abaixo do alvo, para não esconder o que está sendo tocado. */
const FINGER_DX = 9;
const FINGER_DY = 9;

interface FingerProps {
	/** Para onde o dedo vai; `null` o esconde. */
	at: { x: number; y: number } | null;
	/** Muda a cada toque (e é `null` quando não há toque): dispara o anel que se expande. */
	tapKey: number | null;
	color: string;
}

/**
 * O dedo da demonstração: um disco que desliza até o alvo de cada quadro e, quando
 * `tapKey` muda, solta um anel — o "toque". Só decoração (`pointerEvents="none"`).
 */
export function Finger({ at, tapKey, color }: FingerProps) {
	const position = useRef(new Animated.ValueXY({ x: (at?.x ?? 0) + FINGER_DX, y: (at?.y ?? 0) + FINGER_DY })).current;
	const visible = useRef(new Animated.Value(at ? 1 : 0)).current;
	const ring = useRef(new Animated.Value(0)).current;
	const mounted = useRef(false);

	useEffect(() => {
		if (!at) {
			Animated.timing(visible, { toValue: 0, duration: 160, useNativeDriver: true }).start();
			return;
		}
		Animated.parallel([
			Animated.timing(visible, { toValue: 1, duration: 160, useNativeDriver: true }),
			Animated.timing(position, {
				toValue: { x: at.x + FINGER_DX, y: at.y + FINGER_DY },
				duration: 420,
				easing: Easing.inOut(Easing.cubic),
				useNativeDriver: true,
			}),
		]).start();
	}, [at?.x, at?.y]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		if (tapKey === null) return;
		// O anel espera o dedo chegar ao alvo (o deslize dura 420 ms).
		ring.setValue(0);
		Animated.sequence([
			Animated.delay(400),
			Animated.timing(ring, { toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
		]).start();
	}, [tapKey]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Animated.View
			pointerEvents="none"
			style={[
				styles.finger,
				{ opacity: visible, transform: [{ translateX: position.x }, { translateY: position.y }] },
			]}
		>
			<Animated.View
				style={[
					styles.ring,
					{
						borderColor: color,
						opacity: ring.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 0.9, 0] }),
						transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.8] }) }],
					},
				]}
			/>
			<View style={[styles.dot, { backgroundColor: color }]} />
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	stage: {
		height: CANVAS_H + 20,
		borderRadius: 16,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	canvas: {
		width: CANVAS_W,
		height: CANVAS_H,
	},
	finger: {
		position: "absolute",
		left: -11,
		top: -11,
		width: 22,
		height: 22,
		alignItems: "center",
		justifyContent: "center",
	},
	ring: {
		position: "absolute",
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		opacity: 0.85,
	},
});
