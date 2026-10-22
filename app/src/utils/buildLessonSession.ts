import type { OptionActivityContent } from "codap-api/src/types/contracts";
import type { PlayableActivity } from "../types/entities";

/**
 * Monta a sessão de uma lição: a teoria vem primeiro, na ordem em que chegou
 * (a do `index`), e nunca é aleatorizada; a prática vem depois, sorteada e
 * embaralhada a cada chamada.
 *
 * - Atividades práticas com o mesmo `content.pool` são alternativas entre si:
 *   sorteia `draw` delas (lido da primeira do pool; default 1). Sem `pool`,
 *   a atividade é um pool de uma só e sempre aparece.
 * - A lista final de prática é embaralhada.
 * - Em cada `option` sem `fixedOrder`, as alternativas são embaralhadas e o
 *   `correctOption` (1-based) é remapeado para a nova posição da correta.
 *
 * Nunca muta a entrada (ela é o cache do React Query): toda atividade
 * alterada volta como objeto novo. `random` é injetável só para testes.
 */
export function buildLessonSession<T extends PlayableActivity>(
	activities: T[],
	random: () => number = Math.random
): T[] {
	const theory: T[] = [];
	const pools = new Map<string, T[]>();
	const singles: T[][] = [];

	for (const activity of activities) {
		if (activity.type === "theory") {
			theory.push(activity);
			continue;
		}
		const pool = readPool(activity.content);
		if (pool === undefined) {
			singles.push([activity]);
		} else {
			const group = pools.get(pool);
			if (group) group.push(activity);
			else pools.set(pool, [activity]);
		}
	}

	const practice: T[] = [];
	for (const group of [...pools.values(), ...singles]) {
		const draw = readDraw(group[0].content);
		practice.push(...shuffle(group, random).slice(0, draw));
	}

	return [
		...theory,
		...shuffle(practice, random).map((activity) => shuffleOptions(activity, random)),
	];
}

/** Fisher-Yates numa cópia. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

function shuffleOptions<T extends PlayableActivity>(activity: T, random: () => number): T {
	if (activity.type !== "option") return activity;
	const content = activity.content as OptionActivityContent;
	if (content.fixedOrder || !Array.isArray(content.options)) return activity;

	// Embaralha os índices originais, não os textos: duas alternativas com o
	// mesmo texto não confundem o remapeamento da correta.
	const order = shuffle(
		content.options.map((_, index) => index),
		random
	);
	const correctOption = order.indexOf(content.correctOption - 1) + 1;

	return {
		...activity,
		content: {
			...content,
			options: order.map((index) => content.options[index]),
			correctOption,
		},
	};
}

function readPool(content: unknown): string | undefined {
	const pool = (content as Partial<OptionActivityContent> | null)?.pool;
	return typeof pool === "string" && pool.length > 0 ? pool : undefined;
}

function readDraw(content: unknown): number {
	const draw = (content as Partial<OptionActivityContent> | null)?.draw;
	return typeof draw === "number" && draw >= 1 ? Math.floor(draw) : 1;
}
