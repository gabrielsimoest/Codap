import { useTranslation } from "react-i18next";
import OpButton from "../components/Shared/OpButton";
import RenderLessonTest from "./RenderLessonTest";


export default function RenderClassTest() {

    const { t } = useTranslation()

    const modules = t("TESTE", { returnObjects: true })

    return (
        <>
            {modules.map((classModule, index) => (
                <RenderLessonTest key={index} classTitle={classModule.title} lesson={classModule.classes[0].lesson} />
            ))}
        </>
    );
}