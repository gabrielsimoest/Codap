import { ImageSourcePropType } from "react-native";
import type { AreaResponse } from "codap-api/src/types/contracts";
import Images from "../../utils/imageIndexer";
import { IconType } from "../../components/Icon";

interface ModuleMetadata {
	image: ImageSourcePropType;
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
 *
 * O nome/subtítulo descritivo de cada módulo (ex.: "Além do JavaScript") NÃO
 * mora aqui — vem de `module.subtitle`, direto da API (`module_translations`,
 * ver api/CLAUDE.md). Só o cosmético que a API ainda não tem coluna para
 * guardar (imagem do módulo, ícone/cor da área) continua hardcoded aqui.
 */
const areaMetadata: AreaMetadata[] = [
	{
		// HTML
		icon: { type: "fontawesome", name: "html5" },
		headerIcon: "logo-html5",
		color: "#637aff",
		modules: [
			{ image: Images.codyLearning },
			{ image: Images.codyThinking },
			{ image: Images.codyHappy },
			{ image: Images.codyMaster },
		],
	},
	{
		// CSS
		icon: { type: "fontawesome5", name: "css3-alt" },
		headerIcon: "logo-css3",
		color: "#637aff",
		modules: [
			{ image: Images.codyLearning },
			{ image: Images.codyThinking },
			{ image: Images.codyHappy },
			{ image: Images.codyMaster },
		],
	},
	{
		// JavaScript
		icon: { type: "ionicon", name: "logo-javascript" },
		headerIcon: "logo-javascript",
		color: "#637aff",
		modules: [
			{ image: Images.codyLearning },
			{ image: Images.codyThinking },
			{ image: Images.codyHappy },
			{ image: Images.codyMaster },
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
