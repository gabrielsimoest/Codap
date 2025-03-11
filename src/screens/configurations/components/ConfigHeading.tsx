import RowView from "../../../components/layout/RowView";
import Icon, { IconType } from "../../../components/Icon";
import ResizableText from "../../../components/ResizableText";
import ThemedLine from "../../../components/themed/ThemedLine";
import { StyleSheet } from "react-native";

interface Props {
	iconType: IconType;
	iconName: string;
	title: string;
}

export default function ConfigHeading({ iconType, iconName, title }: Props) {
	return (
		<RowView align={"center"} style={{ marginBlock: 20 }}>
			<Icon
				type={iconType}
				name={iconName}
				style={[styles.icon]}
				size={25}
				color={"#5469D3"}
			/>
			<ResizableText useCustomColor defaultSize={25} style={styles.text}>
				{title}
			</ResizableText>
			<ThemedLine />
		</RowView>
	);
}

const styles = StyleSheet.create({
	text: {
		color: "#5469D3",
		fontSize: 25,
		marginRight: 10,
	},
	icon: {
		marginRight: 10,
	},
});
