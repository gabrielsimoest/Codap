/**
 * Mapa curado de classes utilitárias Tailwind → CSS resolvido, cobrindo
 * exatamente o que é ensinado no módulo "Além do CSS: Tailwind CSS e
 * Ecossistema" (`api/prisma/seed.ts`). Não é um motor Tailwind (sem JIT,
 * sem CDN — inviável offline, ver `docs/roadmap-atividades-praticas.md`),
 * só a centralização do CSS que já era resolvido manualmente por lição via
 * `additionalCode`. Uma classe ensinada fora deste mapa simplesmente não
 * gera regra — mesmo comportamento de "falha silenciosa" que já existia
 * antes desta centralização, não é uma regressão.
 */
export const TAILWIND_SUBSET: Record<string, string> = {
	"bg-blue-600": "background-color: #2563eb;",
	"text-white": "color: #ffffff;",
	"px-4": "padding-left: 1rem; padding-right: 1rem;",
	"py-2": "padding-top: 0.5rem; padding-bottom: 0.5rem;",
	"rounded-lg": "border-radius: 0.5rem;",
	"text-lg": "font-size: 1.125rem; line-height: 1.75rem;",
	"font-bold": "font-weight: 700;",
	"p-4": "padding: 1rem;",
	"mt-4": "margin-top: 1rem;",
	"text-2xl": "font-size: 1.5rem; line-height: 2rem;",
	flex: "display: flex;",
	"items-center": "align-items: center;",
	"justify-between": "justify-content: space-between;",
	grid: "display: grid;",
	"grid-cols-3": "grid-template-columns: repeat(3, 1fr);",
	"gap-4": "gap: 1rem;",
	"font-medium": "font-weight: 500;",
};

/**
 * Varre os tokens de `class="..."` do HTML recebido e devolve, concatenadas,
 * as regras CSS de cada classe presente em `TAILWIND_SUBSET`. Cada classe
 * resolve isoladamente (independente de quais outras classes acompanham
 * ela), então combinações novas de classes já ensinadas continuam
 * funcionando sem precisar de entrada própria no mapa.
 */
export function resolveTailwindSubsetCss(html: string): string {
	const classAttributeRegex = /class="([^"]*)"/g;
	const matchedClasses = new Set<string>();

	let match: RegExpExecArray | null;
	while ((match = classAttributeRegex.exec(html)) !== null) {
		for (const className of match[1].split(/\s+/)) {
			if (className in TAILWIND_SUBSET) {
				matchedClasses.add(className);
			}
		}
	}

	return Array.from(matchedClasses)
		.map((className) => `.${className} { ${TAILWIND_SUBSET[className]} }`)
		.join("\n");
}
