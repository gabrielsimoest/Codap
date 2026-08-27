import { ImageSourcePropType } from "react-native";
import type { AreaResponse } from "codap-api/src/types/contracts";
import Images from "../../utils/imageIndexer";
import { IconType } from "../../components/Icon";

interface ModuleMetadata {
	image: ImageSourcePropType;
	subtitleKey: string;
}

interface AreaMetadata {
	icon: { type: IconType; name: string };
	headerIcon: string;
	color: string;
	modules: ModuleMetadata[];
}

/**
 * Ícones/imagens ainda não existem no banco (só id/nome) — mapeados aqui
 * manualmente, por POSIÇÃO na resposta de `GET /areas` (não pelo `id`, que é
 * um autoincrement do Postgres sem valor fixo garantido). O seeder
 * (api/prisma/seed.ts) sempre cria as áreas nesta ordem — HTML, CSS,
 * JavaScript — e `GET /areas` sempre ordena por `id asc`, então a posição no
 * array é estável mesmo que os ids não sejam 1/2/3.
 */
const areaMetadata: AreaMetadata[] = [
	{
		// HTML
		icon: { type: "fontawesome", name: "html5" },
		headerIcon: "logo-html5",
		color: "#637aff",
		modules: [
			{ image: Images.codyLearning, subtitleKey: "concepts of html" },
			{ image: Images.codyThinking, subtitleKey: "intermediate html" },
			{ image: Images.codyHappy, subtitleKey: "advanced html" },
			{ image: Images.codyMaster, subtitleKey: "mastery in html" },
		],
	},
	{
		// CSS
		icon: { type: "fontawesome5", name: "css3-alt" },
		headerIcon: "logo-css3",
		color: "#637aff",
		modules: [
			{ image: Images.codyLearning, subtitleKey: "concepts of CSS" },
			{ image: Images.codyThinking, subtitleKey: "intermediate CSS" },
			{ image: Images.codyHappy, subtitleKey: "advanced CSS" },
			{ image: Images.codyMaster, subtitleKey: "mastery in CSS" },
		],
	},
	{
		// JavaScript
		icon: { type: "ionicon", name: "logo-javascript" },
		headerIcon: "logo-javascript",
		color: "#637aff",
		modules: [
			{ image: Images.codyLearning, subtitleKey: "concepts of JavaScript" },
			{ image: Images.codyThinking, subtitleKey: "intermediate JavaScript" },
			{ image: Images.codyHappy, subtitleKey: "advanced JavaScript" },
			{ image: Images.codyMaster, subtitleKey: "mastery in JavaScript" },
		],
	},
];

export default areaMetadata;

/** Índice da área dentro da resposta de `GET /areas` (0 = HTML, sempre a primeira criada pelo seeder). */
export function getAreaIndex(
	areas: AreaResponse[] | undefined,
	areaId: number | undefined
): number {
	if (!areas || areaId === undefined) return -1;
	return areas.findIndex((area) => area.id === areaId);
}
