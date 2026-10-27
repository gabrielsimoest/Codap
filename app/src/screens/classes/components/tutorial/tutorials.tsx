import type { ReactNode } from "react";
import type { TheoryPalette } from "../theory/theoryTheme";
import {
	BlankScene,
	ChecksScene,
	EditorScene,
	FillBlankScene,
	HintsScene,
	MatchScene,
	OptionsScene,
	PreviewResultScene,
	ProceedScene,
	ReadScene,
	ReorderScene,
	TheoryReadScene,
	TheoryRunScene,
	TheoryTabsScene
} from "./scenes";

/** Os tipos de atividade que têm tutorial — um para cada tela do player. */
export type TutorialType =
	| "theory"
	| "option"
	| "code_blank"
	| "fill_blank"
	| "reorder"
	| "matching"
	| "code_playground"
	| "code_editor";

export interface TutorialStep {
	/** Chave dos textos em `tutorial.<tipo>.<chave>.title` e `.text` (i18n). */
	key: string;
	/** A ilustração animada do passo. */
	scene: (palette: TheoryPalette) => ReactNode;
}

/**
 * Os passos de cada tutorial, na ordem em que aparecem. Cada um mostra uma ilustração
 * animada e um texto curto (pt/en em `tutorial.*`): o objetivo é ensinar **como se faz**
 * a atividade, vendo — não explicar o conteúdo da lição.
 */
export const TUTORIALS: Record<TutorialType, TutorialStep[]> = {
	theory: [
		{ key: "read", scene: (palette) => <TheoryReadScene palette={palette} /> },
		{ key: "tabs", scene: (palette) => <TheoryTabsScene palette={palette} /> },
		{ key: "run", scene: (palette) => <TheoryRunScene palette={palette} /> },
		{ key: "next", scene: (palette) => <ProceedScene palette={palette} /> }
	],
	option: [
		{ key: "read", scene: (palette) => <ReadScene palette={palette} /> },
		{ key: "choose", scene: (palette) => <OptionsScene palette={palette} /> },
		{ key: "check", scene: (palette) => <ProceedScene palette={palette} verdict /> }
	],
	code_blank: [
		{ key: "see", scene: (palette) => <BlankScene palette={palette} mode="see" /> },
		{ key: "fill", scene: (palette) => <BlankScene palette={palette} mode="fill" /> },
		{ key: "undo", scene: (palette) => <BlankScene palette={palette} mode="undo" /> }
	],
	fill_blank: [
		{ key: "see", scene: (palette) => <FillBlankScene palette={palette} stage="see" /> },
		{ key: "type", scene: (palette) => <FillBlankScene palette={palette} stage="type" /> },
		{ key: "check", scene: (palette) => <ProceedScene palette={palette} verdict /> }
	],
	reorder: [
		{ key: "see", scene: (palette) => <ReorderScene palette={palette} mode="see" /> },
		{ key: "place", scene: (palette) => <ReorderScene palette={palette} mode="place" /> },
		{ key: "undo", scene: (palette) => <ReorderScene palette={palette} mode="undo" /> }
	],
	matching: [
		{ key: "see", scene: (palette) => <MatchScene palette={palette} mode="see" /> },
		{ key: "pair", scene: (palette) => <MatchScene palette={palette} mode="pair" /> },
		{ key: "wrong", scene: (palette) => <MatchScene palette={palette} mode="wrong" /> }
	],
	code_playground: [
		{ key: "fill", scene: (palette) => <BlankScene palette={palette} mode="fill" /> },
		{ key: "run", scene: (palette) => <PreviewResultScene palette={palette} verdict={false} /> },
		{ key: "verdict", scene: (palette) => <PreviewResultScene palette={palette} verdict /> }
	],
	code_editor: [
		{ key: "read", scene: (palette) => <ReadScene palette={palette} requirements /> },
		{ key: "type", scene: (palette) => <EditorScene palette={palette} /> },
		{ key: "run", scene: (palette) => <ChecksScene palette={palette} /> },
		{ key: "hints", scene: (palette) => <HintsScene palette={palette} /> }
	]
};
