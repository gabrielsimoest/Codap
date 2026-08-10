import HtmlLessons from "../lessons/html/content";
import useLanguageStore from "../../../stores/LanguageStore";
import ClassView from "./ClassView";
import LessonComingSoon from "./LessonComingSoon";

interface Props {
	topic: "HTML" | "CSS" | "JavaScript";
	moduleType: "basic" | "inter" | "advanced" | "master";
}

export default function ClassList({ topic, moduleType }: Props) {
	const language = useLanguageStore((s) => s.language);

	let lessons;

	switch (topic) {
		case "HTML": {
			lessons = HtmlLessons[moduleType];
			break;
		}
		/* case "CSS":
		case "JavaScript": */
		default: {
			lessons = HtmlLessons[moduleType];
		}
	}

	if (lessons === undefined) {
		return <LessonComingSoon />;
	}

	return (
		<>
			{lessons[language as "pt" | "en"].map((lesson, index) => (
				<ClassView
					key={index}
					classes={lesson.classes}
					title={lesson.title}
				/>
			))}
		</>
	);
}
