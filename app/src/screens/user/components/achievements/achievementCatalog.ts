import { ImageSourcePropType } from "react-native";
import Images from "../../../../utils/imageIndexer";
import { ACHIEVEMENT_IDS } from "../../../../services/AchievementService";

export interface AchievementDisplay {
	id: number;
	/** Prefixo das chaves i18n em `achievement.<key>.*`. */
	key: keyof typeof ACHIEVEMENT_IDS;
	image: ImageSourcePropType;
}

/**
 * Ordem da grade 2×2: a trilha na ordem em que é ensinada (HTML, CSS,
 * JavaScript) e a Tríade Web por último, fechando a grade como o emblema que
 * depende dos outros três.
 */
const achievementCatalog: AchievementDisplay[] = [
	{ id: ACHIEVEMENT_IDS.html, key: "html", image: Images.emblemHtml },
	{ id: ACHIEVEMENT_IDS.css, key: "css", image: Images.emblemCss },
	{ id: ACHIEVEMENT_IDS.javascript, key: "javascript", image: Images.emblemJs },
	{ id: ACHIEVEMENT_IDS.webTriad, key: "webTriad", image: Images.emblemWebTriad },
];

export default achievementCatalog;
