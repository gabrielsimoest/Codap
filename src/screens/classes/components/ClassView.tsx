import { DimensionValue } from "react-native";
import { Classes, Theory } from "../../../types/entities";
import { Modal, Portal } from "react-native-paper";
import { useEffect, useState } from "react";
import ClassButton from "./ClassButton";
import TheoryView from "./TheoryLesson";
import useNavigate from "../../../hooks/useNavigate";

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
				return (
					<TheoryView
						firstParagraph={
							(currentLesson as Theory).lesson.firstParagraph
						}
						secondParagraph={
							(currentLesson as Theory).lesson.secondParagraph
						}
						thirdParagraph={
							(currentLesson as Theory).lesson.thirdParagraph
						}
						endParagraph={
							(currentLesson as Theory).lesson.endParagraph
						}
						highlight={(currentLesson as Theory).lesson.highlight}
						codeLanguage={
							(currentLesson as Theory).lesson.codeLanguage
						}
						code={(currentLesson as Theory).lesson.code}
						progress={progressWidth as DimensionValue}
						onProceed={changeContent}
						tutorial={(currentLesson as Theory).lesson.tutorial}
						onlyCode={(currentLesson as Theory).lesson.onlyCode}
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
