import React from "react";
import {
	Pressable,
	Text,
	StyleSheet,
	ColorValue,
	ViewStyle,
} from "react-native";

interface Props {
	onPress: () => void;
	color: ColorValue;
	style?: ViewStyle;
	title: string;
}

const AuthButton = ({ onPress, color, style, title }: Props) => {
	return (
		<Pressable
			onPress={onPress}
			hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
			android_ripple={{ color: "#00000050" }}
			style={({ pressed }) => [
				{ backgroundColor: pressed ? "#dddddd" : color },
				styles.button,
				{ ...style },
			]}
		>
			<Text style={styles.text}>{title}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	text: {
		color: "#ffffff",
		fontSize: 20,
		margin: 10,
		textAlign: "center",
	},
	button: {
		width: 150,
		height: 50,
		alignItems: "center",
		borderRadius: 10,
		margin: 25,
		marginLeft: 80,
	},
});

export default AuthButton;
