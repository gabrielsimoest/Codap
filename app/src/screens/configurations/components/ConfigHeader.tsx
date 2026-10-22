import React from "react";
import { Title } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import ScreenHeader from "../../../components/layout/ScreenHeader";

export default function ConfigHeader({ title }: { title: string }) {
	const { colors } = useTheme();

	return (
		<ScreenHeader>
			<Title
				style={{
					color: colors.text,
					fontFamily: "Roboto",
					marginLeft: 30,
				}}
			>
				{title}
			</Title>
		</ScreenHeader>
	);
}
