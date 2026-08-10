import { DimensionValue } from "react-native";
import { Classes, Option, Theory } from "../../../types/entities";
import { Modal, Portal } from "react-native-paper";
import { useEffect, useState } from "react";
import ClassButton from "./ClassButton";
import TheoryView from "./TheoryLesson";
import useNavigate from "../../../hooks/useNavigate";
import OptionExercise from "./OptionExercise";

interface Props {
	classes: Classes[];
	title: string;
}

export default function ClassView({ classes, title }: Props) {
	const [visible, setVisible] = useState(false);
	const [contentIndex, setContentIndex] = useState(0);
	const [progressWidth, setProgressWidth] = useState("0%");

	const calculateProgressWidth = () => {
		const totalLessons = classes.length;
		const currentLesson = contentIndex + 1;
		const progressPercentage = (
			(currentLesson / totalLessons) *
			100
		).toFixed(0);
		setProgressWidth(`${progressPercentage}%`);
	};

	useEffect(() => {
		calculateProgressWidth();
	}, [contentIndex]);

	const navigation = useNavigate();

	const changeContent = () => {
		if (contentIndex + 1 > classes.length - 1) {
			setVisible(false);
			setContentIndex(0);
		} else {
			setContentIndex(contentIndex + 1);
		}
	};

	const closeLesson = () => {
		setVisible(false);
		setContentIndex(0);
	};

	const renderByType = () => {
		const currentLesson = classes[contentIndex];

		switch (currentLesson.type) {
			case "theory": {
				const lessonType = currentLesson as Theory;
				return (
					<TheoryView
						firstParagraph={lessonType.lesson.firstParagraph}
						secondParagraph={lessonType.lesson.secondParagraph}
						thirdParagraph={lessonType.lesson.thirdParagraph}
						endParagraph={lessonType.lesson.endParagraph}
						highlight={lessonType.lesson.highlight}
						codeLanguage={lessonType.lesson.codeLanguage}
						code={lessonType.lesson.code}
						onlyCode={lessonType.lesson.onlyCode}
						tutorial={lessonType.lesson.tutorial}
						progress={progressWidth as DimensionValue}
						onProceed={changeContent}
						onClose={closeLesson}
					/>
				);
			}
			case "option": {
				const lessonType = currentLesson as Option;
				return (
					<OptionExercise
						question={lessonType.lesson.question}
						aditionalParagraph={
							lessonType.lesson.aditionalParagraph
						}
						options={lessonType.lesson.options}
						correctOption={lessonType.lesson.correctOption}
						highlight={lessonType.lesson.highlight}
						tutorial={lessonType.lesson.tutorial}
						progress={progressWidth as DimensionValue}
						onProceed={changeContent}
						onClose={closeLesson}
					/>
				);
			}
			default: {
				console.log("Not suported");
				return null;
			}
		}
	};

	return (
		<>
			<Portal>
				<Modal
					visible={visible}
					onDismiss={() => setVisible(false)}
					contentContainerStyle={{ flex: 1 }}
					dismissableBackButton={false}
					dismissable={false}
				>
					{renderByType()}
				</Modal>
			</Portal>
			<ClassButton title={title} onPress={() => setVisible(true)} />
		</>
	);
}
