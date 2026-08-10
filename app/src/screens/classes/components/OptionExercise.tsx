import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	DimensionValue,
} from "react-native";
import { LessonHeader, Progressbar } from "./LessonHeader";
import ResizableHighlighter from "../../../components/ResizableHighlighter";
import ResizableText from "../../../components/ResizableText";
import NextButton from "./NextButton";
import ThemedView from "../../../components/themed/ThemedView";
import ValidationModal from "./ValidationModal";

const textSize = 23;

interface Props {
	aditionalParagraph?: string;
	question: string;
	options: string[];
	correctOption: number;
	highlight: string[];
	tutorial?: boolean;
	progress: DimensionValue;
	onProceed: () => void;
	onClose: () => void;
}

export default function OptionExercise({
	highlight = [""],
	tutorial = false,
	aditionalParagraph,
	question,
	options,
	correctOption,
	progress,
	onClose,
	onProceed,
}: Props) {
	const [tutorialVisible, setTutorialVisible] = useState(tutorial);

	const [selectedOption, setSelectedOption] = useState<number>();

	const [modalVisible, setModalVisible] = useState(false);

	const Validate = () => {
		if (selectedOption !== undefined) {
			setModalVisible(true);
		}
	};

	return (
		<>
			<ThemedView theme="card" style={styles.container}>
				<Progressbar progress={progress} />
				<ScrollView style={styles.scroller}>
					<LessonHeader
						onClose={onClose}
						setTutorialVisible={() =>
							setTutorialVisible(!tutorialVisible)
						}
					/>
					{aditionalParagraph !== undefined ? (
						<ResizableHighlighter
							style={styles.text}
							highlight={highlight}
							text={aditionalParagraph}
							defaultSize={textSize}
						/>
					) : null}
					<ResizableHighlighter
						style={styles.text}
						highlight={highlight}
						text={question}
						defaultSize={textSize}
					/>
					<>
						{options.map((option, index) => (
							<OptionButton
								key={index}
								selectedOption={selectedOption}
								onSelect={() => setSelectedOption(index)}
								option={option}
								index={index}
							/>
						))}
					</>
				</ScrollView>
				<NextButton onPress={() => Validate()} />
			</ThemedView>
			<ValidationModal
				visible={modalVisible}
				onDismiss={() => setModalVisible(false)}
				correct={selectedOption === correctOption - 1}
				onProceed={onProceed}
			/>
			{/* <TutorialOption
					visible={TutorialVisible}
					setModalVisible={setTutorialVisible}
				/>
				<Timer navigation={navigation} seconds={sec} />
				<SaveClass AulaId={aulaSalvar} Salvar={Salvar} /> */}
		</>
	);
}

interface OptionButtonProps {
	selectedOption?: number;
	onSelect: () => void;
	index: number;
	option: string;
}

const OptionButton = ({
	selectedOption,
	onSelect,
	index,
	option,
}: OptionButtonProps) => {
	const { colors } = useTheme();

	return (
		<TouchableOpacity
			style={[
				{ backgroundColor: colors.background },
				styles.button,
				selectedOption === index ? { backgroundColor: "green" } : {},
			]}
			onPress={onSelect}
		>
			<ResizableText style={[styles.text]} defaultSize={20}>
				{option}
			</ResizableText>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 70,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 5,
		marginBottom: 7,
		borderRadius: 20,
		elevation: 10,
	},
	container: {
		height: "100%",
	},
	text: {
		margin: 20,
		flexGrow: 1,
		fontFamily: "Roboto",
		color: "white",
		fontSize: 23,
		fontWeight: "bold",
	},
	scroller: {
		marginBottom: "25%",
	},
});
