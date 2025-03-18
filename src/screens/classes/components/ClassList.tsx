import { Button, View } from "react-native";
import HtmlLessons from "../lessons/html/content";
import useLanguageStore from "../../../stores/LanguageStore";
import ClassView from "./ClassView";

interface Props {
	moduleType?: string;
}

export default function ClassList() {
	const moduleType = "basic";
	const language = useLanguageStore((s) => s.language);

	return (
		<>
			{HtmlLessons[moduleType][language as "pt" | "en"].map(
				(lesson, index) => (
					<ClassView
						key={index}
						classes={lesson.classes}
						title={lesson.title}
					/>
				)
			)}
		</>
	);
}
