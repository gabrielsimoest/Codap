import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Polygon, Rect } from "react-native-svg";

interface Props {
	country: "br" | "us";
	/** Largura em dp; a altura segue a proporção da bandeira recortada em 10:7. */
	width?: number;
}

const ASPECT = 0.7;

/** Estrelas da bandeira dos EUA: 9 fileiras alternando 6 e 5 estrelas no cantão. */
const US_STARS = Array.from({ length: 9 }, (_, row) => {
	const count = row % 2 === 0 ? 6 : 5;
	return Array.from({ length: count }, (_, col) => ({
		x: (row % 2 === 0 ? 0.633 : 1.267) + col * 1.267,
		y: 0.5385 + row * 0.5385,
	}));
}).flat();

/**
 * Bandeira do Brasil ou dos Estados Unidos, desenhada em SVG (não é emoji: a
 * aparência não depende da fonte do aparelho). Recorte em cantos arredondados e
 * um contorno fino para a bandeira não sumir sobre superfícies da mesma cor.
 */
export default function Flag({ country, width = 36 }: Props) {
	const height = Math.round(width * ASPECT);

	return (
		<View style={[styles.frame, { width, height }]}>
			{country === "br" ? (
				<Svg width={width} height={height} viewBox="0 0 20 14" preserveAspectRatio="xMidYMid slice">
					<Rect width="20" height="14" fill="#009C3B" />
					<Polygon points="10,1.3 18.3,7 10,12.7 1.7,7" fill="#FFDF00" />
					<Circle cx="10" cy="7" r="3.5" fill="#002776" />
					<Path d="M6.6 6.1 Q10 5.1 13.4 7.9" stroke="#FFFFFF" strokeWidth="0.55" fill="none" />
				</Svg>
			) : (
				<Svg width={width} height={height} viewBox="0 0 19 10" preserveAspectRatio="xMidYMid slice">
					<Rect width="19" height="10" fill="#FFFFFF" />
					{Array.from({ length: 7 }, (_, i) => (
						<Rect key={i} x="0" y={(i * 2 * 10) / 13} width="19" height={10 / 13} fill="#B22234" />
					))}
					<Rect width="7.6" height={(7 * 10) / 13} fill="#3C3B6E" />
					{US_STARS.map((star, i) => (
						<Circle key={i} cx={star.x} cy={star.y} r="0.2" fill="#FFFFFF" />
					))}
				</Svg>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	frame: {
		borderRadius: 5,
		overflow: "hidden",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "rgba(127,127,127,0.5)",
	},
});
