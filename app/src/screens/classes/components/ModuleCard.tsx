import { ReactNode, useState } from "react";
import {
	Dimensions,
	Image,
	ImageSourcePropType,
	StyleSheet,
} from "react-native";
import Collapsible from "react-native-collapsible";
import ThemedTouchableOpacity from "../../../components/themed/ThemedTouchableOpacity";
import ResizableText from "../../../components/ResizableText";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

interface Props {
	image: ImageSourcePropType;
	title: string;
	subtitle: string;
	children: ReactNode[];
}

export default function ModuleCard({
	image,
	title,
	subtitle,
	children,
}: Props) {
	const [expanded, toggleExpanded] = useState(false);

	return (
		<>
			<ThemedTouchableOpacity
				theme="primary"
				onPress={() => toggleExpanded(!expanded)}
				style={styles.class}
			>
				<ResizableText defaultSize={23} style={styles.title}>
					{title}
				</ResizableText>
				<ResizableText defaultSize={15} style={styles.text}>
					{subtitle}
				</ResizableText>
				<Image style={styles.image} source={image} />
			</ThemedTouchableOpacity>
			<Collapsible collapsed={!expanded}>{children}</Collapsible>
		</>
	);
}

const styles = StyleSheet.create({
	class: {
		height: windowHeight * 0.19,
		marginLeft: 20,
		marginRight: 20,
		marginTop: 15,
		marginBottom: 15,
		borderRadius: 20,
		elevation: 2,
	},
	title: {
		position: "absolute",
		right: 30,
		top: 55,
		fontFamily: "Roboto",
	},
	text: {
		position: "absolute",
		right: 30,
		top: 85,
		fontFamily: "Roboto",
	},
	image: {
		marginVertical: "auto",
		left: windowWidth * 0.065,
		width: windowWidth * 0.189,
		height: windowHeight * 0.185,
	},
});
