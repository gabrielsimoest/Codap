import type { TheoryActivityContent } from "codap-api/src/types/contracts";

/**
 * Entrega ao app uma teoria sempre no modelo novo (`introduction` /
 * `explanation` / `closing`), mesmo que o `content` venha no formato antigo
 * (`firstParagraph`, `secondParagraph`, `thirdParagraph`, `endParagraph`).
 *
 * Existe para o app novo funcionar contra um banco que ainda não rodou
 * `api/prisma/migrateTheoryV2.ts` (ex.: produção, onde o app é publicado antes
 * da migração). Com o banco migrado, o ramo legado nunca é usado.
 *
 * No formato antigo não há persona, então vira `neutral`: o app não deduz Cody
 * pela posição da tela — a persona é uma decisão editorial que só a migração (e
 * o autor, pelo dashboard) tomam.
 */
export function normalizeTheoryContent(raw: unknown): TheoryActivityContent {
	const content = (raw ?? {}) as Record<string, unknown>;

	if (typeof content.introduction === "object" && content.introduction !== null) {
		return content as unknown as TheoryActivityContent;
	}

	const text = (value: unknown): string | undefined =>
		typeof value === "string" && value.trim() !== "" ? value : undefined;

	const {
		firstParagraph,
		secondParagraph,
		thirdParagraph,
		endParagraph,
		...rest
	} = content;
	const explanation = [text(secondParagraph), text(thirdParagraph)]
		.filter((part): part is string => part !== undefined)
		.join("\n\n");
	const closing = text(endParagraph);

	return {
		introduction: { text: text(firstParagraph) ?? "", persona: "neutral" },
		...(explanation !== "" ? { explanation: { text: explanation } } : {}),
		...(closing !== undefined ? { closing } : {}),
		...rest,
	} as unknown as TheoryActivityContent;
}
